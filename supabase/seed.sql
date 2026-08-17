insert into public.categories (key, name, description, sort_order)
values
  ('clothing', 'Clothing', 'Dresses, suits, traditional wear, and occasion wear.', 10),
  ('accessories', 'Accessories', 'Bags, shoes, jewelry, belts, and related rental items.', 20),
  ('event_equipment', 'Event Equipment', 'Decor, lights, tables, chairs, tents, and event supplies.', 30),
  ('tools_equipment', 'Tools & Equipment', 'Drills, cleaners, garden tools, and small machines.', 40),
  ('electronics', 'Electronics', 'Cameras, speakers, projectors, and similar equipment.', 50),
  ('sports_outdoor', 'Sports & Outdoor', 'Camping gear, surf gear, and sports equipment.', 60),
  ('baby_kids', 'Baby & Kids', 'Strollers, toys, party items, and age-based rentals.', 70),
  ('party_occasion', 'Party & Occasion', 'Costumes, props, decorations, and themed rentals.', 80)
on conflict (key) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;
