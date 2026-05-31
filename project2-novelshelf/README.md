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
- Add novels to My Bookshelf
- Save current reading progress
- Create, read, update, and delete reviews
- Remove novels from My Bookshelf

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase-schema.sql`.
4. Go to Authentication -> Providers and enable Email auth.
5. Open `config.js`.
6. Replace the placeholders with your Supabase project URL and anon key:

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
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000
```

## Demo Checklist

1. Register a new account.
2. Log in.
3. Browse the Book Store.
4. Open a novel detail page.
5. Add a novel to My Bookshelf.
6. Open a chapter and save reading progress.
7. Create a review.
8. Edit the review.
9. Delete the review.
10. Remove a novel from My Bookshelf.

## Files

- `spec.md`: project specification
- `supabase-schema.sql`: Supabase database schema and seed data
- `index.html`: app shell
- `styles.css`: app styling
- `app.js`: Supabase queries and UI logic
- `config.js`: Supabase project configuration
