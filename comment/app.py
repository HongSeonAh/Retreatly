from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Comment
from review.models import Review
from users.host.models import Host
from extensions import db
from comment import comment_bp

@comment_bp.route('/api/comment', methods=['POST'])
@jwt_required()
def create_comment():
    # JWT 토큰에서 호스트 정보를 가져옵니다.
    identity = get_jwt_identity()
    
    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can create comments.'}), 403

    data = request.get_json()
    review_id = data.get('review_id')
    content = data.get('content')
    
    # 리뷰가 존재하는지 확인
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'message': 'Review not found.'}), 404

    # 호스트가 본인의 숙소에만 댓글을 달 수 있도록 체크
    host = Host.query.get(identity['host_id'])
    if host.id != review.house.host_id:  # review.house를 사용할 수 있게 수정됨
        return jsonify({'message': 'You are not authorized to comment on this review.'}), 403

    # 댓글 생성
    comment = Comment(
        review_id=review_id,
        host_id=host.id,
        content=content,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    try:
        db.session.add(comment)
        db.session.commit()
        return jsonify({'message': 'Comment created successfully.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating comment.', 'error': str(e)}), 500




@comment_bp.route('/api/comment/<int:comment_id>', methods=['PATCH'])
@jwt_required()
def update_comment(comment_id):
    # JWT 토큰에서 호스트 정보를 가져옵니다.
    identity = get_jwt_identity()

    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can update comments.'}), 403

    data = request.get_json()
    content = data.get('content')

    # 댓글을 찾습니다.
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'message': 'Comment not found.'}), 404

    # 댓글 작성자가 본인인지 확인
    if comment.host_id != identity['host_id']:
        return jsonify({'message': 'You are not authorized to update this comment.'}), 403

    # 댓글 수정
    comment.content = content
    comment.updated_at = datetime.utcnow()

    try:
        db.session.commit()
        return jsonify({'message': 'Comment updated successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating comment.', 'error': str(e)}), 500


@comment_bp.route('/api/comment/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    # JWT 토큰에서 호스트 정보를 가져옵니다.
    identity = get_jwt_identity()

    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can delete comments.'}), 403

    # 댓글을 찾습니다.
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'message': 'Comment not found.'}), 404

    # 댓글 작성자가 본인인지 확인
    if comment.host_id != identity['host_id']:
        return jsonify({'message': 'You are not authorized to delete this comment.'}), 403

    # 댓글 삭제
    try:
        db.session.delete(comment)
        db.session.commit()
        return jsonify({'message': 'Comment deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting comment.', 'error': str(e)}), 500
