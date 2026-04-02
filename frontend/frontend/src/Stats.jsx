import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Stats() {
  const [gastos, setGastos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  // 🔄 cargar datos
  const cargarDatos = () => {
    fetch("https://moneyboss-production.up.railway.app/gastos")
      .then((res) => res.json())
      .then((data) => {
        console.log("GASTOS:", data);
        setGastos(data);
      })
      .catch((err) => console.error("Error:", err));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🎯 FILTRO POR CATEGORÍA
  const datosFiltrados = categoriaSeleccionada
    ? gastos.filter((g) => g.nombre === categoriaSeleccionada)
    : gastos;

  // 🧠 AGRUPAR POR CATEGORÍA
  const gastosPorCategoria = {};

  datosFiltrados.forEach((g) => {
    if (!g.nombre) return;

    if (!gastosPorCategoria[g.nombre]) {
      gastosPorCategoria[g.nombre] = 0;
    }

    gastosPorCategoria[g.nombre] += parseFloat(g.cantidad);
  });

  // 🔥 ORDENAR (de mayor a menor)
  const ordenado = Object.entries(gastosPorCategoria).sort(
    (a, b) => b[1] - a[1]
  );

  const labels = ordenado.map(([k]) => k);
  const dataValues = ordenado.map(([_, v]) => v);

  // 🎨 COLORES DINÁMICOS
  const colores = labels.map(
    () => `hsl(${Math.random() * 360}, 70%, 60%)`
  );

  // 📊 DATA CHART
  const dataChart = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colores,
      },
    ],
  };

  // 💥 TOOLTIP CON PORCENTAJE
  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let value = context.raw;
            let percentage = ((value / total) * 100).toFixed(1);
            return `${value}€ (${percentage}%)`;
          },
        },
      },
    },
  };

  if (!Array.isArray(gastos) || gastos.length === 0) {
    return <p style={{ textAlign: "center" }}>No hay datos aún</p>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        textAlign: "center",
      }}
    >
      <h1>📊 Estadísticas</h1>

      {/* 🔽 SELECT */}
      <select
        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
      >
        <option value="">Todos</option>
        {labels.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <br />
      <br />

      {/* 🔄 BOTÓN ACTUALIZAR */}
      <button onClick={cargarDatos}>🔄 Actualizar</button>

      <br />
      <br />

      {/* 📊 GRÁFICA */}
      {labels.length > 0 && <Pie data={dataChart} options={options} />}

      {/* 📋 LISTA */}
      <ul>
        {labels.map((cat) => (
          <li key={cat}>
            {cat} → {gastosPorCategoria[cat]}€
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Stats;