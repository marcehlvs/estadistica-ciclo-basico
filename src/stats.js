/* ---------------------------------------------------------------- */
/* Estadística descriptiva · 3.º año                                  */
/*                                                                    */
/* Temas: tabla de frecuencias (f, fr, fr %, FA), gráficos (barras,    */
/* circular, histograma, polígono) y medidas (moda, mediana, media).   */
/* ---------------------------------------------------------------- */

/* ---------- Utilidades de número ---------- */

export function round(x, d = 2) {
  const f = 10 ** d;
  return Math.round(x * f) / f;
}

/** Número para mostrarle al estudiante, con coma decimal y sin separador de miles (así puede tipearlo igual). */
export function fmt(x, d = 2) {
  return String(round(x, d)).replace(".", ",");
}

/** Lee lo que escribió el estudiante ("12,5", "45 %", "") → número o NaN. */
export function parseNum(raw) {
  const s = String(raw ?? "").replace("%", "").replace(",", ".").trim();
  return s === "" ? NaN : Number(s);
}

/** Margen de error aceptado por redondeos hechos a mano: 0,3 % del valor, mínimo 0,05. */
export function tolFor(v) {
  return Math.max(0.05, Math.abs(v) * 0.003);
}

/* ---------- Azar con semilla (misma semilla → mismos datos) ---------- */

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Entero al azar entre lo y hi, ambos incluidos. */
export function randInt(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/** Elige un valor según pesos. */
export function weighted(rng, values, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < values.length; i++) {
    r -= weights[i];
    if (r < 0) return values[i];
  }
  return values[values.length - 1];
}

/* ---------- Armar datos a partir de frecuencias conocidas ---------- */

/** [[valor, cantidad], ...] → lista de datos mezclada (como si se hubieran relevado en desorden). */
export function expandCounts(counts, seed) {
  const data = counts.flatMap(([v, c]) => Array(c).fill(v));
  return shuffle(data, mulberry32(seed));
}

/** Intervalos [lo, hi) con ancho fijo. */
export function makeIntervals(start, width, k) {
  return Array.from({ length: k }, (_, i) => ({ lo: start + i * width, hi: start + (i + 1) * width }));
}

/** Datos enteros que caen exactamente `counts[i]` veces en el intervalo i (cada intervalo es [lo, hi)). */
export function expandIntervals(intervals, counts, seed) {
  const rng = mulberry32(seed);
  const data = [];
  intervals.forEach(({ lo, hi }, i) => {
    for (let j = 0; j < counts[i]; j++) data.push(randInt(rng, lo, hi - 1));
  });
  return shuffle(data, rng);
}

/* ---------- Tabla de frecuencias · datos sueltos ---------- */

/**
 * Una fila por cada valor (o categoría).
 *   f    frecuencia absoluta      cuántas veces aparece
 *   fr   frecuencia relativa      f / n            (decimal)
 *   frp  frecuencia relativa %    fr · 100
 *   fa   frecuencia acumulada     suma de las f hasta esa fila
 *   angle ángulo del sector circular  fr · 360°
 * `order` fija el orden de las categorías; si no se da, se ordenan los valores de menor a mayor.
 */
export function freqTable(data, order) {
  const n = data.length;
  const values = order ?? [...new Set(data)].sort((a, b) => a - b);
  let fa = 0;
  return values.map((v) => {
    const f = data.filter((x) => x === v).length;
    fa += f;
    return {
      label: String(v),
      value: v,
      f,
      fr: round(f / n, 4),
      frp: round((f / n) * 100, 2),
      fa,
      angle: round((f / n) * 360, 1),
    };
  });
}

/* ---------- Tabla de frecuencias · datos agrupados ---------- */

/** Intervalos [lo, hi): el límite inferior entra, el superior no. */
export function groupedTable(data, intervals) {
  const n = data.length;
  let fa = 0;
  return intervals.map(({ lo, hi }) => {
    const f = data.filter((x) => x >= lo && x < hi).length;
    fa += f;
    const mark = (lo + hi) / 2;
    return {
      lo,
      hi,
      label: `[${lo} - ${hi})`,
      mark,
      f,
      fr: round(f / n, 4),
      frp: round((f / n) * 100, 2),
      fa,
      xf: mark * f,
    };
  });
}

/* ---------- Moda, mediana y media · datos sueltos ---------- */

export function computeStats(data) {
  const n = data.length;
  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const mid = Math.floor(n / 2);
  const medianPos = n % 2 === 0 ? [mid - 1, mid] : [mid]; // posiciones (desde 0) de los datos centrales
  const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const freq = new Map();
  data.forEach((x) => freq.set(x, (freq.get(x) || 0) + 1));
  const maxFreq = Math.max(...freq.values());
  const modes = [...freq.entries()]
    .filter(([, c]) => c === maxFreq)
    .map(([v]) => v)
    .sort((a, b) => a - b);
  return { n, sorted, sum, mean, median, medianPos, modes, maxFreq };
}

/* ---------- Moda, mediana y media · datos agrupados ---------- */

/**
 * A partir de la tabla agrupada:
 *   intervalo modal   → el de mayor f
 *   intervalo mediano → el primero cuya FA llega a n/2
 *   media aproximada  → Σ(marca · f) / n
 */
export function groupedMeasures(rows) {
  const n = rows[rows.length - 1].fa;
  const maxF = Math.max(...rows.map((r) => r.f));
  const modalIdx = rows.findIndex((r) => r.f === maxF);
  const modalTied = rows.filter((r) => r.f === maxF).length > 1;
  const medianIdx = rows.findIndex((r) => r.fa >= n / 2);
  const medianAmbiguous = rows.some((r) => r.fa === n / 2); // la mediana cae justo entre dos intervalos
  const sumXf = rows.reduce((a, r) => a + r.xf, 0);
  return { n, modalIdx, modalTied, medianIdx, medianAmbiguous, sumXf, mean: sumXf / n };
}

