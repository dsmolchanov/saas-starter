import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function calculateMoonPhase(date: Date) {
  // Simple moon phase calculation
  const lunarCycle = 29.53059; // days
  const knownNewMoon = new Date('2024-01-11T00:00:00Z');
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const currentCycle = (daysSinceNewMoon % lunarCycle + lunarCycle) % lunarCycle;
  const phaseValue = currentCycle / lunarCycle;
  
  return {
    phaseValue: parseFloat(phaseValue.toFixed(2)),
    illumination: Math.abs(Math.cos(phaseValue * Math.PI * 2)) * 100
  };
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if we have moon calendar data for today
    const { data: moonCalendar, error: calendarError } = await supabase
      .from('moon_calendar')
      .select(`
        *,
        phase:moon_phases(*)
      `)
      .eq('date', todayStr)
      .single();

    if (!calendarError && moonCalendar) {
      return NextResponse.json({ 
        moonPhase: moonCalendar.phase,
        calendar: moonCalendar,
        isCalculated: false
      });
    }

    // Calculate moon phase if no calendar entry
    const { phaseValue, illumination } = calculateMoonPhase(today);
    
    // Find the closest moon phase
    const { data: moonPhases, error: phasesError } = await supabase
      .from('moon_phases')
      .select('*')
      .order('phase_value');

    if (phasesError) {
      console.error('Error fetching moon phases:', phasesError);
      return NextResponse.json({ error: 'Failed to fetch moon phases' }, { status: 500 });
    }

    // Find the closest phase
    let closestPhase = moonPhases[0];
    let minDiff = Math.abs(phaseValue - moonPhases[0].phase_value);
    
    for (const phase of moonPhases) {
      const diff = Math.abs(phaseValue - phase.phase_value);
      if (diff < minDiff) {
        minDiff = diff;
        closestPhase = phase;
      }
    }

    // Get practice guidelines for this phase
    const { data: guidelines } = await supabase
      .from('moon_practice_guidelines')
      .select('*')
      .eq('phase_id', closestPhase.id);

    return NextResponse.json({ 
      moonPhase: closestPhase,
      calculated: {
        exactPhase: phaseValue,
        illumination: illumination.toFixed(1)
      },
      guidelines,
      isCalculated: true
    });
  } catch (error) {
    console.error('Error in moon-phase API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}