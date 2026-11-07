from datetime import datetime, timezone
from app.extensions import db

class Patient(db.Model):
    __tablename__ = 'patients'

    patient_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_name = db.Column(db.String(100), nullable=False, index=True)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(30), nullable=False, index=True)
    email = db.Column(db.String(150), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    blood_group = db.Column(db.String(10), nullable=False)
    registration_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    appointments = db.relationship('Appointment', backref='patient', lazy='select', cascade='all, delete-orphan')
    medical_records = db.relationship('MedicalRecord', backref='patient', lazy='select', cascade='all, delete-orphan')
    bills = db.relationship('Billing', backref='patient', lazy='select', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'patient_id': self.patient_id,
            'patient_name': self.patient_name,
            'age': self.age,
            'gender': self.gender,
            'phone': self.phone,
            'email': self.email,
            'address': self.address or '',
            'blood_group': self.blood_group,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None
        }

