from flask import Blueprint, request, jsonify
from models import User
from extensions import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint("api", __name__)

@api.route("/register", methods=["POST"])
def register():
    data = request.json

    user = User(email=data["email"], password=data["password"])
    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado"})

@api.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if not user or user.password != data["password"]:
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({"token": token})

@api.route("/profile")
@jwt_required()
def profile():
    return {"msg": "ok"}