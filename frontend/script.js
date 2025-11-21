const API_URL = 'http://localhost:3000/api';

// Show/Hide sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    // Load data when section is shown
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'patients':
            loadPatients();
            break;
        case 'doctors':
            loadDoctors();
            break;
        case 'drugs':
            loadDrugs();
            break;
        case 'pharmacies':
            loadPharmacies();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'bills':
            loadBills();
            loadBillFormData();
            break;
    }
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`);
        const data = await response.json();
        
        document.getElementById('totalPatients').textContent = data.totalPatients[0].count;
        document.getElementById('totalDoctors').textContent = data.totalDoctors[0].count;
        document.getElementById('totalPharmacies').textContent = data.totalPharmacies[0].count;
        
        // FIXED: Handle null revenue properly
        const revenue = data.totalRevenue[0].total;
        document.getElementById('totalRevenue').textContent = `$${revenue ? parseFloat(revenue).toFixed(2) : '0.00'}`;
        
        // Load recent bills
        const tbody = document.getElementById('recentBillsBody');
        tbody.innerHTML = '';
        
        if (data.recentBills && data.recentBills.length > 0) {
            data.recentBills.forEach(bill => {
                tbody.innerHTML += `
                    <tr>
                        <td>${bill.bill_id}</td>
                        <td>${new Date(bill.date).toLocaleDateString()}</td>
                        <td>${bill.patient_name}</td>
                        <td>${bill.pharmacy_name}</td>
                        <td>$${parseFloat(bill.total_amt).toFixed(2)}</td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No recent bills</td></tr>';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('totalRevenue').textContent = 'Error';
    }
}

// ==================== PATIENTS ====================

async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/patients`);
        const patients = await response.json();
        
        const tbody = document.getElementById('patientsBody');
        tbody.innerHTML = '';
        
        patients.forEach(patient => {
            tbody.innerHTML += `
                <tr>
                    <td>${patient.PID}</td>
                    <td>${patient.first_name} ${patient.last_name}</td>
                    <td>${patient.sex}</td>
                    <td>${patient.address || 'N/A'}</td>
                    <td>${patient.contacts || 'N/A'}</td>
                    <td>${patient.insurance_info || 'N/A'}</td>
                    <td>
                        <button onclick="viewPatientPrescriptions('${patient.PID}')" class="btn-info">Prescriptions</button>
                        <button onclick="viewPatientSpending('${patient.PID}')" class="btn-info">Spending</button>
                        <button onclick="deletePatient('${patient.PID}')" class="btn-danger">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

function showAddPatientForm() {
    document.getElementById('addPatientForm').style.display = 'block';
}

function hideAddPatientForm() {
    document.getElementById('addPatientForm').style.display = 'none';
}

async function addPatient(event) {
    event.preventDefault();
    
    const patientData = {
        PID: document.getElementById('patientId').value,
        first_name: document.getElementById('patientFirstName').value,
        last_name: document.getElementById('patientLastName').value,
        sex: document.getElementById('patientSex').value,
        address: document.getElementById('patientAddress').value,
        contact: document.getElementById('patientContact').value,
        insurance_info: document.getElementById('patientInsurance').value
    };
    
    try {
        const response = await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });
        
        const result = await response.json();
        alert('Patient added successfully!');
        hideAddPatientForm();
        loadPatients();
        event.target.reset();
    } catch (error) {
        alert('Error adding patient: ' + error.message);
    }
}

async function deletePatient(pid) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
        await fetch(`${API_URL}/patients/${pid}`, { method: 'DELETE' });
        alert('Patient deleted successfully!');
        loadPatients();
    } catch (error) {
        alert('Error deleting patient: ' + error.message);
    }
}

async function viewPatientPrescriptions(pid) {
    try {
        const response = await fetch(`${API_URL}/patients/${pid}/prescriptions`);
        const prescriptions = await response.json();
        
        let message = `Prescriptions for Patient ${pid}:\n\n`;
        prescriptions.forEach(p => {
            message += `Doctor: ${p.Doctor_Name}\nDrug: ${p.drug_name}\nQuantity: ${p.quantity}\nDate: ${new Date(p.date).toLocaleDateString()}\n\n`;
        });
        
        alert(message || 'No prescriptions found');
    } catch (error) {
        alert('Error loading prescriptions: ' + error.message);
    }
}

