-- =========================================================
-- MEDICARE HOSPITAL MANAGEMENT SYSTEM - POSTGRESQL SCHEMA
-- =========================================================

-- Drop tables in reverse foreign key order if needed
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- 1. Admins Table
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Doctors Table
CREATE TABLE doctors (
    doctor_id SERIAL PRIMARY KEY,
    doctor_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(department_id) ON DELETE CASCADE,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    availability VARCHAR(100) NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_consultation_fee CHECK (consultation_fee >= 0)
);

-- 4. Patients Table
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    blood_group VARCHAR(10) NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Appointments Table
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'In Progress')),
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Medical Records Table
CREATE TABLE medical_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    prescription TEXT NOT NULL,
    treatment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Billing Table
CREATE TABLE billing (
    bill_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Cancelled')),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal lookup and search performance
CREATE INDEX idx_patients_name ON patients(patient_name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_blood ON patients(blood_group);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_dept ON doctors(department_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_billing_status ON billing(payment_status);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);

