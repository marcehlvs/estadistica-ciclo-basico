import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Line,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmt } from "./stats.js";

/* Gráficos de 3.º año. Todos reciben las filas de freqTable / groupedTable. */

const INK = "#1F3A34";
const TEAL = "#5FA8A0";
const AMBER = "#E8B33D";
const MUTED = "#5A5142";
const COLORS = ["#5FA8A0", "#E8B33D", "#D97D7D", "#8FBF7F", "#8C7BC4", "#4F8FBF", "#CB9F5A"];

const axisTick = { fontSize: 11, fill: MUTED };

/** Gráfico de barras: una barra SEPARADA por categoría o valor; la altura es la frecuencia absoluta. */
export function BarsChart({ rows, xLabel }) {
  return (
    <div className="hist-box">
      <div className="chart-title">Gráfico de barras</div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={rows} margin={{ top: 18, right: 10, left: -10, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C4" />
          <XAxis dataKey="label" tick={axisTick} interval={0} label={{ value: xLabel, position: "insideBottom", offset: -10, fontSize: 11, fill: MUTED }} />
          <YAxis tick={axisTick} allowDecimals={false} label={{ value: "f", angle: -90, position: "insideLeft", offset: 18, fontSize: 11, fill: MUTED }} />
          <Tooltip formatter={(v) => [v, "Frecuencia (f)"]} />
          <Bar dataKey="f" name="f" radius={[4, 4, 0, 0]}>
            {rows.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            <LabelList dataKey="f" position="top" fontSize={11} fill={INK} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Gráfico circular: cada sector mide fr · 360°. */
export function PieBox({ rows }) {
  return (
    <div className="hist-box">
      <div className="chart-title">Gráfico circular</div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="f"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={86}
            label={(d) => `${fmt(d.frp, 1)} %`}
            labelLine={false}
            isAnimationActive={false}
          >
            {rows.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Tooltip formatter={(v, _n, item) => [`${v} (${fmt(item.payload.frp, 1)} %)`, "f"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Tabla del ángulo de cada sector del gráfico circular. */
export function AngleTable({ rows }) {
  const total = rows.reduce((a, r) => a + r.angle, 0);
  return (
    <div className="table-wrap">
      <table className="freq-table freq-table--compact">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>fr</th>
            <th>Ángulo = fr · 360°</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="fc fc--label">
                <span className="swatch" style={{ background: COLORS[i % COLORS.length] }} /> {r.label}
              </td>
              <td className="fc fc--num">{fmt(r.fr, 3)}</td>
              <td className="fc fc--num">{fmt(r.angle, 1)}°</td>
            </tr>
          ))}
          <tr>
            <td className="fc fc--total">Total</td>
            <td className="fc fc--total fc--num">1</td>
            <td className="fc fc--total fc--num">{fmt(total, 0)}°</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Histograma y polígono de frecuencias para datos agrupados.
 *   hist → barras PEGADAS (los intervalos se tocan), altura = f
 *   poly → se unen con rectas las marcas de clase; se agregan un intervalo vacío a cada lado
 *          para que el polígono "baje" hasta el eje (f = 0) y quede cerrado
 *   both → los dos juntos: se ve que el polígono pasa por el punto medio del techo de cada barra
 */
export function HistogramPolygon({ rows, mode = "both", unit }) {
  const w = rows[0].hi - rows[0].lo;
  const ghost = (lo, hi) => ({ label: `[${lo} - ${hi})`, mark: (lo + hi) / 2, f: 0 });
  const ext = [ghost(rows[0].lo - w, rows[0].lo), ...rows, ghost(rows[rows.length - 1].hi, rows[rows.length - 1].hi + w)];
  const base = mode === "hist" ? rows : ext;
  const data = base.map((r) => ({ ...r, tick: mode === "poly" ? String(r.mark) : r.label }));
  const xText = mode === "poly" ? `Marca de clase${unit ? ` (${unit})` : ""}` : `Intervalo${unit ? ` (${unit})` : ""}`;
  const title = { hist: "Histograma", poly: "Polígono de frecuencias", both: "Histograma y polígono de frecuencias" }[mode];
  return (
    <div className="hist-box">
      <div className="chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} barCategoryGap={0} margin={{ top: 18, right: 14, left: -10, bottom: 34 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C4" />
          <XAxis
            dataKey="tick"
            interval={0}
            tick={{ fontSize: 10, fill: MUTED }}
            angle={mode === "poly" ? 0 : -25}
            textAnchor={mode === "poly" ? "middle" : "end"}
            label={{ value: xText, position: "insideBottom", offset: -26, fontSize: 11, fill: MUTED }}
          />
          <YAxis tick={axisTick} allowDecimals={false} label={{ value: "f", angle: -90, position: "insideLeft", offset: 18, fontSize: 11, fill: MUTED }} />
          <Tooltip formatter={(v) => [v, "Frecuencia (f)"]} />
          {mode !== "poly" && (
            <Bar dataKey="f" name="Histograma" fill={TEAL} fillOpacity={mode === "both" ? 0.55 : 1} stroke={INK} isAnimationActive={false}>
              {mode === "hist" && <LabelList dataKey="f" position="top" fontSize={11} fill={INK} />}
            </Bar>
          )}
          {mode !== "hist" && (
            <Line
              type="linear"
              dataKey="f"
              name="Polígono"
              stroke={mode === "both" ? "#B14E4E" : INK}
              strokeWidth={2.5}
              dot={{ r: 4, fill: AMBER, stroke: INK }}
              isAnimationActive={false}
            >
              {mode === "poly" && <LabelList dataKey="f" position="top" fontSize={11} fill={INK} />}
            </Line>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
