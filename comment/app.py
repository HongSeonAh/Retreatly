from datetime import datetime
from flask import render_template, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Comment
from review.models import Review
from users.host.models import Host
from extensions import db
from comment import comment_bp


# 답변 작성 폼 렌더링
@comment_bp.route('/comment-form/<int:review_id>', methods=['GET'])
def render_comment_form(review_id):
    review = Review.query.get_or_404(review_id)
    return render_template('comment/comment_form.html', review_id=review_id)

# 답변 수정 폼 렌더링
@comment_bp.route('/comment-form/edit/<int:comment_id>', methods=['GET'])
def render_edit_comment_form(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    return render_template('comment/edit_comment_form.html', comment=comment)


# 답변 생성
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



# 답변 수정 
@comment_bp.route('/api/comment/<int:comment_id>', methods=['POST'])
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


# 답변 삭제 
@comment_bp.route('/api/comment/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    identity = get_jwt_identity()

    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can delete comments.'}), 403

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'message': 'Comment not found.'}), 404

    if comment.host_id != identity['host_id']:
        return jsonify({'message': 'You are not authorized to delete this comment.'}), 403

    try:
        db.session.delete(comment)
        db.session.commit()
        return jsonify({'message': 'Comment deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting comment.', 'error': str(e)}), 500

