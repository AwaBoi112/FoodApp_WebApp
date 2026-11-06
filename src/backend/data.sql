INSERT INTO profiles (id, email, full_name, phone, role, is_approved) VALUES
('11111111-1111-1111-1111-111111111111', 'vasarlo@teszt.hu', 'Teszt Vásárló', '+36301234567', 'CUSTOMER', true),
('22222222-2222-2222-2222-222222222222', 'admin@pizzaparadicsom.hu', 'Pizza Admin', '+36201234567', 'RESTAURANT_ADMIN', true),
('33333333-3333-3333-3333-333333333333', 'futar@teszt.hu', 'Gyors Futár', '+36701234567', 'COURIER', true);

INSERT INTO restaurants (id, owner_id, name, address, latitude, longitude, is_approved, category, image_url, delivery_fee, delivery_time_min, delivery_time_max) VALUES
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Pizza Paradicsom', '1051 Budapest, Fő tér 1.', 47.4979, 19.0402, true, 'Olasz', 'https://példa.hu/pizza.jpg', 990, 30, 45);

INSERT INTO menu_items (id, restaurant_id, name, description, price, category, calories, protein, carbs, fat, is_available) VALUES
('66666666-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Margherita Pizza', 'Klasszikus olasz pizza paradicsomszósszal és mozzarellával', 2500, 'Főétel', 850, 35, 110, 25, true),
('66666666-2222-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Tiramisu', 'Eredeti olasz desszert', 1500, 'Desszert', 450, 8, 45, 20, true);

INSERT INTO courier_details (id, vehicle_type, license_plate, is_online, current_lat, current_lng) VALUES
('33333333-3333-3333-3333-333333333333', 'Robogó', 'ABC-123', true, 47.4980, 19.0410);

INSERT INTO orders (id, customer_id, restaurant_id, courier_id, status, total_price, total_calories, delivery_address) VALUES
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'DELIVERED', 4990, 1300, '1065 Budapest, Andrássy út 10.');

INSERT INTO order_items (id, order_id, menu_item_id, quantity, price_at_time) VALUES
(gen_random_uuid(), '88888888-8888-8888-8888-888888888888', '66666666-1111-1111-1111-111111111111', 1, 2500),
(gen_random_uuid(), '88888888-8888-8888-8888-888888888888', '66666666-2222-1111-1111-111111111111', 1, 1500);

