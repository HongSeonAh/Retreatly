# models.py
from extensions import db
from datetime import datetime

class Image(db.Model):
    __tablename__ = 'image'
    id = db.Column(db.BigInteger, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    data = db.Column(db.String(255), nullable=True)  # 파일 경로를 저장
    house_id = db.Column(db.BigInteger, db.ForeignKey('house.id'), nullable=False)

    house = db.relationship('House', backref=db.backref('images', cascade='all, delete-orphan'))
