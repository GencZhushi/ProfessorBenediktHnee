# Professor Benedikt — Digital Assistant

A responsive landing page built with Next.js (App Router), TypeScript, and
Tailwind CSS. It shows the professor's photo, a heading, and gold "language"
buttons. Clicking a button plays that language's video, with an **Open Chat**
button underneath that opens the chat link in a new tab.

Everything visible is **editable live from a built-in Admin panel** — no code
changes or redeploys needed. Settings and uploaded media are stored in
Supabase.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Admin panel (live editing)

1. Click the small **Admin** button (top-left of the page), or go to `/admin`.
2. Sign in. The login shows **Prof. Dr. phil. Hans-Peter Benedikt**.
   - Password: **`Berlin123`**
3. From the panel you can, and changes go live instantly:
   - Edit the page text (professor name, assistant name, heading, footer).
   - **Change the photo** (upload a new image or paste a URL).
   - **Resize the photo** (displayed width + frame width/height — set to 400×700).
   - Edit the **default chat/GPT link** and the chat button label.
   - For each language button: edit the text, **upload a video** (or paste a
     direct `.mp4` / YouTube / Vimeo link), and set a **per-button chat link**.
   - **Add** new language buttons, reorder them, or delete them.

### Change the admin password

The password is stored (hashed) in the database, not in the code. To change it,
run this in the Supabase SQL editor (replace the new password):

```sql
update public.admin_secret
set password_hash = extensions.crypt('YourNewPassword', extensions.gen_salt('bf'))
where id = 1;
```

## How it works (backend)

- **Database** (`public.site_settings`) holds the whole config as JSON. It is
  world-readable, but writes only happen through the password-checked function
  `admin_save_config(password, config)`.
- **Storage** (`media` bucket) holds uploaded photos/videos and serves them via
  public URLs. Max upload size is **50 MB** per file — for longer videos, paste
  a YouTube/Vimeo link instead.
- The public URL + anon key are safe to ship in the browser; the admin password
  is verified inside Postgres.

## Customize defaults (optional)

Default values (used before anything is saved) live in `lib/settings.ts`.

## Project structure

```
app/
  layout.tsx            Root layout, fonts, dynamic metadata
  page.tsx              Photo + heading + buttons + footer (reads live settings)
  admin/page.tsx        Admin login + editor
components/
  LanguageButtons.tsx   Gold buttons + video modal (file / YouTube / Vimeo)
  admin/AdminPanel.tsx  The full editor UI
  admin/fields.tsx      Reusable inputs + upload button
lib/
  settings.ts           Types, defaults, and the live-settings fetcher
  supabase.ts           Supabase connection (public URL + anon key)
  adminClient.ts        Password check, save, media upload
  video.ts              YouTube / Vimeo / direct-file detection
```

## Build for production

```bash
npm run build
npm run start
```

## Deploy to GitHub + Netlify

This repo is already connected to GitHub (`GencZhushi/benedikproject`) and
Netlify. To ship changes, just push to `main`:

```bash
git add .
git commit -m "Your message"
git push
```

Netlify rebuilds automatically. **No environment variables are required** — the
public Supabase URL + anon key are baked in (overridable via
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

> Note: content edits made in the **Admin panel** (text, links, photo, videos)
> are saved to Supabase and appear instantly — they do **not** require a
> redeploy.
