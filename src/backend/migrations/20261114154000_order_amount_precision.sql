ALTER TABLE public.menu_items
  ALTER COLUMN price TYPE numeric(10, 2) USING price::numeric;

ALTER TABLE public.restaurants
  ALTER COLUMN delivery_fee TYPE numeric(10, 2) USING delivery_fee::numeric;

ALTER TABLE public.orders
  ALTER COLUMN total_price TYPE numeric(10, 2) USING total_price::numeric,
  ALTER COLUMN delivery_fee TYPE numeric(10, 2) USING delivery_fee::numeric;

ALTER TABLE public.order_items
  ALTER COLUMN price_at_time TYPE numeric(10, 2) USING price_at_time::numeric;
