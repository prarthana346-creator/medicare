from datetime import datetime, timezone
from app.extensions import db

class Department(db.Model):
    __tablename__ = 'departments'

    department_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    department_name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    doctors = db.relationship('Doctor', backref='department', lazy='select', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'department_id': self.department_id,
            'department_name': self.department_name,
            'description': self.description or '',
            'doctor_count': len(self.doctors) if self.doctors is not None else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

