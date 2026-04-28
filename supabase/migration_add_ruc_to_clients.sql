-- Migration: Add RUC to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ruc TEXT;

-- Update existing clients (optional, but good to have the column)
COMMENT ON COLUMN clients.ruc IS 'Tax ID (Registro Único de Contribuyentes)';
