from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '9742223074',  # Your MySQL password
    'database': 'pharmacy_management'
}

# Database connection helper
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# ==================== PATIENT ROUTES ====================

@app.route('/api/patients', methods=['GET'])
def get_patients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT p.*, GROUP_CONCAT(pc.contact_no SEPARATOR ', ') AS contacts
            FROM patient p
            LEFT JOIN patient_contact pc ON p.PID = pc.PID
            GROUP BY p.PID
        """
        cursor.execute(query)
        patients = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(patients)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<pid>', methods=['GET'])
def get_patient(pid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT p.*, GROUP_CONCAT(pc.contact_no SEPARATOR ', ') AS contacts
            FROM patient p
            LEFT JOIN patient_contact pc ON p.PID = pc.PID
            WHERE p.PID = %s
            GROUP BY p.PID
        """
        cursor.execute(query, (pid,))
        patient = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(patient if patient else {})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['POST'])
def add_patient():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.callproc('sp_AddPatient', [
            data['PID'],
            data['first_name'],
            data['last_name'],
            data['sex'],
            data.get('address', ''),
            data.get('contact', ''),
            data.get('insurance_info', '')
        ])
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Patient added successfully', 'PID': data['PID']})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<pid>', methods=['PUT'])
def update_patient(pid):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            UPDATE patient 
            SET first_name = %s, last_name = %s, sex = %s, address = %s, insurance_info = %s 
            WHERE PID = %s
        """
        cursor.execute(query, (
            data['first_name'],
            data['last_name'],
            data['sex'],
            data.get('address', ''),
            data.get('insurance_info', ''),
            pid
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Patient updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<pid>', methods=['DELETE'])
def delete_patient(pid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM patient WHERE PID = %s", (pid,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Patient deleted successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<pid>/prescriptions', methods=['GET'])
def get_patient_prescriptions(pid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('sp_GetPatientPrescriptions', [pid])
        
        # Fetch results from stored procedure
        prescriptions = []
        for result in cursor.stored_results():
            prescriptions = result.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(prescriptions)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<pid>/spending', methods=['GET'])
def get_patient_spending(pid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT fn_PatientTotalSpending(%s) AS total_spending"
        cursor.execute(query, (pid,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ==================== DOCTOR ROUTES ====================

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT d.*, GROUP_CONCAT(ds.speciality SEPARATOR ', ') AS specialities
            FROM doctor d
            LEFT JOIN doctor_speciality ds ON d.doc_id = ds.doc_id
            GROUP BY d.doc_id
        """
        cursor.execute(query)
        doctors = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(doctors)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctors', methods=['POST'])
def add_doctor():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert doctor
        cursor.execute(
            "INSERT INTO doctor (doc_id, d_name) VALUES (%s, %s)",
            (data['doc_id'], data['d_name'])
        )
        
        # Insert specialities if provided
        if data.get('specialities') and len(data['specialities']) > 0:
            spec_query = "INSERT INTO doctor_speciality (doc_id, speciality) VALUES (%s, %s)"
            for spec in data['specialities']:
                cursor.execute(spec_query, (data['doc_id'], spec))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Doctor added successfully', 'doc_id': data['doc_id']})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctors/<doc_id>/prescription-count', methods=['GET'])