async function viewPatientSpending(pid) {
    try {
        const response = await fetch(`${API_URL}/patients/${pid}/spending`);
        const data = await response.json();
        alert(`Total Spending: $${parseFloat(data.total_spending).toFixed(2)}`);
    } catch (error) {
        alert('Error loading spending: ' + error.message);
    }
}

// ==================== DOCTORS ====================

async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        const doctors = await response.json();
        
        const tbody = document.getElementById('doctorsBody');
        tbody.innerHTML = '';
        
        doctors.forEach(doctor => {
            tbody.innerHTML += `
                <tr>
                    <td>${doctor.doc_id}</td>
                    <td>${doctor.d_name}</td>
                    <td>${doctor.specialities || 'N/A'}</td>
                    <td>
                        <button onclick="viewDoctorPrescriptionCount('${doctor.doc_id}')" class="btn-info">Prescription Count</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

function showAddDoctorForm() {
    document.getElementById('addDoctorForm').style.display = 'block';
}

function hideAddDoctorForm() {
    document.getElementById('addDoctorForm').style.display = 'none';
}

async function addDoctor(event) {
    event.preventDefault();
    
    const specialities = document.getElementById('doctorSpeciality').value
        .split(',')
        .map(s => s.trim())
        .filter(s => s);
    
    const doctorData = {
        doc_id: document.getElementById('doctorId').value,
        d_name: document.getElementById('doctorName').value,
        specialities: specialities
    };
    
    try {
        const response = await fetch(`${API_URL}/doctors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorData)
        });
        
        const result = await response.json();
        alert('Doctor added successfully!');
        hideAddDoctorForm();
        loadDoctors();
        event.target.reset();
    } catch (error) {
        alert('Error adding doctor: ' + error.message);
    }
}

async function viewDoctorPrescriptionCount(docId) {
    try {
        const response = await fetch(`${API_URL}/doctors/${docId}/prescription-count`);
        const data = await response.json();
        alert(`Total Prescriptions: ${data.prescription_count}`);
    } catch (error) {
        alert('Error loading prescription count: ' + error.message);
    }
}

// ==================== DRUGS ====================

async function loadDrugs() {
    try {
        const response = await fetch(`${API_URL}/drugs`);
        const drugs = await response.json();
        
        const tbody = document.getElementById('drugsBody');
        tbody.innerHTML = '';
        
        drugs.forEach(drug => {
            tbody.innerHTML += `
                <tr>
                    <td>${drug.drug_name}</td>
                    <td>${drug.description || 'N/A'}</td>
                    <td>${drug.manufacturer_name || 'N/A'}</td>
                    <td>
                        <button onclick="updateDrugPrice('${drug.drug_name}')" class="btn-info">Update Price</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading drugs:', error);
    }
}

function showAddDrugForm() {
    document.getElementById('addDrugForm').style.display = 'block';
}

function hideAddDrugForm() {
    document.getElementById('addDrugForm').style.display = 'none';
}

async function addDrug(event) {
    event.preventDefault();
    
    const drugData = {
        drug_name: document.getElementById('drugName').value,
        description: document.getElementById('drugDescription').value,
        company_id: document.getElementById('drugManufacturer').value
    };
    
    try {
        const response = await fetch(`${API_URL}/drugs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(drugData)
        });
        
        const result = await response.json();
        alert('Drug added successfully!');
        hideAddDrugForm();
        loadDrugs();
        event.target.reset();
    } catch (error) {
        alert('Error adding drug: ' + error.message);
    }
}

async function updateDrugPrice(drugName) {
    const pharId = prompt('Enter Pharmacy ID (e.g., PH001):');
    if (!pharId) return;
    
    const newPrice = prompt('Enter New Price:');
    if (!newPrice) return;
    
    try {
        const response = await fetch(`${API_URL}/drugs/update-price`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phar_id: pharId,
                drug_name: drugName,
                new_price: parseFloat(newPrice)
            })
        });
        
        const result = await response.json();
        alert(result.Message);
    } catch (error) {
        alert('Error updating price: ' + error.message);
    }
}

