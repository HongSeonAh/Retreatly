from flask import Blueprint, render_template, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from .models import Review
from house.models import House
from reservation.models import Reservation
from users.guest.models import Guest
from comment.models import Comment
from users.host.models import Host
from review import review_bp


@review_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_user_info():
    """현재 로그인한 사용자 정보를 반환"""
    identity = get_jwt_identity()  # JWT에서 사용자 정보 추출
    return jsonify(identity), 200

# 리뷰 등록 폼
@review_bp.route('/review-form/<int:house_id>', methods=['GET'])
def review_form(house_id):

    # 숙소 확인
    house = House.query.get_or_404(house_id)

    # 렌더링할 템플릿에 숙소 정보 전달
    return render_template('review/review_form.html', house=house)



# 게스트 리뷰 등록
@review_bp.route('/api/review', methods=['POST'])
@jwt_required()
def create_review():
    identity = get_jwt_identity()
    if identity['role'] != 'guest':
        return jsonify({'message': 'Only guests can create reviews.'}), 403

    data = request.get_json()
    guest_email = identity['email']
    house_id = data.get('house_id')
    title = data.get('title')
    content = data.get('content')
    rating = data.get('rating')

    # 입력 데이터 검증
    if not house_id or not title or not content or not rating:
        return jsonify({'message': 'All fields are required.'}), 400

    # 게스트와 예약 확인
    guest = Guest.query.filter_by(email=guest_email).first()
    if not guest:
        return jsonify({'message': 'Guest not found.'}), 404

    reservation = Reservation.query.filter_by(guest_id=guest.id, house_id=house_id).first()
    if not reservation:
        return jsonify({'message': 'You can only review houses you have reserved.'}), 403

    # 리뷰 생성
    review = Review(
        title=title,
        content=content,
        rating=rating,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        house_id=house_id,
        guest_id=guest.id
    )

    try:
        db.session.add(review)
        db.session.commit()
        return jsonify({'message': 'Review created successfully.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating review.', 'error': str(e)}), 500


# 게스트 리뷰 수정
@review_bp.route('/api/review/<int:review_id>', methods=['PATCH'])
@jwt_required()
def update_review(review_id):
    identity = get_jwt_identity()
    if identity['role'] != 'guest':
        return jsonify({'message': 'Only guests can update reviews.'}), 403

    data = request.get_json()
    guest_email = identity['email']
    title = data.get('title')
    content = data.get('content')
    rating = data.get('rating')

    # 리뷰 가져오기
    review = Review.query.get_or_404(review_id)
    guest = Guest.query.filter_by(email=guest_email).first()

    if review.guest_id != guest.id:
        return jsonify({'message': 'You are not authorized to update this review.'}), 403

    # 필드 업데이트
    review.title = title if title else review.title
    review.content = content if content else review.content
    review.rating = rating if rating else review.rating
    review.updated_at = datetime.utcnow()

    try:
        db.session.commit()
        return jsonify({'message': 'Review updated successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating review.', 'error': str(e)}), 500


