from datetime import datetime
from extensions import db

class Reservation(db.Model):
    __tablename__ = 'reservation'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    house_id = db.Column(db.BigInteger, db.ForeignKey('house.id'), nullable=False)
    guest_id = db.Column(db.BigInteger, db.ForeignKey('guest.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 예약 상태 (대기, 승인, 거부)
    num_guests = db.Column(db.Integer, nullable=False)  # 예약된 인원 수 추가
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    guest = db.relationship('Guest', backref=db.backref('reservations', lazy=True))
    house = db.relationship('House', backref=db.backref('reservations', lazy=True))

    def __init__(self, start_date, end_date, house_id, guest_id, num_guests):
        self.start_date = start_date
        self.end_date = end_date
        self.house_id = house_id
        self.guest_id = guest_id
        self.num_guests = num_guests  # 생성자에 num_guests 추가
