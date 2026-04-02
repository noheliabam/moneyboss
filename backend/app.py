from flask import Flask, request, jsonify
from extensions import db, jwt
from routes import api
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["JWT_SECRET_KEY"] = "super-secret-key"

CORS(app, resources={r"/*": {"origins": "*"}})

db.init_app(app)
jwt.init_app(app)

app.register_blueprint(api)

# 🧾 Modelo
class Gasto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    cantidad = db.Column(db.Float)
    fecha = db.Column(db.String(20))
    mes = db.Column(db.String(10))

# Crear BD
with app.app_context():
    db.create_all()

# 🏠 Ruta base
@app.route("/")
def home():
    return "API funcionando 🚀"

# 📥 Obtener gastos
@app.route("/gastos", methods=["GET"])
def obtener_gastos():
    gastos = Gasto.query.all()
    return jsonify([
        {
            "id": g.id,
            "nombre": g.nombre,
            "cantidad": g.cantidad,
            "fecha": g.fecha,
            "mes": g.mes
        } for g in gastos
    ])

# ➕ Agregar gasto
@app.route("/gastos", methods=["POST"])
def agregar_gasto():
    data = request.json

    hoy = datetime.now()

    nuevo = Gasto(
        nombre=data["nombre"],
        cantidad=float(data["cantidad"]),
        fecha=hoy.strftime("%Y-%m-%d"),
        mes=hoy.strftime("%Y-%m")
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"msg": "ok"})

# ❌ Eliminar gasto
@app.route("/gastos/<int:id>", methods=["DELETE"])
def eliminar(id):
    gasto = Gasto.query.get(id)
    if not gasto:
        return jsonify({"error": "No encontrado"}), 404

    db.session.delete(gasto)
    db.session.commit()
    return jsonify({"msg": "eliminado"})

# 🚀 RUN (SOLO UNA VEZ)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)