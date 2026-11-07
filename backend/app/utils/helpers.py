import re
from datetime import datetime
from flask import jsonify

def api_response(data=None, message="Success", status_code=200):
    response = {
        'success': True,
        'message': message,
        'data': data
    }
    return jsonify(response), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    response = {
        'success': False,
        'message': message,
        'errors': errors
    }
    return jsonify(response), status_code

def validate_email(email):
    if not email:
        return False
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email.strip()))

def validate_phone(phone):
    if not phone:
        return False
    # allow digits, spaces, plus, hyphens, min 7 chars
    cleaned = re.sub(r'[\s\-\+\(\)]', '', phone)
    return len(cleaned) >= 7 and cleaned.isdigit()

def parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str.strip(), '%Y-%m-%d').date()
    except ValueError:
        return None

def validate_required_fields(data, required_fields):
    if not isinstance(data, dict):
        return False, "Request payload must be a JSON object"
    missing = [f for f in required_fields if f not in data or data[f] is None or (isinstance(data[f], str) and data[f].strip() == '')]
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"
    return True, None

