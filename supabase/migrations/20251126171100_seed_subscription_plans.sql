insert into public.subscription_plans (name, slug, monthly_price_cents, stripe_price_id, features)
values
  ('Free', 'FREE', 0, null, '{}'::jsonb),
  ('Vyte Plus', 'PLUS', 1499, null, '{}'::jsonb),
  ('Vyte Elite', 'ELITE', 2999, null, '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;
