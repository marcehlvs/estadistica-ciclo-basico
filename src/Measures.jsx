import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { NUMERIC_SETS, GROUPED_SETS } from "./datasets.js";
import { computeStats, freqTable, groupedMeasures, groupedTable, fmt, parseNum, tolFor } from "./stats.js";
import { AnswerInput, Callout, Cell_, DataBox, PickSelect } from "./ui.jsx";

/* Pestaña 4 · Moda, mediana y media.
   Cada medida tiene: definición, un campo para que el estudiante la calcule, verificación y "ver cómo se calcula". */

function PracticeCard({ label, definition, kind = "number", expected, options, unit, children }) {
  const [guess, setGuess] = useState("");
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const ok = kind === "select" ? guess === expected : Number.isFinite(parseNum(guess)) && Math.abs(parseNum(guess) - expected) <= tolFor(expected);
  const state = checked ? (ok ? "ok" : "bad") : undefined;
  const set = (v) => {
    setGuess(v);
    setChecked(false);
  };
  return (
    <div className="practice-card">
      <div className="practice-card__label">{label}</div>
      <p className="practice-card__def">{definition}</p>
      <div className="practice-card__row">
        {kind === "select" ? (
          <PickSelect value={guess} onChange={set} options={options} state={state} />
        ) : (
          <AnswerInput value={guess} onChange={set} state={state} width={80} suffix={unit} />
        )}
        <button className="btn btn--primary" onClick={() => setChecked(true)} disabled={guess === ""}>
          Verificar
        </button>
        <button className="btn btn--ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "ocultar" : "ver cómo se calcula"}
        </button>
      </div>
      {checked && (
        <p className={`ex-feedback ${ok ? "ex-feedback--ok" : "ex-feedback--bad"}`}>
          {ok ? "¡Correcto!" : "Todavía no. Abrí “ver cómo se calcula” y probá de nuevo."}
        </p>
      )}
      {open && <div className="practice-card__body">{children}</div>}
    </div>
  );
}

function SortedChips({ sorted, highlight = [] }) {
  return (
    <div className="raw-data__chips raw-data__chips--scroll">
      {sorted.map((v, i) => (
        <span key={i} className={`chip ${highlight.includes(i) ? "chip--hl" : ""}`}>
          {v}
        </span>
      ))}
    </div>
  );
}

/* ---------- Datos sueltos ---------- */

function UngroupedMeasures({ set, onCycle }) {
  const st = useMemo(() => computeStats(set.data), [set]);
  const rows = useMemo(() => freqTable(set.data, set.order), [set]);
  const even = st.n % 2 === 0;
  const [p1, p2] = st.medianPos.map((i) => i + 1); // posiciones desde 1
  const maxRow = rows.find((r) => r.f === st.maxFreq);
  const meanParts = rows.map((r) => `${r.value} · ${r.f}`).join(" + ");

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
      <Callout title="Tip" tone="tip">
        Usá el botón “ordenar de menor a mayor”: para la mediana siempre hay que ordenar los datos primero.
      </Callout>

      <h4 className="charts-title">Calculá las tres medidas</h4>
      <div className="practice-grid">
        <PracticeCard label="Moda (Mo)" definition="El valor que más se repite, o sea el de mayor frecuencia absoluta." expected={st.modes[0]} unit={set.unit}>
          <p>
            Contá cuántas veces aparece cada valor: {rows.map((r) => `${r.value} → ${r.f}`).join(" · ")}.
          </p>
          <p>
            La mayor frecuencia es <strong>{st.maxFreq}</strong>, que corresponde al valor <strong>{maxRow.value}</strong>. Entonces Mo = <strong>{st.modes[0]}</strong>{" "}
            {set.unit}.
          </p>
        </PracticeCard>

        <PracticeCard label="Mediana (Me)" definition="El valor del medio cuando los datos están ordenados de menor a mayor." expected={st.median} unit={set.unit}>
          <p>1) Ordenamos los datos (en amarillo, los del medio):</p>
          <SortedChips sorted={st.sorted} highlight={st.medianPos} />
          <p>
            2) n = {st.n} es {even ? "par" : "impar"}.{" "}
            {even
              ? `Hay dos datos centrales, los de las posiciones ${p1} y ${p2}. La mediana es su promedio: (${st.sorted[p1 - 1]} + ${st.sorted[p2 - 1]}) ÷ 2 = `
              : `El dato central está en la posición (${st.n} + 1) ÷ 2 = ${p1}, y vale `}
            <strong>{fmt(st.median)}</strong>.
          </p>
          <p className="hc-note">La mediana deja la mitad de los datos a cada lado.</p>
        </PracticeCard>

        <PracticeCard label="Media aritmética (x̄)" definition="Se suman todos los datos y se divide por la cantidad de datos." expected={st.mean} unit={set.unit}>
          <p className="formula">x̄ = (suma de todos los datos) ÷ n</p>
          <p>
            Como hay datos repetidos, se multiplica cada valor por su f: x̄ = ({meanParts}) ÷ {st.n} = {fmt(st.sum)} ÷ {st.n} = <strong>{fmt(st.mean)}</strong>{" "}
            {set.unit}.
          </p>
          <p className="hc-note">Es lo mismo que sumar los {st.n} datos uno por uno y dividir por {st.n}.</p>
        </PracticeCard>
      </div>

      <MeasuresNotes />
    </div>
  );
}

