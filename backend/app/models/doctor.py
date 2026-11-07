from datetime import datetime, timezone
from app.extensions import db

class Doctor(db.Model):
    __tablename__ = 'doctors'

    doctor_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    doctor_name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False, index=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id', ondelete='CASCADE'), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    consultation_fee = db.Column(db.Float, nullable=False, default=0.0)
    availability = db.Column(db.String(100), nullable=False, default='Available')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    appointments = db.relationship('Appointment', backref='doctor', lazy='select', cascade='all, delete-orphan')
    medical_records = db.relationship('MedicalRecord', backref='doctor', lazy='select', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor_name,
            'specialization': self.specialization,
            'department_id': self.department_id,
            'department_name': self.department.department_name if self.department else None,
            'phone': self.phone,
            'email': self.email,
            'consultation_fee': float(self.consultation_fee),
            'availability': self.availability,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

