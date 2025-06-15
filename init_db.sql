-- Insert sample admin user
INSERT INTO users (name, username, password, email, role) VALUES 
('Admin User', 'admin', '$2b$10$rQzK5K5K5K5K5K5K5K5K5OxQzK5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'admin@focar.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (make, model, year, vin, license_plate, color, vehicle_type, fuel_type, status) VALUES
('BMW', 'X5 M Competition', 2024, 'WBAFR7C54LC123456', 'FOC-001', 'Alpine White', 'SUV', 'gasoline', 'available'),
('BMW', 'i7 M70 xDrive', 2024, 'WBA7E2C54NC123457', 'FOC-002', 'Storm Bay', 'Sedan', 'electric', 'available'),
('BMW', 'XM 2024 Edition', 2024, 'WBSJF0C54PC123458', 'FOC-003', 'Carbon Black', 'SUV', 'hybrid', 'available'),
('BMW', 'M3 Competition', 2024, 'WBS8M9C54PC123459', 'FOC-004', 'Alpine White', 'Sedan', 'gasoline', 'available'),
('BMW', 'iX xDrive50', 2024, 'WBAJZ6C54PC123460', 'FOC-005', 'Mineral Grey', 'SUV', 'electric', 'available')
ON CONFLICT (vin) DO NOTHING;

-- Insert sample drivers
INSERT INTO drivers (name, phone, email, license_number, license_expiry, ecg_number, permit_number, hire_date, status) VALUES
('John Smith', '+1-555-0101', 'john.smith@focar.com', 'D1234567890', '2025-12-31', 'ECG001', 'PRM001', '2024-01-15', 'active'),
('Sarah Johnson', '+1-555-0102', 'sarah.johnson@focar.com', 'D2345678901', '2026-06-30', 'ECG002', 'PRM002', '2024-02-01', 'active'),
('Michael Brown', '+1-555-0103', 'michael.brown@focar.com', 'D3456789012', '2025-09-15', 'ECG003', 'PRM003', '2023-11-20', 'active'),
('Emily Davis', '+1-555-0104', 'emily.davis@focar.com', 'D4567890123', '2026-03-20', 'ECG004', 'PRM004', '2024-03-10', 'active')
ON CONFLICT (license_number) DO NOTHING;
