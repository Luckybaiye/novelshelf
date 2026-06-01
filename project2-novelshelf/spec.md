# NovelShelf Spec

## One-Line Description

NovelShelf is a web app for students and casual readers who want to browse online novels, save favorite novels to a personal bookshelf, track reading progress, and write reviews.

## Target User

The target users are college students and casual web-novel readers who want a simple place to discover novels, continue reading saved books, and share short reviews.

## Core Pages

- **Login / Register:** Users sign up and sign in with Supabase Auth.
- **Book Store:** Users browse all available novels.
- **Search and Filter:** Users search novels by title, author, or description and filter by category.
- **Novel Detail:** Users view a novel description, chapters, and reviews.
- **Reader:** Users read a selected chapter and update their reading progress.
- **My Bookshelf:** Users view saved novels, continue reading, update progress, or remove a novel.

## Entities and Attributes

### `novels`

- `id`: primary key
- `title`: novel title
- `author`: author name
- `category`: genre or category
- `description`: short description
- `cover_url`: cover image URL
- `created_at`: creation timestamp

### `chapters`

- `id`: primary key
- `novel_id`: foreign key referencing `novels.id`
- `chapter_number`: chapter order
- `title`: chapter title
- `content`: chapter body
- `created_at`: creation timestamp

### `bookshelves`

- `id`: primary key
- `user_id`: Supabase Auth user ID
- `novel_id`: foreign key referencing `novels.id`
- `current_chapter_id`: foreign key referencing `chapters.id`
- `created_at`: creation timestamp
- `updated_at`: last update timestamp

### `reviews`

- `id`: primary key
- `user_id`: Supabase Auth user ID
- `novel_id`: foreign key referencing `novels.id`
- `rating`: numeric rating from 1 to 5
- `comment`: review text
- `created_at`: creation timestamp
- `updated_at`: last update timestamp

## Relationships

- One novel has many chapters.
- One novel has many reviews.
- One user has many bookshelf records.
- One user has many reviews.
- One bookshelf record belongs to one user and one novel.
- One review belongs to one user and one novel.

## User Flows

1. **Register and browse:** A new user registers with email and password, logs in, opens the Book Store, and browses available novels.
2. **Save and continue reading:** A logged-in user opens a novel detail page, adds it to My Bookshelf, reads a chapter, and updates reading progress.
3. **Review CRUD:** A logged-in user creates a review for a novel, views it on the detail page, edits the rating/comment, and deletes the review.
4. **Bookshelf CRUD:** A logged-in user adds a novel to the bookshelf, views saved novels, updates the current chapter, and removes the novel from the bookshelf.

## CRUD Requirement Coverage

The app supports full CRUD on `reviews`:

- **Create:** Add a review on the novel detail page.
- **Read:** Display reviews for each novel.
- **Update:** Edit any review created by the current user.
- **Delete:** Delete any review created by the current user.

Users can also add multiple reviews or follow-up comments for the same novel, which supports a "read more, add more thoughts later" workflow.

The app also supports CRUD-like bookshelf management:

- **Create:** Add a novel to My Bookshelf.
- **Read:** View saved novels on My Bookshelf.
- **Update:** Save current reading progress.
- **Delete:** Remove a novel from My Bookshelf.

## ER Diagram / Schema

The schema SQL is provided in `supabase-schema.sql`. The main foreign-key relationships are:

- `chapters.novel_id -> novels.id`
- `bookshelves.novel_id -> novels.id`
- `bookshelves.current_chapter_id -> chapters.id`
- `bookshelves.user_id -> auth.users.id`
- `reviews.novel_id -> novels.id`
- `reviews.user_id -> auth.users.id`

## Backend Choice

This project uses Supabase as required by the assignment. Supabase provides hosted PostgreSQL, authentication, row-level security, and a JavaScript client, which makes it suitable for a small CRUD web app without building a custom backend server.
