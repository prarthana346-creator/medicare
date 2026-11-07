from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.billing import Billing
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.utils.helpers import api_response, error_response, validate_required_fields

billing_bp = Blueprint('billing', __name__, url_prefix='/api/billing')

VALID_PAYMENT_STATUSES = ['Pending', 'Paid', 'Cancelled']

@billing_bp.route('', methods=['GET'])
def get_bills():
    query = Billing.query

    status = request.args.get('payment_status')
    if status:
        query = query.filter(Billing.payment_status == status.strip())

    patient_id = request.args.get('patient_id', type=int)
    if patient_id:
        query = query.filter(Billing.patient_id == patient_id)

    bills = query.order_by(Billing.created_at.desc()).all()
    return api_response(data=[b.to_dict() for b in bills], message="Billing records retrieved successfully")

@billing_bp.route('/summary', methods=['GET'])
def get_billing_summary():
    bills = Billing.query.all()
    total_revenue = sum(b.total_amount for b in bills if b.payment_status == 'Paid')
    pending_amount = sum(b.total_amount for b in bills if b.payment_status == 'Pending')
    paid_count = sum(1 for b in bills if b.payment_status == 'Paid')
    pending_count = sum(1 for b in bills if b.payment_status == 'Pending')
    total_count = len(bills)

    return api_response(
        data={
            'total_revenue': float(total_revenue),
            'pending_amount': float(pending_amount),
            'paid_count': paid_count,
            'pending_count': pending_count,
            'total_count': total_count
        },
        message="Billing summary calculated successfully"
    )

@billing_bp.route('/<int:bill_id>', methods=['GET'])
def get_bill(bill_id):
    bill = Billing.query.get(bill_id)
    if not bill:
        return error_response("Bill not found", 404)
    return api_response(data=bill.to_dict(), message="Bill retrieved successfully")

@billing_bp.route('', methods=['POST'])
@jwt_required()
def create_bill():
    data = request.get_json(silent=True) or {}
    required = ['patient_id', 'total_amount']
    is_valid, msg = validate_required_fields(data, required)
    if not is_valid:
        return error_response(msg, 400)

    patient = Patient.query.get(data['patient_id'])
    if not patient:
        return error_response("Patient not found", 404)

    appointment_id = data.get('appointment_id')
    if appointment_id:
        apt = Appointment.query.get(appointment_id)
        if not apt:
            return error_response("Associated appointment not found", 404)

    try:
        amount = float(data['total_amount'])
        if amount < 0:
            return error_response("Total amount cannot be negative", 400)
    except (ValueError, TypeError):
        return error_response("Total amount must be a valid number", 400)

    payment_status = data.get('payment_status', 'Pending').strip()
    if payment_status not in VALID_PAYMENT_STATUSES:
        payment_status = 'Pending'

    payment_date = None
    if payment_status == 'Paid':
        payment_date = datetime.now(timezone.utc)

    bill = Billing(
        patient_id=patient.patient_id,
        appointment_id=appointment_id if appointment_id else None,
        total_amount=amount,
        payment_status=payment_status,
        payment_date=payment_date
    )

    db.session.add(bill)
    db.session.commit()

    return api_response(data=bill.to_dict(), message="Bill generated successfully", status_code=201)

@billing_bp.route('/<int:bill_id>', methods=['PUT'])
@jwt_required()
def update_bill(bill_id):
    bill = Billing.query.get(bill_id)
    if not bill:
        return error_response("Bill not found", 404)

    data = request.get_json(silent=True) or {}

    if 'total_amount' in data:
        try:
            amt = float(data['total_amount'])
            if amt < 0:
                return error_response("Total amount cannot be negative", 400)
            bill.total_amount = amt
        except (ValueError, TypeError):
            return error_response("Total amount must be a valid number", 400)

    if 'payment_status' in data:
        new_status = data['payment_status'].strip()
        if new_status not in VALID_PAYMENT_STATUSES:
            return error_response(f"Invalid payment status. Allowed: {', '.join(VALID_PAYMENT_STATUSES)}", 400)
        bill.payment_status = new_status
        if new_status == 'Paid' and not bill.payment_date:
            bill.payment_date = datetime.now(timezone.utc)
        elif new_status != 'Paid':
            bill.payment_date = None

    if 'appointment_id' in data:
        apt_id = data['appointment_id']
        if apt_id:
            apt = Appointment.query.get(apt_id)
            if not apt:
                return error_response("Appointment not found", 404)
            bill.appointment_id = apt_id
        else:
            bill.appointment_id = None

    db.session.commit()
    return api_response(data=bill.to_dict(), message="Bill updated successfully")

@billing_bp.route('/<int:bill_id>', methods=['DELETE'])
@jwt_required()
def delete_bill(bill_id):
    bill = Billing.query.get(bill_id)
    if not bill:
        return error_response("Bill not found", 404)

    db.session.delete(bill)
    db.session.commit()
    return api_response(message="Bill deleted successfully")

