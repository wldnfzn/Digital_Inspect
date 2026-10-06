-- Script untuk menambahkan Dummy Account (Password semua: password123)
-- Anda bisa menjalankan ini di Supabase SQL Editor

INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES 
  -- Super Admin
  ('admin@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Super Admin', 'SUPER_ADMIN', true),
  
  -- Direktur
  ('direktur@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Bpk Direktur', 'DIRECTOR', true),
  
  -- General Manager
  ('gm@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Bpk General Manager', 'GENERAL_MANAGER', true),
  
  -- Customer Care Division Leader (MANAGER)
  ('cc_leader@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Budi (CC Leader)', 'MANAGER', true),
  ('manager@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Test Manager', 'MANAGER', true),
  
  -- Customer Care Mekanik (MECHANIC)
  ('mekanik1@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Joko Mekanik', 'MECHANIC', true),
  ('mekanik2@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Andi Mekanik', 'MECHANIC', true),
  
  -- Sales
  ('sales1@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Siti Sales', 'SALES', true),
  
  -- Technical & Inventory
  ('inventory@ump.co.id', '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy', 'Agus Inventory', 'TECH_INVENTORY', true)
ON CONFLICT (email) DO UPDATE SET 
  password_hash = '\\\.HMY9ACKCybnuksYFDgTb6OGi0AW0vvy',
  role = EXCLUDED.role;
