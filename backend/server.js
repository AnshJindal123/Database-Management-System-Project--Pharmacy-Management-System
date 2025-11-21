const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '9742223074', // Change this to your MySQL password
    database: 'pharmacy_management'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// ==================== PATIENT ROUTES ====================

// Get all patients
app.get('/api/patients', (req, res) => {
    const query = `
        SELECT p.*, GROUP_CONCAT(pc.contact_no SEPARATOR ', ') AS contacts
        FROM patient p
        LEFT JOIN patient_contact pc ON p.PID = pc.PID
        GROUP BY p.PID
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get patient by ID
app.get('/api/patients/:id', (req, res) => {
    const query = `
        SELECT p.*, GROUP_CONCAT(pc.contact_no SEPARATOR ', ') AS contacts
        FROM patient p
        LEFT JOIN patient_contact pc ON p.PID = pc.PID
        WHERE p.PID = ?
        GROUP BY p.PID
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0] || null);
    });
});

// Add new patient
app.post('/api/patients', (req, res) => {
    const { PID, first_name, last_name, sex, address, contact, insurance_info } = req.body;
    const query = 'CALL sp_AddPatient(?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [PID, first_name, last_name, sex, address, contact, insurance_info], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Patient added successfully', PID });
    });
});

// Update patient
app.put('/api/patients/:id', (req, res) => {
    const { first_name, last_name, sex, address, insurance_info } = req.body;
    const query = 'UPDATE patient SET first_name = ?, last_name = ?, sex = ?, address = ?, insurance_info = ? WHERE PID = ?';
    db.query(query, [first_name, last_name, sex, address, insurance_info, req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Patient updated successfully' });
    });
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
    const query = 'DELETE FROM patient WHERE PID = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Patient deleted successfully' });
    });
});

