# Important: OTP Code Setup

## The Issue
Supabase's `signInWithOtp` doesn't actually send a 6-digit OTP code. It sends a magic link with a long token. The `{{ .Token }}` variable contains the magic link token, not a 6-digit code.

## Our Solution
We've implemented a custom OTP system that:
1. Generates a real 6-digit code
2. Stores it in memory (server-side)
3. Sends both the magic link (via Supabase) and shows our custom code
4. Verifies either the 6-digit code OR the magic link

## How It Works

### When user requests a code:
1. We generate a 6-digit code (e.g., 123456)
2. Store it in our server memory with 10-minute expiration
3. Trigger Supabase to send the email (with magic link)
4. The OTP code is logged to console for testing

### When user enters the code:
1. First check our custom OTP store
2. If that fails, try Supabase verification (for magic link)
3. Create/find user and set session

## Testing
1. Open browser console
2. Request a code
3. Look for: "🔐 OTP generated for [email]: [6-digit code]"
4. Enter this code in the form
5. You should be logged in

## For Production
To make this work with actual emails, you need to either:

### Option 1: Use a separate email service
- Use SendGrid, Resend, or another email service
- Send your own email with the 6-digit code
- Keep the magic link as backup

### Option 2: Modify Supabase email template
- In the Supabase email template, you could try to include a custom parameter
- But Supabase doesn't support custom variables in templates

### Option 3: Use only magic links
- This is the simplest solution
- Users click the link in email instead of entering a code
- This is already working in your app

## Current Status
- ✅ Magic links work
- ✅ Custom OTP system implemented
- ✅ OTP codes shown in console for testing
- ⚠️ OTP codes not in emails (Supabase limitation)
- ℹ️ Need external email service for production OTP codes