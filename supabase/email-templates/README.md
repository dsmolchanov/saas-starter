# Supabase Email Templates

These minimalist email templates are designed for use with Supabase Authentication.

## Templates Included

1. **confirmation.html** - Email verification for new sign-ups
2. **magic-link.html** - Passwordless sign-in with 6-digit code
3. **reset-password.html** - Password reset requests
4. **invite.html** - User invitations

## How to Use

### Setting up in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. For each template type, copy the HTML content and paste it into the corresponding template editor

### Available Variables

Supabase provides these variables that you can use in your templates:

- `{{ .Token }}` - The 6-digit verification code (for OTP)
- `{{ .ConfirmationURL }}` - The confirmation/magic link URL
- `{{ .SiteURL }}` - Your application's URL
- `{{ .InviterEmail }}` - Email of the person sending the invite (for invitations)
- `{{ .SiteName }}` - Your application name

### Customizing the Templates

The templates use a minimalist design with:
- Clean, modern typography
- Subtle gray color palette
- Simple dot logo (can be replaced with your brand)
- Mobile-responsive design
- Support for both light and dark email clients

To customize:
1. Replace the logo dot with your brand logo
2. Update color scheme in the CSS (currently using gray-900 #111827)
3. Modify the footer links to match your site structure
4. Adjust copy to match your brand voice

### Testing

Always test your email templates by:
1. Sending test emails from Supabase dashboard
2. Checking rendering in different email clients
3. Verifying all links work correctly
4. Testing on mobile devices

## Design Philosophy

These templates follow a minimalist approach:
- **Less is more** - Only essential information
- **Clear hierarchy** - Important actions are prominent
- **Accessibility** - High contrast, readable fonts
- **Trust** - Clean design builds confidence
- **Mobile-first** - Optimized for small screens