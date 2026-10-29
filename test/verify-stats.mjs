// Verifica los datos fijos y el generador de evaluaciones de 3.º año con miles de semillas.
// Uso: npm test   (o: node test/verify-stats.mjs)
import {
  FRIENDLY_N, tolFor, computeStats, freqTable, groupedMeasures, groupedTable,
  makeGroupedExercise, makeUngroupedExercise, round,
} from "../src/stats.js";
import { FREQ_SETS, GROUPED_SETS, NUMERIC_SETS } from "../src/datasets.js";

const fails = [];
const bad = (where, msg) => fails.push(`${where}: ${msg}`);
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/* ---------- Conjuntos fijos ---------- */
for (const s of FREQ_SETS) {
  const n = s.data.length;
  if (!FRIENDLY_N.includes(n)) bad(s.id, `n = ${n} no es amigable (${FRIENDLY_N})`);
  const t = freqTable(s.data, s.order);
  s.counts.forEach(([v, c], i) => t[i].f !== c && bad(s.id, `f de "${v}" = ${t[i].f}, esperado ${c}`));
  if (t[t.length - 1].fa !== n) bad(s.id, "la última FA no da n");
  if (!near(t.reduce((a, r) => a + r.fr, 0), 1, 1e-6)) bad(s.id, "Σfr ≠ 1");
  if (!near(t.reduce((a, r) => a + r.frp, 0), 100, 1e-6)) bad(s.id, "Σfr % ≠ 100");
  if (!near(t.reduce((a, r) => a + r.angle, 0), 360, 0.2)) bad(s.id, "Σángulos ≠ 360°");
}
for (const s of NUMERIC_SETS) {
  const st = computeStats(s.data);
  if (st.modes.length !== 1) bad(s.id, "la moda no es única");
  if (!near(round(st.mean, 3), st.mean, 1e-9)) bad(s.id, "la media tiene más de 3 decimales (periódica)");
  if (Math.abs(round(st.mean, 2) - st.mean) > tolFor(st.mean)) bad(s.id, "redondear la media a 2 decimales no entra en la tolerancia");
}
for (const s of GROUPED_SETS) {
  const n = s.data.length;
  if (!FRIENDLY_N.includes(n)) bad(s.id, `n = ${n} no es amigable`);
  const rows = groupedTable(s.data, s.intervals);
  s.counts.forEach((c, i) => rows[i].f !== c && bad(s.id, `f del intervalo ${i} = ${rows[i].f}, esperado ${c}`));
  const m = groupedMeasures(rows);
  if (m.modalTied) bad(s.id, "hay dos intervalos modales");
  if (m.medianAmbiguous) bad(s.id, "FA = n/2 exacto: la mediana cae entre dos intervalos");
  const lo = s.intervals[0].lo;
  const hi = s.intervals[s.intervals.length - 1].hi;
  if (s.data.some((x) => x < lo || x >= hi)) bad(s.id, "hay datos fuera de los intervalos");
}

/* ---------- Generador de evaluaciones ---------- */
const SEEDS = 3000;
const seenN = new Set();
for (let seed = 1; seed <= SEEDS; seed++) {
  const w = `ej.1 semilla ${seed}`;
  let A;
  try { A = makeUngroupedExercise(seed); } catch (e) { bad(w, e.message); continue; }
  if (JSON.stringify(A) !== JSON.stringify(makeUngroupedExercise(seed))) bad(w, "misma semilla, distinto ejercicio");
  const n = A.data.length;
  seenN.add(n);
  if (!FRIENDLY_N.includes(n)) bad(w, `n = ${n}`);
  const st = computeStats(A.data);
  const t = freqTable(A.data);
  if (st.modes.length !== 1) bad(w, "moda no única");
  if (t.length < 4 || t.length > 6) bad(w, `${t.length} filas`);
  if (t[t.length - 1].fa !== n) bad(w, "última FA ≠ n");
  if (!near(round(st.mean, 3), st.mean, 1e-9)) bad(w, "media periódica (más de 3 decimales)");
  if (Math.abs(round(st.mean, 2) - st.mean) > tolFor(st.mean)) bad(w, "redondear la media a 2 decimales no entra en la tolerancia");
  // mediana "a mano": posición(es) central(es) sobre los datos ordenados
  const s = [...A.data].sort((a, b) => a - b);
  const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  if (!near(med, st.median)) bad(w, "mediana mal calculada");

  const wb = `ej.2 semilla ${seed}`;
  let B;
  try { B = makeGroupedExercise(seed); } catch (e) { bad(wb, e.message); continue; }
  if (JSON.stringify(B) !== JSON.stringify(makeGroupedExercise(seed))) bad(wb, "misma semilla, distinto ejercicio");
  const rows = groupedTable(B.data, B.intervals);
  const m = groupedMeasures(rows);
  const nb = B.data.length;
  if (rows.some((r) => r.f === 0)) bad(wb, "intervalo vacío");
  if (rows.reduce((a, r) => a + r.f, 0) !== nb) bad(wb, "Σf ≠ n (hay datos sin intervalo)");
  if (rows[rows.length - 1].fa !== nb) bad(wb, "última FA ≠ n");
  if (m.modalTied) bad(wb, "dos intervalos modales");
  if (m.medianAmbiguous) bad(wb, "FA = n/2 exacto");
  if (!near(rows.reduce((a, r) => a + r.frp, 0), 100, 1e-6)) bad(wb, "Σfr % ≠ 100");
}
if (seenN.size < FRIENDLY_N.length) bad("generador", `solo aparecieron n = ${[...seenN]}`);

if (fails.length) {
  console.error(`✗ ${fails.length} problemas:\n` + fails.slice(0, 25).join("\n"));
  process.exit(1);
}
console.log(`✓ ${FREQ_SETS.length} conjuntos de datos sueltos, ${GROUPED_SETS.length} agrupados y ${SEEDS} semillas de evaluación verificados.`);
