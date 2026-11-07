from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.patient import Patient
from app.utils.helpers import api_response, error_response, validate_required_fields, validate_email, validate_phone

patients_bp = Blueprint('patients', __name__, url_prefix='/api/patients')

VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

@patients_bp.route('', methods=['GET'])
def get_patients():
    query = Patient.query

    search = request.args.get('search') or request.args.get('q')
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Patient.patient_name.ilike(search_term)) |
            (Patient.phone.ilike(search_term)) |
            (Patient.email.ilike(search_term)) |
            (Patient.blood_group.ilike(search_term)) |
            (Patient.address.ilike(search_term))
        )

    blood_group = request.args.get('blood_group')
    if blood_group:
        query = query.filter(Patient.blood_group == blood_group.strip().upper())

    patients = query.order_by(Patient.registration_date.desc()).all()
    return api_response(data=[p.to_dict() for p in patients], message="Patients retrieved successfully")

@patients_bp.route('/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return error_response("Patient not found", 404)

    data = patient.to_dict()
    data['appointments'] = [apt.to_dict() for apt in patient.appointments]
    data['medical_records'] = [rec.to_dict() for rec in patient.medical_records]
    data['bills'] = [b.to_dict() for b in patient.bills]
    return api_response(data=data, message="Patient details retrieved successfully")

@patients_bp.route('', methods=['POST'])
@jwt_required()
def create_patient():
    data = request.get_json(silent=True) or {}
    required = ['patient_name', 'age', 'gender', 'phone', 'email', 'blood_group']
    is_valid, msg = validate_required_fields(data, required)
    if not is_valid:
        return error_response(msg, 400)

    try:
        age = int(data['age'])
        if age < 0 or age > 130:
            return error_response("Age must be between 0 and 130", 400)
    except (ValueError, TypeError):
        return error_response("Age must be a valid integer", 400)

    if not validate_email(data['email']):
        return error_response("Invalid email format", 400)

    if not validate_phone(data['phone']):
        return error_response("Invalid phone number format", 400)

    bg = data['blood_group'].strip().upper()
    if bg not in VALID_BLOOD_GROUPS:
        return error_response(f"Invalid blood group. Allowed: {', '.join(VALID_BLOOD_GROUPS)}", 400)

    patient = Patient(
        patient_name=data['patient_name'].strip(),
        age=age,
        gender=data['gender'].strip(),
        phone=data['phone'].strip(),
        email=data['email'].strip().lower(),
        address=data.get('address', '').strip(),
        blood_group=bg
    )

    db.session.add(patient)
    db.session.commit()

    return api_response(data=patient.to_dict(), message="Patient registered successfully", status_code=201)

@patients_bp.route('/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return error_response("Patient not found", 404)

    data = request.get_json(silent=True) or {}

    if 'patient_name' in data:
        patient.patient_name = data['patient_name'].strip()
    if 'age' in data:
        try:
            age = int(data['age'])
            if age < 0 or age > 130:
                return error_response("Age must be between 0 and 130", 400)
            patient.age = age
        except (ValueError, TypeError):
            return error_response("Age must be a valid integer", 400)
    if 'gender' in data:
        patient.gender = data['gender'].strip()
    if 'phone' in data:
        if not validate_phone(data['phone']):
            return error_response("Invalid phone number format", 400)
        patient.phone = data['phone'].strip()
    if 'email' in data:
        if not validate_email(data['email']):
            return error_response("Invalid email format", 400)
        patient.email = data['email'].strip().lower()
    if 'address' in data:
        patient.address = data['address'].strip()
    if 'blood_group' in data:
        bg = data['blood_group'].strip().upper()
        if bg not in VALID_BLOOD_GROUPS:
            return error_response(f"Invalid blood group. Allowed: {', '.join(VALID_BLOOD_GROUPS)}", 400)
        patient.blood_group = bg

    db.session.commit()
    return api_response(data=patient.to_dict(), message="Patient updated successfully")

@patients_bp.route('/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return error_response("Patient not found", 404)

    db.session.delete(patient)
    db.session.commit()
    return api_response(message="Patient record deleted successfully")

