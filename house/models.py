from extensions import db
from datetime import datetime

class House(db.Model):
    __tablename__ = 'house'

    id = db.Column(db.BigInteger, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    address = db.Column(db.String(500))
    description = db.Column(db.String(255))
    introduce = db.Column(db.String(255))
    max_people = db.Column(db.Integer)
    name = db.Column(db.String(255))
    price_per_person = db.Column(db.Integer)
    price_per_day = db.Column(db.Integer)
    host_id = db.Column(db.BigInteger, db.ForeignKey('host.id'), nullable=False)

    host = db.relationship("Host", backref=db.backref("houses", lazy=True))
