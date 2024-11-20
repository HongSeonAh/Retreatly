from extensions import db
from datetime import datetime

class Comment(db.Model):
    __tablename__ = 'comment'

    id = db.Column(db.BigInteger, primary_key=True)
    content = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    review_id = db.Column(db.BigInteger, db.ForeignKey('review.id'), nullable=False)
    host_id = db.Column(db.BigInteger, db.ForeignKey('host.id'), nullable=False)

    review = db.relationship('Review', backref=db.backref('comments', lazy=True))
    host = db.relationship('Host', backref=db.backref('comments', lazy=True))

