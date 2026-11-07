from app.routes.auth import auth_bp
from app.routes.departments import departments_bp
from app.routes.doctors import doctors_bp
from app.routes.patients import patients_bp
from app.routes.appointments import appointments_bp
from app.routes.medical_records import medical_records_bp
from app.routes.billing import billing_bp
from app.routes.dashboard import dashboard_bp

__all__ = [
    'auth_bp',
    'departments_bp',
    'doctors_bp',
    'patients_bp',
    'appointments_bp',
    'medical_records_bp',
    'billing_bp',
    'dashboard_bp'
]

