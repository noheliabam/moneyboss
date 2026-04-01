import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Stats() {
  const [gastos, setGastos] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");

  useEffect(() => {
    fetch("https://moneyboss-production.up.railway.app/gastos")
      .then(res => res.json())
      .then(data => setGastos(data));
  }, []);

  const gastosPorMes = {};

  gastos.forEach(g => {
    if (!g.mes) return;
    if (!gastosPorMes[g.mes]) gastosPorMes[g.mes] = 0;
    gastosPorMes[g.mes] += g.cantidad;
  });

  const dataChart = {
    labels: Object.keys(gastosPorMes),
    datasets: [{
      data: Object.values(gastosPorMes),
      backgroundColor: ["#4CAF50","#FF9800","#F44336","#2196F3"]
    }]
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
      <h1>📊 Estadísticas</h1>

      <select onChange={(e) => setMesSeleccionado(e.target.value)}>
        <option value="">Todos</option>
        {Object.keys(gastosPorMes).map(m => (
        <option key={m} value={m}>
  {getNombreMes(m)}
</option>
        ))}
      </select>

      {Object.keys(gastosPorMes).length > 0 && <Pie data={dataChart} />}

      <ul>
        {Object.keys(gastosPorMes).map((mes) => (
          <li key={mes}>
            {getNombreMes(mes)} → {gastosPorMes[mes]}€
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Stats;