def get_doctor_prescription_count(doc_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT fn_DoctorPrescriptionCount(%s) AS prescription_count"
        cursor.execute(query, (doc_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ==================== PHARMACY ROUTES ====================

@app.route('/api/pharmacies', methods=['GET'])
def get_pharmacies():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM pharmacy")
        pharmacies = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(pharmacies)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pharmacies', methods=['POST'])
def add_pharmacy():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO pharmacy (phar_id, name, address, fax) VALUES (%s, %s, %s, %s)",
            (data['phar_id'], data['name'], data.get('address', ''), data.get('fax', ''))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Pharmacy added successfully', 'phar_id': data['phar_id']})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pharmacies/<phar_id>/drug-count', methods=['GET'])
def get_pharmacy_drug_count(phar_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT fn_PharmacyDrugCount(%s) AS drug_count"
        cursor.execute(query, (phar_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ==================== DRUG ROUTES ====================

@app.route('/api/drugs', methods=['GET'])
def get_drugs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT d.*, dm.name AS manufacturer_name
            FROM drug d
            LEFT JOIN drug_manufacturer dm ON d.company_id = dm.company_id
        """
        cursor.execute(query)
        drugs = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(drugs)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drugs', methods=['POST'])
def add_drug():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO drug (drug_name, description, company_id) VALUES (%s, %s, %s)",
            (data['drug_name'], data.get('description', ''), data.get('company_id', ''))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Drug added successfully', 'drug_name': data['drug_name']})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drugs/below-price/<threshold>', methods=['GET'])
def get_drugs_below_price(threshold):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('sp_GetBelowPriceDrugs', [float(threshold)])
        
        # Fetch results from stored procedure
        drugs = []
        for result in cursor.stored_results():
            drugs = result.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(drugs)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drugs/update-price', methods=['PUT'])
def update_drug_price():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('sp_UpdateDrugPrice', [
            data['phar_id'],
            data['drug_name'],
            float(data['new_price'])
        ])
        
        # Fetch result message
        result = {}
        for res in cursor.stored_results():
            result = res.fetchone()
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ==================== EMPLOYEE ROUTES ====================

@app.route('/api/employees', methods=['GET'])
def get_employees():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT e.*, 
                   GROUP_CONCAT(DISTINCT ec.contact_no SEPARATOR ', ') AS contacts,
                   GROUP_CONCAT(DISTINCT CONCAT(w.phar_id, ' (', w.shift_start, '-', w.shift_end, ')') SEPARATOR '; ') AS work_info
            FROM employee e
            LEFT JOIN employee_contact ec ON e.employee_id = ec.employee_id
            LEFT JOIN work w ON e.employee_id = w.employee_id
            GROUP BY e.employee_id
        """
        cursor.execute(query)
        employees = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(employees)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/employees', methods=['POST'])
def add_employee():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO employee (employee_id, first_name, last_name, sex, salary) VALUES (%s, %s, %s, %s, %s)",
            (data['employee_id'], data['first_name'], data['last_name'], data['sex'], float(data['salary']))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Employee added successfully', 'employee_id': data['employee_id']})
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ==================== BILL ROUTES ====================

@app.route('/api/bills', methods=['GET'])
def get_bills():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT b.*, 
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                   ph.name AS pharmacy_name
            FROM bill b
            JOIN patient p ON b.PID = p.PID
            JOIN pharmacy ph ON b.phar_id = ph.phar_id
            ORDER BY b.date DESC
        """
        cursor.execute(query)
        bills = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(bills)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bills', methods=['POST'])
def add_bill():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO bill (bill_id, date, total_amt, payment_method, PID, phar_id) VALUES (%s, %s, %s, %s, %s, %s)",
            (data['bill_id'], data['date'], float(data['total_amt']), data['payment_method'], data['PID'], data['phar_id'])
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Bill added successfully', 'bill_id': data['bill_id']})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/monthly-sales/<int:month>/<int:year>', methods=['GET'])
def get_monthly_sales(month, year):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('sp_MonthlySalesReport', [month, year])
        
        # Fetch results from stored procedure
        report = []
        for result in cursor.stored_results():
            report = result.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(report)
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ==================== PRESCRIPTION ROUTES ====================

@app.route('/api/prescriptions', methods=['POST'])
def add_prescription():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO prescribe (PID, doc_id, drug_name, date, quantity) VALUES (%s, %s, %s, %s, %s)",
            (data['PID'], data['doc_id'], data['drug_name'], data['date'], int(data['quantity']))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Prescription added successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ==================== DASHBOARD STATS ====================

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        results = {}
        
        # Total Patients
        cursor.execute("SELECT COUNT(*) AS count FROM patient")
        results['totalPatients'] = cursor.fetchall()
        
        # Total Doctors
        cursor.execute("SELECT COUNT(*) AS count FROM doctor")
        results['totalDoctors'] = cursor.fetchall()
        
        # Total Pharmacies
        cursor.execute("SELECT COUNT(*) AS count FROM pharmacy")
        results['totalPharmacies'] = cursor.fetchall()
        
        # Total Revenue
        cursor.execute("SELECT SUM(total_amt) AS total FROM bill")
        results['totalRevenue'] = cursor.fetchall()
        
        # Recent Bills
        query = """
            SELECT b.bill_id, b.date, b.total_amt, 
                   CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                   ph.name AS pharmacy_name
            FROM bill b
            JOIN patient p ON b.PID = p.PID
            JOIN pharmacy ph ON b.phar_id = ph.phar_id
            ORDER BY b.date DESC
            LIMIT 5
        """
        cursor.execute(query)
        results['recentBills'] = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(results)
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ==================== SERVE FRONTEND ====================

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# ==================== START SERVER ====================

if __name__ == '__main__':
    print("Connected to MySQL database")
    print("Server running on http://localhost:3000")
    app.run(host='0.0.0.0', port=3000, debug=True)