from flask import Blueprint

# Blueprint 정의
comment_bp = Blueprint('comment', __name__)

from comment.app import * 
