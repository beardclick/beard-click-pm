-- Migration: Add missing columns to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ruc TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update comments
COMMENT ON COLUMN clients.ruc IS 'Tax ID (Registro Único de Contribuyentes)';
COMMENT ON COLUMN clients.phone IS 'Client contact phone number';
