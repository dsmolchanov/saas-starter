import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { GoogleGenAI } from 'npm:@google/genai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranslationRequest {
  entity_type: string
  entity_id: string
  source_locale?: string // Optional, will be detected if not provided
  target_locales?: string[] // Optional, defaults to other supported languages
}

interface TranslationTask {
  entity_type: string
  entity_id: string
  field_name: string
  source_text: string
  source_locale: string
  target_locale: string
}

const SUPPORTED_LOCALES = ['en', 'ru', 'es']
const DEFAULT_LOCALE = 'en'

// Yoga-specific context for better translations
const YOGA_CONTEXT = {
  chakra: 'This is about chakras (energy centers in yoga philosophy). Maintain spiritual and energetic meanings.',
  moon_phase: 'This relates to moon phases and lunar yoga practices. Keep astronomical and spiritual terminology accurate.',
  yoga_quote: 'This is a yoga or spiritual quote. Preserve philosophical meaning and poetic nature.',
  asana: 'This is a yoga pose/asana. Use proper yoga terminology and maintain technical accuracy.',
  meditation: 'This is about meditation practice. Keep mindfulness and spiritual concepts intact.',
  breathing_exercise: 'This is a pranayama/breathing exercise. Maintain technical breathing instructions.',
  class: 'This is a yoga class description. Keep it inviting and informative.',
  course: 'This is a yoga course description. Maintain structure and learning objectives.',
  article: 'This is a yoga/wellness article. Preserve informative and educational tone.',
}

serve(async (req) => {
  // Handle CORS preflight
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
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey
    })

    const { entity_type, entity_id, source_locale, target_locales } = await req.json() as TranslationRequest

    console.log('Translation request:', { entity_type, entity_id, source_locale, target_locales })

    // Step 1: Get all existing translations for this entity
    const { data: existingTranslations, error: fetchError } = await supabase
      .from('i18n_translations')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)

    if (fetchError) throw fetchError

    if (!existingTranslations || existingTranslations.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No source content found for translation' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Detect source language if not provided
    let detectedSourceLocale = source_locale

    if (!detectedSourceLocale) {
      // Find which locale has the most translations
      const localeCounts = existingTranslations.reduce((acc, trans) => {
        acc[trans.locale] = (acc[trans.locale] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      detectedSourceLocale = Object.entries(localeCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || DEFAULT_LOCALE

      console.log('Detected source locale:', detectedSourceLocale, 'from counts:', localeCounts)
    }

    // Step 3: Determine target locales
    const targetLocalesList = target_locales || 
      SUPPORTED_LOCALES.filter(locale => locale !== detectedSourceLocale)

    console.log('Target locales:', targetLocalesList)

    // Step 4: Get required fields for this entity type
    const { data: requiredFields, error: fieldsError } = await supabase
      .from('i18n_required_fields')
      .select('field_name, description')
      .eq('entity_type', entity_type)
      .eq('is_required', true)

    if (fieldsError) throw fieldsError

    // Step 5: Build translation tasks
    const translationTasks: TranslationTask[] = []

    for (const field of requiredFields || []) {
      // Find source text
      const sourceTranslation = existingTranslations.find(
        t => t.field_name === field.field_name && t.locale === detectedSourceLocale
      )

      if (!sourceTranslation) {
        console.log(`No source text found for field ${field.field_name} in locale ${detectedSourceLocale}`)
        continue
      }

      // Check which target locales need translation
      for (const targetLocale of targetLocalesList) {
        const existingTargetTranslation = existingTranslations.find(
          t => t.field_name === field.field_name && t.locale === targetLocale
        )

        // Skip if translation already exists and is not auto-translated
        // (or if it's auto-translated with high confidence)
        if (existingTargetTranslation && 
            (!existingTargetTranslation.is_auto_translated || 
             existingTargetTranslation.translation_confidence >= 0.9)) {
          continue
        }

        translationTasks.push({
          entity_type,
          entity_id,
          field_name: field.field_name,
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
          message: 'All translations already exist',
          translations_count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${translationTasks.length} fields to translate`)

    // Step 6: Batch translate using Gemini
    const translations = []
    const batchSize = 5 // Process 5 translations at a time

    for (let i = 0; i < translationTasks.length; i += batchSize) {
      const batch = translationTasks.slice(i, i + batchSize)
      
      // Create a single prompt for the batch
      const batchPrompt = `You are a professional translator specializing in yoga, wellness, and spiritual content.

Context: ${YOGA_CONTEXT[entity_type as keyof typeof YOGA_CONTEXT] || 'General yoga and wellness content.'}

Translate the following texts from ${batch[0].source_locale} to their respective target languages.
Maintain the tone, style, and spiritual/technical accuracy of the original text.

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
- Preserve any Sanskrit terms when appropriate
- Maintain the spiritual and philosophical depth of yoga terminology
- Keep technical instructions clear and accurate
- For names and titles, ensure they sound natural in the target language
- confidence should be between 0 and 1, where 1 means you're completely confident`

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents: batchPrompt,
        })
        const text = response.text
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.error('Failed to parse Gemini response:', text)
          continue
        }

        const parsed = JSON.parse(jsonMatch[0])
        
        // Process each translation in the batch
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
          })
        }
      } catch (error) {
        console.error('Error translating batch:', error)
        // Continue with next batch
      }
    }

    // Step 7: Insert translations into database
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

      console.log(`Successfully inserted ${translations.length} translations`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Translated ${translations.length} fields`,
        source_locale: detectedSourceLocale,
        target_locales: targetLocalesList,
        translations_count: translations.length,
        translations: translations.map(t => ({
          field: t.field_name,
          locale: t.locale,
          confidence: t.translation_confidence
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