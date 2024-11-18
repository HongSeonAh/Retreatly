import os
from flask import current_app  # current_app 사용

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# current_app을 사용하여 현재 앱의 config에 접근
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# UPLOAD_FOLDER 설정은 Flask 앱이 생성된 후에 해야 함
def set_upload_folder(app):
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
