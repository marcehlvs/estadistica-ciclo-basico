import { useMemo, useState } from "react";
import { Eye, EyeOff, Lightbulb, RotateCcw } from "lucide-react";
import { freqTable, groupedTable, fmt, parseNum } from "./stats.js";
import { COLUMNS, columnsFor, isCorrect } from "./freqColumns.js";
import { AnswerInput, Callout, Cell_, DataBox } from "./ui.jsx";
import { AngleTable, BarsChart, HistogramPolygon, PieBox } from "./Charts.jsx";

/* Práctica de tablas de frecuencia (datos sueltos o agrupados).
   Modo guiado: se completa UNA columna por vez; cada columna trae su definición, su fórmula y un ejemplo.
   Debajo de la tabla hay un control de totales calculado con lo que el estudiante va escribiendo. */

export default function FreqTable({ set, grouped = false, onCycle }) {
  const kind = grouped ? "continua" : set.kind;
  const cols = useMemo(() => columnsFor({ grouped, kind }), [grouped, kind]);
  const rows = useMemo(
    () => (grouped ? groupedTable(set.data, set.intervals) : freqTable(set.data, set.order)),
    [set, grouped],
  );
  const n = set.data.length;

  const [answers, setAnswers] = useState({});
  const [guided, setGuided] = useState(true);
  const [visible, setVisible] = useState(1);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [example, setExample] = useState(false);
  const [chartMode, setChartMode] = useState("both");

  const shown = guided || solved ? (solved ? cols.length : visible) : cols.length;
  const activeCols = useMemo(() => cols.slice(0, shown), [cols, shown]);
  const current = cols[Math.min(shown, cols.length) - 1];

  const valueOf = (col, i) => (solved ? COLUMNS[col].show(rows[i]) : (answers[`${col}_${i}`] ?? ""));

  const results = useMemo(() => {
    if (!checked) return null;
    const r = {};
    activeCols.forEach((col) => rows.forEach((row, i) => (r[`${col}_${i}`] = isCorrect(col, answers[`${col}_${i}`], row, parseNum))));
    return r;
  }, [checked, activeCols, rows, answers]);

  const wrongCols = results ? activeCols.filter((c) => rows.some((_, i) => !results[`${c}_${i}`])) : [];
  const visibleOk = results && wrongCols.length === 0;
  const allDone = visibleOk && shown === cols.length;
  const showCharts = solved || allDone;

  const update = (col, i, v) => {
    setAnswers((prev) => ({ ...prev, [`${col}_${i}`]: v }));
    setChecked(false);
  };

  const toggleGuided = () => {
    setGuided((g) => !g);
    setChecked(false);
    setVisible(1);
  };

  /* Control de totales con lo que escribió el estudiante */
  const typedSum = (col) => {
    const vals = rows.map((_, i) => parseNum(answers[`${col}_${i}`]));
    if (vals.every((v) => !Number.isFinite(v))) return null;
    return vals.reduce((a, v) => a + (Number.isFinite(v) ? v : 0), 0);
  };
  const totalSpec = { f: { target: n, text: `n = ${n}` }, fr: { target: 1, text: "1" }, frp: { target: 100, text: "100 %" } };

  const exampleRow = current === "fa" && rows.length > 1 ? 1 : 0;
  const exampleCtx = { n, grouped, idx: exampleRow, prev: rows[exampleRow - 1] };

  return (
    <div>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">{set.title}</h3>
          <p className="ex-prompt">{set.prompt}</p>
        </div>
        <button className="btn btn--ghost" onClick={onCycle}>
          <RotateCcw size={14} /> otro conjunto
        </button>
      </div>

      <DataBox label="Datos relevados" data={set.data} />

      <div className="seg" role="group" aria-label="Modo de trabajo">
        <button className={`seg__btn ${guided ? "seg__btn--active" : ""}`} onClick={() => !guided && toggleGuided()}>
          Guiado: una columna por vez
        </button>
        <button className={`seg__btn ${!guided ? "seg__btn--active" : ""}`} onClick={() => guided && toggleGuided()}>
          Completar toda la tabla
        </button>
      </div>

      {guided && !solved ? (
        <Callout title={`Columna ${shown} de ${cols.length}: ${COLUMNS[current].name}`} tone="info">
          <p>{COLUMNS[current].meaning}</p>
          <p className="formula">{COLUMNS[current].formula}</p>
          <button className="btn btn--ghost" onClick={() => setExample((e) => !e)}>
            <Lightbulb size={14} /> {example ? "ocultar ejemplo" : "ver un ejemplo resuelto"}
          </button>
          {example && <p className="example">{COLUMNS[current].example(rows[exampleRow], exampleCtx)}</p>}
        </Callout>
      ) : (
        <Callout title="¿Qué significa cada columna?" tone="info">
          <ul className="def-list">
            {cols.map((c) => (
              <li key={c}>
                <strong>{COLUMNS[c].name}:</strong> {COLUMNS[c].meaning} <span className="formula">{COLUMNS[c].formula}</span>
              </li>
            ))}
          </ul>
        </Callout>
      )}

      <div className="table-wrap">
        <table className="freq-table">
          <thead>
            <tr>
              <th>{grouped ? "Intervalo" : kind === "cualitativa" ? "Categoría" : "Valor (x)"}</th>
              {activeCols.map((c) => (
                <th key={c}>{COLUMNS[c].head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="fc fc--label">{row.label}</td>
                {activeCols.map((c) => {
                  const st = results && (results[`${c}_${i}`] ? "ok" : "bad");
                  return (
                    <Cell_ key={c} state={st}>
                      <AnswerInput
                        value={valueOf(c, i)}
                        onChange={(v) => update(c, i, v)}
                        state={st || undefined}
                        width={COLUMNS[c].width}
                        suffix={COLUMNS[c].suffix}
                        disabled={solved}
                      />
                    </Cell_>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="fc fc--total">Total</td>
              {activeCols.map((c) => {
                const spec = totalSpec[c];
                if (!spec) return <td key={c} className="fc fc--total" />;
                const sum = solved ? spec.target : typedSum(c);
                const ok = sum !== null && Math.abs(sum - spec.target) < (c === "fr" ? 0.011 : 0.51);
                return (
                  <td key={c} className={`fc fc--total fc--num ${sum === null ? "" : ok ? "fc--ok" : "fc--bad"}`}>
                    {sum === null ? "—" : c === "fr" ? fmt(sum, 3) : fmt(sum, 2)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="hc-note">
        Control: la fila Total se calcula con lo que vas escribiendo. Si la suma de f no da n = {n}, la de fr no da 1 o la de fr % no da 100 %,
        alguna celda tiene un error.
      </p>

      <div className="ex-actions">
        <button className="btn btn--primary" onClick={() => setChecked(true)} disabled={solved}>
          Verificar{guided && shown < cols.length ? " columna" : " respuestas"}
        </button>
        {guided && visibleOk && shown < cols.length && !solved && (
          <button
            className="btn btn--accent"
            onClick={() => {
              setVisible(shown + 1);
              setChecked(false);
              setExample(false);
            }}
          >
            Siguiente columna →
          </button>
        )}
        <button
          className="btn btn--ghost"
          onClick={() => {
            setSolved((s) => !s);
            setChecked(false);
          }}
        >
          {solved ? <EyeOff size={14} /> : <Eye size={14} />} {solved ? "ocultar solución" : "ver solución"}
        </button>
      </div>

      {checked && !solved && (
        <p className={`ex-feedback ${visibleOk ? "ex-feedback--ok" : "ex-feedback--bad"}`}>
          {allDone
            ? "¡Tabla completa y correcta! Mirá cómo se ven estos datos en los gráficos de abajo."
            : visibleOk
              ? `¡Bien! La columna ${COLUMNS[current].short} está correcta.${guided ? " Pasá a la siguiente." : ""}`
              : `Revisá la columna ${wrongCols.map((c) => COLUMNS[c].short).join(", ")}: ${COLUMNS[wrongCols[0]].formula}. Las celdas en rojo no coinciden.`}
        </p>
      )}
      {solved && <p className="ex-feedback ex-feedback--info">Estás viendo la solución completa. Los gráficos de abajo ya reflejan la tabla correcta.</p>}

      {showCharts && (grouped ? <GroupedCharts rows={rows} unit={set.unit} mode={chartMode} setMode={setChartMode} /> : <SimpleCharts rows={rows} set={set} kind={kind} />)}
    </div>
  );
}

function SimpleCharts({ rows, set, kind }) {
  return (
    <div className="charts-section">
      <h4 className="charts-title">Gráfico de barras y gráfico circular</h4>
      <div className="charts-grid">
        <BarsChart rows={rows} xLabel={set.variable} />
        <PieBox rows={rows} />
      </div>
      <Callout title="Cómo leer estos gráficos" tone="tip">
        <p>
          <strong>Barras:</strong> una barra por {kind === "cualitativa" ? "categoría" : "valor"}, <em>separadas</em> entre sí. La altura de cada barra es la frecuencia
          absoluta (f).
        </p>
        <p>
          <strong>Circular:</strong> el círculo entero (360°) es el total de datos. Cada sector ocupa una parte proporcional a su fr:{" "}
          <span className="formula">ángulo = fr × 360°</span>. En el gráfico aparece el porcentaje de cada sector.
        </p>
      </Callout>
      <AngleTable rows={rows} />
    </div>
  );
}

function GroupedCharts({ rows, unit, mode, setMode }) {
  return (
    <div className="charts-section">
      <h4 className="charts-title">Histograma y polígono de frecuencias</h4>
      <div className="seg" role="group" aria-label="Qué gráfico ver">
        {[["hist", "Histograma"], ["poly", "Polígono"], ["both", "Los dos juntos"]].map(([id, text]) => (
          <button key={id} className={`seg__btn ${mode === id ? "seg__btn--active" : ""}`} onClick={() => setMode(id)}>
            {text}
          </button>
        ))}
      </div>
      <HistogramPolygon rows={rows} mode={mode} unit={unit} />
      <Callout title="Cómo se construyen" tone="tip">
        <p>
          <strong>Histograma:</strong> como los intervalos se tocan, las barras van <em>pegadas</em> (no hay espacio entre ellas). Cada barra tiene de ancho la
          amplitud del intervalo y de alto su f.
        </p>
        <p>
          <strong>Polígono de frecuencias:</strong> se marca un punto en la <em>marca de clase</em> de cada intervalo (a la altura de f) y se unen con rectas. Se
          agrega un intervalo vacío a cada lado (f = 0) para que la línea baje hasta el eje y el polígono quede cerrado.
        </p>
        <p>Probá el botón “Los dos juntos”: el polígono pasa por el punto medio del techo de cada barra.</p>
      </Callout>
    </div>
  );
}
