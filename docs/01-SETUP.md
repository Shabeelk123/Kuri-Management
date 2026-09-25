# Setup

## Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account
- VS Code with the **ES7+ React**, **Tailwind CSS IntelliSense**, and
  **Prettier** extensions (optional but helpful)

## 1. Create the project

```bash
npm create vite@latest kuri-ledger -- --template react
cd kuri-ledger
npm install
```

## 2. Install dependencies

```bash
npm install @supabase/supabase-js react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. Configure Tailwind

In `tailwind.config.js`, set the content paths so Tailwind scans your files:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // design tokens go here — see 04-DESIGN-TOKENS.md
    },
  },
  plugins: [],
}
```

Add the Tailwind directives to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 4. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Once created, go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
3. Go to **Authentication → Providers → Phone** and enable phone sign-in
   (you'll need to connect an SMS provider like Twilio under
   **Authentication → Providers → Phone → Twilio settings**)

## 5. Environment variables

Create `.env.local` in your project root:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never commit this file — add it to `.gitignore` (Vite does this by default).

## 6. Connect Supabase in code

Create `src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## 7. Run the schema

Open **Supabase → SQL Editor** and run the SQL from
[02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md).

## 8. Start the dev server

```bash
npm run dev
```

Open the printed `localhost` URL — resize your browser to ~390px width
(or open dev tools' device toolbar) since this is a mobile-first app.

## 9. Recommended VS Code settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [["className\\s*=\\s*[\"']([^\"']*)"]]
}
```
