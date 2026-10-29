import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { fmt } from "./stats.js";

/* Componentes compartidos por App, GroupedMeasures y Evaluation. */

export function Cell_({ children, state }) {
  return (
    <td className={`fc ${state === "ok" ? "fc--ok" : state === "bad" ? "fc--bad" : ""}`}>
      {children}
    </td>
  );
}

/**
 * hint     (opcional): si la respuesta está mal, muestra "= valor correcto".
 * disabled (opcional): bloquea el campo (se usa al entregar la evaluación).
 */
export function AnswerInput({ value, onChange, state, width = 64, suffix, hint, disabled = false }) {
  return (
    <span className="ans-wrap">
      <input
        type="text"
        className={`ans-input ${state === "ok" ? "ans-input--ok" : state === "bad" ? "ans-input--bad" : ""}`}
        style={{ width }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        disabled={disabled}
      />
      {suffix && <span className="ans-suffix">{suffix}</span>}
      {state === "ok" && <Check size={14} className="ans-icon ans-icon--ok" />}
      {state === "bad" && <X size={14} className="ans-icon ans-icon--bad" />}
      {state === "bad" && hint !== undefined && <span className="ans-hint">= {typeof hint === "number" ? fmt(hint, 6) : hint}</span>}
    </span>
  );
}

export function MeasureCard({ label, formula, value, unit, children, open, onToggle }) {
  return (
    <div className="measure-card">
      <div className="measure-card__head" onClick={onToggle}>
        <div>
          <div className="measure-card__label">{label}</div>
          <div className="measure-card__value">
            {value} <span className="measure-card__unit">{unit}</span>
          </div>
        </div>
        <span className="measure-card__toggle">{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div className="measure-card__body">
          <div className="measure-card__formula">{formula}</div>
          {children}
        </div>
      )}
    </div>
  );
}

/** Datos relevados, con scroll y botón para ordenarlos (útil con muchos datos). */
export function DataBox({ label, data }) {
  const [sorted, setSorted] = useState(false);
  const shown = useMemo(
    () => (sorted ? [...data].sort((a, b) => (typeof a === "number" ? a - b : String(a).localeCompare(String(b), "es"))) : data),
    [sorted, data],
  );
  return (
    <div className="raw-data">
      <div className="raw-data__toolbar">
        <span className="raw-data__label">
          {label} (n = {data.length}):
        </span>
        <button className="btn btn--ghost" onClick={() => setSorted((v) => !v)}>
          {sorted ? "ver como se relevaron" : "ordenar de menor a mayor"}
        </button>
      </div>
      <div className="raw-data__chips raw-data__chips--scroll">
        {shown.map((v, i) => (
          <span className="chip" key={i}>{v}</span>
        ))}
      </div>
    </div>
  );
}

/** Cuadro de ayuda (definiciones, pistas, "¿sabías que?"). tone: "info" | "tip" | "warn" */
export function Callout({ title, tone = "info", children }) {
  return (
    <div className={`callout callout--${tone}`}>
      {title && <div className="callout__title">{title}</div>}
      <div className="callout__body">{children}</div>
    </div>
  );
}

/**
 * Opción múltiple (una sola respuesta).
 *   options: [{ id, text }]   correct: id correcto (solo se usa para pintar cuando state está definido)
 */
export function Choice({ name, options, value, onChange, correct, checked = false, disabled = false }) {
  return (
    <div className="choice">
      {options.map((o) => {
        const picked = value === o.id;
        const cls = checked ? (o.id === correct ? "choice__opt--ok" : picked ? "choice__opt--bad" : "") : "";
        return (
          <label key={o.id} className={`choice__opt ${cls}`}>
            <input type="radio" name={name} checked={picked} disabled={disabled} onChange={() => onChange(o.id)} />
            <span>{o.text}</span>
          </label>
        );
      })}
    </div>
  );
}

/** Lista desplegable para elegir un intervalo (o cualquier opción de texto). */
export function PickSelect({ value, onChange, options, state, disabled = false, hint }) {
  return (
    <span className="ans-wrap">
      <select
        className={`pct-select ${state === "ok" ? "pct-select--ok" : state === "bad" ? "pct-select--bad" : ""}`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">elegí…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {state === "ok" && <Check size={14} className="ans-icon ans-icon--ok" />}
      {state === "bad" && <X size={14} className="ans-icon ans-icon--bad" />}
      {state === "bad" && hint !== undefined && <span className="ans-hint">= {hint}</span>}
    </span>
  );
}
