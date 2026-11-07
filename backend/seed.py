import os
import sys

# Ensure backend directory is in python module search path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from datetime import date, datetime, timedelta, timezone
from app import create_app
from app.extensions import db
from app.models.admin import Admin
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.billing import Billing

app = create_app()

def seed():
    with app.app_context():
        print("Creating all database tables...")
        db.create_all()

        # Check if already seeded
        if Admin.query.first():
            print("Database already contains data. Skipping re-seed.")
            return

        print("Seeding Admin account...")
        admin = Admin(
            username='admin',
            email='admin@medicare.com'
        )
        admin.set_password('admin123')
        db.session.add(admin)

        print("Seeding 5 Departments...")
        departments_data = [
            {
                'department_name': 'Cardiology',
                'description': 'Comprehensive care for congenital heart defects, coronary artery disease, heart failure, and valvular disorders.'
            },
            {
                'department_name': 'Neurology',
                'description': 'Advanced diagnostics and medical treatment for disorders of the brain, spinal cord, and peripheral nervous system.'
            },
            {
                'department_name': 'Orthopedics',
                'description': 'Specialized orthopedic surgery and rehabilitation for bones, joints, ligaments, tendons, and sports injuries.'
            },
            {
                'department_name': 'Pediatrics',
                'description': 'Compassionate pediatric healthcare, neonatal care, routine wellness, and acute child illness management.'
            },
            {
                'department_name': 'Dermatology',
                'description': 'Clinical, cosmetic, and surgical treatments for skin conditions, dermatopathology, and aesthetic medicine.'
            }
        ]

        departments = []
        for d_data in departments_data:
            dept = Department(**d_data)
            db.session.add(dept)
            departments.append(dept)
        db.session.flush()

        print("Seeding 5 Doctors...")
        doctors_data = [
            {
                'doctor_name': 'Dr. Sarah Jenkins',
                'specialization': 'Interventional Cardiology',
                'department_id': departments[0].department_id,
                'phone': '+1 (555) 234-5671',
                'email': 's.jenkins@medicare.com',
                'consultation_fee': 250.00,
                'availability': 'Mon - Fri, 09:00 AM - 04:00 PM'
            },
            {
                'doctor_name': 'Dr. Marcus Vance',
                'specialization': 'Neurophysiology',
                'department_id': departments[1].department_id,
                'phone': '+1 (555) 345-6782',
                'email': 'm.vance@medicare.com',
                'consultation_fee': 300.00,
                'availability': 'Tue - Sat, 10:00 AM - 05:00 PM'
            },
            {
                'doctor_name': 'Dr. Elena Rostova',
                'specialization': 'Joint Replacement & Spine',
                'department_id': departments[2].department_id,
                'phone': '+1 (555) 456-7893',
                'email': 'e.rostova@medicare.com',
                'consultation_fee': 220.00,
                'availability': 'Mon - Thu, 08:30 AM - 03:30 PM'
            },
            {
                'doctor_name': 'Dr. David Kim',
                'specialization': 'General Pediatrics',
                'department_id': departments[3].department_id,
                'phone': '+1 (555) 567-8904',
                'email': 'd.kim@medicare.com',
                'consultation_fee': 180.00,
                'availability': 'Mon - Fri, 09:00 AM - 05:00 PM'
            },
            {
                'doctor_name': 'Dr. Aisha Patel',
                'specialization': 'Clinical Dermatology',
                'department_id': departments[4].department_id,
                'phone': '+1 (555) 678-9015',
                'email': 'a.patel@medicare.com',
                'consultation_fee': 200.00,
                'availability': 'Wed - Sun, 10:00 AM - 06:00 PM'
            }
        ]

        doctors = []
        for doc_data in doctors_data:
            doc = Doctor(**doc_data)
            db.session.add(doc)
            doctors.append(doc)
        db.session.flush()

        print("Seeding 10 Patients...")
        today = date.today()
        patients_data = [
            {
                'patient_name': 'John Doe',
                'age': 45,
                'gender': 'Male',
                'phone': '+1 (555) 111-2233',
                'email': 'john.doe@example.com',
                'address': '742 Evergreen Terrace, Springfield',
                'blood_group': 'A+'
            },
            {
                'patient_name': 'Jane Smith',
                'age': 34,
                'gender': 'Female',
                'phone': '+1 (555) 222-3344',
                'email': 'jane.smith@example.com',
                'address': '124 Conch Street, Bikini Bottom',
                'blood_group': 'O+'
            },
            {
                'patient_name': 'Robert Johnson',
                'age': 62,
                'gender': 'Male',
                'phone': '+1 (555) 333-4455',
                'email': 'robert.j@example.com',
                'address': '221B Baker Street, London',
                'blood_group': 'B+'
            },
            {
                'patient_name': 'Emily Davis',
                'age': 28,
                'gender': 'Female',
                'phone': '+1 (555) 444-5566',
                'email': 'emily.davis@example.com',
                'address': '404 Elm Street, Austin, TX',
                'blood_group': 'AB+'
            },
            {
                'patient_name': 'Michael Brown',
                'age': 53,
                'gender': 'Male',
                'phone': '+1 (555) 555-6677',
                'email': 'mbrown@example.com',
                'address': '890 Fifth Avenue, New York, NY',
                'blood_group': 'A-'
            },
            {
                'patient_name': 'Amanda Wilson',
                'age': 39,
                'gender': 'Female',
                'phone': '+1 (555) 666-7788',
                'email': 'awilson@example.com',
                'address': '1007 Mountain Drive, Gotham',
                'blood_group': 'O-'
            },
            {
                'patient_name': 'Christopher Taylor',
                'age': 14,
                'gender': 'Male',
                'phone': '+1 (555) 777-8899',
                'email': 'chris.taylor@example.com',
                'address': '31 Spooner Street, Quahog, RI',
                'blood_group': 'B-'
            },
            {
                'patient_name': 'Olivia Anderson',
                'age': 71,
                'gender': 'Female',
                'phone': '+1 (555) 888-9900',
                'email': 'olivia.anderson@example.com',
                'address': '1313 Mockingbird Lane, Dallas, TX',
                'blood_group': 'AB-'
            },
            {
                'patient_name': 'Daniel Martinez',
                'age': 24,
                'gender': 'Male',
                'phone': '+1 (555) 999-0011',
                'email': 'dmartinez@example.com',
                'address': '515 Broadway, Seattle, WA',
                'blood_group': 'O+'
            },
            {
                'patient_name': 'Sophia Thomas',
                'age': 41,
                'gender': 'Female',
                'phone': '+1 (555) 101-1122',
                'email': 'sthomas@example.com',
                'address': '777 Sunset Blvd, Los Angeles, CA',
                'blood_group': 'A+'
            }
        ]

        patients = []
        for i, p_data in enumerate(patients_data):
            p = Patient(
                **p_data,
                registration_date=datetime.now(timezone.utc) - timedelta(days=30 - (i * 2))
            )
            db.session.add(p)
            patients.append(p)
        db.session.flush()

        print("Seeding 10 Appointments...")
        appointments_data = [
            {
                'patient_id': patients[0].patient_id,
                'doctor_id': doctors[0].doctor_id,
                'appointment_date': today - timedelta(days=5),
                'appointment_time': '09:30 AM',
                'status': 'Completed',
                'reason': 'Routine cardiac stress assessment and ECG'
            },
            {
                'patient_id': patients[1].patient_id,
                'doctor_id': doctors[4].doctor_id,
                'appointment_date': today - timedelta(days=4),
                'appointment_time': '10:00 AM',
                'status': 'Completed',
                'reason': 'Chronic eczema flare-up and rash consultation'
            },
            {
                'patient_id': patients[2].patient_id,
                'doctor_id': doctors[1].doctor_id,
                'appointment_date': today - timedelta(days=3),
                'appointment_time': '11:15 AM',
                'status': 'Completed',
                'reason': 'Persistent migraine headaches and sleep disturbance'
            },
            {
                'patient_id': patients[3].patient_id,
                'doctor_id': doctors[2].doctor_id,
                'appointment_date': today - timedelta(days=2),
                'appointment_time': '01:00 PM',
                'status': 'Completed',
                'reason': 'Right knee ligament strain after athletic training'
            },
            {
                'patient_id': patients[6].patient_id,
                'doctor_id': doctors[3].doctor_id,
                'appointment_date': today - timedelta(days=1),
                'appointment_time': '02:30 PM',
                'status': 'Completed',
                'reason': 'Adolescent annual growth screening and immunizations'
            },
            {
                'patient_id': patients[4].patient_id,
                'doctor_id': doctors[0].doctor_id,
                'appointment_date': today,
                'appointment_time': '10:00 AM',
                'status': 'Scheduled',
                'reason': 'Mild chest discomfort and follow-up on hypertension'
            },
            {
                'patient_id': patients[5].patient_id,
                'doctor_id': doctors[1].doctor_id,
                'appointment_date': today,
                'appointment_time': '02:00 PM',
                'status': 'Scheduled',
                'reason': 'Tingling sensation in extremities and nerve reflex tests'
            },
            {
                'patient_id': patients[7].patient_id,
                'doctor_id': doctors[2].doctor_id,
                'appointment_date': today + timedelta(days=1),
                'appointment_time': '10:30 AM',
                'status': 'Scheduled',
                'reason': 'Hip joint osteoarthritis consultation'
            },
            {
                'patient_id': patients[8].patient_id,
                'doctor_id': doctors[4].doctor_id,
                'appointment_date': today + timedelta(days=2),
                'appointment_time': '03:15 PM',
                'status': 'Scheduled',
                'reason': 'Mole evaluation and biopsy follow-up'
            },
            {
                'patient_id': patients[9].patient_id,
                'doctor_id': doctors[0].doctor_id,
                'appointment_date': today + timedelta(days=3),
                'appointment_time': '11:00 AM',
                'status': 'Cancelled',
                'reason': 'Patient requested reschedule due to travel conflicts'
            }
        ]

        appointments = []
        for apt_data in appointments_data:
            apt = Appointment(**apt_data)
            db.session.add(apt)
            appointments.append(apt)
        db.session.flush()

        print("Seeding Medical Records...")
        medical_records_data = [
            {
                'patient_id': patients[0].patient_id,
                'doctor_id': doctors[0].doctor_id,
                'diagnosis': 'Stage 1 Primary Hypertension with sinus tachycardia.',
                'prescription': 'Amlodipine 5mg daily in morning; Metoprolol 25mg twice daily. Low sodium dietary protocol.',
                'treatment_date': today - timedelta(days=5)
            },
            {
                'patient_id': patients[1].patient_id,
                'doctor_id': doctors[4].doctor_id,
                'diagnosis': 'Contact dermatitis with localized pruritic erythema.',
                'prescription': 'Hydrocortisone 1% topical cream twice daily for 10 days; Cetirizine 10mg once daily at bedtime.',
                'treatment_date': today - timedelta(days=4)
            },
            {
                'patient_id': patients[2].patient_id,
                'doctor_id': doctors[1].doctor_id,
                'diagnosis': 'Chronic tension-type headache exacerbated by cervical spine tension.',
                'prescription': 'Sumatriptan 50mg PRN at migraine onset; Physical therapy referral for cervical alignment.',
                'treatment_date': today - timedelta(days=3)
            },
            {
                'patient_id': patients[3].patient_id,
                'doctor_id': doctors[2].doctor_id,
                'diagnosis': 'Grade 1 Medial Collateral Ligament (MCL) strain of the right knee.',
                'prescription': 'Ibuprofen 400mg every 8 hours as needed for inflammation; RICE therapy; Knee stabilizer brace 3 weeks.',
                'treatment_date': today - timedelta(days=2)
            },
            {
                'patient_id': patients[6].patient_id,
                'doctor_id': doctors[3].doctor_id,
                'diagnosis': 'Healthy adolescent checkup; seasonal allergic rhinitis.',
                'prescription': 'Fluticasone nasal spray 1 spray per nostril daily; Vitamin D3 1000 IU supplement.',
                'treatment_date': today - timedelta(days=1)
            }
        ]

        for mr_data in medical_records_data:
            mr = MedicalRecord(**mr_data)
            db.session.add(mr)

        print("Seeding Billing Records...")
        billing_data = [
            {
                'patient_id': patients[0].patient_id,
                'appointment_id': appointments[0].appointment_id,
                'total_amount': 250.00,
                'payment_status': 'Paid',
                'payment_date': datetime.now(timezone.utc) - timedelta(days=5)
            },
            {
                'patient_id': patients[1].patient_id,
                'appointment_id': appointments[1].appointment_id,
                'total_amount': 200.00,
                'payment_status': 'Paid',
                'payment_date': datetime.now(timezone.utc) - timedelta(days=4)
            },
            {
                'patient_id': patients[2].patient_id,
                'appointment_id': appointments[2].appointment_id,
                'total_amount': 300.00,
                'payment_status': 'Paid',
                'payment_date': datetime.now(timezone.utc) - timedelta(days=3)
            },
            {
                'patient_id': patients[3].patient_id,
                'appointment_id': appointments[3].appointment_id,
                'total_amount': 220.00,
                'payment_status': 'Paid',
                'payment_date': datetime.now(timezone.utc) - timedelta(days=2)
            },
            {
                'patient_id': patients[6].patient_id,
                'appointment_id': appointments[4].appointment_id,
                'total_amount': 180.00,
                'payment_status': 'Paid',
                'payment_date': datetime.now(timezone.utc) - timedelta(days=1)
            },
            {
                'patient_id': patients[4].patient_id,
                'appointment_id': appointments[5].appointment_id,
                'total_amount': 250.00,
                'payment_status': 'Pending',
                'payment_date': None
            },
            {
                'patient_id': patients[5].patient_id,
                'appointment_id': appointments[6].appointment_id,
                'total_amount': 300.00,
                'payment_status': 'Pending',
                'payment_date': None
            },
            {
                'patient_id': patients[7].patient_id,
                'appointment_id': appointments[7].appointment_id,
                'total_amount': 220.00,
                'payment_status': 'Pending',
                'payment_date': None
            }
        ]

        for b_data in billing_data:
            b = Billing(**b_data)
            db.session.add(b)

        db.session.commit()
        print("Medicare sample database successfully seeded!")
        print("Default Admin Credentials: username: admin, password: admin123")

if __name__ == '__main__':
    seed()