/* ---------------------------------------------------------------- */
/* Generador de ejercicios para el modo evaluación                     */
/* ---------------------------------------------------------------- */

/** Cantidades de datos "amigables": n divide a 1000, así fr y la media tienen como mucho 3 decimales exactos (sin periódicos). */
export const FRIENDLY_N = [20, 25, 40, 50];

const UNGROUPED_THEMES = [
  {
    title: "Hermanos y hermanas",
    prompt: (n) => `Se relevó a ${n} estudiantes de 3.º año: ¿cuántos hermanos o hermanas tiene cada uno?`,
    unit: "hermanos/as",
    values: [0, 1, 2, 3, 4, 5],
    weights: [10, 32, 28, 16, 9, 5],
  },
  {
    title: "Goles por partido",
    prompt: (n) => `Goles convertidos por el equipo del colegio en ${n} partidos del torneo intercolegial.`,
    unit: "goles",
    values: [0, 1, 2, 3, 4, 5],
    weights: [14, 30, 25, 17, 9, 5],
  },
  {
    title: "Libros leídos en el año",
    prompt: (n) => `Cantidad de libros que leyeron durante el año ${n} estudiantes de 3.º año.`,
    unit: "libros",
    values: [0, 1, 2, 3, 4, 5],
    weights: [8, 20, 28, 22, 14, 8],
  },
  {
    title: "Aciertos en una prueba",
    prompt: (n) => `Respuestas correctas (de 8 preguntas) de ${n} estudiantes en una prueba de opción múltiple.`,
    unit: "aciertos",
    values: [3, 4, 5, 6, 7, 8],
    weights: [6, 12, 20, 26, 22, 14],
  },
];

const GROUPED_THEMES = [
  {
    title: "Estaturas de estudiantes",
    prompt: (n) => `Estaturas (en cm) de ${n} estudiantes de 3.º año. Los intervalos ya están armados.`,
    unit: "cm",
    start: 145,
    width: 5,
    weights: [3, 10, 20, 24, 18, 9, 3],
  },
  {
    title: "Tiempo de viaje a la escuela",
    prompt: (n) => `Minutos que tardan en llegar a la escuela ${n} estudiantes. Los intervalos ya están armados.`,
    unit: "minutos",
    start: 0,
    width: 10,
    weights: [8, 24, 28, 20, 12, 8],
  },
  {
    title: "Edades de los socios de un club",
    prompt: (n) => `Edades (en años) de ${n} socios de un club de barrio. Los intervalos ya están armados.`,
    unit: "años",
    start: 10,
    width: 5,
    weights: [16, 26, 22, 16, 12, 8],
  },
  {
    title: "Puntajes en un juego",
    prompt: (n) => `Puntos obtenidos por ${n} participantes en un juego de la feria de ciencias. Los intervalos ya están armados.`,
    unit: "puntos",
    start: 20,
    width: 10,
    weights: [6, 14, 26, 28, 16, 10],
  },
];

/** Ejercicio 1 · datos sueltos (variable discreta). Moda única y entre 4 y 6 valores distintos. */
export function makeUngroupedExercise(seed) {
  const theme = UNGROUPED_THEMES[(seed - 1 + UNGROUPED_THEMES.length * 1000) % UNGROUPED_THEMES.length];
  const n = FRIENDLY_N[(seed - 1 + FRIENDLY_N.length * 1000) % FRIENDLY_N.length];
  for (let attempt = 0; attempt < 500; attempt++) {
    const rng = mulberry32(seed * 7919 + attempt);
    const data = Array.from({ length: n }, () => weighted(rng, theme.values, theme.weights));
    const st = computeStats(data);
    const distinct = new Set(data).size;
    if (st.modes.length === 1 && distinct >= 4) {
      return { title: theme.title, prompt: theme.prompt(n), unit: theme.unit, data };
    }
  }
  throw new Error("No se pudo generar el ejercicio de datos sueltos");
}

/**
 * Ejercicio 2 · datos agrupados con intervalos YA armados (no hay que calcularlos).
 * Condiciones para que la corrección no sea ambigua: ningún intervalo vacío,
 * una única clase modal y ninguna FA exactamente igual a n/2.
 */
export function makeGroupedExercise(seed) {
  const theme = GROUPED_THEMES[(seed * 3 + 1000) % GROUPED_THEMES.length];
  const n = [40, 50][seed % 2];
  const intervals = makeIntervals(theme.start, theme.width, theme.weights.length);
  for (let attempt = 0; attempt < 800; attempt++) {
    const rng = mulberry32(seed * 104729 + attempt);
    const idxs = theme.weights.map((_, i) => i);
    const counts = Array(idxs.length).fill(0);
    for (let i = 0; i < n; i++) counts[weighted(rng, idxs, theme.weights)]++;
    const data = expandIntervals(intervals, counts, seed * 31 + attempt);
    const rows = groupedTable(data, intervals);
    const m = groupedMeasures(rows);
    if (rows.every((r) => r.f > 0) && !m.modalTied && !m.medianAmbiguous) {
      return { title: theme.title, prompt: theme.prompt(n), unit: theme.unit, data, intervals };
    }
  }
  throw new Error("No se pudo generar el ejercicio de datos agrupados");
}

export { GROUPED_THEMES, UNGROUPED_THEMES };
