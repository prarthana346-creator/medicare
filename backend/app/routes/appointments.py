from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.utils.helpers import api_response, error_response, validate_required_fields, parse_date

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

VALID_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'In Progress']

@appointments_bp.route('', methods=['GET'])
def get_appointments():
    query = Appointment.query

    status = request.args.get('status')
    if status:
        query = query.filter(Appointment.status == status.strip())

    doctor_id = request.args.get('doctor_id', type=int)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)

    patient_id = request.args.get('patient_id', type=int)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    date_str = request.args.get('date')
    if date_str:
        d = parse_date(date_str)
        if d:
            query = query.filter(Appointment.appointment_date == d)

    appointments = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()
    return api_response(data=[apt.to_dict() for apt in appointments], message="Appointments retrieved successfully")

@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)
    return api_response(data=appointment.to_dict(), message="Appointment retrieved successfully")

@appointments_bp.route('', methods=['POST'])
@jwt_required()
def create_appointment():
    data = request.get_json(silent=True) or {}
    required = ['patient_id', 'doctor_id', 'appointment_date', 'appointment_time']
    is_valid, msg = validate_required_fields(data, required)
    if not is_valid:
        return error_response(msg, 400)

    # Validate patient exists
    patient = Patient.query.get(data['patient_id'])
    if not patient:
        return error_response("Patient not found", 404)

    # Validate doctor exists
    doctor = Doctor.query.get(data['doctor_id'])
    if not doctor:
        return error_response("Doctor not found", 404)

    # Parse and validate date
    apt_date = parse_date(data['appointment_date'])
    if not apt_date:
        return error_response("Invalid appointment date format. Use YYYY-MM-DD", 400)

    apt_time = data['appointment_time'].strip()

    # CONFLICT CHECK: Doctor cannot have overlapping active appointments
    conflict = Appointment.query.filter(
        Appointment.doctor_id == doctor.doctor_id,
        Appointment.appointment_date == apt_date,
        Appointment.appointment_time == apt_time,
        Appointment.status != 'Cancelled'
    ).first()

    if conflict:
        doc_display = doctor.doctor_name if doctor.doctor_name.startswith("Dr.") else f"Dr. {doctor.doctor_name}"
        return error_response(
            f"Scheduling Conflict: {doc_display} already has an active appointment at {apt_time} on {apt_date.strftime('%Y-%m-%d')}.",
            409
        )

    status = data.get('status', 'Scheduled').strip()
    if status not in VALID_STATUSES:
        status = 'Scheduled'

    appointment = Appointment(
        patient_id=patient.patient_id,
        doctor_id=doctor.doctor_id,
        appointment_date=apt_date,
        appointment_time=apt_time,
        status=status,
        reason=data.get('reason', '').strip()
    )

    db.session.add(appointment)
    db.session.commit()

    return api_response(data=appointment.to_dict(), message="Appointment booked successfully", status_code=201)

@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)

    data = request.get_json(silent=True) or {}

    doctor_id = data.get('doctor_id', appointment.doctor_id)
    apt_date = parse_date(data.get('appointment_date')) if 'appointment_date' in data else appointment.appointment_date
    apt_time = data.get('appointment_time', appointment.appointment_time).strip() if 'appointment_time' in data else appointment.appointment_time
    new_status = data.get('status', appointment.status).strip() if 'status' in data else appointment.status

    if new_status not in VALID_STATUSES:
        return error_response(f"Invalid status. Allowed: {', '.join(VALID_STATUSES)}", 400)

    # Check for conflicts if doctor, date, or time is modified and status is not Cancelled
    if new_status != 'Cancelled':
        conflict = Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == apt_date,
            Appointment.appointment_time == apt_time,
            Appointment.appointment_id != appointment_id,
            Appointment.status != 'Cancelled'
        ).first()

        if conflict:
            doctor = Doctor.query.get(doctor_id)
            doc_name = doctor.doctor_name if doctor else "the doctor"
            doc_display = doc_name if doc_name.startswith("Dr.") else f"Dr. {doc_name}"
            return error_response(
                f"Scheduling Conflict: {doc_display} already has an active appointment scheduled at {apt_time} on {apt_date.strftime('%Y-%m-%d')}.",
                409
            )

    if 'patient_id' in data:
        patient = Patient.query.get(data['patient_id'])
        if not patient:
            return error_response("Patient not found", 404)
        appointment.patient_id = patient.patient_id

    if 'doctor_id' in data:
        doctor = Doctor.query.get(data['doctor_id'])
        if not doctor:
            return error_response("Doctor not found", 404)
        appointment.doctor_id = doctor.doctor_id

    appointment.appointment_date = apt_date
    appointment.appointment_time = apt_time
    appointment.status = new_status
    if 'reason' in data:
        appointment.reason = data['reason'].strip()

    db.session.commit()
    return api_response(data=appointment.to_dict(), message="Appointment updated successfully")

@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)

    db.session.delete(appointment)
    db.session.commit()
    return api_response(message="Appointment deleted successfully")

@appointments_bp.route('/<int:appointment_id>/cancel', methods=['PATCH', 'POST'])
@jwt_required()
def cancel_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)

    appointment.status = 'Cancelled'
    db.session.commit()
    return api_response(data=appointment.to_dict(), message="Appointment cancelled successfully")
