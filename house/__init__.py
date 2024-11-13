from flask import Blueprint

# Blueprint 정의
houses_bp = Blueprint('houses', __name__)

from house.app import * 
