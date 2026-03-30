from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# 🧱 Configuración base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gastos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 🧾 Modelo (tabla)
class Gasto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    cantidad = db.Column(db.Float)

# Crear base de datos
with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return "API con BD funcionando 🚀"

@app.route("/gastos", methods=["GET"])
def obtener_gastos():
    gastos = Gasto.query.all()
    resultado = []

    for g in gastos:
        resultado.append({
            "id": g.id,
            "nombre": g.nombre,
            "cantidad": g.cantidad
        })

    return jsonify(resultado)

@app.route("/gastos", methods=["POST"])
def agregar_gasto():
    data = request.json

    nuevo_gasto = Gasto(
        nombre=data["nombre"],
        cantidad=data["cantidad"]
    )

    db.session.add(nuevo_gasto)
    db.session.commit()

    

    return jsonify({"mensaje": "Gasto guardado en BD"}), 201

@app.route("/reset", methods=["DELETE"])
def reset_gastos():
    Gasto.query.delete()
    db.session.commit()
    return jsonify({"mensaje": "Todos los gastos eliminados"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

    