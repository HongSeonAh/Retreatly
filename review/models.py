from extensions import db
from datetime import datetime

class Review(db.Model):
    __tablename__ = 'review'
    
    id = db.Column(db.BigInteger, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    house_id = db.Column(db.BigInteger, db.ForeignKey('house.id'), nullable=False)
    guest_id = db.Column(db.BigInteger, db.ForeignKey('guest.id'), nullable=False)

    house = db.relationship('House', backref=db.backref('reviews', lazy=True))  # 추가된 관계
    guest = db.relationship('Guest', backref=db.backref('reviews', lazy=True))