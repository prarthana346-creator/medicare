from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.department import Department
from app.utils.helpers import api_response, error_response, validate_required_fields

departments_bp = Blueprint('departments', __name__, url_prefix='/api/departments')

@departments_bp.route('', methods=['GET'])
def get_departments():
    departments = Department.query.order_by(Department.department_name.asc()).all()
    return api_response(data=[dept.to_dict() for dept in departments], message="Departments retrieved successfully")

@departments_bp.route('/<int:department_id>', methods=['GET'])
def get_department(department_id):
    dept = Department.query.get(department_id)
    if not dept:
        return error_response("Department not found", 404)
    data = dept.to_dict()
    data['doctors'] = [doc.to_dict() for doc in dept.doctors]
    return api_response(data=data, message="Department retrieved successfully")

@departments_bp.route('', methods=['POST'])
@jwt_required()
def create_department():
    data = request.get_json(silent=True) or {}
    is_valid, msg = validate_required_fields(data, ['department_name'])
    if not is_valid:
        return error_response(msg, 400)

    dept_name = data['department_name'].strip()
    if Department.query.filter(Department.department_name.ilike(dept_name)).first():
        return error_response("A department with this name already exists", 409)

    department = Department(
        department_name=dept_name,
        description=data.get('description', '').strip()
    )
    db.session.add(department)
    db.session.commit()

    return api_response(data=department.to_dict(), message="Department created successfully", status_code=201)

@departments_bp.route('/<int:department_id>', methods=['PUT'])
@jwt_required()
def update_department(department_id):
    dept = Department.query.get(department_id)
    if not dept:
        return error_response("Department not found", 404)

    data = request.get_json(silent=True) or {}
    if 'department_name' in data:
        new_name = data['department_name'].strip()
        existing = Department.query.filter(Department.department_name.ilike(new_name)).first()
        if existing and existing.department_id != department_id:
            return error_response("Another department with this name already exists", 409)
        dept.department_name = new_name

    if 'description' in data:
        dept.description = data['description'].strip()

    db.session.commit()
    return api_response(data=dept.to_dict(), message="Department updated successfully")

@departments_bp.route('/<int:department_id>', methods=['DELETE'])
@jwt_required()
def delete_department(department_id):
    dept = Department.query.get(department_id)
    if not dept:
        return error_response("Department not found", 404)

    db.session.delete(dept)
    db.session.commit()
    return api_response(message="Department deleted successfully")

