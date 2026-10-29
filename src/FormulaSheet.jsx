import { Printer } from "lucide-react";

/* Hoja de fórmulas imprimible. Solo contenido estático: sin estado ni componentes anidados. */

const SECCIONES = [
  {
    titulo: "Vocabulario",
    items: [
      ["Población y muestra", "Población: todo lo que se estudia. Muestra: la parte que se consulta."],
      ["Variable", "Cualitativa (categorías) · cuantitativa discreta (se cuenta) · cuantitativa continua (se mide)."],
      ["n", "Cantidad total de datos."],
    ],
  },
  {
    titulo: "Tabla de frecuencias",
    items: [
      ["f · frecuencia absoluta", "Cuántas veces aparece el valor. Σf = n"],
      ["fr · frecuencia relativa", "fr = f ÷ n (decimal entre 0 y 1). Σfr = 1"],
      ["fr % · relativa porcentual", "fr % = fr × 100. Σfr % = 100 %"],
      ["FA · frecuencia acumulada", "FA = FA de la fila anterior + f. La última FA es n."],
    ],
  },
  {
    titulo: "Datos agrupados en intervalos",
    items: [
      ["Intervalo [a - b)", "El límite inferior a entra; el superior b no entra."],
      ["Amplitud", "Ancho del intervalo: b − a."],
      ["Marca de clase", "x = (límite inferior + límite superior) ÷ 2"],
    ],
  },
  {
    titulo: "Moda, mediana y media",
    items: [
      ["Moda (Mo)", "El valor de mayor f. Puede haber más de una. Sirve también para variables cualitativas."],
      ["Mediana (Me)", "Con los datos ordenados: el valor central (n impar) o el promedio de los dos centrales (n par)."],
      ["Media (x̄)", "x̄ = Σ x ÷ n. Con frecuencias: x̄ = Σ (x · f) ÷ n"],
      ["Datos agrupados", "Intervalo modal: el de mayor f. Intervalo mediano: primero con FA ≥ n ÷ 2. Media aproximada: x̄ ≈ Σ (marca · f) ÷ n"],
    ],
  },
  {
    titulo: "Gráficos",
    items: [
      ["Barras", "Barras separadas; la altura es f. Para variables cualitativas o discretas."],
      ["Circular", "Cada sector es proporcional a fr. Ángulo = fr × 360°"],
      ["Histograma", "Barras pegadas para datos agrupados; la altura es f."],
      ["Polígono de frecuencias", "Une las marcas de clase (a la altura de f) y se cierra en 0 con un intervalo vacío a cada lado."],
    ],
  },
];

export default function FormulaSheet() {
  return (
    <div className="formula-sheet">
      <div className="formula-sheet__bar no-print">
        <h3 className="ex-title">Hoja de fórmulas</h3>
        <button className="btn btn--primary" onClick={() => window.print()}>
          <Printer size={14} /> imprimir / guardar PDF
        </button>
      </div>
      <h2 className="formula-sheet__print-title">Estadística · hoja de fórmulas</h2>
      <div className="formula-cols">
        {SECCIONES.map((s) => (
          <section className="formula-block" key={s.titulo}>
            <h4>{s.titulo}</h4>
            <dl>
              {s.items.map(([k, v]) => (
                <div className="formula-row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
