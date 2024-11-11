from extensions import db
from datetime import datetime

class Admin(db.Model):
    __tablename__ = 'admin'

    id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # 생성 시 현재 일자 자동 설정
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)  # 수정 시 현재 일자 자동 설정

    def __init__(self, email, password):
        self.email = email
        self.password = password  # 이미 해시된 비밀번호를 저장
