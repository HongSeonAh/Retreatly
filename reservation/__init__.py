from flask import Blueprint

# Blueprint 정의
reservation_bp = Blueprint('reservation', __name__)

from reservation.app import *
