import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranslationRequest {
  entity_type: string
  entity_id: string
  source_locale?: string
  target_locales?: string[]
  tier?: 'immediate' | 'on_demand' | 'batch'
  fields?: string[] // Specific fields to translate
  user_id?: string // For tracking who requested
  priority?: number // Override calculated priority
}

interface ContentMeta {
  source_locale: string
  translation_tier: string
  auto_translate: boolean
  view_count_by_locale: Record<string, number>
  request_count_by_locale: Record<string, number>
  translation_priority: number
}

const SUPPORTED_LOCALES = ['en', 'ru', 'es']
const DEFAULT_LOCALE = 'en'

// Different contexts for different content types
const CONTENT_CONTEXTS = {
  course: 'Educational yoga course content. Maintain instructional clarity and learning objectives.',
  class: 'Yoga class description. Keep it inviting, clear about difficulty level and requirements.',
  article: 'Wellness/yoga article. Preserve informative and educational tone.',
  workshop: 'Workshop or event description. Maintain professional tone and practical information.',
  teacher: 'Teacher profile and bio. Keep personal tone while maintaining professionalism.',
}

// Model selection based on tier and content type
const getModelForTier = (tier: string) => {
  switch (tier) {
    case 'immediate':
      return 'gemini-1.5-flash' // Faster, good quality
    case 'batch':
      return 'gemini-1.5-flash' // Cost-efficient
    case 'on_demand':
    default:
      return 'gemini-1.5-flash' // Balanced
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')!

    if (!geminiApiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { 
      entity_type, 
      entity_id, 
      source_locale, 
      target_locales,
      tier = 'on_demand',
      fields,
      user_id,
      priority
    } = await req.json() as TranslationRequest

    console.log('Translation request:', { entity_type, entity_id, tier, fields })

    // Step 1: Get or create content metadata
    let { data: contentMeta, error: metaError } = await supabase
      .from('i18n_content_meta')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .single()

    if (metaError && metaError.code === 'PGRST116') {
      // Create metadata if doesn't exist
      const { data: newMeta, error: createError } = await supabase
        .from('i18n_content_meta')
        .insert({
          entity_type,
          entity_id,
          source_locale: source_locale || DEFAULT_LOCALE,
          translation_tier: tier,
          translation_priority: priority || 0
        })
        .select()
        .single()

      if (createError) throw createError
      contentMeta = newMeta
    }

    // Step 2: Check if we should translate based on tier and settings
    if (!contentMeta.auto_translate && tier !== 'immediate') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Auto-translation is disabled for this content' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Track the request if user-initiated
    if (user_id) {
      await supabase.rpc('track_content_view', {
        p_entity_type: entity_type,
        p_entity_id: entity_id,
        p_user_locale: target_locales?.[0] || 'en'
      })
    }

    // Step 4: Get existing translations
    const { data: existingTranslations, error: fetchError } = await supabase
      .from('i18n_translations')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .in('field_name', fields || [])

    if (fetchError) throw fetchError

    // Step 5: Detect source language if not provided
    let detectedSourceLocale = source_locale || contentMeta.source_locale

    if (!detectedSourceLocale) {
      const localeCounts = existingTranslations?.reduce((acc, trans) => {
        acc[trans.locale] = (acc[trans.locale] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      detectedSourceLocale = Object.entries(localeCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || DEFAULT_LOCALE
    }

    // Step 6: Determine target locales
    const targetLocalesList = target_locales || 
      SUPPORTED_LOCALES.filter(locale => locale !== detectedSourceLocale)

    // Step 7: Get glossary terms for consistent translation
    const { data: glossaryTerms } = await supabase
      .from('i18n_glossary')
      .select('term_key, translations')

    const glossary = glossaryTerms?.reduce((acc, term) => {
      acc[term.term_key] = term.translations
      return acc
    }, {} as Record<string, any>) || {}

    // Step 8: Get required fields for this entity type
    const { data: requiredFields } = await supabase
      .from('i18n_required_fields')
      .select('field_name, description')
      .eq('entity_type', entity_type)
      .in('field_name', fields || [])
      .eq('is_required', true)

    // Step 9: Build translation tasks
    const translationTasks: any[] = []
    const fieldsToTranslate = fields || requiredFields?.map(f => f.field_name) || []

    for (const field of fieldsToTranslate) {
      const sourceTranslation = existingTranslations?.find(
        t => t.field_name === field && t.locale === detectedSourceLocale
      )

      if (!sourceTranslation) continue

      for (const targetLocale of targetLocalesList) {
        const existingTarget = existingTranslations?.find(
          t => t.field_name === field && t.locale === targetLocale
        )

        // Skip if good translation exists
        if (existingTarget && 
            (!existingTarget.is_auto_translated || 
             existingTarget.quality_score >= 0.9)) {
          continue
        }

        translationTasks.push({
          entity_type,
          entity_id,
          field_name: field,
          source_text: sourceTranslation.translation,
          source_locale: detectedSourceLocale,
          target_locale: targetLocale,
        })
      }
    }

    if (translationTasks.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No translations needed',
          translations_count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 10: Initialize Gemini with appropriate model
    const modelName = getModelForTier(tier)
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: modelName })

    // Step 11: Batch translate
    const translations = []
    const batchSize = tier === 'immediate' ? 10 : 5

    for (let i = 0; i < translationTasks.length; i += batchSize) {
      const batch = translationTasks.slice(i, i + batchSize)
      
      // Build context-aware prompt
      const context = CONTENT_CONTEXTS[entity_type as keyof typeof CONTENT_CONTEXTS] || 
                     'General content for a yoga and wellness platform.'
      
      const glossaryInfo = Object.keys(glossary).length > 0 
        ? `\nImportant terms (use these translations consistently):\n${
            Object.entries(glossary).map(([key, trans]) => 
              `${key}: ${JSON.stringify(trans)}`
            ).join('\n')
          }`
        : ''

      const batchPrompt = `You are a professional translator for a yoga and wellness platform.

Context: ${context}
${glossaryInfo}

Translate the following texts from ${batch[0].source_locale} to their respective target languages.
Maintain the tone, style, and accuracy of the original text.

${batch.map((task, index) => `
Translation ${index + 1}:
Source Language: ${getLanguageName(task.source_locale)}
Target Language: ${getLanguageName(task.target_locale)}
Field Type: ${task.field_name}
Source Text: "${task.source_text}"
`).join('\n')}

Provide the translations in the following JSON format:
{
  "translations": [
    {
      "index": 0,
      "translated_text": "...",
      "confidence": 0.95
    }
  ]
}

Important:
- Maintain consistency with glossary terms
- Keep formatting (line breaks, lists, etc.)
- Preserve any HTML or markdown formatting
- For course/class titles, make them appealing in the target language
- confidence should be between 0 and 1`

      try {
        const result = await model.generateContent(batchPrompt)
        const response = await result.response
        const text = response.text()
        
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.error('Failed to parse response:', text)
          continue
        }

        const parsed = JSON.parse(jsonMatch[0])
        
        for (const trans of parsed.translations) {
          const task = batch[trans.index]
          translations.push({
            entity_type: task.entity_type,
            entity_id: task.entity_id,
            field_name: task.field_name,
            locale: task.target_locale,
            translation: trans.translated_text,
            is_auto_translated: true,
            auto_translation_service: 'gemini',
            translation_confidence: trans.confidence || 0.8,
            translation_method: tier,
            translator_type: 'ai',
            content_version: contentMeta.content_version || 1,
            needs_review: tier === 'batch' || trans.confidence < 0.8
          })
        }
      } catch (error) {
        console.error('Error translating batch:', error)
      }
    }

    // Step 12: Insert translations
    if (translations.length > 0) {
      const { error: insertError } = await supabase
        .from('i18n_translations')
        .upsert(translations, {
          onConflict: 'entity_type,entity_id,field_name,locale',
          ignoreDuplicates: false
        })

      if (insertError) {
        console.error('Error inserting translations:', insertError)
        throw insertError
      }

      // Update content metadata
      const newLocales = [...new Set(translations.map(t => t.locale))]
      await supabase
        .from('i18n_content_meta')
        .update({
          available_locales: supabase.sql`
            array(
              SELECT DISTINCT unnest(
                array_cat(
                  COALESCE(available_locales, '{}'),
                  ${newLocales}::text[]
                )
              )
            )
          `,
          pending_locales: supabase.sql`
            array(
              SELECT unnest(pending_locales)
              EXCEPT
              SELECT unnest(${newLocales}::text[])
            )
          `,
          last_translated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Translated ${translations.length} fields`,
        source_locale: detectedSourceLocale,
        target_locales: targetLocalesList,
        translations_count: translations.length,
        tier,
        translations: translations.map(t => ({
          field: t.field_name,
          locale: t.locale,
          confidence: t.translation_confidence,
          needs_review: t.needs_review
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in auto-translate function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getLanguageName(locale: string): string {
  const languages: Record<string, string> = {
    en: 'English',
    ru: 'Russian',
    es: 'Spanish',
  }
  return languages[locale] || locale
}