import { useMemo, useState } from "react";
import { RotateCcw, Send, Shuffle } from "lucide-react";
import { AnswerInput, Choice, DataBox, PickSelect } from "./ui.jsx";
import { recordResult } from "./progress.js";
import {
  computeStats, freqTable, groupedMeasures, groupedTable, makeGroupedExercise, makeUngroupedExercise,
  mulberry32, parseNum, round, shuffle, tolFor,
} from "./stats.js";

/* Pestaña 5 · Modo evaluación (3.º año).
   Ejercicio 1: datos sueltos → tabla (f, fr, fr %, FA) + moda, mediana y media.
   Ejercicio 2: datos agrupados con intervalos ya armados → tabla (marca, f, fr %, FA) + intervalo modal, intervalo mediano y media.
   Ejercicio 3: interpretación (FA, porcentaje, ángulo del circular y reconocimiento del histograma).
   La misma evaluación N.º siempre trae los mismos datos. */

const exact = (value) => ({ value, tol: 0.001, decimals: 0 });
const approx = (value, decimals = 2) => ({ value, tol: tolFor(value), decimals });

const CHART_OPTIONS = [
  { id: "histo", text: "Histograma" },
  { id: "barras", text: "Gráfico de barras" },
  { id: "circular", text: "Gráfico circular" },
  { id: "poli", text: "Polígono de frecuencias" },
];

function buildExercises(evalNo) {
  const exA = makeUngroupedExercise(evalNo);
  const exB = makeGroupedExercise(evalNo);
  const rowsA = freqTable(exA.data);
  const stA = computeStats(exA.data);
  const rowsB = groupedTable(exB.data, exB.intervals);
  const mB = groupedMeasures(rowsB);
  // Valor de corte para las preguntas de interpretación: nunca el primero ni el último
  const qi = 1 + (evalNo % (rowsA.length - 2));
  const cut = rowsA[qi];
  const modalRowA = rowsA.find((r) => r.value === stA.modes[0]);
  const chartOptions = shuffle(CHART_OPTIONS, mulberry32(evalNo * 13 + 7));
  return { exA, exB, rowsA, stA, rowsB, mB, cut, modalRowA, chartOptions };
}

function buildExpected({ rowsA, stA, rowsB, mB, cut, modalRowA }) {
  const e = {};
  rowsA.forEach((r, i) => {
    e[`a_f_${i}`] = exact(r.f);
    e[`a_fr_${i}`] = { value: r.fr, tol: 0.006, decimals: 3 };
    e[`a_frp_${i}`] = { value: r.frp, tol: 0.5, decimals: 2 };
    e[`a_fa_${i}`] = exact(r.fa);
  });
  e.a_mode = exact(stA.modes[0]);
  e.a_median = approx(stA.median);
  e.a_mean = approx(stA.mean);

  rowsB.forEach((r, i) => {
    e[`b_mark_${i}`] = { value: r.mark, tol: 0.01, decimals: 1 };
    e[`b_f_${i}`] = exact(r.f);
    e[`b_frp_${i}`] = { value: r.frp, tol: 0.5, decimals: 2 };
    e[`b_fa_${i}`] = exact(r.fa);
  });
  e.b_modal = { choice: rowsB[mB.modalIdx].label };
  e.b_median = { choice: rowsB[mB.medianIdx].label };
  e.b_mean = approx(mB.mean);

  e.c_q1 = exact(cut.fa);
  e.c_q2 = { value: round(100 - (cut.fa / stA.n) * 100, 2), tol: 0.6, decimals: 1 };
  e.c_angle = { value: modalRowA.angle, tol: 0.6, decimals: 1 };
  e.c_chart = { choice: "histo" };
  return e;
}

function gradeAnswers(expected, answers) {
  const r = {};
  for (const [key, spec] of Object.entries(expected)) {
    if ("choice" in spec) {
      r[key] = answers[key] === spec.choice;
      continue;
    }
    const v = parseNum(answers[key]);
    r[key] = Number.isFinite(v) && Math.abs(v - spec.value) <= spec.tol;
  }
  return r;
}