INSERT INTO reviews (id, order_id, customer_id, restaurant_id, rating, comment) VALUES
(gen_random_uuid(), '88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 5, 'Nagyon finom volt és gyorsan megérkezett!');

INSERT INTO job_application (id, restaurant_id, applicant_id, position_type, message, cv_url, status) VALUES
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Futár', 'Szeretnék nálatok dolgozni hétvégente.', 'https://példa.hu/cv.pdf', 'PENDING');

INSERT INTO profiles (id, email, full_name, phone, role, is_approved) VALUES
('44444444-1111-1111-1111-111111111111', 'burger@teszt.hu', 'Burger Admin', '+36301112222', 'RESTAURANT_ADMIN'::user_role, true),
('44444444-2222-2222-2222-222222222222', 'sushi@teszt.hu', 'Sushi Admin', '+36302223333', 'RESTAURANT_ADMIN'::user_role, true),
('44444444-3333-3333-3333-333333333333', 'indiai@teszt.hu', 'Indiai Admin', '+36303334444', 'RESTAURANT_ADMIN'::user_role, true),
('44444444-4444-4444-4444-444444444444', 'vegan@teszt.hu', 'Vegán Admin', '+36304445555', 'RESTAURANT_ADMIN'::user_role, true),
('44444444-5555-5555-5555-555555555555', 'kebab@teszt.hu', 'Kebab Admin', '+36305556666', 'RESTAURANT_ADMIN'::user_role, true);

INSERT INTO restaurants (id, owner_id, name, address, latitude, longitude, is_approved, category, image_url, delivery_fee, delivery_time_min, delivery_time_max) VALUES
('55555555-1111-1111-1111-111111111111', '44444444-1111-1111-1111-111111111111', 'Szaftos Burger', '1075 Budapest, Király utca 10.', 47.4988, 19.0583, true, 'Hamburger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 790, 20, 40),
('55555555-2222-2222-2222-222222222222', '44444444-2222-2222-2222-222222222222', 'Tokyo Sushi', '1061 Budapest, Andrássy út 45.', 47.5042, 19.0621, true, 'Ázsiai', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c', 1200, 40, 60),
('55555555-3333-3333-3333-333333333333', '44444444-3333-3333-3333-333333333333', 'Taj Mahal Indiai', '1085 Budapest, József krt. 30.', 47.4912, 19.0689, true, 'Indiai', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe', 890, 35, 50),
('55555555-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Zöld Tál Vegán', '1054 Budapest, Szabadság tér 5.', 47.5034, 19.0512, true, 'Egészséges', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', 690, 15, 30),
('55555555-6666-6666-6666-666666666666', '44444444-5555-5555-5555-555555555555', 'Oázis Kebab', '1092 Budapest, Ráday utca 12.', 47.4871, 19.0614, true, 'Gyros', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783', 500, 15, 25);

INSERT INTO menu_items (id, restaurant_id, name, description, price, category, calories, protein, carbs, fat, is_available) VALUES
('66666666-3333-1111-1111-111111111111', '55555555-1111-1111-1111-111111111111', 'Dupla Húsos Burger', 'Két szaftos marhahúspogácsa, cheddar sajt, bacon, házi szósz.', 3200, 'Főétel', 950, 45, 60, 50, true),
('66666666-4444-1111-1111-111111111111', '55555555-1111-1111-1111-111111111111', 'Sajtos Sültkrumpli', 'Ropogós hasábburgonya olvasztott cheddar szósszal.', 1200, 'Köretek', 500, 8, 55, 25, true),
('66666666-5555-1111-1111-111111111111', '55555555-1111-1111-1111-111111111111', 'Kézműves Cola', 'Helyben főzött cukormentes kólakivonat.', 800, 'Italok', 5, 0, 1, 0, true),
('66666666-6666-1111-1111-111111111111', '55555555-2222-2222-2222-222222222222', 'Lazac Nigiri (4db)', 'Friss norvég lazacszeletek rizságyon.', 2400, 'Sushi', 250, 15, 30, 5, true),
('66666666-7777-1111-1111-111111111111', '55555555-2222-2222-2222-222222222222', 'Spicy Tuna Roll (8db)', 'Fűszeres tonhal, avokádó, uborka, szezámmag.', 3500, 'Sushi', 400, 20, 50, 12, true),
('66666666-8888-1111-1111-111111111111', '55555555-2222-2222-2222-222222222222', 'Miso Leves', 'Tradicionális japán szójapaszta leves tofuval.', 1100, 'Levesek', 80, 6, 8, 3, true),
('66666666-9999-1111-1111-111111111111', '55555555-3333-3333-3333-333333333333', 'Chicken Tikka Masala', 'Grillezett csirkemell sűrű, fűszeres paradicsomos szószban.', 3800, 'Főétel', 600, 40, 25, 35, true),
('66666666-aaaa-1111-1111-111111111111', '55555555-3333-3333-3333-333333333333', 'Fokhagymás Naan', 'Kemencében sült friss indiai laposkenyér fokhagymával.', 900, 'Köretek', 280, 8, 45, 8, true),
('66666666-bbbb-1111-1111-111111111111', '55555555-4444-4444-4444-444444444444', 'Nagy Falafel Tál', 'Házi falafel golyók, hummusz, friss saláta és pita.', 2900, 'Főétel', 550, 18, 65, 22, true),
('66666666-cccc-1111-1111-111111111111', '55555555-4444-4444-4444-444444444444', 'Zöld Smoothie', 'Spenót, banán, alma és gyömbér frissen turmixolva.', 1500, 'Italok', 150, 3, 35, 1, true),
('66666666-dddd-1111-1111-111111111111', '55555555-6666-6666-6666-666666666666', 'Dürüm Borjúhúsból', 'Óriás tortillába tekert friss borjúhús salátával, joghurtos szósszal.', 2200, 'Főétel', 700, 35, 60, 30, true),
('66666666-eeee-1111-1111-111111111111', '55555555-6666-6666-6666-666666666666', 'Baklava (3db)', 'Mézes-diós török édesség.', 1200, 'Desszert', 450, 5, 55, 25, true);

-- fixing the datas
ALTER TABLE public.menu_items 
ALTER COLUMN price TYPE NUMERIC(10, 2) USING price::NUMERIC;

UPDATE public.menu_items
SET price = price / 100.0;

ALTER TABLE public.restaurants 
ALTER COLUMN delivery_fee TYPE NUMERIC(10, 2) USING delivery_fee::NUMERIC;

UPDATE public.restaurants
SET delivery_fee = delivery_fee / 100.0;

UPDATE public.restaurants
SET image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591'
WHERE category = 'Olasz';