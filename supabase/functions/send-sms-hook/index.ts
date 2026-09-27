// Supabase Auth "Send SMS Hook" -- called instead of a built-in SMS provider
// whenever Supabase needs to send a phone OTP (sign-in or verification).
// Docs: https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook
//
// Deploy:
//   supabase functions deploy send-sms-hook --no-verify-jwt
//
// Secrets (set once, via `supabase secrets set`):
//   SEND_SMS_HOOK_SECRET  -- from Auth > Hooks > Send SMS hook, format "v1,whsec_..."
//   MSG91_AUTH_KEY        -- MSG91 dashboard > API > Auth Key
//   MSG91_TEMPLATE_ID     -- your DLT-approved OTP template's ID
//
// Then in Supabase Dashboard > Authentication > Hooks, enable "Send SMS hook"
// and point it at this function's URL.

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const MSG91_AUTH_KEY = Deno.env.get('MSG91_AUTH_KEY')
const MSG91_TEMPLATE_ID = Deno.env.get('MSG91_TEMPLATE_ID')
const HOOK_SECRET = Deno.env.get('SEND_SMS_HOOK_SECRET')

Deno.serve(async (req) => {
  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)

    const base64Secret = (HOOK_SECRET ?? '').replace('v1,whsec_', '')
    const wh = new Webhook(base64Secret)
    const { user, sms } = wh.verify(payload, headers) as {
      user: { phone: string }
      sms: { otp: string }
    }

    // MSG91 expects the number without a leading '+' (Supabase's `user.phone`
    // is already in that format, e.g. "919876543210").
    const mobile = user.phone

    const res = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: MSG91_AUTH_KEY ?? '',
      },
      body: JSON.stringify({
        template_id: MSG91_TEMPLATE_ID,
        short_url: '0',
        recipients: [
          {
            mobiles: mobile,
            // "OTP" must match the variable name in your DLT-approved
            // template exactly (case-sensitive) -- adjust if yours differs.
            OTP: sms.otp,
          },
        ],
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return new Response(JSON.stringify({ error: `MSG91 error: ${body}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Empty 200 response = success, per the Send SMS Hook contract.
    return new Response(null, { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
