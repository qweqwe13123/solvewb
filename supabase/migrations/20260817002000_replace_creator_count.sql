UPDATE public.community_profile
SET description = replace(description, '26.4k creators', '100 creators'),
    body = replace(body, '26.4k creators', '100 creators')
WHERE description LIKE '%26.4k creators%'
   OR body LIKE '%26.4k creators%';

UPDATE public.courses
SET summary = replace(summary, '26.4k creators', '100 creators'),
    description = replace(description, '26.4k creators', '100 creators')
WHERE summary LIKE '%26.4k creators%'
   OR description LIKE '%26.4k creators%';
