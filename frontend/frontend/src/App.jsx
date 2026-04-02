import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API = "https://moneyboss-production.up.railway.app";

function App() {
  const [gastos, setGastos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  const [ingreso, setIngreso] = useState(
    localStorage.getItem("ingreso") || ""
  );

  const [gastosFijos, setGastosFijos] = useState(
    localStorage.getItem("gastosFijos") || ""
  );

  const hoy = new Date();
  const fechaTexto = hoy.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const mesActual = new Date().toISOString().slice(0, 7);

  // 📥 CARGAR
  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    try {
      const res = await fetch(`${API}/gastos`);
      const data = await res.json();
      setGastos(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 💾 GUARDAR
  useEffect(() => {
    localStorage.setItem("ingreso", ingreso);
  }, [ingreso]);

  useEffect(() => {
    localStorage.setItem("gastosFijos", gastosFijos);
  }, [gastosFijos]);

  // 🧠 CALCULOS
  const gastosMes = gastos.filter(g => !g.mes || g.mes === mesActual);

  const disponible =
    parseFloat(ingreso || 0) - parseFloat(gastosFijos || 0);

  const totalGastado = gastosMes.reduce(
    (acc, g) => acc + parseFloat(g.cantidad),
    0
  );

  const restante = disponible - totalGastado;
  const gastoDiarioReal = restante > 0 ? restante / 30 : 0;

  let estado = "#4CAF50";
  if (totalGastado > disponible) estado = "#F44336";
  else if (totalGastado > disponible * 0.7) estado = "#FF9800";

  let mensaje = "";
  if (disponible <= 0) mensaje = "💀 Números rojos";
  else if (restante <= 0) mensaje = "🚨 Sin margen";
  else if (estado === "#4CAF50") mensaje = "✅ Vas bien";
  else mensaje = "⚠️ Cuidado";

  // ➕ AGREGAR
  const agregarGasto = async () => {
    if (!nombre || !cantidad) return;

    await fetch(`${API}/gastos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, cantidad })
    });

    setNombre("");
    setCantidad("");
    cargarGastos();
  };

  // ❌ ELIMINAR
  const eliminarGasto = async (id) => {
    await fetch(`${API}/gastos/${id}`, {
      method: "DELETE"
    });

    setGastos(prev => prev.filter(g => g.id !== id));
  };

  // 🔄 RESET
  const reiniciarMes = async () => {
    await fetch(`${API}/reset`, { method: "DELETE" });
    setGastos([]);
  };

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h1>💰 MoneyBoss</h1>
        <p>{fechaTexto}</p>
      </div>

      {/* TARJETA PRINCIPAL */}
      <div style={card}>
        <h2>Disponible</h2>
        <h1>{disponible}€</h1>
        <p>Diario: {gastoDiarioReal.toFixed(2)}€</p>
      </div>

      {/* STATUS */}
      <div style={status}>
        <h3 style={{ color: estado }}>
          💸 {totalGastado.toFixed(2)}€
        </h3>
        <p>{mensaje}</p>
      </div>

      {/* INPUTS */}
      <input
        placeholder="Ingreso mensual"
        value={ingreso}
        onChange={(e) => setIngreso(e.target.value)}
        style={input}
      />

      <input
        placeholder="Gastos fijos"
        value={gastosFijos}
        onChange={(e) => setGastosFijos(e.target.value)}
        style={input}
      />

      {/* BOTONES */}
      <div style={btnGroup}>
        <button style={btn} onClick={agregarGasto}>➕</button>
        <button style={btn} onClick={reiniciarMes}>🔄</button>
        <Link to="/stats">
          <button style={btn}>📊</button>
        </Link>
      </div>

      {/* INPUT GASTOS */}
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={input}
      />

      <input
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && agregarGasto()}
        style={input}
      />

      {/* LISTA */}
      <div>
        {gastosMes.map((g) => (
          <div key={g.id} style={item}>
            <span>{g.nombre}</span>
            <span>{g.cantidad}€</span>
            <button onClick={() => eliminarGasto(g.id)}>❌</button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;






// 🎨 ESTILOS PRO

const container = {
  maxWidth: "420px",
  margin: "40px auto",
  fontFamily: "Arial",
};

const header = {
  textAlign: "center",
  marginBottom: "20px"
};

const card = {
  background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
  color: "white",
  borderRadius: "15px",
  padding: "20px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
};

const status = {
  marginTop: "15px",
  padding: "15px",
  borderRadius: "10px",
  background: "#fff",
  boxShadow: "0 5px 10px rgba(0,0,0,0.1)"
};

const input = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const btnGroup = {
  display: "flex",
  gap: "10px",
  marginTop: "10px"
};

const btn = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#FFC107",
  fontWeight: "bold",
  cursor: "pointer"
};

const item = {
  display: "flex",
  justifyContent: "space-between",
  background: "#fff",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "8px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
};