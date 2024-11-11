from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from .models import Admin

admin_bp = Blueprint('admin', __name__)

# 관리자 회원가입 엔드포인트
@admin_bp.route('/admin/signup', methods=['POST'])
def admin_signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # 이메일 중복 확인
    if Admin.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists.'}), 400

    # 비밀번호 해싱 후 새로운 관리자 생성
    hashed_password = generate_password_hash(password)
    new_admin = Admin(email=email, password=hashed_password)

    try:
        db.session.add(new_admin)
        db.session.commit()
        return jsonify({'message': 'Admin successfully registered.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error occurred while registering admin.', 'error': str(e)}), 500

# 관리자 로그인 엔드포인트
@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # 관리자 계정 확인
    admin = Admin.query.filter_by(email=email).first()
    if not admin or not check_password_hash(admin.password, password):
        return jsonify({'message': 'Invalid email or password.'}), 401

    # JWT 토큰 생성
    access_token = create_access_token(identity={'email': email, 'role': 'admin'})
    return jsonify({'message': 'Admin login successful.', 'access_token': access_token}), 200

