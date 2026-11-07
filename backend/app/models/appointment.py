from datetime import datetime, timezone
from app.extensions import db

class Appointment(db.Model):
    __tablename__ = 'appointments'

    appointment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.doctor_id', ondelete='CASCADE'), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False, index=True)
    appointment_time = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(30), nullable=False, default='Scheduled', index=True)  # Scheduled, Completed, Cancelled
    reason = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    bills = db.relationship('Billing', backref='appointment', lazy='select', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'appointment_id': self.appointment_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.patient_name if self.patient else None,
            'patient_phone': self.patient.phone if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.doctor_name if self.doctor else None,
            'specialization': self.doctor.specialization if self.doctor else None,
            'department_name': self.doctor.department.department_name if (self.doctor and self.doctor.department) else None,
            'consultation_fee': float(self.doctor.consultation_fee) if self.doctor else 0.0,
            'appointment_date': self.appointment_date.strftime('%Y-%m-%d') if self.appointment_date else None,
            'appointment_time': self.appointment_time,
            'status': self.status,
            'reason': self.reason or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

