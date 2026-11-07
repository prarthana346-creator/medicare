from datetime import date
from flask import Blueprint
from sqlalchemy import func
from app.extensions import db
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.department import Department
from app.models.appointment import Appointment
from app.models.billing import Billing
from app.utils.helpers import api_response

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
def get_stats():
    total_patients = Patient.query.count()
    total_doctors = Doctor.query.count()
    total_appointments = Appointment.query.count()

    total_revenue = db.session.query(
        func.coalesce(func.sum(Billing.total_amount), 0.0)
    ).filter(Billing.payment_status == 'Paid').scalar()

    pending_revenue = db.session.query(
        func.coalesce(func.sum(Billing.total_amount), 0.0)
    ).filter(Billing.payment_status == 'Pending').scalar()

    today = date.today()
    today_appointments = Appointment.query.filter(Appointment.appointment_date == today).count()

    return api_response(
        data={
            'total_patients': total_patients,
            'total_doctors': total_doctors,
            'total_appointments': total_appointments,
            'total_revenue': float(total_revenue or 0.0),
            'pending_revenue': float(pending_revenue or 0.0),
            'today_appointments': today_appointments
        },
        message="Dashboard statistics retrieved successfully"
    )

@dashboard_bp.route('/charts', methods=['GET'])
def get_charts():
    # 1. Appointment status distribution
    status_counts = db.session.query(
        Appointment.status, func.count(Appointment.appointment_id)
    ).group_by(Appointment.status).all()

    appointment_status_chart = [
        {'name': status or 'Unknown', 'count': count}
        for status, count in status_counts
    ]

    # 2. Department distribution (doctors per department)
    dept_distribution = db.session.query(
        Department.department_name, func.count(Doctor.doctor_id)
    ).outerjoin(Doctor, Department.department_id == Doctor.department_id)\
     .group_by(Department.department_name).all()

    department_chart = [
        {'name': name, 'doctors': count}
        for name, count in dept_distribution
    ]

    # 3. Patient age groups distribution
    patients = Patient.query.all()
    age_groups = {
        '0-17': 0,
        '18-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0
    }
    for p in patients:
        if p.age < 18:
            age_groups['0-17'] += 1
        elif p.age <= 35:
            age_groups['18-35'] += 1
        elif p.age <= 50:
            age_groups['36-50'] += 1
        elif p.age <= 65:
            age_groups['51-65'] += 1
        else:
            age_groups['65+'] += 1

    patient_age_chart = [
        {'group': group, 'count': count}
        for group, count in age_groups.items()
    ]

    # 4. Revenue & Billing status distribution
    paid_rev = db.session.query(func.coalesce(func.sum(Billing.total_amount), 0.0)).filter(Billing.payment_status == 'Paid').scalar()
    pending_rev = db.session.query(func.coalesce(func.sum(Billing.total_amount), 0.0)).filter(Billing.payment_status == 'Pending').scalar()
    cancelled_rev = db.session.query(func.coalesce(func.sum(Billing.total_amount), 0.0)).filter(Billing.payment_status == 'Cancelled').scalar()

    billing_chart = [
        {'name': 'Paid', 'amount': float(paid_rev or 0.0)},
        {'name': 'Pending', 'amount': float(pending_rev or 0.0)},
        {'name': 'Cancelled', 'amount': float(cancelled_rev or 0.0)}
    ]

    return api_response(
        data={
            'appointment_status': appointment_status_chart,
            'department_distribution': department_chart,
            'patient_age_groups': patient_age_chart,
            'billing_breakdown': billing_chart
        },
        message="Chart data retrieved successfully"
    )

@dashboard_bp.route('/recent-appointments', methods=['GET'])
def get_recent_appointments():
    recent = Appointment.query.order_by(
        Appointment.appointment_date.desc(),
        Appointment.appointment_time.desc()
    ).limit(8).all()

    return api_response(
        data=[apt.to_dict() for apt in recent],
        message="Recent appointments retrieved successfully"
    )

