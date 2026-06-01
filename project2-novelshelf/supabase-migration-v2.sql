-- NovelShelf v2 migration
-- Run this after the original schema if your Supabase project already exists.

alter table reviews drop constraint if exists reviews_user_id_novel_id_key;

insert into chapters (novel_id, chapter_number, title, content)
select id, 3, 'Chapter 3: The Bell Tower Oath',
'Nora followed the sound of bells to a tower with no staircase. The students waiting there wore blue coats and spoke as if they had known her name for years.'
from novels where title = 'Mist Harbor Academy'
on conflict (novel_id, chapter_number) do nothing;

insert into chapters (novel_id, chapter_number, title, content)
select id, 4, 'Chapter 4: Map of Unwritten Rooms',
'The map changed whenever Nora blinked. One room appeared only when she admitted she was afraid, and inside it waited a desk carved with her initials.'
from novels where title = 'Mist Harbor Academy'
on conflict (novel_id, chapter_number) do nothing;

insert into chapters (novel_id, chapter_number, title, content)
select id, 3, 'Chapter 3: The Observatory Key',
'The key was taped beneath the oldest telescope. It opened a cabinet full of printed star charts, each one marked with tomorrow''s date.'
from novels where title = 'After Class, We Hunt Stars'
on conflict (novel_id, chapter_number) do nothing;

insert into chapters (novel_id, chapter_number, title, content)
select id, 4, 'Chapter 4: Message Queue',
'By morning, the app had received twenty-seven warnings. Some were tiny, some impossible, and one simply said: Trust the quietest person in the room.'
from novels where title = 'After Class, We Hunt Stars'
on conflict (novel_id, chapter_number) do nothing;

insert into chapters (novel_id, chapter_number, title, content)
select id, 3, 'Chapter 3: Steam on the Window',
'A name appeared in the steam on the front window. Mina copied it down before the letters vanished, then realized the handwriting matched her own.'
from novels where title = 'The Tea Shop Detective'
on conflict (novel_id, chapter_number) do nothing;

insert into chapters (novel_id, chapter_number, title, content)
select id, 4, 'Chapter 4: The Receipt Drawer',
'The receipt drawer held orders from customers who had never visited. Each receipt ended with the same table number, though the tea shop had only six tables.'
from novels where title = 'The Tea Shop Detective'
on conflict (novel_id, chapter_number) do nothing;
