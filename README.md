# MEDICARE – Enterprise Hospital Management System

**MEDICARE** is a full-stack, enterprise-grade Hospital Management System designed for healthcare providers, clinical administrators, and physicians. It features real-time analytics, conflict-aware appointment scheduling, patient record tracking, multi-specialty doctor directories, clinical diagnostics, and comprehensive billing.

---

## Technology Stack

### Frontend
- **Framework**: React.js 19 with Vite 8
- **Language**: JavaScript (ESNext)
- **Styling**: Tailwind CSS 3.4 (custom white and light-blue healthcare palette)
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios with JWT interceptors
- **Data Visualizations**: Recharts (interactive Pie, Bar, Area charts)
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3 (Flask 3.1)
- **CORS**: Flask-CORS
- **ORM**: SQLAlchemy 2.0 & Flask-SQLAlchemy 3.1
- **Database Migrations**: Flask-Migrate & Alembic
- **Authentication**: JWT via Flask-JWT-Extended & Werkzeug password hashing
- **Database Drivers**: `psycopg` (v3) / `pg8000` / `psycopg2-binary`

### Database
- **Primary**: PostgreSQL (DDL schema in `backend/schema.sql` and `docker-compose.yml`)
- **Local Fallback**: Persistent SQLite (`medicare.db`) for immediate out-of-the-box local testing

---

## Architecture & Project Structure

```
hip/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── admin.py            # Admin authentication model
│   │   │   ├── department.py       # Clinical departments
│   │   │   ├── doctor.py           # Medical specialists & fees
│   │   │   ├── patient.py          # Demographics & records
│   │   │   ├── appointment.py      # Bookings & conflict detection
│   │   │   ├── medical_record.py   # Clinical diagnoses & prescriptions
│   │   │   └── billing.py          # Invoices & financial ledgers
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # JWT login & registration
│   │   │   ├── dashboard.py        # Dynamic statistics & charts
│   │   │   ├── departments.py      # Department CRUD
│   │   │   ├── doctors.py          # Doctor CRUD & specialization filter
│   │   │   ├── patients.py         # Patient CRUD & search
│   │   │   ├── appointments.py     # Conflict-free appointment booking
│   │   │   ├── medical_records.py  # Diagnoses & prescriptions
│   │   │   └── billing.py          # Bills & revenue analytics
│   │   ├── utils/
│   │   │   └── helpers.py          # Validators & standard API responses
│   │   ├── config.py               # Multi-environment configurations
│   │   ├── extensions.py           # DB, Migrate, JWT, CORS
│   │   └── __init__.py             # Flask App factory
│   ├── migrations/                 # Alembic database migration scripts
│   ├── schema.sql                  # Pure PostgreSQL DDL schema & indexes
│   ├── seed.py                     # Initial database seeder script
│   ├── test_api.py                 # Automated backend test suite
│   ├── run.py                      # Flask server entry point
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios client with JWT auto-injection
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication provider state
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx     # Professional responsive navigation
│   │   │   │   ├── Navbar.jsx      # Top status bar & admin profile
│   │   │   │   ├── Layout.jsx      # Dashboard layout wrapper
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── common/
│   │   │       ├── Modal.jsx       # Reusable accessible modal
│   │   │       ├── StatCard.jsx    # Metric card with icons & trends
│   │   │       ├── StatusBadge.jsx # Color-coded status pills
│   │   │       └── ConfirmModal.jsx# Delete confirmation dialogs
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Portal login with demo auto-fill
│   │   │   ├── Dashboard.jsx       # Live stats & Recharts visualizers
│   │   │   ├── Patients.jsx        # Patient CRUD & history modal
│   │   │   ├── Doctors.jsx         # Doctor management & specialty filter
│   │   │   ├── Departments.jsx     # Clinical units & doctor counts
│   │   │   ├── Appointments.jsx    # Conflict-aware scheduling
│   │   │   ├── MedicalRecords.jsx  # Diagnoses & printable Rx sheets
│   │   │   └── Billing.jsx         # Invoices, ledger & receipts
│   │   ├── App.jsx                 # Client router configuration
│   │   ├── main.jsx                # React DOM entry
│   │   └── index.css               # Tailwind CSS directives
│   ├── tailwind.config.js          # Healthcare color palette
│   ├── vite.config.js              # Dev server with backend proxy
│   └── package.json                # Frontend package configuration
├── docker-compose.yml              # Instant PostgreSQL container
├── requirements.txt                # Root requirements pointer
├── package.json                    # Root scripts shortcut
├── .gitignore
└── README.md
```

