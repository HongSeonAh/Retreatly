# houses/app.py
import os
from flask import Flask, Blueprint, current_app, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from image.models import Image
from static.uploads.img_upload import allowed_file
from .models import House
from users.host.models import Host
from werkzeug.utils import secure_filename
from house import houses_bp


# 숙소 등록 페이지 보여주기
@houses_bp.route('/house/registerform', methods=['GET'])
def register_house():
    return render_template('house/register_house.html')


# 숙소 등록 api
@houses_bp.route('/api/house', methods=['POST'])
@jwt_required()
def create_house():
    identity = get_jwt_identity()
    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can create a house.'}), 403

    data = request.form  # JSON이 아닌 form-data로 받기
    files = request.files.getlist('images')  # 다중 파일 업로드 처리


    host_id = Host.query.filter_by(email=identity['email']).first().id
    new_house = House(
        address=data['address'],
        description=data['description'],
        introduce=data['introduce'],
        max_people=data['max_people'],
        name=data['name'],
        price_per_person=data['price_per_person'],
        price_per_day=data['price_per_day'],
        host_id=host_id,
    )
    db.session.add(new_house)
    db.session.commit()


    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)  # current_app 사용
            file.save(filepath)

            # Save image record in the database
            new_image = Image(data=filepath, house_id=new_house.id)
            db.session.add(new_image)

    db.session.commit()

    return jsonify({'message': 'House created successfully with images.'}), 201

# 숙소 수정 폼을 보여주는 GET 요청
@houses_bp.route('/house/<int:house_id>/editform', methods=['GET'])
@jwt_required()
def edit_house(house_id):
    identity = get_jwt_identity()
    house = House.query.get_or_404(house_id)

    # 호스트가 해당 숙소의 호스트인지 확인
    if house.host.email != identity['email']:
        return jsonify({'message': 'You are not authorized to edit this house.'}), 403

    return render_template('house/edit_house.html', house=house)


# 숙소 수정 api
@houses_bp.route('/api/house/<int:house_id>', methods=['PATCH'])
@jwt_required()
def update_house(house_id):
    identity = get_jwt_identity()
    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can update a house.'}), 403

    house = House.query.get_or_404(house_id)
    if house.host.email != identity['email']:
        return jsonify({'message': 'You are not authorized to update this house.'}), 403

    data = request.form
    files = request.files.getlist('images')  # 수정 시 새 이미지 업로드

    house.address = data.get('address', house.address)
    house.description = data.get('description', house.description)
    house.introduce = data.get('introduce', house.introduce)
    house.max_people = data.get('max_people', house.max_people)
    house.name = data.get('name', house.name)
    house.price_per_person = data.get('price_per_person', house.price_per_person)
    house.price_per_day = data.get('price_per_day', house.price_per_day)
    house.updated_at = datetime.utcnow()

    # Add new images
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)  # current_app 사용
            file.save(filepath)

            new_image = Image(data=filepath, house_id=house.id)
            db.session.add(new_image)

    db.session.commit()

    return jsonify({'message': 'House updated successfully with images.'}), 200




# # 숙소 삭제 폼을 보여주는 GET 요청
# @houses_bp.route('/house/<int:house_id>/delete', methods=['GET'])
# @jwt_required()
# def delete_house_form(house_id):
#     identity = get_jwt_identity()
#     house = House.query.get_or_404(house_id)

#     # 호스트가 해당 숙소의 호스트인지 확인
#     if house.host.email != identity['email']:
#         return jsonify({'message': 'You are not authorized to delete this house.'}), 403

#     return render_template('house/delete_house.html', house_id=house_id)


# 숙소 삭제 요청
@houses_bp.route('/api/house/<int:house_id>', methods=['DELETE'])
@jwt_required()
def delete_house(house_id):
    identity = get_jwt_identity()
    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can delete a house.'}), 403

    house = House.query.get_or_404(house_id)
    if house.host.email != identity['email']:
        return jsonify({'message': 'You are not authorized to delete this house.'}), 403

    db.session.delete(house)
    db.session.commit()

    return jsonify({'message': 'House deleted successfully.'}), 200

# 호스트 마이 숙소 조회 폼
@houses_bp.route('/host-houses', methods=['GET'])
@jwt_required()
def render_host_houses():
    identity = get_jwt_identity()
    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can view their houses.'}), 403

    host = Host.query.filter_by(email=identity['email']).first()
    if not host:
        return jsonify({'message': 'Host not found.'}), 404

    houses = House.query.filter_by(host_id=host.id).all()
    houses_data = [{'id': house.id, 'name': house.name, 'address': house.address} for house in houses]

    return render_template('house/host_houses.html', houses=houses_data)


# 호스트 마이 숙소 전체 조회
@houses_bp.route('/api/host-houses', methods=['GET'])
@jwt_required()
def get_host_houses_data():
    identity = get_jwt_identity()
    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can view their houses.'}), 403

    host = Host.query.filter_by(email=identity['email']).first()
    if not host:
        return jsonify({'message': 'Host not found.'}), 404

    houses = House.query.filter_by(host_id=host.id).all()
    houses_data = []
    for house in houses:
        houses_data.append({
            'id': house.id,
            'name': house.name,
            'address': house.address,
            'images': [image.data for image in house.images]  # 이미지 포함
        })

    return jsonify(houses_data), 200


