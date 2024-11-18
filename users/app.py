from flask import render_template, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash

from extensions import db
from users.guest.models import Guest
from users.host.models import Host
from users import users_bp  # Blueprint 임포트
from datetime import datetime

@users_bp.route('/base', methods=['GET'])
def home():
    return render_template('user/base.html')


@users_bp.route('/loginForm', methods=['GET'])
def loginForm():
    return render_template('user/login.html')


@users_bp.route('/signupForm', methods=['GET'])
def signupForm():
    return render_template('user/signup.html')


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

# 호스트 정보 수정
@users_bp.route('/host/<int:hostId>', methods=['PATCH'])
@jwt_required()  # JWT 인증 필요
def update_host(hostId):
    # 현재 로그인한 사용자의 정보
    identity = get_jwt_identity()
    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can modify host information.'}), 403

    # 로그인한 사용자가 요청한 리소스를 수정하려고 하는지 확인
    host = Host.query.get_or_404(hostId)
    if identity['email'] != host.email:
        return jsonify({'message': 'You are not authorized to modify this host information.'}), 403

    data = request.get_json()

    # 필드별 업데이트
    host.name = data.get('name', host.name)
    host.phone = data.get('phone', host.phone)

    # 수정 일자 갱신
    host.updated_at = datetime.utcnow()  # 수동으로 updated_at을 업데이트

    try:
        db.session.commit()
        # 업데이트된 정보를 포함하여 응답
        return jsonify({
            'message': 'Host information updated successfully.',
            'updated_info': {
                'id': host.id,
                'email': host.email,
                'name': host.name,
                'phone': host.phone,
                'updated_at': host.updated_at  # 업데이트된 시간 포함
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error occurred while updating host information.', 'error': str(e)}), 500

# 게스트 정보 수정
@users_bp.route('/guest/<int:guestId>', methods=['PATCH'])
@jwt_required()  # JWT 인증 필요
def update_guest(guestId):
    # 현재 로그인한 사용자의 정보
    identity = get_jwt_identity()
    if identity['role'] != 'guest':
        return jsonify({'message': 'Only guests can modify guest information.'}), 403

    # 로그인한 사용자가 요청한 리소스를 수정하려고 하는지 확인
    guest = Guest.query.get_or_404(guestId)
    if identity['email'] != guest.email:
        return jsonify({'message': 'You are not authorized to modify this guest information.'}), 403

    data = request.get_json()

    # 필드별 업데이트
    guest.name = data.get('name', guest.name)
    guest.phone = data.get('phone', guest.phone)

    # 수정 일자 갱신
    guest.updated_at = datetime.utcnow()  # 수동으로 updated_at을 업데이트

    try:
        db.session.commit()
        # 업데이트된 정보를 포함하여 응답
        return jsonify({
            'message': 'Guest information updated successfully.',
            'updated_info': {
                'id': guest.id,
                'email': guest.email,
                'name': guest.name,
                'phone': guest.phone,
                'updated_at': guest.updated_at  # 업데이트된 시간 포함
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error occurred while updating guest information.', 'error': str(e)}), 500

# 게스트 정보 전체 조회 (JWT 인증 없음)
@users_bp.route('/guest/list', methods=['GET'])
def get_all_guests():
    guests = Guest.query.all()
    guest_list = [
        {
            'id': guest.id,
            'email': guest.email,
            'name': guest.name,
            'phone': guest.phone,
            'created_at': guest.created_at,
            'updated_at': guest.updated_at
        } for guest in guests
    ]

    return jsonify({'guests': guest_list}), 200


# 호스트 정보 전체 조회 (JWT 인증 없음)
@users_bp.route('/host/list', methods=['GET'])
def get_all_hosts():
    hosts = Host.query.all()
    host_list = [
        {
            'id': host.id,
            'email': host.email,
            'name': host.name,
            'phone': host.phone,
            'created_at': host.created_at,
            'updated_at': host.updated_at
        } for host in hosts
    ]

    return jsonify({'hosts': host_list}), 200
