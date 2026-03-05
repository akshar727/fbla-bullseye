# Setting up reCAPTCHA for Signup and Claim Pages

## 1. Get reCAPTCHA Keys

1. Go to https://www.google.com/recaptcha/admin
2. Sign in with your Google account
3. Click **+ Create** to add a new site
4. Fill in:
   - **Label**: "Bullseye Lost & Found" (or your app name)
   - **reCAPTCHA type**: Select "reCAPTCHA v2" > "I'm not a robot" Checkbox
   - **Domains**: Add your domain (e.g., `localhost` for dev, your production domain)
5. Accept the reCAPTCHA Terms of Service and click **Submit**
6. Copy the **Site Key** and **Secret Key**

## 2. Add Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

The `NEXT_PUBLIC_` prefix makes the site key accessible in the browser; the secret key stays server-side only.

## 3. Create a Backend Verification Endpoint

Create `app/api/verify-captcha/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { token } = await request.json();

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();

    if (data.success && data.score > 0.5) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "CAPTCHA verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Verification error" },
      { status: 500 }
    );
  }
}
```

## 4. Use in Signup Page

Add to `app/signup/page.tsx`:

```tsx
import { Recaptcha } from "@/components/ui/recaptcha";

// Inside your component:
const [captchaToken, setCaptchaToken] = useState<string | null>(null);

// In your form submission:
async function handleSignup(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  
  if (!captchaToken) {
    toast.error("Please complete the CAPTCHA");
    return;
  }

  setLoading(true);
  try {
    // Verify CAPTCHA first
    const verifyRes = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: captchaToken }),
    });

    if (!verifyRes.ok) {
      toast.error("CAPTCHA verification failed");
      return;
    }

    // Then proceed with signup
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. Please login.");
    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
  } finally {
    setLoading(false);
  }
}

// In JSX:
<Recaptcha onVerify={setCaptchaToken} />
```

## 5. Use in Claim Page

Same pattern as signup — add the `<Recaptcha />` component before the submit button and verify the token before sending the claim.

## Notes

- **reCAPTCHA v2 (Checkbox)**: Simple "I'm not a robot" checkbox, user-friendly
- **reCAPTCHA v3** (alternative): Invisible, scores risk from 0–1; better UX but less obvious
- Keep your **Secret Key** secure and only use it server-side
- Test locally with `localhost` in your reCAPTCHA admin panel
