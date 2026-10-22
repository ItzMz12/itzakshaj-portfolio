# ItzAkshaj Portfolio — Android-friendly starter

This is a fresh five-page HTML/CSS/JavaScript portfolio. It does not overwrite or require your old project. The visual design is a dark cinematic space theme with animated stars, a glowing planet, and clickable portal cards.

## Pages
1. `index.html` — Home / portal universe
2. `works.html` — My Works
3. `socials.html` — Socials & Contact placeholders
4. `message.html` — Google login, private message form, owner-only inbox
5. `upcoming.html` — Upcoming Projects

## Preview and publish
- Extract the ZIP on your phone.
- Upload the extracted project files and folders to a new GitHub repository (keep the folder structure).
- Import that repository into Vercel and deploy.
- For local preview, use any HTML preview app that supports multiple files, or open the deployed Vercel URL. Some phone file viewers block OAuth redirects.

## Set up private messages (Supabase + Google)
You must complete these steps before the message page can work.

### 1. Create a Supabase project
1. Create a project at https://supabase.com/.
2. Open **Project Settings → API** (or API Keys, depending on the current dashboard).
3. Copy the Project URL and the **publishable/anon public key**.
4. Edit `assets/config.js` and replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_KEY`.
5. Keep `ownerEmail` as your owner email: `l4xlxm@gmail.com`.
6. Never use the `service_role` / secret key in frontend JavaScript.

### 2. Enable Google sign-in
1. In Supabase, open **Authentication → Providers → Google** and enable Google.
2. Follow the provider setup instructions shown by Supabase to create a Google OAuth client in Google Cloud Console. Add the exact Supabase callback URL shown on the provider setup screen as an authorized redirect URI in Google Cloud.
3. In Google Cloud OAuth client settings, add your deployed Vercel domain under **Authorized JavaScript origins** when required.
4. In Supabase, open **Authentication → URL Configuration**. Add your Vercel URL (for example, `https://your-project.vercel.app`) to the allowed redirect URLs. Use your actual deployed domain; do not copy the example literally.
5. Use the current Supabase instructions in the dashboard if its labels differ.

### 3. Create the database tables and security policies
1. Open **SQL Editor** in Supabase.
2. Open `supabase/schema.sql` from this ZIP, copy all its SQL, and run it.
3. Do not skip this step: the row-level security policies prevent visitors from reading other users' messages.

### 4. Authorize your Google account as the owner
1. Deploy the site and visit `message.html`.
2. Sign in with Google using **l4xlxm@gmail.com** at least once. This creates your user in Supabase Auth.
3. In Supabase, open **Authentication → Users**, find that exact email, and copy its **User UID**.
4. Open **SQL Editor** and run the following query after replacing `PASTE_YOUR_USER_UID_HERE` with the copied UUID:

```sql
insert into public.portfolio_admins (user_id)
values ('PASTE_YOUR_USER_UID_HERE')
on conflict (user_id) do nothing;
```

Only add the UID for the intended owner account. Do not add visitors as admins. The owner inbox appears only for an authorized user, and the database policies enforce the same rule.

### 5. Test security before sharing
- Sign in as the owner account and confirm the inbox loads.
- Test with a different Google account: it should be able to send a message but must not see the inbox or read any messages.
- Do not share screenshots containing private messages or user email addresses publicly.
- If you need to revoke owner access, delete that UID from `public.portfolio_admins` in the SQL Editor.

## Important notes
- This starter does not include a contact email or social URLs that you haven't provided.
- The example project cards are clearly marked as concepts/placeholders; replace them with your real links and screenshots.
- The owner inbox is protected by database Row Level Security (RLS), not merely hidden in the page.
- For a public-facing site, consider adding CAPTCHA/rate limiting later to reduce spam.
- Supabase and Google dashboards can change; follow the exact callback/redirect values shown in your project dashboards.
