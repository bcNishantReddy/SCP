-- Function to increment likes
create or replace function increment_likes()
returns integer
language sql
as $$
  update posts
  set likes_count = likes_count + 1
  where id = id
  returning likes_count;
$$;

-- Function to decrement likes
create or replace function decrement_likes()
returns integer
language sql
as $$
  update posts
  set likes_count = likes_count - 1
  where id = id
  returning likes_count;
$$;