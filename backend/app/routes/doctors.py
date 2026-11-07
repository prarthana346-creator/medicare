from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.doctor import Doctor
from app.models.department import Department
from app.utils.helpers import api_response, error_response, validate_required_fields, validate_email, validate_phone

doctors_bp = Blueprint('doctors', __name__, url_prefix='/api/doctors')

@doctors_bp.route('', methods=['GET'])
def get_doctors():
    query = Doctor.query

    specialization = request.args.get('specialization')
    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization.strip()}%"))

    department_id = request.args.get('department_id', type=int)
    if department_id:
        query = query.filter(Doctor.department_id == department_id)

    search = request.args.get('search')
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Doctor.doctor_name.ilike(search_term)) |
            (Doctor.specialization.ilike(search_term)) |
            (Doctor.email.ilike(search_term)) |
            (Doctor.phone.ilike(search_term))
        )

    doctors = query.order_by(Doctor.doctor_name.asc()).all()
    return api_response(data=[doc.to_dict() for doc in doctors], message="Doctors retrieved successfully")

@doctors_bp.route('/specializations', methods=['GET'])
def get_specializations():
    results = db.session.query(Doctor.specialization).distinct().order_by(Doctor.specialization.asc()).all()
    specializations = [r[0] for r in results if r[0]]
    return api_response(data=specializations, message="Specializations retrieved successfully")

@doctors_bp.route('/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return error_response("Doctor not found", 404)
    return api_response(data=doctor.to_dict(), message="Doctor retrieved successfully")

@doctors_bp.route('', methods=['POST'])
@jwt_required()
def create_doctor():
    data = request.get_json(silent=True) or {}
    required = ['doctor_name', 'specialization', 'department_id', 'phone', 'email', 'consultation_fee']
    is_valid, msg = validate_required_fields(data, required)
    if not is_valid:
        return error_response(msg, 400)

    if not validate_email(data['email']):
        return error_response("Invalid email format", 400)

    if not validate_phone(data['phone']):
        return error_response("Invalid phone number format", 400)

    department = Department.query.get(data['department_id'])
    if not department:
        return error_response("Specified department does not exist", 404)

    try:
        fee = float(data['consultation_fee'])
        if fee < 0:
            return error_response("Consultation fee cannot be negative", 400)
    except (ValueError, TypeError):
        return error_response("Consultation fee must be a valid number", 400)

    doctor = Doctor(
        doctor_name=data['doctor_name'].strip(),
        specialization=data['specialization'].strip(),
        department_id=data['department_id'],
        phone=data['phone'].strip(),
        email=data['email'].strip().lower(),
        consultation_fee=fee,
        availability=data.get('availability', 'Available').strip()
    )

    db.session.add(doctor)
    db.session.commit()

    return api_response(data=doctor.to_dict(), message="Doctor added successfully", status_code=201)

@doctors_bp.route('/<int:doctor_id>', methods=['PUT'])
@jwt_required()
def update_doctor(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return error_response("Doctor not found", 404)

    data = request.get_json(silent=True) or {}

    if 'doctor_name' in data:
        doctor.doctor_name = data['doctor_name'].strip()
    if 'specialization' in data:
        doctor.specialization = data['specialization'].strip()
    if 'department_id' in data:
        dept = Department.query.get(data['department_id'])
        if not dept:
            return error_response("Department does not exist", 404)
        doctor.department_id = data['department_id']
    if 'phone' in data:
        if not validate_phone(data['phone']):
            return error_response("Invalid phone number format", 400)
        doctor.phone = data['phone'].strip()
    if 'email' in data:
        if not validate_email(data['email']):
            return error_response("Invalid email format", 400)
        doctor.email = data['email'].strip().lower()
    if 'consultation_fee' in data:
        try:
            fee = float(data['consultation_fee'])
            if fee < 0:
                return error_response("Consultation fee cannot be negative", 400)
            doctor.consultation_fee = fee
        except (ValueError, TypeError):
            return error_response("Consultation fee must be a valid number", 400)
    if 'availability' in data:
        doctor.availability = data['availability'].strip()

    db.session.commit()
    return api_response(data=doctor.to_dict(), message="Doctor updated successfully")

@doctors_bp.route('/<int:doctor_id>', methods=['DELETE'])
@jwt_required()
def delete_doctor(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return error_response("Doctor not found", 404)

    db.session.delete(doctor)
    db.session.commit()
    return api_response(message="Doctor deleted successfully")

