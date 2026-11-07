from datetime import datetime, timezone
from app.extensions import db

class Billing(db.Model):
    __tablename__ = 'billing'

    bill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id', ondelete='CASCADE'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.appointment_id', ondelete='SET NULL'), nullable=True)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    payment_status = db.Column(db.String(30), nullable=False, default='Pending', index=True)  # Pending, Paid, Cancelled
    payment_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'bill_id': self.bill_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.patient_name if self.patient else None,
            'patient_email': self.patient.email if self.patient else None,
            'patient_phone': self.patient.phone if self.patient else None,
            'appointment_id': self.appointment_id,
            'doctor_name': self.appointment.doctor.doctor_name if (self.appointment and self.appointment.doctor) else None,
            'appointment_date': self.appointment.appointment_date.strftime('%Y-%m-%d') if (self.appointment and self.appointment.appointment_date) else None,
            'total_amount': float(self.total_amount),
            'payment_status': self.payment_status,
            'payment_date': self.payment_date.strftime('%Y-%m-%d %H:%M') if self.payment_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

