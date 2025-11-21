-- PHARMACY MANAGEMENT SYSTEM - DATABASE CREATION
CREATE DATABASE IF NOT EXISTS pharmacy_management;
USE pharmacy_management;

-- DROP TABLES (if they exist)
DROP TABLE IF EXISTS patient_contact;
DROP TABLE IF EXISTS employee_contact;
DROP TABLE IF EXISTS doctor_speciality;
DROP TABLE IF EXISTS sell;
DROP TABLE IF EXISTS contract;
DROP TABLE IF EXISTS work;
DROP TABLE IF EXISTS prescribe;
DROP TABLE IF EXISTS medical_record;
DROP TABLE IF EXISTS bill;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS pharmacy;
DROP TABLE IF EXISTS drug;
DROP TABLE IF EXISTS drug_manufacturer;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS patient_audit;

-- ==================== STRONG ENTITY TABLES ====================

-- Patient Table
CREATE TABLE patient (
    PID VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    sex CHAR(1) CHECK (sex IN ('M', 'F', 'O')),
    address VARCHAR(200),
    insurance_info VARCHAR(100)
);

-- Doctor Table
CREATE TABLE doctor (
    doc_id VARCHAR(10) PRIMARY KEY,
    d_name VARCHAR(100) NOT NULL
);

-- Drug Manufacturer Table
CREATE TABLE drug_manufacturer (
    company_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200)
);

-- Drug Table (Includes Manufacturer FK)
CREATE TABLE drug (
    drug_name VARCHAR(100) PRIMARY KEY,
    description VARCHAR(500),
    company_id VARCHAR(10),
    FOREIGN KEY (company_id) REFERENCES drug_manufacturer(company_id) ON DELETE SET NULL
);

-- Pharmacy Table
CREATE TABLE pharmacy (
    phar_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    fax VARCHAR(20)
);

-- Employee Table
CREATE TABLE employee (
    employee_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    sex CHAR(1) CHECK (sex IN ('M', 'F', 'O')),
    salary DECIMAL(10, 2)
);

-- Bill Table (Includes Patient and Pharmacy FKs)
CREATE TABLE bill (
    bill_id VARCHAR(10) PRIMARY KEY,
    date DATE NOT NULL,
    total_amt DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    PID VARCHAR(10) NOT NULL,
    phar_id VARCHAR(10) NOT NULL,
    FOREIGN KEY (PID) REFERENCES patient(PID) ON DELETE CASCADE,
    FOREIGN KEY (phar_id) REFERENCES pharmacy(phar_id) ON DELETE CASCADE
);

-- ==================== WEAK ENTITY TABLE ====================

-- Medical Record (Weak Entity - depends on Patient)
CREATE TABLE medical_record (
    record_no VARCHAR(10),
    PID VARCHAR(10),
    diagnosis TEXT,
    visit_date DATE,
    PRIMARY KEY (record_no, PID),
    FOREIGN KEY (PID) REFERENCES patient(PID) ON DELETE CASCADE
);

-- ==================== MULTIVALUED ATTRIBUTE TABLES ====================

-- Patient Contact Numbers
CREATE TABLE patient_contact (
    PID VARCHAR(10),
    contact_no VARCHAR(15),
    PRIMARY KEY (PID, contact_no),
    FOREIGN KEY (PID) REFERENCES patient(PID) ON DELETE CASCADE
);

-- Employee Contact Numbers
CREATE TABLE employee_contact (
    employee_id VARCHAR(10),
    contact_no VARCHAR(15),
    PRIMARY KEY (employee_id, contact_no),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- Doctor Speciality
CREATE TABLE doctor_speciality (
    doc_id VARCHAR(10),
    speciality VARCHAR(100),
    PRIMARY KEY (doc_id, speciality),
    FOREIGN KEY (doc_id) REFERENCES doctor(doc_id) ON DELETE CASCADE
);

-- ==================== RELATIONSHIP TABLES ====================

-- Prescribe Relationship (Ternary with attributes)
CREATE TABLE prescribe (
    PID VARCHAR(10),
    doc_id VARCHAR(10),
    drug_name VARCHAR(100),
    date DATE,
    quantity INT,
    PRIMARY KEY (PID, doc_id, drug_name, date),
    FOREIGN KEY (PID) REFERENCES patient(PID) ON DELETE CASCADE,
    FOREIGN KEY (doc_id) REFERENCES doctor(doc_id) ON DELETE CASCADE,
    FOREIGN KEY (drug_name) REFERENCES drug(drug_name) ON DELETE CASCADE
);

-- Sell Relationship (M:N with price attribute)
CREATE TABLE sell (
    drug_name VARCHAR(100),
    phar_id VARCHAR(10),
    price DECIMAL(10, 2),
    PRIMARY KEY (drug_name, phar_id),
    FOREIGN KEY (drug_name) REFERENCES drug(drug_name) ON DELETE CASCADE,
    FOREIGN KEY (phar_id) REFERENCES pharmacy(phar_id) ON DELETE CASCADE
);

-- Contract Relationship (M:N with attributes)
CREATE TABLE contract (
    company_id VARCHAR(10),
    phar_id VARCHAR(10),
    start_date DATE,
    end_date DATE,
    PRIMARY KEY (company_id, phar_id),
    FOREIGN KEY (company_id) REFERENCES drug_manufacturer(company_id) ON DELETE CASCADE,
    FOREIGN KEY (phar_id) REFERENCES pharmacy(phar_id) ON DELETE CASCADE
);

-- Work Relationship (M:N with shift attributes)
CREATE TABLE work (
    employee_id VARCHAR(10),
    phar_id VARCHAR(10),
    shift_start TIME,
    shift_end TIME,
    PRIMARY KEY (employee_id, phar_id),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (phar_id) REFERENCES pharmacy(phar_id) ON DELETE CASCADE
);