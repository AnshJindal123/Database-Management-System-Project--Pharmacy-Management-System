# Database-Management-System-Project--Pharmacy-Management-System
A comprehensive Pharmacy Management System built using MySQL and Flask. It features a fully normalized relational schema, triggers, stored procedures, functions, and advanced SQL queries to manage patients, prescriptions, billing, drug inventory, contracts, and employees.

A Database Management System (DBMS) mini-project designed to efficiently manage pharmacy operations such as patient records, prescriptions, billing, drug inventory, manufacturer contracts, and employee scheduling.

This project uses:
- **MySQL** – Backend relational database  
- **Flask (Python)** – Backend web application  
- **HTML/CSS/Bootstrap** – Frontend  
- **Advanced SQL** – Triggers, Stored Procedures, Functions, Joins, Nested & Aggregate Queries

---

## Features
### **Patients**
- Store patient details and multiple contacts  
- Maintain medical records  
- View prescriptions and bills  

### **Doctors**
- Store doctor information and specialities  
- Issue prescriptions to patients  

### **Pharmacies & Inventory**
- Maintain drug catalogue and prices  
- Manage manufacturer contracts  
- View pharmacy-wise inventory statistics  

### **Administration**
- Full CRUD across entities  
- Update drug price (stored procedure)  
- Prevent invalid billing (trigger)  
- Automatic patient audit logging  
- Monthly sales reports & analytics  

---

## **Database Design**

### **ER Diagram**
<img width="1215" height="765" alt="Screenshot 2025-11-20 104414" src="https://github.com/user-attachments/assets/ceaefac8-0adc-4521-8d49-d92222b350e5" />


### **Relational Schema**
<img width="645" height="923" alt="Screenshot 2025-11-20 104443" src="https://github.com/user-attachments/assets/655ed339-12d4-45fe-abd0-222612d2f20e" />


---

## 🛠️ **SQL Components**

### **Triggers**
- `before_patient_delete`  
- `before_bill_insert`  

### **Stored Procedures**
- `sp_AddPatient`  
- `sp_UpdateDrugPrice`  
- `sp_GetPatientPrescriptions`  
- `sp_MonthlySalesReport`  
- `sp_GetBelowPriceDrugs`  

### **Functions**
- `fn_PatientTotalSpending`  
- `fn_PharmacyDrugCount`  
- `fn_DoctorPrescriptionCount`  

### **Complex Queries**
Includes joins, nested queries, aggregates, inventory analysis, contract analysis, patient spending patterns, drug popularity, and more.

---

##  **Web Application (Flask)**
- Establishes MySQL connection  
- Implements routes for CRUD operations  
- Executes stored procedures and functions  
- Displays data for patient management, billing, and inventory  

# Installation & Setup Guide
This project contains three main components:
/backend     → Flask + Node server  
/database    → SQL schema, triggers, sample data, complex queries  
/frontend    → HTML/CSS/JS client

### Clone the repository
git clone https://github.com/AnshJindal123/Database-Management-System-Project--Pharmacy-Management-System.git

### Create the database
Open your MySQL shell / Workbench and run:
CREATE DATABASE pharmacy_management;
USE pharmacy_management;

### Import schema, triggers, and sample data
SOURCE database/schema.sql;
SOURCE database/triggers_procedures.sql;
SOURCE database/sample_data.sql;
SOURCE database/complex_queries.sql;

## Backend Setup (Flask)

### Create a virtual environment
cd backend
python -m venv venv

Activate-
Windows- venv\Scripts\activate
MacOS/Linus- source venv/bin/activate

### Install required dependencies
pip install -r requirements.txt

### Node Server Setup
npm install

### Configure MySQL credentials
Inside backend/app.py, update:

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="pharmacy_management"
)

### Run the backend server
python app.py

The Flask API will start at:
http://localhost:5000/