function EvaluationSheet({ evalNo }) {
  const ex = useMemo(() => buildExercises(evalNo), [evalNo]);
  const { exA, exB, rowsA, stA, rowsB, cut, modalRowA, chartOptions } = ex;
  const expected = useMemo(() => buildExpected(ex), [ex]);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const results = useMemo(() => (submitted ? gradeAnswers(expected, answers) : null), [submitted, answers, expected]);

  const keysOf = (p) => Object.keys(expected).filter((k) => k.startsWith(p));
  const parts = [
    { label: "Ej. 1", keys: keysOf("a_") },
    { label: "Ej. 2", keys: keysOf("b_") },
    { label: "Ej. 3", keys: keysOf("c_") },
  ];
  const total = parts.reduce((s, p) => s + p.keys.length, 0);
  const scores = parts.map((p) => (results ? p.keys.filter((k) => results[k]).length : 0));
  const score = scores.reduce((a, b) => a + b, 0);
  const pct = Math.round((score / total) * 100);
  const tone = pct >= 85 ? "good" : pct >= 60 ? "mid" : "low";

  const stateOf = (key) => (results ? (results[key] ? "ok" : "bad") : undefined);
  const set = (key, v) => setAnswers((prev) => ({ ...prev, [key]: v }));

  const field = (key, { width = 54, suffix } = {}) => (
    <AnswerInput
      value={answers[key] ?? ""}
      onChange={(v) => set(key, v)}
      state={stateOf(key)}
      hint={round(expected[key].value, expected[key].decimals)}
      width={width}
      suffix={suffix}
      disabled={submitted}
    />
  );

  const pick = (key, options) => (
    <PickSelect
      value={answers[key] ?? ""}
      onChange={(v) => set(key, v)}
      options={options}
      state={stateOf(key)}
      hint={expected[key].choice}
      disabled={submitted}
    />
  );

  const entregar = () => {
    const r = gradeAnswers(expected, answers);
    const detail = parts.map((p) => ({ label: p.label, score: p.keys.filter((k) => r[k]).length, total: p.keys.length }));
    recordResult({ kind: "evaluacion", id: evalNo, score: detail.reduce((s, p) => s + p.score, 0), total, parts: detail });
    setSubmitted(true);
  };

  return (
    <div>
      {/* ---------- Ejercicio 1 ---------- */}
      <section className="eval-section">
        <span className="eval-badge">Ejercicio 1 · datos sueltos</span>
        <h3 className="ex-title">{exA.title}</h3>
        <p className="ex-prompt">{exA.prompt}</p>
        <DataBox label="Datos relevados" data={exA.data} />

        <h4 className="eval-subtitle">a) Completá la tabla de frecuencias</h4>
        <div className="table-wrap">
          <table className="freq-table">
            <thead>
              <tr>
                <th>Valor (x)</th>
                <th>f</th>
                <th>fr</th>
                <th>fr %</th>
                <th>FA</th>
              </tr>
            </thead>
            <tbody>
              {rowsA.map((r, i) => (
                <tr key={i}>
                  <td className="fc fc--label">{r.label}</td>
                  <td className="fc">{field(`a_f_${i}`, { width: 46 })}</td>
                  <td className="fc">{field(`a_fr_${i}`, { width: 56 })}</td>
                  <td className="fc">{field(`a_frp_${i}`, { width: 52, suffix: "%" })}</td>
                  <td className="fc">{field(`a_fa_${i}`, { width: 46 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="eval-subtitle">b) Calculá las medidas</h4>
        <p className="eval-note">Redondeá a dos decimales si hace falta.</p>
        <div className="eval-fields">
          <div className="eval-field">
            <span className="eval-field__label">Moda (Mo)</span>
            {field("a_mode", { width: 64 })}
          </div>
          <div className="eval-field">
            <span className="eval-field__label">Mediana (Me)</span>
            {field("a_median", { width: 64 })}
          </div>
          <div className="eval-field">
            <span className="eval-field__label">Media (x̄)</span>
            {field("a_mean", { width: 64 })}
          </div>
        </div>
      </section>

      {/* ---------- Ejercicio 2 ---------- */}
      <section className="eval-section">
        <span className="eval-badge">Ejercicio 2 · datos agrupados</span>
        <h3 className="ex-title">{exB.title}</h3>
        <p className="ex-prompt">{exB.prompt}</p>
        <DataBox label="Datos relevados" data={exB.data} />

        <h4 className="eval-subtitle">a) Completá la tabla (los intervalos ya están armados)</h4>
        <div className="table-wrap">
          <table className="freq-table">
            <thead>
              <tr>
                <th>Intervalo</th>
                <th>Marca de clase</th>
                <th>f</th>
                <th>fr %</th>
                <th>FA</th>
              </tr>
            </thead>
            <tbody>
              {rowsB.map((r, i) => (
                <tr key={i}>
                  <td className="fc fc--label">{r.label}</td>
                  <td className="fc">{field(`b_mark_${i}`, { width: 56 })}</td>
                  <td className="fc">{field(`b_f_${i}`, { width: 46 })}</td>
                  <td className="fc">{field(`b_frp_${i}`, { width: 52, suffix: "%" })}</td>
                  <td className="fc">{field(`b_fa_${i}`, { width: 46 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="eval-subtitle">b) Medidas con datos agrupados</h4>
        <div className="eval-fields">
          <div className="eval-field">
            <span className="eval-field__label">Intervalo modal</span>
            {pick("b_modal", rowsB.map((r) => r.label))}
          </div>
          <div className="eval-field">
            <span className="eval-field__label">Intervalo mediano</span>
            {pick("b_median", rowsB.map((r) => r.label))}
          </div>
          <div className="eval-field">
            <span className="eval-field__label">Media aproximada (x̄)</span>
            <span className="eval-field__formula">x̄ ≈ Σ(marca · f) ÷ n</span>
            {field("b_mean", { width: 64 })}
          </div>
        </div>
      </section>

      {/* ---------- Ejercicio 3 ---------- */}
      <section className="eval-section">
        <span className="eval-badge">Ejercicio 3 · interpretación</span>
        <p className="ex-prompt">
          Respondé usando la tabla del Ejercicio 1 ({exA.title.toLowerCase()}, n = {stA.n}).
        </p>
        <div className="eval-fields eval-fields--col">
          <div className="eval-field">
            <span className="eval-field__label">¿Cuántos datos son menores o iguales que {cut.value}?</span>
            {field("c_q1", { width: 64 })}
          </div>
          <div className="eval-field">
            <span className="eval-field__label">¿Qué porcentaje de los datos es mayor que {cut.value}?</span>
            {field("c_q2", { width: 64, suffix: "%" })}
          </div>
          <div className="eval-field">
            <span className="eval-field__label">
              En un gráfico circular, ¿cuántos grados mediría el sector del valor {modalRowA.value} (la moda)?
            </span>
            <span className="eval-field__formula">ángulo = fr × 360°</span>
            {field("c_angle", { width: 64, suffix: "°" })}
          </div>
          <div className="eval-field">
            <span className="eval-field__label">¿Qué gráfico se dibuja con las barras pegadas, una por intervalo, para datos agrupados?</span>
            <Choice
              name={`chart-${evalNo}`}
              options={chartOptions}
              value={answers.c_chart}
              onChange={(v) => set("c_chart", v)}
              correct="histo"
              checked={submitted}
              disabled={submitted}
            />
          </div>
        </div>
      </section>

      {!submitted ? (
        <div className="ex-actions" style={{ marginTop: 22 }}>
          <button className="btn btn--primary" onClick={entregar}>
            <Send size={14} /> Entregar y corregir
          </button>
        </div>
      ) : (
        <div className={`score-banner score-banner--${tone}`}>
          <div>
            <span className="score-banner__num">{score} / {total}</span> respuestas correctas ({pct} %)
            <div className="prog-parts">{parts.map((p, i) => `${p.label}: ${scores[i]}/${p.keys.length}`).join(" · ")}</div>
          </div>
          <span>Las respuestas en rojo muestran el valor correcto. Tu resultado quedó guardado en “Mi progreso”.</span>
        </div>
      )}
    </div>
  );
}

export default function Evaluation() {
  const [evalNo, setEvalNo] = useState(1);
  const [attempt, setAttempt] = useState(0);
  return (
    <div>
      <div className="eval-banner">
        <div>
          <h3>Evaluación N.º {evalNo}</h3>
          <p>Resolvela como en una prueba: sin pistas hasta que entregues. Cada número de evaluación trae siempre los mismos datos.</p>
        </div>
        <div className="ex-actions" style={{ margin: 0 }}>
          <button className="btn btn--ghost" onClick={() => setAttempt((a) => a + 1)}>
            <RotateCcw size={14} /> reintentar
          </button>
          <button
            className="btn btn--ghost"
            onClick={() => {
              setEvalNo((n) => n + 1);
              setAttempt(0);
            }}
          >
            <Shuffle size={14} /> nueva evaluación
          </button>
        </div>
      </div>
      <EvaluationSheet key={`${evalNo}-${attempt}`} evalNo={evalNo} />
    </div>
  );
}
