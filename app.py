from flask import Flask
from extensions import db
from users import users_bp

app = Flask(__name__)

# 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://retreatly:1234@localhost/retreatly'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db 초기화
db.init_app(app)

# Blueprint 등록
app.register_blueprint(users_bp)

@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    app.run(debug=True)
