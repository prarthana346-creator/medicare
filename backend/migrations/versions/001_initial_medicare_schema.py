"""Initial Medicare Hospital schema

Revision ID: 001_initial_medicare
Revises: 
Create Date: 2026-11-07 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial_medicare'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 1. Admins
    op.create_table(
        'admins',
        sa.Column('admin_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('admin_id')
    )
    op.create_index(op.f('ix_admins_username'), 'admins', ['username'], unique=True)
    op.create_index(op.f('ix_admins_email'), 'admins', ['email'], unique=True)

    # 2. Departments
    op.create_table(
        'departments',
        sa.Column('department_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('department_name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('department_id')
    )
    op.create_index(op.f('ix_departments_department_name'), 'departments', ['department_name'], unique=True)

    # 3. Doctors
    op.create_table(
        'doctors',
        sa.Column('doctor_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('doctor_name', sa.String(length=100), nullable=False),
        sa.Column('specialization', sa.String(length=100), nullable=False),
        sa.Column('department_id', sa.Integer(), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('consultation_fee', sa.Float(), nullable=False),
        sa.Column('availability', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['department_id'], ['departments.department_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('doctor_id')
    )
    op.create_index(op.f('ix_doctors_specialization'), 'doctors', ['specialization'], unique=False)

    # 4. Patients
    op.create_table(
        'patients',
        sa.Column('patient_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('patient_name', sa.String(length=100), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(length=20), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('blood_group', sa.String(length=10), nullable=False),
        sa.Column('registration_date', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('patient_id')
    )
    op.create_index(op.f('ix_patients_patient_name'), 'patients', ['patient_name'], unique=False)
    op.create_index(op.f('ix_patients_phone'), 'patients', ['phone'], unique=False)

    # 5. Appointments
    op.create_table(
        'appointments',
        sa.Column('appointment_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('appointment_date', sa.Date(), nullable=False),
        sa.Column('appointment_time', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('reason', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.doctor_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.patient_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('appointment_id')
    )
    op.create_index(op.f('ix_appointments_appointment_date'), 'appointments', ['appointment_date'], unique=False)
    op.create_index(op.f('ix_appointments_status'), 'appointments', ['status'], unique=False)

    # 6. Medical Records
    op.create_table(
        'medical_records',
        sa.Column('record_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('diagnosis', sa.Text(), nullable=False),
        sa.Column('prescription', sa.Text(), nullable=False),
        sa.Column('treatment_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.doctor_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.patient_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('record_id')
    )

    # 7. Billing
    op.create_table(
        'billing',
        sa.Column('bill_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('appointment_id', sa.Integer(), nullable=True),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('payment_status', sa.String(length=30), nullable=False),
        sa.Column('payment_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.appointment_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.patient_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('bill_id')
    )
    op.create_index(op.f('ix_billing_payment_status'), 'billing', ['payment_status'], unique=False)

def downgrade():
    op.drop_table('billing')
    op.drop_table('medical_records')
    op.drop_table('appointments')
    op.drop_table('patients')
    op.drop_table('doctors')
    op.drop_table('departments')
    op.drop_table('admins')

