-- USERS & AUTH (Custom JWT)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN','DIRECTOR','MANAGER','MECHANIC')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FORKLIFTS
CREATE TABLE forklifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT UNIQUE NOT NULL,
  model TEXT,
  customer_id UUID REFERENCES customers(id),
  qr_code_url TEXT,
  health_score NUMERIC(5,2) DEFAULT 0,
  health_status TEXT DEFAULT 'HEALTHY' CHECK (health_status IN ('HEALTHY','ATTENTION','CRITICAL')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- BATTERIES
CREATE TABLE batteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT UNIQUE NOT NULL,
  brand TEXT,
  voltage NUMERIC(6,2),
  customer_id UUID REFERENCES customers(id),
  qr_code_url TEXT,
  status TEXT DEFAULT 'STANDBY' CHECK (status IN ('STANDBY','IN_USE','MAINTENANCE')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INSPECTION TEMPLATE CATEGORIES
CREATE TABLE inspection_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INSPECTION TEMPLATE ITEMS
CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES inspection_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INSPECTION TASKS (Scheduled by Manager)
CREATE TABLE inspection_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('FORKLIFT','BATTERY')),
  forklift_id UUID REFERENCES forklifts(id),
  battery_id UUID REFERENCES batteries(id),
  assigned_to UUID REFERENCES users(id),  -- Mechanic
  assigned_by UUID REFERENCES users(id),  -- Manager
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FORKLIFT INSPECTIONS (Completed by Mechanic)
CREATE TABLE forklift_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES inspection_tasks(id),
  forklift_id UUID NOT NULL REFERENCES forklifts(id),
  mechanic_id UUID NOT NULL REFERENCES users(id),
  total_score INT,
  total_items INT,
  health_percentage NUMERIC(5,2),
  health_status TEXT CHECK (health_status IN ('HEALTHY','ATTENTION','CRITICAL')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FORKLIFT INSPECTION SCORES (Per Item)
CREATE TABLE forklift_inspection_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES forklift_inspections(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inspection_items(id),
  score INT NOT NULL CHECK (score IN (1,2,3)),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BATTERY SERVICE REPORTS (Completed by Mechanic)
CREATE TABLE battery_service_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES inspection_tasks(id),
  battery_id UUID NOT NULL REFERENCES batteries(id),
  mechanic_id UUID NOT NULL REFERENCES users(id),
  voltage_reading NUMERIC(6,2),
  water_level TEXT CHECK (water_level IN ('GOOD','LOW')),
  water_added_liters NUMERIC(5,2),
  terminal_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AUDIT LOG
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  target TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IN-APP NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SYSTEM SETTINGS
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
