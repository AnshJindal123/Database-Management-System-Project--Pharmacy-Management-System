-- Sample Data Insertion for Pharmacy Management System
USE pharmacy_management;

-- ==================== INSERT PATIENTS ====================

INSERT INTO patient VALUES ('P001', 'John', 'Doe', 'M', '123 Main St, City', 'INS12345');
INSERT INTO patient VALUES ('P002', 'Jane', 'Smith', 'F', '456 Oak Ave, Town', 'INS67890');
INSERT INTO patient VALUES ('P003', 'Mike', 'Johnson', 'M', '789 Pine Rd, Village', 'INS54321');

-- Insert Patient Contacts
INSERT INTO patient_contact VALUES ('P001', '555-1234');
INSERT INTO patient_contact VALUES ('P001', '555-5678');
INSERT INTO patient_contact VALUES ('P002', '555-9012');
INSERT INTO patient_contact VALUES ('P003', '555-3456');

-- ==================== INSERT DOCTORS ====================

INSERT INTO doctor VALUES ('D001', 'Dr. Sarah Williams');
INSERT INTO doctor VALUES ('D002', 'Dr. Robert Brown');
INSERT INTO doctor VALUES ('D003', 'Dr. Emily Davis');

-- Insert Doctor Specialities
INSERT INTO doctor_speciality VALUES ('D001', 'Cardiology');
INSERT INTO doctor_speciality VALUES ('D001', 'Internal Medicine');
INSERT INTO doctor_speciality VALUES ('D002', 'Pediatrics');
INSERT INTO doctor_speciality VALUES ('D003', 'General Practice');
INSERT INTO doctor_speciality VALUES ('D003', 'Family Medicine');

-- ==================== INSERT DRUG MANUFACTURERS ====================

INSERT INTO drug_manufacturer VALUES ('C001', 'PharmaCorp Ltd', '100 Industrial Park, City');
INSERT INTO drug_manufacturer VALUES ('C002', 'MediLife Industries', '200 Business District, Town');
INSERT INTO drug_manufacturer VALUES ('C003', 'HealthPlus Pharma', '300 Medical Complex, Village');

-- ==================== INSERT DRUGS ====================

INSERT INTO drug VALUES ('Paracetamol', 'Pain reliever and fever reducer', 'C001');
INSERT INTO drug VALUES ('Amoxicillin', 'Antibiotic for bacterial infections', 'C002');
INSERT INTO drug VALUES ('Aspirin', 'Pain reliever and anti-inflammatory', 'C001');
INSERT INTO drug VALUES ('Lisinopril', 'Blood pressure medication', 'C003');

-- ==================== INSERT PHARMACIES ====================

INSERT INTO pharmacy VALUES ('PH001', 'City Care Pharmacy', '10 Central Plaza, City', '555-7890');
INSERT INTO pharmacy VALUES ('PH002', 'HealthFirst Pharmacy', '20 Market Street, Town', '555-7891');
INSERT INTO pharmacy VALUES ('PH003', 'QuickMeds Pharmacy', '30 Health Center, Village', '555-7892');

-- ==================== INSERT EMPLOYEES ====================

INSERT INTO employee VALUES ('E001', 'Tom', 'Anderson', 'M', 35000.00);
INSERT INTO employee VALUES ('E002', 'Lisa', 'Martinez', 'F', 32000.00);
INSERT INTO employee VALUES ('E003', 'David', 'Wilson', 'M', 33000.00);
INSERT INTO employee VALUES ('E004', 'Maria', 'Garcia', 'F', 34000.00);

-- Insert Employee Contacts
INSERT INTO employee_contact VALUES ('E001', '555-4001');
INSERT INTO employee_contact VALUES ('E001', '555-4002');
INSERT INTO employee_contact VALUES ('E002', '555-4003');
INSERT INTO employee_contact VALUES ('E003', '555-4004');
INSERT INTO employee_contact VALUES ('E004', '555-4005');

-- ==================== INSERT BILLS ====================

INSERT INTO bill VALUES ('B001', '2025-01-15', 150.50, 'Credit Card', 'P001', 'PH001');
INSERT INTO bill VALUES ('B002', '2025-01-16', 85.75, 'Cash', 'P002', 'PH001');
INSERT INTO bill VALUES ('B003', '2025-01-17', 220.00, 'Insurance', 'P003', 'PH002');
INSERT INTO bill VALUES ('B004', '2025-01-18', 95.25, 'Debit Card', 'P001', 'PH003');

-- ==================== INSERT MEDICAL RECORDS ====================

INSERT INTO medical_record VALUES ('MR001', 'P001', 'Hypertension, Type 2 Diabetes', '2025-01-15');
INSERT INTO medical_record VALUES ('MR002', 'P001', 'Annual Checkup - Normal', '2025-02-10');
INSERT INTO medical_record VALUES ('MR003', 'P002', 'Acute Bronchitis', '2025-01-16');
INSERT INTO medical_record VALUES ('MR004', 'P003', 'Sprained Ankle', '2025-01-17');

-- ==================== INSERT PRESCRIPTIONS ====================

INSERT INTO prescribe VALUES ('P001', 'D001', 'Lisinopril', '2025-01-15', 30);
INSERT INTO prescribe VALUES ('P002', 'D002', 'Amoxicillin', '2025-01-16', 14);
INSERT INTO prescribe VALUES ('P003', 'D003', 'Aspirin', '2025-01-17', 20);

-- ==================== INSERT SELL (Drug - Pharmacy) ====================

INSERT INTO sell VALUES ('Paracetamol', 'PH001', 5.50);
INSERT INTO sell VALUES ('Amoxicillin', 'PH001', 12.75);
INSERT INTO sell VALUES ('Aspirin', 'PH002', 4.25);
INSERT INTO sell VALUES ('Lisinopril', 'PH003', 15.00);
INSERT INTO sell VALUES ('Paracetamol', 'PH002', 5.75);
INSERT INTO sell VALUES ('Aspirin', 'PH001', 4.50);
INSERT INTO sell VALUES ('Lisinopril', 'PH001', 14.50);

-- ==================== INSERT CONTRACT (Manufacturer - Pharmacy) ====================

INSERT INTO contract VALUES ('C001', 'PH001', '2024-01-01', '2025-12-31');
INSERT INTO contract VALUES ('C002', 'PH001', '2024-06-01', '2026-05-31');
INSERT INTO contract VALUES ('C003', 'PH002', '2024-03-01', '2025-02-28');
INSERT INTO contract VALUES ('C001', 'PH003', '2024-09-01', '2025-08-31');
INSERT INTO contract VALUES ('C002', 'PH002', '2024-07-01', '2025-06-30');
INSERT INTO contract VALUES ('C003', 'PH003', '2024-04-01', '2025-03-31');

-- ==================== INSERT WORK RECORDS ====================

INSERT INTO work VALUES ('E001', 'PH001', '09:00:00', '17:00:00');
INSERT INTO work VALUES ('E002', 'PH001', '14:00:00', '22:00:00');
INSERT INTO work VALUES ('E003', 'PH002', '08:00:00', '16:00:00');
INSERT INTO work VALUES ('E004', 'PH003', '10:00:00', '18:00:00');