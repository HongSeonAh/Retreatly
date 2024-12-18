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
def edit_house(house_id):
    house = House.query.get_or_404(house_id)

    return render_template('house/edit_house.html', house=house)


# 숙소 수정 api
@houses_bp.route('/api/house/<int:house_id>', methods=['POST'])
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

    # 기존 데이터 업데이트
    house.address = data.get('address', house.address)
    house.description = data.get('description', house.description)
    house.introduce = data.get('introduce', house.introduce)
    house.max_people = data.get('max_people', house.max_people)
    house.name = data.get('name', house.name)
    house.price_per_person = data.get('price_per_person', house.price_per_person)
    house.price_per_day = data.get('price_per_day', house.price_per_day)
    house.updated_at = datetime.utcnow()

    # 이미지 업로드 처리
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            new_image = Image(data=filepath, house_id=house.id)
            db.session.add(new_image)

    db.session.commit()

    return jsonify({'message': 'House updated successfully with images.'}), 200






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



# 호스트 마이 숙소 조회 폼 및 데이터 조회를 한 번에 처리하는 API
@houses_bp.route('/host-houses', methods=['GET'])
def get_host_houses():
    
    return render_template('house/host_houses.html')


@houses_bp.route('/api/host-houses', methods=['GET'])
@jwt_required()
def render_and_get_host_houses():
    identity = get_jwt_identity()
    
    # 호스트가 아니라면 403 오류
    if identity['role'] != 'host':
        return jsonify({'message': 'Only hosts can view their houses.'}), 403

    host = Host.query.filter_by(email=identity['email']).first()
    if not host:
        return jsonify({'message': 'Host not found.'}), 404

    # 호스트의 모든 숙소를 조회
    houses = House.query.filter_by(host_id=host.id).all()

    # 숙소 데이터를 JSON 형식으로 준비
    houses_data = [{'id': house.id, 'name': house.name, 'address': house.address} for house in houses]

    # 템플릿 렌더링과 데이터 전달
    return jsonify({'data' : houses_data}), 200


# 숙소 리스트 페이지 렌더링 및 데이터 조회
@houses_bp.route('/houses', methods=['GET'])
def house_list_page():
    # 모든 숙소 리스트 가져오기
    houses = db.session.query(House).all()

    # 숙소 데이터와 첫 번째 이미지를 포함한 리스트 생성
    house_list = []
    for house in houses:
        # 첫 번째 이미지를 찾고, 없으면 None을 설정
        first_image = house.images[0].data if house.images else None
        
        # 이미지 경로를 static/uploads 경로로 변경
        if first_image:
            first_image = f"/static/{first_image.lstrip('static/')}"

        
        house_list.append({
            'id': house.id,
            'name': house.name,
            'price_per_day': house.price_per_day,
            'image': first_image
        })

    # 템플릿에 houses 데이터 전달
    return render_template('house/house_list.html', houses=house_list)



# 숙소 상세 조회 
@houses_bp.route('/house/<int:house_id>', methods=['GET'])
def house_detail_page(house_id):
    # 숙소 데이터 조회
    house = House.query.get_or_404(house_id)

    # 이미지 경로들을 static/uploads 경로로 변경
    house_images = [f"/static/{image.data.lstrip('static/')}" for image in house.images]

    # 모든 숙소 정보와 이미지들을 포함한 데이터 반환
    house_data = {
        'id': house.id,
        'name': house.name,
        'price_per_day': house.price_per_day,
        'price_per_person': house.price_per_person,
        'address': house.address,
        'description': house.description,
        'introduce': house.introduce,
        'max_people': house.max_people,
        'images': house_images,
        'created_at': house.created_at,
        'updated_at': house.updated_at
    }

    # HTML 페이지에 데이터를 전달하여 렌더링
    return render_template('house/house_detail.html', house=house_data)
