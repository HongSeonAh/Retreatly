from flask import request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import check_password_hash

from extensions import db
from users.guest.models import Guest
from users.host.models import Host
from users import users_bp  # Blueprint 임포트

@users_bp.route('/user/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if 'role' not in data or data['role'] not in ['guest', 'host']:
        return jsonify({'message': 'Role is required and should be either "guest" or "host".'}), 400

    role = data['role']
    email = data['email']
    password = data['password']
    name = data['name']
    phone = data.get('phone')  # phone은 선택 사항

    if role == 'guest':
        # 게스트 회원가입
        new_user = Guest(email=email, name=name, phone=phone)
        new_user.set_password(password)
    elif role == 'host':
        # 호스트 회원가입
        new_user = Host(email=email, name=name, phone=phone)
        new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': f'{role.capitalize()} successfully registered.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error occurred while registering user.', 'error': str(e)}), 500

@users_bp.route('/user/login', methods=['POST'])
def login():
    data = request.get_json()

    # 이메일과 비밀번호가 전달되었는지 확인
    if 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Email and password are required.'}), 400

    email = data['email']
    password = data['password']

    # 이메일로 게스트와 호스트를 검색
    user = Guest.query.filter_by(email=email).first() or Host.query.filter_by(email=email).first()

    # 사용자가 존재하고 비밀번호가 일치하는지 확인
    if user and check_password_hash(user.password, password):
        # JWT 토큰 생성
        access_token = create_access_token(
            identity={'role': 'guest' if isinstance(user, Guest) else 'host', 'email': email})
        return jsonify({'message': 'Login successful.', 'access_token': access_token}), 200
    else:
        return jsonify({'message': 'Invalid email or password.'}), 401
