from flask import Flask
from flask_jwt_extended import JWTManager

from admin.app import admin_bp
from extensions import db
from users import users_bp
from house.app import houses_bp  

app = Flask(__name__)

# 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://retreatly:1234@localhost/retreatly'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT 설정
app.config['JWT_SECRET_KEY'] = 'aP!nJf*o_eiufn34%09jJ&fk@!'

# db 및 JWT 초기화
db.init_app(app)
jwt = JWTManager(app)

# Blueprint 등록
app.register_blueprint(users_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(houses_bp)  

@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    app.run(debug=True)