// ==================== PHARMACIES ====================

async function loadPharmacies() {
    try {
        const response = await fetch(`${API_URL}/pharmacies`);
        const pharmacies = await response.json();
        
        const tbody = document.getElementById('pharmaciesBody');
        tbody.innerHTML = '';
        
        pharmacies.forEach(pharmacy => {
            tbody.innerHTML += `
                <tr>
                    <td>${pharmacy.phar_id}</td>
                    <td>${pharmacy.name}</td>
                    <td>${pharmacy.address || 'N/A'}</td>
                    <td>${pharmacy.fax || 'N/A'}</td>
                    <td>
                        <button onclick="viewPharmacyDrugCount('${pharmacy.phar_id}')" class="btn-info">Drug Count</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading pharmacies:', error);
    }
}

function showAddPharmacyForm() {
    document.getElementById('addPharmacyForm').style.display = 'block';
}

function hideAddPharmacyForm() {
    document.getElementById('addPharmacyForm').style.display = 'none';
}

async function addPharmacy(event) {
    event.preventDefault();
    
    const pharmacyData = {
        phar_id: document.getElementById('pharmacyId').value,
        name: document.getElementById('pharmacyName').value,
        address: document.getElementById('pharmacyAddress').value,
        fax: document.getElementById('pharmacyFax').value
    };
    
    try {
        const response = await fetch(`${API_URL}/pharmacies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pharmacyData)
        });
        
        const result = await response.json();
        alert('Pharmacy added successfully!');
        hideAddPharmacyForm();
        loadPharmacies();
        event.target.reset();
    } catch (error) {
        alert('Error adding pharmacy: ' + error.message);
    }
}

async function viewPharmacyDrugCount(pharId) {
    try {
        const response = await fetch(`${API_URL}/pharmacies/${pharId}/drug-count`);
        const data = await response.json();
        alert(`Total Drugs: ${data.drug_count}`);
    } catch (error) {
        alert('Error loading drug count: ' + error.message);
    }
}

// ==================== EMPLOYEES ====================

