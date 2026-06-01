# NovelShelf

NovelShelf is a small web app for browsing online novels, saving novels to a personal bookshelf, tracking reading progress, and writing reviews.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Supabase Auth + Supabase PostgreSQL
- Hosting option: GitHub Pages

## Features

- Register and log in with Supabase Auth
- Browse novels in the Book Store
- Open a novel detail page with chapters and reviews
- Search novels and filter by category
- Add novels to My Bookshelf
- Save current reading progress
- Create, read, update, and delete multiple reviews or follow-up comments
- Remove novels from My Bookshelf

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase-schema.sql`.
4. If you already ran the first version of the schema, run `supabase-migration-v2.sql` instead of dropping your existing data.
5. Go to Authentication -> Providers and enable Email auth.
6. Open `config.js`.
7. Replace the placeholders with your Supabase project URL and publishable key:

```js
window.NOVELSHELF_CONFIG = {
    supabaseUrl: 'https://your-project-id.supabase.co',
    supabaseAnonKey: 'your-anon-key'
};
```

## Run Locally

Because this is a static frontend, you can run it with any simple local server.

Using Python:

```powershell
python -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080
```

## Demo Checklist

1. Register a new account.
2. Log in.
3. Browse the Book Store.
4. Open a novel detail page.
5. Add a novel to My Bookshelf.
6. Search or filter the Book Store.
7. Open a chapter, use previous/next chapter controls, and save reading progress.
8. Create multiple reviews or follow-up comments.
9. Edit one of your reviews.
10. Delete one of your reviews.
11. Remove a novel from My Bookshelf.

## Files

- `spec.md`: project specification
- `supabase-schema.sql`: Supabase database schema and seed data
- `supabase-migration-v2.sql`: incremental update for existing Supabase projects
- `index.html`: app shell
- `styles.css`: app styling
- `app.js`: Supabase queries and UI logic
- `config.js`: Supabase project configuration
