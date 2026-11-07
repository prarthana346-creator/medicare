from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.admin import Admin
from app.utils.helpers import api_response, error_response, validate_required_fields, validate_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    is_valid, msg = validate_required_fields(data, ['username', 'password'])
    if not is_valid:
        return error_response(msg, 400)

    username_or_email = data['username'].strip()
    password = data['password']

    # Allow login with either username or email
    admin = Admin.query.filter(
        (Admin.username == username_or_email) | (Admin.email == username_or_email)
    ).first()

    if not admin or not admin.check_password(password):
        return error_response("Invalid credentials. Please check your username/email and password.", 401)

    # identity is admin_id as string
    token = create_access_token(identity=str(admin.admin_id))

    return api_response(
        data={
            'token': token,
            'admin': admin.to_dict()
        },
        message="Login successful"
    )

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    is_valid, msg = validate_required_fields(data, ['username', 'email', 'password'])
    if not is_valid:
        return error_response(msg, 400)

    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']

    if len(password) < 6:
        return error_response("Password must be at least 6 characters long", 400)

    if not validate_email(email):
        return error_response("Invalid email format", 400)

    if Admin.query.filter_by(username=username).first():
        return error_response("Username already exists", 409)

    if Admin.query.filter_by(email=email).first():
        return error_response("Email already registered", 409)

    new_admin = Admin(username=username, email=email)
    new_admin.set_password(password)

    db.session.add(new_admin)
    db.session.commit()

    token = create_access_token(identity=str(new_admin.admin_id))

    return api_response(
        data={
            'token': token,
            'admin': new_admin.to_dict()
        },
        message="Admin account created successfully",
        status_code=201
    )

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    admin_id = get_jwt_identity()
    admin = Admin.query.get(admin_id)
    if not admin:
        return error_response("Admin user not found", 404)
    return api_response(data=admin.to_dict(), message="User profile retrieved")