# 게스트 리뷰 삭제 
@review_bp.route('/api/review/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    identity = get_jwt_identity()
    if identity['role'] != 'guest':
        return jsonify({'message': 'Only guests can delete reviews.'}), 403

    guest_email = identity['email']
    review = Review.query.get_or_404(review_id)
    guest = Guest.query.filter_by(email=guest_email).first()

    if review.guest_id != guest.id:
        return jsonify({'message': 'You are not authorized to delete this review.'}), 403

    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({'message': 'Review deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting review.', 'error': str(e)}), 500
    
# 숙소 리뷰 목록 조회 폼   
@review_bp.route('/reviews/house/<int:house_id>', methods=['GET'])
def render_reviews_page(house_id):
    return render_template('review/review_list.html', house_id=house_id)

    

# 숙소 리뷰 목록 조회
@review_bp.route('/api/reviews/<int:house_id>', methods=['GET'])
def get_reviews(house_id):
    # 숙소에 해당하는 리뷰 가져오기
    reviews = Review.query.filter_by(house_id=house_id).all()

    if not reviews:
        return jsonify({'message': 'No reviews found for this house.'}), 404

    # 리뷰 평균 평점 계산
    average_rating = sum([review.rating for review in reviews]) / len(reviews)

    review_list = []
    for review in reviews:
        guest = Guest.query.get(review.guest_id)
        review_list.append({
            'review_id': review.id,
            'author': guest.name,  # 작성자 이름
            'title': review.title,
            'rating': review.rating
        })

    return jsonify({
        'reviews': review_list,
        'average_rating': round(average_rating, 2)  # 평균 평점 소수점 두 자리까지
    }), 200




# 리뷰 단일 조회
# @review_bp.route('/api/review/<int:review_id>', methods=['GET'])
# def get_review_detail(review_id):
#     # 리뷰 가져오기
#     review = Review.query.get_or_404(review_id)
#     guest = Guest.query.get(review.guest_id)

#     review_detail = {
#         'review_id': review.id,
#         'author': guest.name,  # 작성자 이름
#         'title': review.title,
#         'content': review.content,
#         'rating': review.rating,
#         'updated_at': review.updated_at.strftime('%Y-%m-%d %H:%M:%S')
#     }

#     return jsonify(review_detail), 200


# 리뷰 상세 HTML 렌더링
@review_bp.route('/review/<int:review_id>', methods=['GET'])
def render_review_detail_page(review_id):
    # 단순히 HTML 렌더링만 수행
    return render_template('review/review_detail.html', review_id=review_id)



# 리뷰 상세
@review_bp.route('/api/review/<int:review_id>', methods=['GET'])
def get_review_detail(review_id):
    review = Review.query.get_or_404(review_id)
    guest = Guest.query.get(review.guest_id)

    comments = Comment.query.filter_by(review_id=review_id).all()

    comments_data = []
    has_comment = False
    if comments:
        has_comment = True
        for comment in comments:
            host = Host.query.get(comment.host_id)
            comments_data.append({
                'comment_id': comment.id,
                'host_name': host.name,
                'content': comment.content,
                'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })

    house = House.query.get(review.house_id)
    house_host_id = house.host_id

    review_detail = {
        'review_id': review.id,
        'author': guest.name,
        'title': review.title,
        'content': review.content,
        'rating': review.rating,
        'updated_at': review.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
        'comments': comments_data,
        'house_host_id': house_host_id,
        'has_comment': has_comment  # 답변이 있는지 여부 추가
    }

    return jsonify(review_detail), 200


# 게스트 자신이 작성한 리뷰 목록 조회 (HTML 렌더링)
@review_bp.route('/my-reviews', methods=['GET'])
def render_my_reviews_page():
    return render_template('reviews/guest_reviews.html')



# 게스트 자신이 작성한 리뷰 목록 조회
@review_bp.route('/api/my-reviews', methods=['GET'])
@jwt_required()
def get_my_reviews():
    # 현재 로그인된 게스트의 정보 가져오기
    identity = get_jwt_identity()
    if identity['role'] != 'guest':
        return jsonify({'message': 'Only guests can view their reviews.'}), 403

    guest_email = identity['email']
    guest = Guest.query.filter_by(email=guest_email).first()
    if not guest:
        return jsonify({'message': 'Guest not found.'}), 404

    # 게스트가 작성한 리뷰 가져오기
    reviews = Review.query.filter_by(guest_id=guest.id).all()
    if not reviews:
        return jsonify({'message': 'No reviews found for this guest.'}), 404

    # 리뷰 목록 생성
    review_list = []
    for review in reviews:
        house = House.query.get(review.house_id)
        review_list.append({
            'review_id': review.id,
            'house_name': house.name if house else 'Unknown',  # 숙소 이름
            'title': review.title,
            'rating': review.rating,
            'created_at': review.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        })

    return jsonify(review_list), 200

