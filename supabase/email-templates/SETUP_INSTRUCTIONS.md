# Supabase Email Template Setup Instructions

## Important: OTP Code Configuration

For the 6-digit code to work properly with passwordless authentication, you need to configure your Supabase project correctly:

### 1. Update Email Templates in Supabase Dashboard

Go to **Authentication → Email Templates** and update:

#### Magic Link Template
Use the content from `magic-link-with-code.html`. This template shows BOTH:
- The 6-digit code using `{{ .Token }}`
- A magic link button for instant sign-in

**IMPORTANT**: The `{{ .Token }}` variable contains the 6-digit OTP code.

### 2. Ensure Authentication Settings

In **Authentication → Settings**:
- Email provider should be enabled
- "Enable email confirmations" can be on or off depending on your needs
- Magic link validity period affects both the code and link

### 3. Testing the Flow

#### Magic Link (Working ✅)
- User clicks the link in email
- Redirected to `/auth/callback`
- Session is created
- User is logged in

#### 6-Digit Code (If not working)
The code might not work if:
1. Supabase is configured to only send magic links (not OTP codes)
2. The token type mismatch between sending and verifying

To fix:
- Check Supabase logs for the exact error
- Ensure the OTP verification uses the same `type` as when it was sent
- The type should be 'email' for OTP codes

### 4. Google OAuth Setup

Make sure in **Authentication → Providers → Google**:
- Google OAuth is enabled
- Redirect URLs include your callback URL
- Client ID and Secret are configured

### 5. Debugging

Check the browser console and server logs for:
- "OAuth callback received" messages
- "OTP verification result" messages
- Any error messages

The logs will help identify if the issue is with:
- Token verification
- User creation
- Session setting
- Redirect handling