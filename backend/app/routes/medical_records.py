from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.utils.helpers import api_response, error_response, validate_required_fields, parse_date

medical_records_bp = Blueprint('medical_records', __name__, url_prefix='/api/medical-records')

@medical_records_bp.route('', methods=['GET'])
def get_medical_records():
    query = MedicalRecord.query

    patient_id = request.args.get('patient_id', type=int)
    if patient_id:
        query = query.filter(MedicalRecord.patient_id == patient_id)

    doctor_id = request.args.get('doctor_id', type=int)
    if doctor_id:
        query = query.filter(MedicalRecord.doctor_id == doctor_id)

    records = query.order_by(MedicalRecord.treatment_date.desc(), MedicalRecord.created_at.desc()).all()
    return api_response(data=[rec.to_dict() for rec in records], message="Medical records retrieved successfully")

@medical_records_bp.route('/<int:record_id>', methods=['GET'])
def get_medical_record(record_id):
    record = MedicalRecord.query.get(record_id)
    if not record:
        return error_response("Medical record not found", 404)
    return api_response(data=record.to_dict(), message="Medical record retrieved successfully")

@medical_records_bp.route('', methods=['POST'])
@jwt_required()
def create_medical_record():
    data = request.get_json(silent=True) or {}
    required = ['patient_id', 'doctor_id', 'diagnosis', 'prescription', 'treatment_date']
    is_valid, msg = validate_required_fields(data, required)
    if not is_valid:
        return error_response(msg, 400)

    patient = Patient.query.get(data['patient_id'])
    if not patient:
        return error_response("Patient not found", 404)

    doctor = Doctor.query.get(data['doctor_id'])
    if not doctor:
        return error_response("Doctor not found", 404)

    treatment_date = parse_date(data['treatment_date'])
    if not treatment_date:
        return error_response("Invalid treatment date format. Use YYYY-MM-DD", 400)

    record = MedicalRecord(
        patient_id=patient.patient_id,
        doctor_id=doctor.doctor_id,
        diagnosis=data['diagnosis'].strip(),
        prescription=data['prescription'].strip(),
        treatment_date=treatment_date
    )

    db.session.add(record)
    db.session.commit()

    return api_response(data=record.to_dict(), message="Medical record added successfully", status_code=201)

@medical_records_bp.route('/<int:record_id>', methods=['PUT'])
@jwt_required()
def update_medical_record(record_id):
    record = MedicalRecord.query.get(record_id)
    if not record:
        return error_response("Medical record not found", 404)

    data = request.get_json(silent=True) or {}

    if 'patient_id' in data:
        patient = Patient.query.get(data['patient_id'])
        if not patient:
            return error_response("Patient not found", 404)
        record.patient_id = patient.patient_id

    if 'doctor_id' in data:
        doctor = Doctor.query.get(data['doctor_id'])
        if not doctor:
            return error_response("Doctor not found", 404)
        record.doctor_id = doctor.doctor_id

    if 'diagnosis' in data:
        record.diagnosis = data['diagnosis'].strip()

    if 'prescription' in data:
        record.prescription = data['prescription'].strip()

    if 'treatment_date' in data:
        d = parse_date(data['treatment_date'])
        if not d:
            return error_response("Invalid treatment date format. Use YYYY-MM-DD", 400)
        record.treatment_date = d

    db.session.commit()
    return api_response(data=record.to_dict(), message="Medical record updated successfully")

@medical_records_bp.route('/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_medical_record(record_id):
    record = MedicalRecord.query.get(record_id)
    if not record:
        return error_response("Medical record not found", 404)

    db.session.delete(record)
    db.session.commit()
    return api_response(message="Medical record deleted successfully")

