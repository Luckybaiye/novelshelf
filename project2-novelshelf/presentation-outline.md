# NovelShelf Presentation Outline

Target length: 5 minutes.

## 1. Problem and Target User - 1 minute

- NovelShelf is for students and casual readers who want a simple place to browse novels, save favorites, track reading progress, and write short reviews.
- The app focuses on two main pages: Book Store and My Bookshelf.

## 2. Live Demo - 2 minutes

- Register or log in with Supabase Auth.
- Show the unified Login/Register tab card.
- Log in and show the automatic redirect to the Account page.
- Update a password from the Account page and point out the toast/inline feedback.
- Log out from the Account page or top navigation.
- Browse, search, and filter the Book Store.
- Open a novel detail page.
- Add a novel to My Bookshelf.
- Open a chapter, use previous/next chapter controls, and save reading progress.
- Create multiple reviews or follow-up comments, edit one, and delete one.
- Remove a novel from My Bookshelf.

## 3. Database and Supabase - 45 seconds

- Tables: `novels`, `chapters`, `bookshelves`, `reviews`.
- Foreign keys connect chapters, bookshelves, and reviews to novels.
- `bookshelves.user_id` and `reviews.user_id` reference Supabase Auth users.
- Row-level security protects user-specific data.

## 4. AI Workflow - 45 seconds

- We wrote `spec.md` first to define features, entities, relationships, and user flows.
- Then we built one feature at a time and tested each flow in the browser.
- AI helped generate structure and code, but we checked database policies, CRUD behavior, and demo flow manually.

## 5. Reflection - 30 seconds

- Supabase made auth and hosted PostgreSQL faster than building a backend from scratch.
- The hardest part was coordinating frontend state with live database records, user-specific row-level security, and a smooth login/logout experience.