/* ---------- Datos agrupados ---------- */

function GroupedMeasuresView({ set, onCycle }) {
  const rows = useMemo(() => groupedTable(set.data, set.intervals), [set]);
  const m = useMemo(() => groupedMeasures(rows), [rows]);
  const labels = rows.map((r) => r.label);
  const modal = rows[m.modalIdx];
  const med = rows[m.medianIdx];
  const prevFa = m.medianIdx > 0 ? rows[m.medianIdx - 1].fa : 0;

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

      <Callout title="Con datos agrupados" tone="info">
        <p>
          Ya no se conocen los datos uno por uno, solo cuántos hay en cada intervalo. Por eso la moda y la mediana se dan como un <strong>intervalo</strong> (intervalo
          modal e intervalo mediano) y la media es <strong>aproximada</strong>: se usa la marca de clase como si todos los datos del intervalo valieran eso.
        </p>
      </Callout>

      <div className="table-wrap">
        <table className="freq-table">
          <thead>
            <tr>
              <th>Intervalo</th>
              <th>Marca (x)</th>
              <th>f</th>
              <th>FA</th>
              <th>x · f</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="fc fc--label">{r.label}</td>
                <Cell_><span className="fc--num">{fmt(r.mark, 1)}</span></Cell_>
                <Cell_><span className="fc--num">{r.f}</span></Cell_>
                <Cell_><span className="fc--num">{r.fa}</span></Cell_>
                <Cell_><span className="fc--num">{fmt(r.xf, 1)}</span></Cell_>
              </tr>
            ))}
            <tr>
              <td className="fc fc--total">Total</td>
              <td className="fc fc--total" />
              <td className="fc fc--total fc--num">{m.n}</td>
              <td className="fc fc--total" />
              <td className="fc fc--total fc--num">{fmt(m.sumXf, 1)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 className="charts-title">Calculá las tres medidas</h4>
      <div className="practice-grid">
        <PracticeCard label="Intervalo modal" definition="El intervalo con mayor frecuencia absoluta (f)." kind="select" options={labels} expected={modal.label}>
          <p>
            Buscamos la f más grande de la columna: <strong>{modal.f}</strong>. Corresponde al intervalo <strong>{modal.label}</strong> {set.unit}.
          </p>
        </PracticeCard>

        <PracticeCard label="Intervalo mediano" definition="El intervalo donde se alcanza la mitad de los datos (n ÷ 2) en la FA." kind="select" options={labels} expected={med.label}>
          <p>
            n ÷ 2 = {m.n} ÷ 2 = <strong>{m.n / 2}</strong>. Buscamos la primera FA que llega a {m.n / 2} o lo supera.
          </p>
          <p>
            Arriba queda FA = {prevFa} (no alcanza) y en este intervalo FA = <strong>{med.fa}</strong>. Entonces el intervalo mediano es <strong>{med.label}</strong> {set.unit}.
          </p>
        </PracticeCard>

        <PracticeCard label="Media aproximada (x̄)" definition="Se multiplica cada marca de clase por su f, se suma todo y se divide por n." expected={m.mean} unit={set.unit}>
          <p className="formula">x̄ ≈ Σ (x · f) ÷ n</p>
          <p>
            Σ (x · f) = {fmt(m.sumXf, 1)} (último valor de la columna x · f). x̄ ≈ {fmt(m.sumXf, 1)} ÷ {m.n} = <strong>{fmt(m.mean, 2)}</strong> {set.unit}.
          </p>
        </PracticeCard>
      </div>
    </div>
  );
}

function MeasuresNotes() {
  return (
    <Callout title="¿Cuándo conviene cada una?" tone="tip">
      <ul className="def-list">
        <li><strong>Moda:</strong> es la única que sirve también con variables cualitativas (el deporte más elegido, el color más común).</li>
        <li><strong>Mediana:</strong> no se altera por valores muy chicos o muy grandes; deja el 50 % de los datos a cada lado.</li>
        <li><strong>Media:</strong> usa todos los datos, por eso un valor extremo la mueve mucho.</li>
      </ul>
      <p>Pueden dar valores distintos: cada una resume los datos de una manera diferente.</p>
    </Callout>
  );
}

export default function Measures() {
  const [mode, setMode] = useState("sueltos");
  const [sIdx, setSIdx] = useState(0);
  const [gIdx, setGIdx] = useState(0);
  return (
    <>
      <div className="seg" role="group" aria-label="Tipo de datos">
        <button className={`seg__btn ${mode === "sueltos" ? "seg__btn--active" : ""}`} onClick={() => setMode("sueltos")}>
          Datos sueltos
        </button>
        <button className={`seg__btn ${mode === "agrupados" ? "seg__btn--active" : ""}`} onClick={() => setMode("agrupados")}>
          Datos agrupados
        </button>
      </div>
      {mode === "sueltos" ? (
        <UngroupedMeasures key={`s${sIdx}`} set={NUMERIC_SETS[sIdx]} onCycle={() => setSIdx((i) => (i + 1) % NUMERIC_SETS.length)} />
      ) : (
        <GroupedMeasuresView key={`g${gIdx}`} set={GROUPED_SETS[gIdx]} onCycle={() => setGIdx((i) => (i + 1) % GROUPED_SETS.length)} />
      )}
    </>
  );
}
