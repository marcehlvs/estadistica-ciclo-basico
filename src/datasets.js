import { expandCounts, expandIntervals, makeIntervals } from "./stats.js";

/* Conjuntos de práctica. Se definen por sus frecuencias (así n es "amigable": 20, 25, 40 o 50,
   y fr / fr % dan exactos) y los datos crudos se arman mezclados, como si se hubieran relevado en desorden. */

/**
 * Datos sueltos.
 *   kind "cualitativa" → categorías (no se pueden ordenar: no tiene sentido la FA)
 *   kind "discreta"    → valores numéricos (0, 1, 2…): tienen FA, moda, mediana y media
 */
const FREQ_DEFS = [
  {
    id: "transporte",
    kind: "cualitativa",
    title: "¿Cómo llegás a la escuela?",
    prompt: "Se le preguntó a 20 estudiantes de 3.º año: ¿cómo llegás a la escuela?",
    variable: "Medio de transporte",
    unit: "",
    counts: [["Colectivo", 8], ["A pie", 5], ["Bicicleta", 4], ["Auto", 3]],
    seed: 11,
  },
  {
    id: "materia",
    kind: "cualitativa",
    title: "Materia favorita",
    prompt: "Se le preguntó a 25 estudiantes de 3.º año cuál es su materia favorita.",
    variable: "Materia favorita",
    unit: "",
    counts: [["Educación Física", 9], ["Matemática", 5], ["Lengua", 4], ["Historia", 4], ["Tecnología", 3]],
    seed: 12,
  },
  {
    id: "hermanos",
    kind: "discreta",
    title: "Hermanos y hermanas",
    prompt: "Se le preguntó a 20 estudiantes de 3.º año: ¿cuántos hermanos o hermanas tenés?",
    variable: "Cantidad de hermanos/as",
    unit: "hermanos/as",
    counts: [[0, 3], [1, 7], [2, 6], [3, 3], [4, 1]],
    seed: 13,
  },
  {
    id: "goles",
    kind: "discreta",
    title: "Goles por partido",
    prompt: "Goles que convirtió el equipo del colegio en cada uno de sus últimos 25 partidos.",
    variable: "Goles por partido",
    unit: "goles",
    counts: [[0, 4], [1, 8], [2, 7], [3, 4], [4, 2]],
    seed: 14,
  },
  {
    id: "libros",
    kind: "discreta",
    title: "Libros leídos en el año",
    prompt: "Cantidad de libros que leyeron durante el año 40 estudiantes de 3.º año.",
    variable: "Libros leídos",
    unit: "libros",
    counts: [[0, 6], [1, 10], [2, 12], [3, 8], [4, 4]],
    seed: 15,
  },
];

export const FREQ_SETS = FREQ_DEFS.map((d) => ({
  ...d,
  order: d.counts.map(([v]) => v), // categorías en el orden en que se presentan
  data: expandCounts(d.counts, d.seed),
}));

/** Solo las de variable numérica (las que admiten mediana y media). */
export const NUMERIC_SETS = FREQ_SETS.filter((s) => s.kind === "discreta");

/**
 * Datos agrupados en intervalos [lo, hi). Los intervalos vienen dados: lo que se practica es armar
 * la tabla y leerla, no decidir cuántos intervalos usar.
 */
const GROUPED_DEFS = [
  {
    id: "estaturas",
    title: "Estaturas del curso",
    prompt: "Estaturas (en cm) de 40 estudiantes de 3.º año.",
    unit: "cm",
    start: 150,
    width: 5,
    counts: [3, 7, 12, 10, 6, 2],
    seed: 21,
  },
  {
    id: "viaje",
    title: "Tiempo de viaje a la escuela",
    prompt: "Minutos que tardan en llegar a la escuela 50 estudiantes.",
    unit: "minutos",
    start: 0,
    width: 10,
    counts: [4, 12, 16, 10, 6, 2],
    seed: 22,
  },
  {
    id: "edades",
    title: "Edades de los socios de un club",
    prompt: "Edades (en años) de 40 socios de un club de barrio.",
    unit: "años",
    start: 10,
    width: 5,
    counts: [6, 12, 8, 7, 5, 2],
    seed: 23,
  },
];

export const GROUPED_SETS = GROUPED_DEFS.map((d) => {
  const intervals = makeIntervals(d.start, d.width, d.counts.length);
  return { ...d, intervals, data: expandIntervals(intervals, d.counts, d.seed) };
});
