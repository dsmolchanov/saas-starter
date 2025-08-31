# Automatic Spiritual Content Population

The spiritual content (chakras, moon phases, quotes) is automatically populated to ensure content is always available.

## How It Works

### 1. Database Functions
- `populate_chakra_daily_focus()` - Populates chakra focus for future dates
- `populate_daily_quotes()` - Populates daily quotes with anti-repetition logic  
- `populate_moon_calendar()` - Calculates and populates moon phases astronomically
- `daily_spiritual_population()` - Main function that maintains 35 days of content ahead

### 2. Automatic Triggers

#### Server-Side (On Every Home Page Load)
The home page calls `ensure_spiritual_content_available()` which:
- Checks if content exists for the next 7 days
- If not, automatically populates 30 days ahead
- Ensures users always have content

#### API Endpoint
`GET /api/spiritual/populate` - Checks and populates content if needed
`POST /api/spiritual/populate` - Forces population of 35 days ahead

### 3. Scheduled Jobs (Optional)

#### Option A: Vercel Cron (if deployed on Vercel)
The `vercel.json` file configures a daily cron job:
```json
{
  "crons": [{
    "path": "/api/spiritual/populate",
    "schedule": "0 3 * * *"  // Daily at 3 AM UTC
  }]
}
```

#### Option B: Supabase Cron (using pg_cron)
If you have access to Supabase Dashboard:
1. Go to Database > Extensions
2. Enable `pg_cron` extension
3. Go to SQL Editor and run:
```sql
SELECT cron.schedule(
  'populate-spiritual-content',
  '0 3 * * *',
  $$SELECT daily_spiritual_population();$$
);
```

#### Option C: External Cron Service
Use any external cron service (e.g., cron-job.org, EasyCron) to call:
`https://your-domain.com/api/spiritual/populate` daily

## Manual Population

### Via API
```bash
# Check status
curl https://your-domain.com/api/spiritual/populate

# Force populate
curl -X POST https://your-domain.com/api/spiritual/populate
```

### Via SQL
```sql
-- Populate 30 days ahead
SELECT daily_spiritual_population();

-- Check current status
SELECT * FROM spiritual_population_log ORDER BY created_at DESC LIMIT 5;
```

## Content Rotation Logic

### Chakras (7 total)
- Cycles through chakras 1-7 based on day of year
- Each chakra gets equal focus throughout the year

### Moon Phases (8 phases)
- Calculated astronomically using 29.53-day lunar cycle
- Accurate phase and illumination percentage for each day
- Phases: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent

### Daily Quotes
- Random selection from all available quotes
- Avoids repeating the same quote within 7 days
- Links to source texts with author information

## Monitoring

Check the population log:
```sql
SELECT * FROM spiritual_population_log 
ORDER BY created_at DESC 
LIMIT 10;
```

Check days available:
```sql
SELECT 
  (SELECT COUNT(*) FROM chakra_daily_focus WHERE date >= CURRENT_DATE) as chakra_days,
  (SELECT COUNT(*) FROM daily_quotes WHERE date >= CURRENT_DATE) as quote_days,
  (SELECT COUNT(*) FROM moon_calendar WHERE date >= CURRENT_DATE) as moon_days;
```

## Troubleshooting

### Content Not Showing
1. Check if data exists: `SELECT * FROM daily_quotes WHERE date = CURRENT_DATE;`
2. Force populate: `SELECT daily_spiritual_population();`
3. Check logs: `SELECT * FROM spiritual_population_log WHERE success = false;`

### Population Failing
1. Check if tables exist and have seed data
2. Ensure functions are created: `\df *populate*`
3. Check permissions on functions

## Benefits
- **Zero Maintenance**: Content auto-populates as needed
- **No Downtime**: Always 35 days of content available
- **Intelligent Rotation**: Avoids repetition, ensures variety
- **Astronomically Accurate**: Moon phases calculated precisely
- **Multi-language Support**: All content supports EN, RU, ES