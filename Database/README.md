# Demo Credentials Setup

This folder contains the SQL script to create and populate the demo credentials table in your Supabase database.

## Setup Instructions

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Demo Credentials Script

Copy and paste the contents of `demo_credentials_table.sql` into the SQL editor and run it. This will:
- Create the `demo_credentials` table
- Add indexes for better performance
- Insert three demo accounts (Admin, Doctor, Patient)

### 3. Demo Accounts

After running the script, the following demo accounts will be available:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@mindtracker.com | admin123 | Full administrative access |
| **Doctor** | dr.smith@mindtracker.com | doctor123 | Psychologist demo account |
| **Patient** | demo@demo.com | demo123 | Patient demo account |

## Table Structure

```sql
CREATE TABLE demo_credentials (
  demo_id UUID PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security Note

⚠️ **IMPORTANT**: In production environments, passwords should **never** be stored in plain text. This table is for demo/testing purposes only. For production:
- Store hashed passwords only
- Use proper authentication mechanisms
- Consider using environment variables for demo credentials
- Implement rate limiting and account lockout policies

## Maintenance

To add new demo credentials:
```sql
INSERT INTO demo_credentials (role, email, password, display_name, description) 
VALUES ('role', 'email@example.com', 'password', 'Display Name', 'Description');
```

To disable a demo account:
```sql
UPDATE demo_credentials 
SET is_active = false 
WHERE email = 'email@example.com';
```

To view all active demo credentials:
```sql
SELECT role, email, display_name, description 
FROM demo_credentials 
WHERE is_active = true 
ORDER BY role;
```
