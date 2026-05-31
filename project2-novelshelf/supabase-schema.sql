-- NovelShelf Supabase schema
-- Run this file in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

drop table if exists reviews;
drop table if exists bookshelves;
drop table if exists chapters;
drop table if exists novels;

create table novels (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    author text not null,
    category text not null,
    description text not null,
    cover_url text,
    created_at timestamptz not null default now()
);

create table chapters (
    id uuid primary key default gen_random_uuid(),
    novel_id uuid not null references novels(id) on delete cascade,
    chapter_number integer not null,
    title text not null,
    content text not null,
    created_at timestamptz not null default now(),
    unique (novel_id, chapter_number)
);

create table bookshelves (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    novel_id uuid not null references novels(id) on delete cascade,
    current_chapter_id uuid references chapters(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, novel_id)
);

create table reviews (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    novel_id uuid not null references novels(id) on delete cascade,
    rating integer not null check (rating between 1 and 5),
    comment text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, novel_id)
);

alter table novels enable row level security;
alter table chapters enable row level security;
alter table bookshelves enable row level security;
alter table reviews enable row level security;

create policy "Anyone can read novels"
on novels for select
to anon, authenticated
using (true);

create policy "Anyone can read chapters"
on chapters for select
to anon, authenticated
using (true);

create policy "Users can read their own bookshelf"
on bookshelves for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can add to their own bookshelf"
on bookshelves for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own bookshelf"
on bookshelves for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete from their own bookshelf"
on bookshelves for delete
to authenticated
using (auth.uid() = user_id);

create policy "Anyone can read reviews"
on reviews for select
to anon, authenticated
using (true);

create policy "Users can create their own reviews"
on reviews for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
on reviews for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
on reviews for delete
to authenticated
using (auth.uid() = user_id);

insert into novels (title, author, category, description, cover_url) values
('Mist Harbor Academy', 'Lin Vale', 'Fantasy', 'A transfer student discovers that the old library under campus is a gateway to a city built on clouds.', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80'),
('After Class, We Hunt Stars', 'Mira Chen', 'Sci-Fi', 'Three roommates build a telescope app that starts receiving messages from their future selves.', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80'),
('The Tea Shop Detective', 'Jun Park', 'Mystery', 'A quiet tea shop near campus becomes the meeting place for students solving strange local cases.', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80');

insert into chapters (novel_id, chapter_number, title, content)
select id, 1, 'Chapter 1: The Door Beneath the Library',
'The rain had not stopped for three days. When Nora followed the silver bookmark down the library stairs, she expected dust, not a glowing door humming like a sleeping storm.'
from novels where title = 'Mist Harbor Academy';

insert into chapters (novel_id, chapter_number, title, content)
select id, 2, 'Chapter 2: Cloud Street',
'Beyond the door, the city floated in pale blue light. Every road curled upward, and every window reflected a sky that did not belong to the world she knew.'
from novels where title = 'Mist Harbor Academy';

insert into chapters (novel_id, chapter_number, title, content)
select id, 1, 'Chapter 1: Signal After Midnight',
'The telescope app was supposed to chart stars. At 12:07 a.m., it displayed a message instead: Do not go to the physics building tomorrow.'
from novels where title = 'After Class, We Hunt Stars';

insert into chapters (novel_id, chapter_number, title, content)
select id, 2, 'Chapter 2: A Future Problem',
'Kai read the message six times. Mei laughed once, then stopped when the timestamp changed to one week from now.'
from novels where title = 'After Class, We Hunt Stars';

insert into chapters (novel_id, chapter_number, title, content)
select id, 1, 'Chapter 1: Jasmine and Footprints',
'The first clue was a line of wet footprints crossing the tea shop floor, even though no customer had entered since noon.'
from novels where title = 'The Tea Shop Detective';

insert into chapters (novel_id, chapter_number, title, content)
select id, 2, 'Chapter 2: The Missing Notebook',
'By sunset, Mina had three suspects, two cups of cold jasmine tea, and one notebook that everyone claimed they had never seen.'
from novels where title = 'The Tea Shop Detective';
