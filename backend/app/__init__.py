import os
from flask import Flask, jsonify
from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors
from app.routes import (
    auth_bp,
    departments_bp,
    doctors_bp,
    patients_bp,
    appointments_bp,
    medical_records_bp,
    billing_bp,
    dashboard_bp
)

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['development']))

    # Initialize extensions
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # JWT error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            'success': False,
            'message': 'Missing authorization header or token',
            'errors': callback
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({
            'success': False,
            'message': 'Signature verification failed or token is malformed',
            'errors': callback
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token has expired. Please log in again.',
            'errors': 'Token expired'
        }), 401

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(departments_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(medical_records_bp)
    app.register_blueprint(billing_bp)
    app.register_blueprint(dashboard_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'success': True,
            'status': 'healthy',
            'service': 'Medicare Hospital Management System API',
            'database': app.config['SQLALCHEMY_DATABASE_URI'].split('://')[0]
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    return app

