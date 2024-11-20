from flask import Blueprint

# Blueprint 정의
review_bp = Blueprint('review', __name__)

from review.app import * 
