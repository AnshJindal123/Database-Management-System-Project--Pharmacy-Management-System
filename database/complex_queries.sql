-- Complex Queries for Pharmacy Management System
USE pharmacy_management;

-- ==================== NESTED QUERIES ====================

-- Query 1: Find patients who have been prescribed drugs by more than one doctor
SELECT p.PID, p.first_name, p.last_name, COUNT(DISTINCT pr.doc_id) AS doctor_count
FROM patient p
WHERE p.PID IN (
    SELECT PID
    FROM prescribe
    GROUP BY PID
    HAVING COUNT(DISTINCT doc_id) > 1
)
GROUP BY p.PID, p.first_name, p.last_name;

-- Query 2: Find drugs that are more expensive than the average price
SELECT s.drug_name, s.phar_id, s.price, 
       (SELECT AVG(price) FROM sell) AS avg_price
FROM sell s
WHERE s.price > (
    SELECT AVG(price)
    FROM sell
)
ORDER BY s.price DESC;

-- Query 3: Find pharmacies that have contracts with all manufacturers
SELECT ph.phar_id, ph.name
FROM pharmacy ph
WHERE NOT EXISTS (
    SELECT dm.company_id
    FROM drug_manufacturer dm
    WHERE NOT EXISTS (
        SELECT c.company_id
        FROM contract c
        WHERE c.company_id = dm.company_id AND c.phar_id = ph.phar_id
    )
);

-- Query 4: Find patients with bills above the average bill amount
SELECT p.PID, p.first_name, p.last_name, b.bill_id, b.total_amt
FROM patient p
INNER JOIN bill b ON p.PID = b.PID
WHERE b.total_amt > (
    SELECT AVG(total_amt)
    FROM bill
)
ORDER BY b.total_amt DESC;

-- Query 5: Find drugs not prescribed by any doctor
SELECT d.drug_name, d.description
FROM drug d
WHERE d.drug_name NOT IN (
    SELECT DISTINCT drug_name
    FROM prescribe
);

-- ==================== JOIN QUERIES ====================

-- Query 6: Get complete patient prescription details with doctor and pharmacy info
SELECT 
    p.PID,
    CONCAT(p.first_name, ' ', p.last_name) AS Patient_Name,
    d.d_name AS Doctor_Name,
    pr.drug_name,
    pr.quantity,
    pr.date AS Prescription_Date,
    dr.description AS Drug_Description,
    dm.name AS Manufacturer
FROM patient p
INNER JOIN prescribe pr ON p.PID = pr.PID
INNER JOIN doctor d ON pr.doc_id = d.doc_id
INNER JOIN drug dr ON pr.drug_name = dr.drug_name
INNER JOIN drug_manufacturer dm ON dr.company_id = dm.company_id
ORDER BY pr.date DESC;

-- Query 7: Employee work schedule with pharmacy details
SELECT 
    CONCAT(e.first_name, ' ', e.last_name) AS Employee_Name,
    ph.name AS Pharmacy_Name,
    ph.address AS Pharmacy_Address,
    w.shift_start,
    w.shift_end,
    TIMEDIFF(w.shift_end, w.shift_start) AS Shift_Duration
FROM employee e
INNER JOIN work w ON e.employee_id = w.employee_id
INNER JOIN pharmacy ph ON w.phar_id = ph.phar_id
ORDER BY ph.name, w.shift_start;

-- Query 8: Pharmacy inventory with manufacturer details
SELECT 
    ph.name AS Pharmacy_Name,
    s.drug_name,
    s.price,
    dr.description,
    dm.name AS Manufacturer,
    dm.address AS Manufacturer_Address
FROM pharmacy ph
INNER JOIN sell s ON ph.phar_id = s.phar_id
INNER JOIN drug dr ON s.drug_name = dr.drug_name
LEFT JOIN drug_manufacturer dm ON dr.company_id = dm.company_id
ORDER BY ph.name, s.drug_name;

-- Query 9: Patient medical history with all contacts
SELECT 
    p.PID,
    CONCAT(p.first_name, ' ', p.last_name) AS Patient_Name,
    p.address,
    p.insurance_info,
    GROUP_CONCAT(DISTINCT pc.contact_no SEPARATOR ', ') AS Contact_Numbers,
    mr.record_no,
    mr.diagnosis,
    mr.visit_date
FROM patient p
LEFT JOIN patient_contact pc ON p.PID = pc.PID
LEFT JOIN medical_record mr ON p.PID = mr.PID
GROUP BY p.PID, p.first_name, p.last_name, p.address, p.insurance_info, 
         mr.record_no, mr.diagnosis, mr.visit_date
ORDER BY p.PID, mr.visit_date DESC;

-- Query 10: Complete bill information with patient and pharmacy details
SELECT 
    b.bill_id,
    b.date,
    b.total_amt,
    b.payment_method,
    CONCAT(p.first_name, ' ', p.last_name) AS Patient_Name,
    p.insurance_info,
    ph.name AS Pharmacy_Name,
    ph.address AS Pharmacy_Address
FROM bill b
INNER JOIN patient p ON b.PID = p.PID
INNER JOIN pharmacy ph ON b.phar_id = ph.phar_id
ORDER BY b.date DESC;

-- ==================== AGGREGATE QUERIES ====================

