-- ENABLE EXTENSIONS (If needed, e.g. for pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. INSERT INITIAL SUPER ADMIN
-- Password 'password123' bcrypt hash: $2a$10$X...
INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'admin@ump.co.id', 
  crypt('password123', gen_salt('bf')), 
  'Super Admin', 
  'SUPER_ADMIN', 
  true
);

-- 2. INSERT DUMMY MECHANICS
INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
  '22222222-2222-2222-2222-222222222222', 
  'budi@ump.co.id', 
  crypt('password123', gen_salt('bf')), 
  'Budi Santoso', 
  'MECHANIC', 
  true
),
(
  '33333333-3333-3333-3333-333333333333', 
  'andi@ump.co.id', 
  crypt('password123', gen_salt('bf')), 
  'Andi Pratama', 
  'MECHANIC', 
  true
);

-- 3. INSERT DUMMY MANAGER
INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
  '44444444-4444-4444-4444-444444444444', 
  'manager@ump.co.id', 
  crypt('password123', gen_salt('bf')), 
  'Manager Operasional', 
  'MANAGER', 
  true
);

-- 4. INSERT CUSTOMERS
INSERT INTO customers (id, name, location, contact_person)
VALUES 
  ('aaaa1111-1111-1111-1111-111111111111', 'PT ABC Cikarang', 'Cikarang Industrial Estate', 'Bapak Andi'),
  ('bbbb2222-2222-2222-2222-222222222222', 'PT XYZ Karawang', 'Karawang Barat', 'Ibu Siti');

-- 5. INSERT FORKLIFTS
INSERT INTO forklifts (id, asset_code, model, customer_id, health_score, health_status)
VALUES
  ('ffff1111-1111-1111-1111-111111111111', 'FL-0001', 'Toyota 8FBN25', 'aaaa1111-1111-1111-1111-111111111111', 92.5, 'HEALTHY'),
  ('ffff2222-2222-2222-2222-222222222222', 'FL-0015', 'Toyota 8FBN25', 'bbbb2222-2222-2222-2222-222222222222', 75.0, 'ATTENTION');

-- 6. INSERT BATTERIES
INSERT INTO batteries (id, asset_code, brand, voltage, customer_id, status)
VALUES
  ('bbbb1111-1111-1111-1111-111111111111', 'BT-0001', 'GS Yuasa 48V', 48.0, 'aaaa1111-1111-1111-1111-111111111111', 'IN_USE'),
  ('bbbb3333-3333-3333-3333-333333333333', 'BT-0003', 'GS Yuasa 48V', 48.0, 'bbbb2222-2222-2222-2222-222222222222', 'STANDBY');

-- 7. INSERT INSPECTION CATEGORIES & ITEMS
INSERT INTO inspection_categories (id, name, sort_order) VALUES
  ('cccc1111-1111-1111-1111-111111111111', 'Body & Structure', 1),
  ('cccc2222-2222-2222-2222-222222222222', 'Drive Unit', 2);

INSERT INTO inspection_items (category_id, name, is_critical, sort_order) VALUES
  ('cccc1111-1111-1111-1111-111111111111', 'Kondisi Rangka (Frame)', true, 1),
  ('cccc1111-1111-1111-1111-111111111111', 'Panel Body', false, 2),
  ('cccc2222-2222-2222-2222-222222222222', 'Motor Traksi', true, 1),
  ('cccc2222-2222-2222-2222-222222222222', 'Kebocoran Oli', true, 2);
