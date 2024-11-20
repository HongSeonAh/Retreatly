import os
from flask import Flask, render_template, request
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from admin.app import admin_bp
from extensions import db
from static.uploads.img_upload import set_upload_folder
from users import users_bp
from reservation import reservation_bp
from house.app import houses_bp  
from review.app import review_bp

app = Flask(__name__)

# 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://retreatly:1234@localhost/retreatly'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT 설정
app.config['JWT_SECRET_KEY'] = 'aP!nJf*o_eiufn34%09jJ&fk@!'

# CORS 설정에 Authorization 추가
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# 디버깅: Authorization 헤더 확인 로그 추가
@app.after_request
def log_request_headers(response):
    print(f"Request Headers: {request.headers}")
    return response

# CORS 설정
CORS(app)

# db 및 JWT 초기화
db.init_app(app)
jwt = JWTManager(app)

# Upload folder 설정
set_upload_folder(app)

# 설정 추가 (예: 이미지 업로드 폴더 경로 설정)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# 업로드 폴더가 존재하지 않으면 생성
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Blueprint 등록
app.register_blueprint(users_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(houses_bp)
app.register_blueprint(reservation_bp)
app.register_blueprint(review_bp)

@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    app.run(debug=True)
