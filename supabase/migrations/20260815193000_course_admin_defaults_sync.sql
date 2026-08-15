alter table public.community_profile
  add column if not exists owner_avatar text;

update public.community_profile
set
  price_label = '$49/month',
  members_label = '100 members',
  handle_label = 'solverwebsite.com/courses',
  body = replace(
    replace(body, '26.4k creators', '100 creators'),
    '$9/month',
    '$49/month'
  )
where price_label = '$9/month'
   or members_label = '26.4k members'
   or handle_label like '%skool.com%'
   or body like '%26.4k creators%'
   or body like '%$9/month%';

update public.courses
set
  price_label = '$49/month',
  summary = replace(summary, '26.4k creators', '100 creators'),
  description = replace(description, '$9/month', '$49/month')
where price_label = '$9/month'
   or summary like '%26.4k creators%'
   or description like '%$9/month%';

delete from public.user_roles ur
using auth.users u
where ur.user_id = u.id
  and ur.role = 'admin'
  and lower(u.email) <> 'turanoglumehmet1@gmail.com';

insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role
from auth.users u
where lower(u.email) = 'turanoglumehmet1@gmail.com'
on conflict (user_id, role) do nothing;
