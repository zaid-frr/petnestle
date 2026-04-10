<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ea2d4e31-3dba-4119-bcfa-4341ebca713e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Auth registration (any email in local dev)

If your Firebase project has Email/Password disabled, registration will fail with `auth/operation-not-allowed`.

For local/dev testing (register with any email/password):

1. Copy `.env.example` to `.env.local`
2. Set `VITE_USE_FIREBASE_EMULATORS="true"`
3. Install Firebase CLI (one-time): `npm i -g firebase-tools`
4. Start app + emulators: `npm run dev:emulators`

Notes:
- Google popup sign-in requires Firebase Console authorized domains. In emulator mode, the app disables Google sign-in automatically.
