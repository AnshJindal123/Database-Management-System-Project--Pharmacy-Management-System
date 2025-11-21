-- Pharmacy Management System - Triggers, Procedures, and Functions
USE pharmacy_management;

-- ==================== DROP EXISTING OBJECTS ====================

DROP TRIGGER IF EXISTS before_patient_delete;
DROP TRIGGER IF EXISTS before_bill_insert;

DROP PROCEDURE IF EXISTS sp_AddPatient;
DROP PROCEDURE IF EXISTS sp_GetPatientPrescriptions;
DROP PROCEDURE IF EXISTS sp_UpdateDrugPrice;
DROP PROCEDURE IF EXISTS sp_MonthlySalesReport;
DROP PROCEDURE IF EXISTS sp_GetBelowPriceDrugs;

DROP FUNCTION IF EXISTS fn_PatientTotalSpending;
DROP FUNCTION IF EXISTS fn_PharmacyDrugCount;
DROP FUNCTION IF EXISTS fn_DoctorPrescriptionCount;

-- ==================== TRIGGERS ====================

-- Create audit table for patient deletions
CREATE TABLE IF NOT EXISTS patient_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    PID VARCHAR(10),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    deleted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger 1: Log when a patient is deleted
DELIMITER //
CREATE TRIGGER before_patient_delete
BEFORE DELETE ON patient
FOR EACH ROW
BEGIN
    INSERT INTO patient_audit (PID, first_name, last_name)
    VALUES (OLD.PID, OLD.first_name, OLD.last_name);
END//
DELIMITER ;

-- Trigger 2: Validate bill amount is positive
DELIMITER //
CREATE TRIGGER before_bill_insert
BEFORE INSERT ON bill
FOR EACH ROW
BEGIN
    IF NEW.total_amt < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bill amount cannot be negative';
    END IF;
END//
DELIMITER ;

-- ==================== STORED PROCEDURES ====================

-- Procedure 1: Add new patient with error handling
DELIMITER //
CREATE PROCEDURE sp_AddPatient(
    IN p_pid VARCHAR(10),
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_sex CHAR(1),
    IN p_address VARCHAR(200),
    IN p_contact VARCHAR(15),
    IN p_insurance VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error: Patient could not be added' AS Message;
    END;

    START TRANSACTION;
    
    -- Insert into Patient table
    INSERT INTO patient (PID, first_name, last_name, sex, address, insurance_info)
    VALUES (p_pid, p_first_name, p_last_name, p_sex, p_address, p_insurance);
    
    -- Insert into patient_contact table if contact provided
    IF p_contact IS NOT NULL THEN
        INSERT INTO patient_contact (PID, contact_no)
        VALUES (p_pid, p_contact);
    END IF;
    
    COMMIT;
    SELECT 'Patient added successfully' AS Message;
END//
DELIMITER ;

-- Procedure 2: Get patient prescription history
DELIMITER //
CREATE PROCEDURE sp_GetPatientPrescriptions(IN p_pid VARCHAR(10))
BEGIN
    SELECT
        p.first_name,
        p.last_name,
        d.d_name AS Doctor_Name,
        pr.drug_name,
        pr.quantity,
        pr.date,
        dm.name AS Manufacturer
    FROM prescribe pr
    INNER JOIN patient p ON pr.PID = p.PID
    INNER JOIN doctor d ON pr.doc_id = d.doc_id
    INNER JOIN drug dr ON pr.drug_name = dr.drug_name
    INNER JOIN drug_manufacturer dm ON dr.company_id = dm.company_id
    WHERE pr.PID = p_pid
    ORDER BY pr.date DESC;
END//
DELIMITER ;

-- Procedure 3: Update drug price at a specific pharmacy
DELIMITER //
CREATE PROCEDURE sp_UpdateDrugPrice(
    IN p_phar_id VARCHAR(10),
    IN p_drug_name VARCHAR(100),
    IN p_new_price DECIMAL(10, 2)
)
BEGIN
    DECLARE drug_exists INT;

    SELECT COUNT(*) INTO drug_exists
    FROM sell
    WHERE phar_id = p_phar_id AND drug_name = p_drug_name;

    IF drug_exists > 0 THEN
        UPDATE sell
        SET price = p_new_price
        WHERE phar_id = p_phar_id AND drug_name = p_drug_name;

        SELECT CONCAT('Price updated for ', p_drug_name, ' at ', p_phar_id, '. New price: $', p_new_price) AS Message;
    ELSE
        SELECT 'Drug not found in pharmacy inventory' AS Message;
    END IF;
END//
DELIMITER ;

-- Procedure 4: Generate monthly sales report
DELIMITER //
CREATE PROCEDURE sp_MonthlySalesReport(IN p_month INT, IN p_year INT)
BEGIN
    SELECT
        ph.name AS Pharmacy_Name,
        COUNT(DISTINCT b.bill_id) AS Total_Bills,
        COALESCE(SUM(b.total_amt), 0) AS Total_Revenue,
        COALESCE(AVG(b.total_amt), 0) AS Average_Bill_Amount
    FROM pharmacy ph
    LEFT JOIN bill b ON ph.phar_id = b.phar_id
        AND MONTH(b.date) = p_month 
        AND YEAR(b.date) = p_year
    GROUP BY ph.phar_id, ph.name
    ORDER BY Total_Revenue DESC;
END//
DELIMITER ;

-- Procedure 5: Get drugs below a certain price threshold
DELIMITER //
CREATE PROCEDURE sp_GetBelowPriceDrugs(IN p_threshold DECIMAL(10, 2))
BEGIN
    SELECT
        ph.name AS Pharmacy_Name,
        s.drug_name,
        s.price
    FROM sell s
    INNER JOIN pharmacy ph ON s.phar_id = ph.phar_id
    WHERE s.price < p_threshold
    ORDER BY s.price ASC;
END//
DELIMITER ;

-- ==================== FUNCTIONS ====================

-- Function 1: Calculate patient total spending
DELIMITER //
CREATE FUNCTION fn_PatientTotalSpending(p_pid VARCHAR(10))
RETURNS DECIMAL(10, 2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10, 2);

    SELECT COALESCE(SUM(total_amt), 0) INTO total
    FROM bill
    WHERE PID = p_pid;

    RETURN total;
END//
DELIMITER ;

-- Function 2: Get pharmacy drug count
DELIMITER //
CREATE FUNCTION fn_PharmacyDrugCount(p_phar_id VARCHAR(10))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE drug_count INT;

    SELECT COUNT(*) INTO drug_count
    FROM sell
    WHERE phar_id = p_phar_id;

    RETURN drug_count;
END//
DELIMITER ;

-- Function 3: Calculate doctor prescription count
DELIMITER //
CREATE FUNCTION fn_DoctorPrescriptionCount(p_doc_id VARCHAR(10))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE presc_count INT;

    SELECT COUNT(*) INTO presc_count
    FROM prescribe
    WHERE doc_id = p_doc_id;

    RETURN presc_count;
END//
DELIMITER ;