# Sign-in and email links: supported behavior

Verifying an email and signing in are two different steps. A link signs in **only the browser where it opens**.
OKUNAMI never moves a session from one browser or device to another.

| Scenario | Result | What the screen tells the person |
|---|---|---|
| Sign up, open the link in the **same browser** | Email verified and signed in on that browser. Banner: "Email verified. You are signed in on this device." | Verify screen: "Tap the link... open it in the same browser you are using here if you can." |
| Sign up on desktop, open the link on a **phone** | Phone: verified and signed in. Desktop: still signed out, still on the verify screen. | "Opened it on your phone or another device? Your email is still verified. Come back to this screen and sign in with your email and password." |
| Desktop afterwards: "I have verified my email. Sign in" | Goes to sign-in with the email prefilled (never the password). Sign in with the password. | "If you opened the verification link, your email is verified. Sign in below..." |
| Email sign-in link ("magic link") opened on another device | Signed in on that device only. | "Opened it on your phone? You will be signed in on your phone, not here. To sign in on this device, request a new link from here or use your password." |
| Link opens inside an email app's built-in browser | That in-app browser is signed in, not Safari or Chrome. | "If you do not see your cards afterward, open the link in Safari or Chrome instead." |
| Link expired **or already used** | Supabase reports both the same way (`otp_expired`), so OKUNAMI does not claim to know which. | Sign-in page with: "That link has expired or was already used... If you already verified your email, just sign in below." Buttons: Resend verification email, Email me a new sign-in link. |
| Asking for another email | Disabled for 60 seconds with a visible countdown (Supabase allows about one a minute). | "Resend verification email in 42s" |

## Security properties (tested)
- No token stays in the address bar after landing, and none is written to session or local storage by OKUNAMI's own code. The only thing remembered is a timestamp flag so the welcome banner shows once.
- A link opened in one browser leaves the other browser signed out and its storage free of the link's token.
- No password is prefilled, stored, or put in a URL.
- Link lifetime is whatever the Supabase project's "Email OTP expiration" is set to. The copy says "a limited time" and does not promise a number.

## How it was tested
Playwright with separate browser contexts, one using an iPhone user-agent, against the real build with a **mocked Supabase** (`review-tests/authtest2.py`). That proves OKUNAMI's behavior for these cases.
It does **not** prove real email delivery, real Supabase link behavior, or behavior on a physical iPhone or Android phone.

## Where the code is
`src/pages/Login.tsx` (screens), `src/lib/authLanding.ts` (reads the address once), `src/pages/ResetPassword.tsx`.