-- Query 11: Total revenue by pharmacy
SELECT 
    ph.name AS Pharmacy_Name,
    COUNT(b.bill_id) AS Total_Bills,
    COALESCE(SUM(b.total_amt), 0) AS Total_Revenue,
    COALESCE(AVG(b.total_amt), 0) AS Average_Bill_Amount,
    COALESCE(MIN(b.total_amt), 0) AS Min_Bill,
    COALESCE(MAX(b.total_amt), 0) AS Max_Bill
FROM pharmacy ph
LEFT JOIN bill b ON ph.phar_id = b.phar_id
GROUP BY ph.phar_id, ph.name
ORDER BY Total_Revenue DESC;

-- Query 12: Doctor prescription statistics
SELECT 
    d.doc_id,
    d.d_name AS Doctor_Name,
    GROUP_CONCAT(DISTINCT ds.speciality SEPARATOR ', ') AS Specialities,
    COUNT(DISTINCT pr.PID) AS Unique_Patients,
    COUNT(pr.drug_name) AS Total_Prescriptions,
    COUNT(DISTINCT pr.drug_name) AS Unique_Drugs_Prescribed
FROM doctor d
LEFT JOIN doctor_speciality ds ON d.doc_id = ds.doc_id
LEFT JOIN prescribe pr ON d.doc_id = pr.doc_id
GROUP BY d.doc_id, d.d_name
ORDER BY Total_Prescriptions DESC;

-- Query 13: Drug popularity and revenue
SELECT 
    dr.drug_name,
    dr.description,
    dm.name AS Manufacturer,
    COUNT(DISTINCT s.phar_id) AS Pharmacies_Selling,
    COALESCE(AVG(s.price), 0) AS Average_Price,
    COALESCE(MIN(s.price), 0) AS Min_Price,
    COALESCE(MAX(s.price), 0) AS Max_Price,
    COUNT(pr.PID) AS Times_Prescribed
FROM drug dr
LEFT JOIN drug_manufacturer dm ON dr.company_id = dm.company_id
LEFT JOIN sell s ON dr.drug_name = s.drug_name
LEFT JOIN prescribe pr ON dr.drug_name = pr.drug_name
GROUP BY dr.drug_name, dr.description, dm.name
HAVING Times_Prescribed > 0
ORDER BY Times_Prescribed DESC;

-- Query 14: Patient spending analysis
SELECT 
    p.PID,
    CONCAT(p.first_name, ' ', p.last_name) AS Patient_Name,
    COUNT(DISTINCT b.bill_id) AS Total_Bills,
    COALESCE(SUM(b.total_amt), 0) AS Total_Spending,
    COALESCE(AVG(b.total_amt), 0) AS Average_Bill_Amount,
    COUNT(DISTINCT pr.drug_name) AS Unique_Drugs_Prescribed,
    COUNT(DISTINCT mr.record_no) AS Total_Visits
FROM patient p
LEFT JOIN bill b ON p.PID = b.PID
LEFT JOIN prescribe pr ON p.PID = pr.PID
LEFT JOIN medical_record mr ON p.PID = mr.PID
GROUP BY p.PID, p.first_name, p.last_name
ORDER BY Total_Spending DESC;

-- Query 15: Monthly billing trends
SELECT 
    YEAR(b.date) AS Year,
    MONTH(b.date) AS Month,
    COUNT(b.bill_id) AS Total_Bills,
    SUM(b.total_amt) AS Monthly_Revenue,
    AVG(b.total_amt) AS Average_Bill,
    GROUP_CONCAT(DISTINCT b.payment_method SEPARATOR ', ') AS Payment_Methods_Used
FROM bill b
GROUP BY YEAR(b.date), MONTH(b.date)
ORDER BY Year DESC, Month DESC;

-- Query 16: Employee salary statistics by pharmacy
SELECT 
    ph.name AS Pharmacy_Name,
    COUNT(DISTINCT e.employee_id) AS Total_Employees,
    COALESCE(AVG(e.salary), 0) AS Average_Salary,
    COALESCE(MIN(e.salary), 0) AS Min_Salary,
    COALESCE(MAX(e.salary), 0) AS Max_Salary,
    COALESCE(SUM(e.salary), 0) AS Total_Payroll
FROM pharmacy ph
LEFT JOIN work w ON ph.phar_id = w.phar_id
LEFT JOIN employee e ON w.employee_id = e.employee_id
GROUP BY ph.phar_id, ph.name
ORDER BY Total_Employees DESC;

-- Query 17: Manufacturer contract analysis
SELECT 
    dm.name AS Manufacturer_Name,
    dm.address,
    COUNT(DISTINCT c.phar_id) AS Active_Contracts,
    COUNT(DISTINCT dr.drug_name) AS Drugs_Produced,
    MIN(c.start_date) AS Earliest_Contract,
    MAX(c.end_date) AS Latest_Contract_End
FROM drug_manufacturer dm
LEFT JOIN contract c ON dm.company_id = c.company_id
LEFT JOIN drug dr ON dm.company_id = dr.company_id
GROUP BY dm.company_id, dm.name, dm.address
ORDER BY Active_Contracts DESC;

-- Query 18: Pharmacy drug inventory count and value
SELECT 
    ph.name AS Pharmacy_Name,
    COUNT(DISTINCT s.drug_name) AS Total_Drugs,
    COALESCE(AVG(s.price), 0) AS Average_Drug_Price,
    COALESCE(SUM(s.price), 0) AS Total_Inventory_Value
FROM pharmacy ph
LEFT JOIN sell s ON ph.phar_id = s.phar_id
GROUP BY ph.phar_id, ph.name
ORDER BY Total_Drugs DESC;