// Get patient prescriptions
app.get('/api/patients/:id/prescriptions', (req, res) => {
    const query = 'CALL sp_GetPatientPrescriptions(?)';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// Get patient total spending
app.get('/api/patients/:id/spending', (req, res) => {
    const query = 'SELECT fn_PatientTotalSpending(?) AS total_spending';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// ==================== DOCTOR ROUTES ====================

// Get all doctors
app.get('/api/doctors', (req, res) => {
    const query = `
        SELECT d.*, GROUP_CONCAT(ds.speciality SEPARATOR ', ') AS specialities
        FROM doctor d
        LEFT JOIN doctor_speciality ds ON d.doc_id = ds.doc_id
        GROUP BY d.doc_id
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Add new doctor
app.post('/api/doctors', (req, res) => {
    const { doc_id, d_name, specialities } = req.body;
    const query = 'INSERT INTO doctor (doc_id, d_name) VALUES (?, ?)';
    db.query(query, [doc_id, d_name], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Add specialities if provided
        if (specialities && specialities.length > 0) {
            const specQuery = 'INSERT INTO doctor_speciality (doc_id, speciality) VALUES ?';
            const specValues = specialities.map(spec => [doc_id, spec]);
            db.query(specQuery, [specValues], (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: 'Doctor added successfully', doc_id });
            });
        } else {
            res.json({ message: 'Doctor added successfully', doc_id });
        }
    });
});

// Get doctor prescription count
app.get('/api/doctors/:id/prescription-count', (req, res) => {
    const query = 'SELECT fn_DoctorPrescriptionCount(?) AS prescription_count';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// ==================== PHARMACY ROUTES ====================

// Get all pharmacies
app.get('/api/pharmacies', (req, res) => {
    const query = 'SELECT * FROM pharmacy';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Add new pharmacy
app.post('/api/pharmacies', (req, res) => {
    const { phar_id, name, address, fax } = req.body;
    const query = 'INSERT INTO pharmacy (phar_id, name, address, fax) VALUES (?, ?, ?, ?)';
    db.query(query, [phar_id, name, address, fax], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Pharmacy added successfully', phar_id });
    });
});

// Get pharmacy drug count
app.get('/api/pharmacies/:id/drug-count', (req, res) => {
    const query = 'SELECT fn_PharmacyDrugCount(?) AS drug_count';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// ==================== DRUG ROUTES ====================

// Get all drugs
app.get('/api/drugs', (req, res) => {
    const query = `
        SELECT d.*, dm.name AS manufacturer_name
        FROM drug d
        LEFT JOIN drug_manufacturer dm ON d.company_id = dm.company_id
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Add new drug
app.post('/api/drugs', (req, res) => {
    const { drug_name, description, company_id } = req.body;
    const query = 'INSERT INTO drug (drug_name, description, company_id) VALUES (?, ?, ?)';
    db.query(query, [drug_name, description, company_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Drug added successfully', drug_name });
    });
});

// Get drugs below price threshold
app.get('/api/drugs/below-price/:threshold', (req, res) => {
    const query = 'CALL sp_GetBelowPriceDrugs(?)';
    db.query(query, [req.params.threshold], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// Update drug price
app.put('/api/drugs/update-price', (req, res) => {
    const { phar_id, drug_name, new_price } = req.body;
    const query = 'CALL sp_UpdateDrugPrice(?, ?, ?)';
    db.query(query, [phar_id, drug_name, new_price], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0][0]);
    });
});

// ==================== EMPLOYEE ROUTES ====================

// Get all employees
app.get('/api/employees', (req, res) => {
    const query = `
        SELECT e.*, 
               GROUP_CONCAT(DISTINCT ec.contact_no SEPARATOR ', ') AS contacts,
               GROUP_CONCAT(DISTINCT CONCAT(w.phar_id, ' (', w.shift_start, '-', w.shift_end, ')') SEPARATOR '; ') AS work_info
        FROM employee e
        LEFT JOIN employee_contact ec ON e.employee_id = ec.employee_id
        LEFT JOIN work w ON e.employee_id = w.employee_id
        GROUP BY e.employee_id
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Add new employee
app.post('/api/employees', (req, res) => {
    const { employee_id, first_name, last_name, sex, salary } = req.body;
    const query = 'INSERT INTO employee (employee_id, first_name, last_name, sex, salary) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [employee_id, first_name, last_name, sex, salary], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Employee added successfully', employee_id });
    });
});

// ==================== BILL ROUTES ====================

// Get all bills
app.get('/api/bills', (req, res) => {
    const query = `
        SELECT b.*, 
               CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
               ph.name AS pharmacy_name
        FROM bill b
        JOIN patient p ON b.PID = p.PID
        JOIN pharmacy ph ON b.phar_id = ph.phar_id
        ORDER BY b.date DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Add new bill
app.post('/api/bills', (req, res) => {
    const { bill_id, date, total_amt, payment_method, PID, phar_id } = req.body;
    const query = 'INSERT INTO bill (bill_id, date, total_amt, payment_method, PID, phar_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [bill_id, date, total_amt, payment_method, PID, phar_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Bill added successfully', bill_id });
    });
});

// Get monthly sales report
app.get('/api/reports/monthly-sales/:month/:year', (req, res) => {
    const query = 'CALL sp_MonthlySalesReport(?, ?)';
    db.query(query, [req.params.month, req.params.year], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// ==================== PRESCRIPTION ROUTES ====================

// Add new prescription
app.post('/api/prescriptions', (req, res) => {
    const { PID, doc_id, drug_name, date, quantity } = req.body;
    const query = 'INSERT INTO prescribe (PID, doc_id, drug_name, date, quantity) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [PID, doc_id, drug_name, date, quantity], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Prescription added successfully' });
    });
});

// ==================== DASHBOARD STATS ====================

// Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
    const queries = {
        totalPatients: 'SELECT COUNT(*) AS count FROM patient',
        totalDoctors: 'SELECT COUNT(*) AS count FROM doctor',
        totalPharmacies: 'SELECT COUNT(*) AS count FROM pharmacy',
        totalRevenue: 'SELECT SUM(total_amt) AS total FROM bill',
        recentBills: `
            SELECT b.bill_id, b.date, b.total_amt, 
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                   ph.name AS pharmacy_name
            FROM bill b
            JOIN patient p ON b.PID = p.PID
            JOIN pharmacy ph ON b.phar_id = ph.phar_id
            ORDER BY b.date DESC
            LIMIT 5
        `
    };

    const results = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;

    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, result) => {
            if (err) {
                results[key] = { error: err.message };
            } else {
                results[key] = result;
            }
            completed++;
            if (completed === totalQueries) {
                res.json(results);
            }
        });
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});