---

## Database Design

```mermaid
erDiagram
    ADMINS ||--o{ APPOINTMENTS : monitors
    DEPARTMENTS ||--|{ DOCTORS : contains
    DOCTORS ||--o{ APPOINTMENTS : attends
    DOCTORS ||--o{ MEDICAL_RECORDS : writes
    PATIENTS ||--o{ APPOINTMENTS : books
    PATIENTS ||--o{ MEDICAL_RECORDS : possesses
    PATIENTS ||--o{ BILLING : owes
    APPOINTMENTS ||--o| BILLING : generates

    ADMINS {
        int admin_id PK
        string username UK
        string email UK
        string password_hash
        timestamp created_at
    }

    DEPARTMENTS {
        int department_id PK
        string department_name UK
        text description
        timestamp created_at
    }

    DOCTORS {
        int doctor_id PK
        string doctor_name
        string specialization
        int department_id FK
        string phone
        string email
        numeric consultation_fee
        string availability
        timestamp created_at
    }

    PATIENTS {
        int patient_id PK
        string patient_name
        int age
        string gender
        string phone
        string email
        string address
        string blood_group
        timestamp registration_date
    }

    APPOINTMENTS {
        int appointment_id PK
        int patient_id FK
        int doctor_id FK
        date appointment_date
        string appointment_time
        string status
        string reason
        timestamp created_at
    }

    MEDICAL_RECORDS {
        int record_id PK
        int patient_id FK
        int doctor_id FK
        text diagnosis
        text prescription
        date treatment_date
        timestamp created_at
    }

    BILLING {
        int bill_id PK
        int patient_id FK
        int appointment_id FK
        numeric total_amount
        string payment_status
        timestamp payment_date
        timestamp created_at
    }
```

---

## REST API Documentation

All administrative endpoints require the `Authorization: Bearer <JWT_TOKEN>` header.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate admin, returns JWT token & profile | No |
| `POST` | `/api/auth/register` | Register new admin account | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated admin profile | Yes |

### 2. Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Dynamic totals (Patients, Doctors, Appointments, Revenue) | No |
| `GET` | `/api/dashboard/charts` | Chart feeds (Demographics, Appointment Status, Billing) | No |
| `GET` | `/api/dashboard/recent-appointments` | Last 8 hospital bookings with patient/doctor info | No |

### 3. Patients (`/api/patients`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/patients` | Search & filter patients (`?search=`, `?blood_group=`) | No |
| `GET` | `/api/patients/<id>` | Full patient file with appointment & clinical history | No |
| `POST` | `/api/patients` | Register new patient | Yes |
| `PUT` | `/api/patients/<id>` | Update patient information | Yes |
| `DELETE` | `/api/patients/<id>` | Delete patient and cascade records | Yes |

### 4. Doctors (`/api/doctors`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/doctors` | List doctors (`?specialization=`, `?department_id=`) | No |
| `GET` | `/api/doctors/specializations` | Distinct list of clinical specialties | No |
| `GET` | `/api/doctors/<id>` | Doctor detail | No |
| `POST` | `/api/doctors` | Add medical specialist | Yes |
| `PUT` | `/api/doctors/<id>` | Update doctor details & schedule | Yes |
| `DELETE` | `/api/doctors/<id>` | Remove doctor from system | Yes |

### 5. Departments (`/api/departments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/departments` | List all departments with doctor counts | No |
| `GET` | `/api/departments/<id>` | Department detail with doctor list | No |
| `POST` | `/api/departments` | Create clinical department | Yes |
| `PUT` | `/api/departments/<id>` | Update department name & description | Yes |
| `DELETE` | `/api/departments/<id>` | Delete department | Yes |

