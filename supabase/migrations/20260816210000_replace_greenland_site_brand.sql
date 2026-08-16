-- Site-only brand cleanup. This does not modify Stripe account branding,
-- business details, invoices, or payment configuration.
update public.community_profile
set
  name = 'Solver',
  owner_label = case when lower(coalesce(owner_label, '')) = 'greenland llc' then 'Solver' else owner_label end
where lower(trim(name)) = 'greenland llc'
   or lower(trim(coalesce(owner_label, ''))) = 'greenland llc';

update public.courses
set title = 'Solver'
where lower(trim(title)) = 'greenland llc';