async function loadEmployees() {
    try {
        const response = await fetch(`${API_URL}/employees`);
        const employees = await response.json();
        
        const tbody = document.getElementById('employeesBody');
        tbody.innerHTML = '';
        
        employees.forEach(employee => {
            tbody.innerHTML += `
                <tr>
                    <td>${employee.employee_id}</td>
                    <td>${employee.first_name} ${employee.last_name}</td>
                    <td>${employee.sex}</td>
                    <td>$${parseFloat(employee.salary).toFixed(2)}</td>
                    <td>${employee.contacts || 'N/A'}</td>
                    <td>${employee.work_info || 'N/A'}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

function showAddEmployeeForm() {
    document.getElementById('addEmployeeForm').style.display = 'block';
}

function hideAddEmployeeForm() {
    document.getElementById('addEmployeeForm').style.display = 'none';
}

async function addEmployee(event) {
    event.preventDefault();
    
    const employeeData = {
        employee_id: document.getElementById('employeeId').value,
        first_name: document.getElementById('employeeFirstName').value,
        last_name: document.getElementById('employeeLastName').value,
        sex: document.getElementById('employeeSex').value,
        salary: parseFloat(document.getElementById('employeeSalary').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });
        
        const result = await response.json();
        alert('Employee added successfully!');
        hideAddEmployeeForm();
        loadEmployees();
        event.target.reset();
    } catch (error) {
        alert('Error adding employee: ' + error.message);
    }
}

// ==================== BILLS ====================

async function loadBills() {
    try {
        const response = await fetch(`${API_URL}/bills`);
        const bills = await response.json();
        
        const tbody = document.getElementById('billsBody');
        tbody.innerHTML = '';
        
        bills.forEach(bill => {
            tbody.innerHTML += `
                <tr>
                    <td>${bill.bill_id}</td>
                    <td>${new Date(bill.date).toLocaleDateString()}</td>
                    <td>${bill.patient_name}</td>
                    <td>${bill.pharmacy_name}</td>
                    <td>$${parseFloat(bill.total_amt).toFixed(2)}</td>
                    <td>${bill.payment_method}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading bills:', error);
    }
}

async function loadBillFormData() {
    try {
        // Load patients
        const patientsResponse = await fetch(`${API_URL}/patients`);
        const patients = await patientsResponse.json();
        const patientSelect = document.getElementById('billPatient');
        patientSelect.innerHTML = '<option value="">Select Patient</option>';
        patients.forEach(patient => {
            patientSelect.innerHTML += `<option value="${patient.PID}">${patient.first_name} ${patient.last_name} (${patient.PID})</option>`;
        });
        
        // Load pharmacies
        const pharmaciesResponse = await fetch(`${API_URL}/pharmacies`);
        const pharmacies = await pharmaciesResponse.json();
        const pharmacySelect = document.getElementById('billPharmacy');
        pharmacySelect.innerHTML = '<option value="">Select Pharmacy</option>';
        pharmacies.forEach(pharmacy => {
            pharmacySelect.innerHTML += `<option value="${pharmacy.phar_id}">${pharmacy.name} (${pharmacy.phar_id})</option>`;
        });
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

function showAddBillForm() {
    document.getElementById('addBillForm').style.display = 'block';
}

function hideAddBillForm() {
    document.getElementById('addBillForm').style.display = 'none';
}

async function addBill(event) {
    event.preventDefault();
    
    const billData = {
        bill_id: document.getElementById('billId').value,
        date: document.getElementById('billDate').value,
        total_amt: parseFloat(document.getElementById('billAmount').value),
        payment_method: document.getElementById('billPaymentMethod').value,
        PID: document.getElementById('billPatient').value,
        phar_id: document.getElementById('billPharmacy').value
    };
    
    try {
        const response = await fetch(`${API_URL}/bills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData)
        });
        
        const result = await response.json();
        alert('Bill added successfully!');
        hideAddBillForm();
        loadBills();
        event.target.reset();
    } catch (error) {
        alert('Error adding bill: ' + error.message);
    }
}

// ==================== REPORTS ====================

async function generateMonthlySalesReport() {
    const month = document.getElementById('reportMonth').value;
    const year = document.getElementById('reportYear').value;
    
    try {
        const response = await fetch(`${API_URL}/reports/monthly-sales/${month}/${year}`);
        const report = await response.json();
        
        const thead = document.getElementById('reportsTableHead');
        const tbody = document.getElementById('reportsBody');
        
        thead.innerHTML = `
            <tr>
                <th>Pharmacy Name</th>
                <th>Total Bills</th>
                <th>Total Revenue</th>
                <th>Average Bill Amount</th>
            </tr>
        `;
        
        tbody.innerHTML = '';
        
        if (report.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No data for selected period</td></tr>';
        } else {
            report.forEach(row => {
                tbody.innerHTML += `
                    <tr>
                        <td>${row.Pharmacy_Name}</td>
                        <td>${row.Total_Bills}</td>
                        <td>$${parseFloat(row.Total_Revenue || 0).toFixed(2)}</td>
                        <td>$${parseFloat(row.Average_Bill_Amount || 0).toFixed(2)}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        alert('Error generating report: ' + error.message);
    }
}

async function getDrugsBelowPrice() {
    const threshold = document.getElementById('priceThreshold').value;
    
    try {
        const response = await fetch(`${API_URL}/drugs/below-price/${threshold}`);
        const drugs = await response.json();
        
        const thead = document.getElementById('reportsTableHead');
        const tbody = document.getElementById('reportsBody');
        
        thead.innerHTML = `
            <tr>
                <th>Pharmacy Name</th>
                <th>Drug Name</th>
                <th>Price</th>
            </tr>
        `;
        
        tbody.innerHTML = '';
        
        if (drugs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No drugs found below this price</td></tr>';
        } else {
            drugs.forEach(drug => {
                tbody.innerHTML += `
                    <tr>
                        <td>${drug.Pharmacy_Name}</td>
                        <td>${drug.drug_name}</td>
                        <td>$${parseFloat(drug.price).toFixed(2)}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        alert('Error loading drugs: ' + error.message);
    }
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});