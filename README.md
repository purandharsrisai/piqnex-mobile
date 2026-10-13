# Piqnex Mobile (Expo / React Native)

User-facing app for the Piqnex spare-parts marketplace (iOS + Android). Talks to `piqnex-backend`.

## Run
```bash
npm install
npx expo start          # press i (iOS simulator), a (Android emulator), or scan the QR code with a dev build
```
- `.env.local` -> `EXPO_PUBLIC_DEMO=true` shows the whole app with sample data (no backend needed). Remove it to use the real API.
- Real API: set `EXPO_PUBLIC_API_URL` (Android emulator: `http://10.0.2.2:4000`, real phone: `http://<your-LAN-ip>:4000`).
- Typecheck: `npm run typecheck`.

## Versioning & commit messages

Every commit to this repo automatically gets a new version number (see the
`version` field in `package.json`; the app reads it from there, and Settings
shows it as "Piqnex v..."). This happens on its own via a git hook
(`.husky/pre-commit` -> `scripts/bump-version.js`) - you don't need to do
anything, and you shouldn't try to skip it. The hook is installed by
`npm install` (the `prepare` script). This means no code is ever committed
(or pushed) without the version changing.

Commit messages should be written in simple, plain English describing what
actually changed - no technical jargon - so that anyone, technical or not,
can read the project's history and understand it. This applies even to
small changes: instead of "fix bug", write something like "Fixed an issue
where the login button didn't work on mobile phones."

## Before release
- Delete demo mode: `src/lib/demo-data.ts` and the `DEMO_MODE` branch in `src/lib/api.ts`; unset `EXPO_PUBLIC_DEMO`.
- Push notifications need a development/production build (not Expo Go) and an EAS `projectId` in `app.json`; backend needs `prisma migrate deploy` for `push_tokens`.
- Photo upload works end-to-end only once the backend upload storage (S3/R2) exists.
