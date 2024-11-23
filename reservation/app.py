from flask import Blueprint, render_template, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from house.models import House
from reservation.models import Reservation
from reservation import reservation_bp  # Blueprint 임포트

# 예약 생성 폼 api
@reservation_bp.route('/reservation/form/<int:house_id>', methods=['GET'])
def reservation_form(house_id):
    house = House.query.get_or_404(house_id)

    # 이미 예약된 날짜들
    reservations = Reservation.query.filter_by(house_id=house_id).all()
    reserved_dates = [
        {"start_date": r.start_date.strftime('%Y-%m-%d'), "end_date": r.end_date.strftime('%Y-%m-%d')}
        for r in reservations
    ]
    
    # 예약 폼을 위한 HTML 템플릿 반환
    return render_template(
        'reservation/reservation_form.html',
        house_name=house.name,
        host_name=house.host.name,
        price_per_day=house.price_per_day,
        max_people=house.max_people,
        reserved_dates=reserved_dates
    )

# 예약 생성 api
@reservation_bp.route('/api/reservation', methods=['POST'])
@jwt_required()
def create_reservation():
    data = request.get_json()

    if 'start_date' not in data or 'end_date' not in data or 'house_id' not in data or 'num_guests' not in data:
        return jsonify({'message': 'Start date, end date, house ID, and number of guests are required.'}), 400

    start_date = datetime.fromisoformat(data['start_date'])
    end_date = datetime.fromisoformat(data['end_date'])
    house_id = data['house_id']
    num_guests = int(data['num_guests'])  # 문자열을 정수로 변환

    # JWT에서 사용자 정보 가져오기
    identity = get_jwt_identity()

    # 게스트만 예약할 수 있도록 로직 수정
    if identity['role'] == 'guest':
        guest_id = identity.get('guest_id')
        if not guest_id:
            return jsonify({'message': 'Guest ID is required for reservation.'}), 400
    else:
        return jsonify({'message': 'Hosts cannot make reservations.'}), 400  # 호스트는 예약할 수 없음

    house = House.query.get(house_id)
    if not house:
        return jsonify({'message': 'House not found.'}), 404

    # 예약 중복 확인
    existing_reservation = Reservation.query.filter(
        Reservation.house_id == house_id,
        Reservation.start_date < end_date,
        Reservation.end_date > start_date
    ).first()

    if existing_reservation:
        return jsonify({'message': 'The house is already reserved for this period.'}), 400

    # 날짜 계산 및 결제 금액 계산
    days = (end_date - start_date).days
    if days <= 0:
        return jsonify({'message': 'End date must be after start date.'}), 400

    price_per_day = house.price_per_day
    total_amount = days * price_per_day
    details = f"숙박 {days}박 x 1박당 {price_per_day}원"

    # 추가 인원 체크
    if num_guests > house.max_people:
        extra_guests = num_guests - house.max_people
        extra_charge = extra_guests * days * (price_per_day / house.max_people)
        total_amount += extra_charge
        details += f" + 추가 인원 {extra_guests}명 ({extra_charge}원)"

    # 예약 생성
    new_reservation = Reservation(start_date=start_date, end_date=end_date, house_id=house_id, guest_id=guest_id, num_guests=num_guests)

    try:
        db.session.add(new_reservation)
        db.session.commit()
        
        # 예약 성공 후, 결제 내역 반환
        return jsonify({
            'message': 'Reservation created successfully.',
            'total_amount': total_amount,
            'calculation_details': details
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error occurred while creating reservation.', 'error': str(e)}), 500

# 예약 성공 페이지
@reservation_bp.route('/reservation/success', methods=['GET'])
def reservation_success():
    total_amount = request.args.get('total_amount')
    calculation_details = request.args.get('calculation_details')

    return render_template(
        'reservation/reservation_success.html',
        total_amount=total_amount,
        calculation_details=calculation_details
    )

# 예약 목록 HTML 렌더링
@reservation_bp.route('/reservation/guest', methods=['GET'])
def render_guest_reservation_page():
    return render_template('reservation/guest_reservations.html')


# 게스트 예약 데이터 조회 API
@reservation_bp.route('/api/reservation/guest', methods=['GET'])
@jwt_required()
def get_guest_reservations():
    guest_id = get_jwt_identity()['guest_id']

    # 게스트의 모든 예약 조회
    reservations = Reservation.query.filter_by(guest_id=guest_id).all()
    reservation_list = [
        {
            'id': res.id, 
            'house_name': res.house.name,
            'start_date': res.start_date.strftime('%Y-%m-%d'),
            'end_date': res.end_date.strftime('%Y-%m-%d'),
            'status': res.status,
        }
        for res in reservations
    ]

    return jsonify({'reservations': reservation_list}), 200




# 예약 취소 (게스트)
@reservation_bp.route('/api/reservation/<int:reservation_id>', methods=['DELETE'])
@jwt_required()
def cancel_reservation(reservation_id):
    guest_id = get_jwt_identity()['guest_id']
    reservation = Reservation.query.get_or_404(reservation_id)

    if reservation.guest_id != guest_id:
        return jsonify({'message': 'You are not authorized to cancel this reservation.'}), 403

    try:
        db.session.delete(reservation)
        db.session.commit()
        return jsonify({'message': 'Reservation canceled successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error occurred while canceling reservation.', 'error': str(e)}), 500



# 호스트 예약 목록 HTML 렌더링
@reservation_bp.route('/reservation/host', methods=['GET'])
def render_host_reservation_page():
    return render_template('reservation/host_reservations.html')



# 예약 조회 (호스트)
@reservation_bp.route('/api/reservation/host', methods=['GET'])
@jwt_required()
def get_reservations_by_host():
    identity = get_jwt_identity()

    # 'host_id'가 JWT에 포함되어 있는지 확인
    if 'host_id' not in identity:
        return jsonify({'message': 'Host ID not found in token. Please login again.'}), 400

    host_id = identity['host_id']

    # 호스트가 관리하는 숙소의 예약 조회
    reservations = Reservation.query.join(House).filter(House.host_id == host_id).all()
    reservation_list = [
        {
            'id': res.id,
            'start_date': res.start_date,
            'end_date': res.end_date,
            'guest_id': res.guest_id,
            'status': res.status,  # 상태 추가
            'created_at': res.created_at,
            'updated_at': res.updated_at,
            'house_name': res.house.name,
            'guest_name': res.guest.name
        } for res in reservations
    ]

    return jsonify({'reservations': reservation_list}), 200


# 예약 승인/거부 (호스트)
@reservation_bp.route('/api/reservation/<int:reservation_id>/status', methods=['PATCH'])
@jwt_required()
def update_reservation_status(reservation_id):
    data = request.get_json()
    status = data.get('status')

    if status not in ['approved', 'rejected']:
        return jsonify({'message': 'Invalid status. Status must be "approved" or "rejected".'}), 400

    reservation = Reservation.query.get_or_404(reservation_id)
    identity = get_jwt_identity()

    # 'host_id'가 JWT에 포함되어 있는지 확인
    if 'host_id' not in identity:
        return jsonify({'message': 'Host ID not found in token. Please login again.'}), 400

    host_id = identity['host_id']

    # 호스트가 해당 숙소의 예약을 관리하는지 확인
    if reservation.house.host_id != host_id:
        return jsonify({'message': 'You are not authorized to approve/reject this reservation.'}), 403

    reservation.status = status
    try:
        db.session.commit()
        return jsonify({'message': f'Reservation status updated to {status} successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error occurred while updating reservation status.', 'error': str(e)}), 500


# 예약 상세 HTML 렌더링 (게스트/호스트에 따른 버튼 표시)
@reservation_bp.route('/reservation/<int:reservation_id>', methods=['GET'])
def render_reservation_details_page(reservation_id):
    # 예약 상세 페이지를 HTML로 렌더링
    return render_template('reservation/reservation_details.html', reservation_id=reservation_id)


# 예약 상세 조회 api
@reservation_bp.route('/api/reservation/<int:reservation_id>', methods=['GET'])
@jwt_required()
def get_reservation_details(reservation_id):
    reservation = Reservation.query.get_or_404(reservation_id)
    identity = get_jwt_identity()  # JWT 토큰에서 사용자 정보 가져오기

    # 게스트인지 호스트인지 확인
    is_guest = reservation.guest_id == identity.get('guest_id')
    is_host = reservation.house.host_id == identity.get('host_id')

    # 게스트와 호스트가 각각 볼 수 있는 예약 정보 제공
    if not (is_guest or is_host):
        return jsonify({'message': 'You are not authorized to view this reservation.'}), 403

    # 예약 상세 정보 준비
    reservation_details = {
        'id': reservation.id,
        'house_name': reservation.house.name,
        'guest_name': reservation.guest.name,
        'start_date': reservation.start_date.strftime('%Y-%m-%d'),
        'end_date': reservation.end_date.strftime('%Y-%m-%d'),
        'total_amount': calculate_total_amount(reservation),  # 최종 결제 금액 계산
        'created_at': reservation.created_at,
        'status': reservation.status,  # 예약 상태
        'is_guest': is_guest,  # 게스트 여부
        'is_host': is_host,    # 호스트 여부
    }

    return jsonify({'reservation': reservation_details}), 200


def calculate_total_amount(reservation):
    days = (reservation.end_date - reservation.start_date).days
    price_per_day = reservation.house.price_per_day
    total_amount = days * price_per_day

    if reservation.num_guests > reservation.house.max_people:
        extra_guests = reservation.num_guests - reservation.house.max_people
        extra_charge = extra_guests * days * (price_per_day / reservation.house.max_people)
        total_amount += extra_charge

    return total_amount
