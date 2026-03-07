-- Demo Credentials Table for Mind Tracker
-- This table stores demo/test credentials for different user roles

CREATE TABLE demo_credentials (
  demo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role, email)
);

-- Create index for faster lookups
CREATE INDEX idx_demo_credentials_role ON demo_credentials(role);
CREATE INDEX idx_demo_credentials_email ON demo_credentials(email);

-- Insert demo credentials
INSERT INTO demo_credentials (role, email, password, display_name, description) VALUES
('admin', 'admin@mindtracker.com', 'admin123', 'Admin Demo Account', 'Full administrative access to the system'),
('doctor', 'dr.smith@mindtracker.com', 'doctor123', 'Dr. Smith Demo Account', 'Psychologist demo account with patient management'),
('patient', 'demo@demo.com', 'demo123', 'Patient Demo Account', 'Patient demo account with full features');

-- Add comments for documentation
COMMENT ON TABLE demo_credentials IS 'Stores demo/test credentials for different user roles in the Mind Tracker application';
COMMENT ON COLUMN demo_credentials.role IS 'User role: patient, doctor, or admin';
COMMENT ON COLUMN demo_credentials.email IS 'Demo account email address';
COMMENT ON COLUMN demo_credentials.password IS 'Demo account password (in production, this should be hashed)';
COMMENT ON COLUMN demo_credentials.display_name IS 'Friendly display name for the demo account';
COMMENT ON COLUMN demo_credentials.description IS 'Description of what this demo account can do';
COMMENT ON COLUMN demo_credentials.is_active IS 'Whether this demo credential is currently active';
