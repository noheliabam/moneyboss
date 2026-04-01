from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 🧱 Configuración base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gastos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 🧾 Modelo
class Gasto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    cantidad = db.Column(db.Float)
    fecha = db.Column(db.String(20))   # 🆕
    mes = db.Column(db.String(10))     # 🆕

# Crear base de datos
with app.app_context():
    db.create_all()

# 🏠 Ruta base
@app.route("/")
def home():
    return "API con BD funcionando 🚀"

# 📥 Obtener gastos
@app.route("/gastos", methods=["GET"])
def obtener_gastos():
    gastos = Gasto.query.all()
    resultado = []

    for g in gastos:
        resultado.append({
            "id": g.id,
            "nombre": g.nombre,
            "cantidad": g.cantidad,
            "fecha": g.fecha,
            "mes": g.mes
        })

    return jsonify(resultado)

# ➕ Agregar gasto
@app.route("/gastos", methods=["POST"])
def agregar_gasto():
    data = request.json

    # 🚨 Validaciones
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    nombre = data.get("nombre")
    cantidad = data.get("cantidad")

    if not nombre or not str(nombre).strip():
        return jsonify({"error": "El nombre es obligatorio"}), 400

    try:
        cantidad = float(cantidad)
    except:
        return jsonify({"error": "Cantidad inválida"}), 400

    if cantidad <= 0:
        return jsonify({"error": "La cantidad debe ser mayor a 0"}), 400

    # 🧠 Fecha actual
    hoy = datetime.now()

    # ✅ Crear gasto
    nuevo_gasto = Gasto(
        nombre=nombre,
        cantidad=cantidad,
        fecha=hoy.strftime("%Y-%m-%d"),
        mes=hoy.strftime("%Y-%m")
    )

    db.session.add(nuevo_gasto)
    db.session.commit()

    return jsonify({"mensaje": "Gasto guardado en BD"}), 201

# ❌ Eliminar gasto
@app.route("/gastos/<int:id>", methods=["DELETE"])
def eliminar_gasto(id):
    gasto = Gasto.query.get(id)

    if not gasto:
        return jsonify({"error": "No encontrado"}), 404

    db.session.delete(gasto)
    db.session.commit()

    return jsonify({"mensaje": "Gasto eliminado"})

# 🔄 Reset (solo limpia gastos actuales si quieres mantener histórico luego)
@app.route("/reset", methods=["DELETE"])
def reset_gastos():
    Gasto.query.delete()
    db.session.commit()
    return jsonify({"mensaje": "Todos los gastos eliminados"})

# 🚀 Run app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)