from flask import request, jsonify
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