### 6. Appointments & Scheduling (`/api/appointments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/appointments` | Filter by `status`, `date`, `doctor_id` | No |
| `GET` | `/api/appointments/<id>` | Appointment detail | No |
| `POST` | `/api/appointments` | Book appointment (**Enforces Conflict Prevention**) | Yes |
| `PUT` | `/api/appointments/<id>` | Reschedule or change status | Yes |
| `DELETE` | `/api/appointments/<id>` | Cancel & remove booking | Yes |
| `POST` | `/api/appointments/<id>/cancel` | Quick cancellation | Yes |

> **Doctor Conflict Prevention**: When booking or rescheduling an appointment, the backend checks for existing active appointments for the specified doctor at the exact same `appointment_date` and `appointment_time`. If a conflict exists, the API rejects the request with HTTP `409 Conflict` and a descriptive message.

### 7. Medical Records (`/api/medical-records`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/medical-records` | Filter by `patient_id` or `doctor_id` | No |
| `GET` | `/api/medical-records/<id>` | Single clinical record | No |
| `POST` | `/api/medical-records` | Create diagnosis & prescription | Yes |
| `PUT` | `/api/medical-records/<id>` | Update medical record | Yes |
| `DELETE` | `/api/medical-records/<id>` | Delete medical record | Yes |

### 8. Billing & Payments (`/api/billing`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/billing` | Filter by `payment_status` (`Paid`, `Pending`) | No |
| `GET` | `/api/billing/summary` | Real-time revenue aggregates | No |
| `GET` | `/api/billing/<id>` | Invoice detail | No |
| `POST` | `/api/billing` | Generate patient invoice | Yes |
| `PUT` | `/api/billing/<id>` | Update invoice / mark as Paid | Yes |
| `DELETE` | `/api/billing/<id>` | Delete invoice | Yes |

---

## Local Setup & Execution Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker, or use built-in SQLite fallback)

### Step 1: Clone and Set Up Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Database Setup

#### Option A: Using PostgreSQL with Docker (Fastest)
```bash
# In the project root:
docker compose up -d
```

#### Option B: Using Native PostgreSQL
1. Create a database in psql:
   ```sql
   CREATE DATABASE medicare_db;
   ```
2. Import schema:
   ```bash
   psql -U postgres -d medicare_db -f backend/schema.sql
   ```
3. Update `backend/.env`:
   ```ini
   DATABASE_URL=postgresql+psycopg://postgres:yourpassword@localhost:5432/medicare_db
   USE_SQLITE_FALLBACK=false
   ```

#### Option C: Instant Local Fallback (No PostgreSQL installed)
Leave `USE_SQLITE_FALLBACK=true` in `backend/.env`. The application will automatically initialize persistent storage in `backend/medicare.db`.

### Step 3: Seed Sample Data
Run the seeding script to populate 10 patients, 5 doctors, 5 departments, 10 appointments, medical records, billing records, and the default admin:
```bash
python backend/seed.py
```

### Step 4: Run Backend Test Suite
Verify that all APIs, constraints, and double-booking conflict checks pass:
```bash
python backend/test_api.py
```

### Step 5: Start Backend Server
```bash
python backend/run.py
```
The Flask REST API will start at: `http://localhost:5000`

### Step 6: Start Frontend Application
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React application will launch at: `http://localhost:3000`

---

## Default Administrator Credentials

| Field | Value |
|---|---|
| **Username** | `admin` |
| **Email** | `admin@medicare.com` |
| **Password** | `admin123` |

*(A convenient "Auto Fill" button is also provided directly on the Login screen).*

---

## Deployment Instructions

### Production Frontend Build
```bash
cd frontend
npm run build
```
The optimized production bundle is generated in `frontend/dist/`. It can be served via Nginx, Vercel, Netlify, or AWS S3 + CloudFront.

### Production Backend Deployment (Gunicorn / Docker)
Run with Gunicorn (Linux/Container):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app('production')"
```

### Production Environment Variables Checklist
- `FLASK_ENV=production`
- `SECRET_KEY=<generate-strong-random-key>`
- `JWT_SECRET_KEY=<generate-strong-jwt-secret>`
- `DATABASE_URL=postgresql+psycopg://<user>:<password>@<host>:5432/<dbname>`
- `USE_SQLITE_FALLBACK=false`

