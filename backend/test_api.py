import os
import sys

# Ensure backend directory is in python module search path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import json
from app import create_app
from app.extensions import db
from app.models.admin import Admin
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.department import Department
from app.models.medical_record import MedicalRecord
from app.models.billing import Billing

def run_tests():
    app = create_app('development')
    client = app.test_client()

    with app.app_context():
        print("--- 1. Health Check Test ---")
        res = client.get('/api/health')
        assert res.status_code == 200, f"Health check failed: {res.data}"
        print("✓ Health check OK:", res.json)

        print("\n--- 2. Admin Authentication Test ---")
        login_res = client.post('/api/auth/login', json={
            'username': 'admin',
            'password': 'admin123'
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.data}"
        token = login_res.json['data']['token']
        assert token, "Token missing in login response"
        headers = {'Authorization': f'Bearer {token}'}
        print("✓ Login OK. Token generated successfully.")

        print("\n--- 3. Dashboard Stats & Charts Test ---")
        stats_res = client.get('/api/dashboard/stats')
        assert stats_res.status_code == 200, f"Stats failed: {stats_res.data}"
        stats = stats_res.json['data']
        print("✓ Dashboard Stats:", stats)
        assert stats['total_patients'] >= 10
        assert stats['total_doctors'] >= 5
        assert stats['total_appointments'] >= 10
        assert stats['total_revenue'] > 0

        charts_res = client.get('/api/dashboard/charts')
        assert charts_res.status_code == 200
        charts = charts_res.json['data']
        print(f"✓ Dashboard Charts OK. Appointment statuses: {len(charts['appointment_status'])}, Departments: {len(charts['department_distribution'])}")

        print("\n--- 4. Departments CRUD Test ---")
        # GET
        depts_res = client.get('/api/departments')
        assert depts_res.status_code == 200
        dept_count_before = len(depts_res.json['data'])

        # POST
        new_dept_res = client.post('/api/departments', json={
            'department_name': 'Emergency & Trauma',
            'description': '24/7 urgent critical trauma and resuscitation care'
        }, headers=headers)
        assert new_dept_res.status_code == 201, f"Failed create dept: {new_dept_res.data}"
        created_dept_id = new_dept_res.json['data']['department_id']
        print(f"✓ Created Department #{created_dept_id}")

        # PUT
        update_dept_res = client.put(f'/api/departments/{created_dept_id}', json={
            'description': 'Updated urgent trauma care center'
        }, headers=headers)
        assert update_dept_res.status_code == 200
        assert update_dept_res.json['data']['description'] == 'Updated urgent trauma care center'
        print("✓ Updated Department OK")

        # DELETE
        del_dept_res = client.delete(f'/api/departments/{created_dept_id}', headers=headers)
        assert del_dept_res.status_code == 200
        print("✓ Deleted Department OK")

        print("\n--- 5. Doctor Management Test ---")
        doc_res = client.get('/api/doctors')
        assert doc_res.status_code == 200
        doc_id = doc_res.json['data'][0]['doctor_id']

        # Filter by specialization
        spec_res = client.get('/api/doctors?specialization=Cardiology')
        assert spec_res.status_code == 200
        print(f"✓ Doctors list OK. Specialization filter found {len(spec_res.json['data'])} cardiologist(s).")

        print("\n--- 6. Appointment Booking & Conflict Prevention Test ---")
        patient = Patient.query.first()
        doctor = Doctor.query.first()

        # Book an appointment
        book_res = client.post('/api/appointments', json={
            'patient_id': patient.patient_id,
            'doctor_id': doctor.doctor_id,
            'appointment_date': '2026-12-01',
            'appointment_time': '09:00 AM',
            'reason': 'Annual general physical checkup'
        }, headers=headers)
        assert book_res.status_code == 201, f"Booking failed: {book_res.data}"
        apt_id = book_res.json['data']['appointment_id']
        print(f"✓ Booked Appointment #{apt_id} on 2026-12-01 at 09:00 AM")

        # Attempt to book the SAME doctor at the SAME date and time -> MUST BE REJECTED WITH 409 CONFLICT!
        conflict_res = client.post('/api/appointments', json={
            'patient_id': patient.patient_id,
            'doctor_id': doctor.doctor_id,
            'appointment_date': '2026-12-01',
            'appointment_time': '09:00 AM',
            'reason': 'Conflicting slot test'
        }, headers=headers)
        assert conflict_res.status_code == 409, f"Conflict prevention failed! Received: {conflict_res.status_code}"
        print(f"✓ Conflict Prevention Verified: Doctor double booking was successfully blocked ({conflict_res.json['message']})")

        # Cleanup test appointment
        client.delete(f'/api/appointments/{apt_id}', headers=headers)

        print("\n--- 7. Medical Records CRUD Test ---")
        rec_res = client.post('/api/medical-records', json={
            'patient_id': patient.patient_id,
            'doctor_id': doctor.doctor_id,
            'diagnosis': 'Seasonal allergic conjunctivitis',
            'prescription': 'Olopatadine 0.1% eye drops twice daily',
            'treatment_date': '2026-11-01'
        }, headers=headers)
        assert rec_res.status_code == 201
        rec_id = rec_res.json['data']['record_id']
        print(f"✓ Created Medical Record #{rec_id}")
        client.delete(f'/api/medical-records/{rec_id}', headers=headers)

        print("\n--- 8. Billing & Revenue Test ---")
        bill_res = client.post('/api/billing', json={
            'patient_id': patient.patient_id,
            'total_amount': 350.00,
            'payment_status': 'Pending'
        }, headers=headers)
        assert bill_res.status_code == 201
        bill_id = bill_res.json['data']['bill_id']
        print(f"✓ Generated Bill #{bill_id} for $350.00 (Pending)")

        # Update to Paid
        update_bill_res = client.put(f'/api/billing/{bill_id}', json={
            'payment_status': 'Paid'
        }, headers=headers)
        assert update_bill_res.status_code == 200
        assert update_bill_res.json['data']['payment_status'] == 'Paid'
        assert update_bill_res.json['data']['payment_date'] is not None
        print(f"✓ Updated Bill #{bill_id} to Paid. Payment date stamped.")
        client.delete(f'/api/billing/{bill_id}', headers=headers)

        print("\n==========================================")
        print("ALL BACKEND APIS & CONSTRAINTS PASSED 100%!")
        print("==========================================")

if __name__ == '__main__':
    run_tests()
