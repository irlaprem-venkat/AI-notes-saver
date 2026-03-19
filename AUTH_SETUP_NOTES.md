# Supabase Auth Setup Guide (Lumina Notes)

Follow these steps to enable Google and GitHub authentication for your Lumina Notes application.

## 1. Configure Redirect URLs in Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication > URL Configuration**.
3. Set **Site URL** to: `https://ai-notes-saver-nine.vercel.app`
4. Add these to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://ai-notes-saver-nine.vercel.app/auth/callback` (for production)

## 2. Enable Google Provider
1. Go to **Authentication > Providers > Google**.
2. Toggle **Enable Google** to ON.
3. Enter your **Client ID** and **Client Secret** from the [Google Cloud Console](https://console.cloud.google.com/).
4. Click **Save**.

## 3. Enable GitHub Provider
1. Go to **Authentication > Providers > GitHub**.
2. Toggle **Enable GitHub** to ON.
3. Enter your **Client ID** and **Client Secret** from the [GitHub Developer Settings](https://github.com/settings/developers).
   - Create a new **OAuth App**.
   - Homepage URL: `https://ai-notes-saver-nine.vercel.app`
   - Authorization callback URL: Copy this from the Supabase GitHub provider settings (it usually looks like `https://[PROJECT-ID].supabase.co/auth/v1/callback`).
4. Click **Save**.

## 4. Environment Variables
Ensure your `.env.local` and Vercel Environment Variables include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> [!TIP]
> After configuring, test locally at `http://localhost:3000/auth`. Your Sidebar will now show your avatar and email after a successful login!
