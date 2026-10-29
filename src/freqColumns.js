import { fmt } from "./stats.js";

/* Qué significa cada columna de la tabla y cómo se calcula. Lo usan la práctica de tablas y la hoja de fórmulas. */

export const COLUMNS = {
  mark: {
    head: "Marca de clase",
    short: "marca",
    name: "Marca de clase",
    meaning: "Es el punto medio del intervalo: el número que lo representa.",
    formula: "marca = (límite inferior + límite superior) ÷ 2",
    width: 56,
    tol: 0.01,
    expected: (r) => r.mark,
    show: (r) => fmt(r.mark, 1),
    example: (r) => `(${r.lo} + ${r.hi}) ÷ 2 = ${fmt(r.mark, 1)}`,
  },
  f: {
    head: "f",
    short: "f",
    name: "Frecuencia absoluta (f)",
    meaning: "Cuántas veces aparece cada valor (o cuántos datos caen en cada intervalo). Todas las f juntas dan n, el total de datos.",
    formula: "f = cantidad de veces que aparece",
    width: 48,
    tol: 0,
    expected: (r) => r.f,
    show: (r) => String(r.f),
    example: (r, { grouped }) =>
      grouped
        ? `Contá cuántos datos están en ${r.label} (el límite inferior entra, el superior no): f = ${r.f}`
        : `Contá cuántas veces aparece "${r.label}" en los datos: f = ${r.f}`,
  },
  fr: {
    head: "fr",
    short: "fr",
    name: "Frecuencia relativa (fr)",
    meaning: "Qué parte del total representa cada fila. Es un número decimal entre 0 y 1; todas las fr juntas dan 1.",
    formula: "fr = f ÷ n",
    width: 56,
    tol: 0.005,
    expected: (r) => r.fr,
    show: (r) => fmt(r.fr, 3),
    example: (r, { n }) => `fr = f ÷ n = ${r.f} ÷ ${n} = ${fmt(r.fr, 3)}`,
  },
  frp: {
    head: "fr %",
    short: "fr %",
    name: "Frecuencia relativa porcentual (fr %)",
    meaning: "Lo mismo que fr pero expresado en porcentaje. Todas las fr % juntas dan 100 %.",
    formula: "fr % = fr × 100",
    width: 52,
    tol: 0.5,
    suffix: "%",
    expected: (r) => r.frp,
    show: (r) => fmt(r.frp, 2),
    example: (r) => `fr % = fr × 100 = ${fmt(r.fr, 3)} × 100 = ${fmt(r.frp, 2)} %`,
  },
  fa: {
    head: "FA",
    short: "FA",
    name: "Frecuencia acumulada (FA)",
    meaning: "Cuántos datos hay hasta esa fila inclusive. Se arma sumando: a la FA de la fila de arriba se le suma la f de esta fila. La última FA tiene que dar n.",
    formula: "FA = FA de la fila anterior + f de esta fila",
    width: 48,
    tol: 0,
    expected: (r) => r.fa,
    show: (r) => String(r.fa),
    example: (r, { idx, prev }) => (idx === 0 ? `En la primera fila FA = f = ${r.fa}` : `FA = ${prev.fa} + ${r.f} = ${r.fa}`),
  },
};

/** Orden de las columnas según el tipo de conjunto. La FA no tiene sentido si las categorías no se pueden ordenar. */
export function columnsFor({ grouped, kind }) {
  if (grouped) return ["mark", "f", "fr", "frp", "fa"];
  return kind === "cualitativa" ? ["f", "fr", "frp"] : ["f", "fr", "frp", "fa"];
}

/** ¿La respuesta del estudiante coincide con la fila? */
export function isCorrect(col, rawValue, row, parse) {
  const spec = COLUMNS[col];
  const v = parse(rawValue);
  return Number.isFinite(v) && Math.abs(v - spec.expected(row)) <= spec.tol + 1e-9;
}
