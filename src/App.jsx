import { useState } from "react";

import { FREQ_SETS, GROUPED_SETS } from "./datasets.js";
import Intro from "./Intro.jsx";
import FreqTable from "./FreqTable.jsx";
import Measures from "./Measures.jsx";
import Evaluation from "./Evaluation.jsx";
import FormulaSheet from "./FormulaSheet.jsx";
import Progress from "./Progress.jsx";
import Groups from "./Groups.jsx";
import "./board.css";
import "./extras.css";

/* Estadística desde cero · 3.º año.
   Recorrido: 1 conceptos → 2 tabla y gráficos con datos sueltos → 3 tabla y gráficos con datos agrupados
   → 4 moda, mediana y media → 5 evaluación. Las pestañas 6 a 8 son herramientas de apoyo. */

const TABS = [
  ["intro", "1 · ¿Qué es la estadística?"],
  ["sueltos", "2 · Datos sueltos"],
  ["agrupados", "3 · Datos agrupados"],
  ["medidas", "4 · Moda, mediana y media"],
  ["evaluacion", "5 · Modo evaluación"],
  ["formulas", "6 · Hoja de fórmulas"],
  ["progreso", "7 · Mi progreso"],
  ["grupos", "8 · Armar grupos"],
];

function ChalkTab({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`chalk-tab ${active ? "chalk-tab--active" : ""}`} aria-current={active ? "page" : undefined}>
      {children}
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState("intro");
  const [freqIdx, setFreqIdx] = useState(0);
  const [groupedIdx, setGroupedIdx] = useState(0);

  return (
    <div className="board-app">
      <div className="board-header">
        <h1 className="board-title">Estadística desde cero</h1>
        <p className="board-subtitle">3.º año — tablas de frecuencia, gráficos y medidas</p>
      </div>

      <div className="tabs-row">
        {TABS.map(([id, text]) => (
          <ChalkTab key={id} active={tab === id} onClick={() => setTab(id)}>
            {text}
          </ChalkTab>
        ))}
      </div>

      <div className="paper">
        {tab === "intro" && <Intro goTo={setTab} />}
        {tab === "sueltos" && (
          <FreqTable
            key={`sueltos-${freqIdx}`}
            set={FREQ_SETS[freqIdx]}
            onCycle={() => setFreqIdx((i) => (i + 1) % FREQ_SETS.length)}
          />
        )}
        {tab === "agrupados" && (
          <FreqTable
            key={`agrupados-${groupedIdx}`}
            grouped
            set={GROUPED_SETS[groupedIdx]}
            onCycle={() => setGroupedIdx((i) => (i + 1) % GROUPED_SETS.length)}
          />
        )}
        {tab === "medidas" && <Measures />}
        {tab === "evaluacion" && <Evaluation />}
        {tab === "formulas" && <FormulaSheet />}
        {tab === "progreso" && <Progress />}
        {tab === "grupos" && <Groups />}
      </div>
    </div>
  );
}
