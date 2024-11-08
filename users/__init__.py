from flask import Blueprint

# Blueprint 정의
users_bp = Blueprint('users', __name__)

from users.app import *  # users/app.py에서 라우트 로드
