from datetime import datetime, timezone
from app.extensions import db

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'

    record_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.doctor_id', ondelete='CASCADE'), nullable=False)
    diagnosis = db.Column(db.Text, nullable=False)
    prescription = db.Column(db.Text, nullable=False)
    treatment_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'record_id': self.record_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.patient_name if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.doctor_name if self.doctor else None,
            'specialization': self.doctor.specialization if self.doctor else None,
            'diagnosis': self.diagnosis,
            'prescription': self.prescription,
            'treatment_date': self.treatment_date.strftime('%Y-%m-%d') if self.treatment_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

