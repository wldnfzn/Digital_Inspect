-- Migration 002: Restrukturisasi Role, Tiket Order, Sparepart, & Draft Inspeksi

-- 1. Mengubah Constraint Role di tabel users (Menghapus constraint lama, buat yang baru)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('SUPER_ADMIN','DIRECTOR','GENERAL_MANAGER','MANAGER','MECHANIC','SALES','TECH_INVENTORY'));

-- 2. Membuat tabel Service Tickets
CREATE TABLE IF NOT EXISTS service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('FORKLIFT','BATTERY')),
  forklift_id UUID REFERENCES forklifts(id),
  battery_id UUID REFERENCES batteries(id),
  issue_type TEXT NOT NULL CHECK (issue_type IN ('KELUHAN_SERVICE', 'INSPEKSI_DADAKAN')),
  issue_description TEXT NOT NULL,
  sales_notes TEXT,
  leader_notes TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'ASSIGNED', 'COMPLETED', 'CANCELLED')),
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_mechanic_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 3. Membuat tabel Sparepart Requests
CREATE TABLE IF NOT EXISTS sparepart_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  asset_type TEXT CHECK (asset_type IN ('FORKLIFT','BATTERY')),
  forklift_id UUID REFERENCES forklifts(id),
  battery_id UUID REFERENCES batteries(id),
  ticket_id UUID REFERENCES service_tickets(id),
  urgency TEXT DEFAULT 'NORMAL' CHECK (urgency IN ('NORMAL', 'URGENT')),
  leader_notes TEXT,
  inventory_notes TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'PROCESSING', 'READY', 'REJECTED')),
  created_by UUID NOT NULL REFERENCES users(id),
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sparepart_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES sparepart_requests(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  part_number TEXT,
  quantity INT NOT NULL CHECK (quantity > 0)
);

-- 4. Modifikasi inspection_tasks
-- Tambah ticket_id agar bisa direlasikan dan diselesaikan otomatis
ALTER TABLE inspection_tasks ADD COLUMN IF NOT EXISTS ticket_id UUID REFERENCES service_tickets(id);

-- Tambah draft_data (JSONB) dan started_at (TIMESTAMPTZ) untuk fitur Mobile App
ALTER TABLE inspection_tasks ADD COLUMN IF NOT EXISTS draft_data JSONB;
ALTER TABLE inspection_tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Pastikan full_report_data dan additional_data ada di laporan akhir
ALTER TABLE forklift_inspections ADD COLUMN IF NOT EXISTS additional_data JSONB;
ALTER TABLE battery_service_reports ADD COLUMN IF NOT EXISTS full_report_data JSONB;
ALTER TABLE forklift_inspections ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE battery_service_reports ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
