import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Callout } from "./ui.jsx";

/* Pestaña 1 · Conceptos desde cero: qué es la estadística, tipos de variable, pasos del análisis y qué gráfico usar.
   Los dos mini-juegos son de respuesta inmediata (no se registran en "Mi progreso"). */

const VARIABLE_TYPES = [
  { id: "cual", text: "Cualitativa" },
  { id: "disc", text: "Cuantitativa discreta" },
  { id: "cont", text: "Cuantitativa continua" },
];

const VARIABLE_ITEMS = [
  { id: "v1", text: "Color de pelo de los estudiantes", answer: "cual", why: "Es una cualidad: se responde con una palabra, no con un número." },
  { id: "v2", text: "Cantidad de hermanos o hermanas", answer: "disc", why: "Se cuenta y solo toma valores enteros (0, 1, 2…). No puede haber 1,5 hermanos." },
  { id: "v3", text: "Estatura de los estudiantes", answer: "cont", why: "Se mide y puede tomar cualquier valor dentro de un intervalo (1,62 m; 1,625 m…)." },
  { id: "v4", text: "Equipo de fútbol preferido", answer: "cual", why: "Es una categoría (River, Boca, Racing…), no un número." },
  { id: "v5", text: "Goles por partido", answer: "disc", why: "Se cuentan: 0, 1, 2, 3… No existe “medio gol”." },
  { id: "v6", text: "Tiempo que tarda cada estudiante en llegar a la escuela", answer: "cont", why: "El tiempo se mide y puede tener cualquier valor (12 min, 12,5 min…)." },
  { id: "v7", text: "Cantidad de mascotas en la casa", answer: "disc", why: "Se cuenta con números enteros." },
  { id: "v8", text: "Medio de transporte para ir a la escuela", answer: "cual", why: "Son categorías (colectivo, a pie, auto…)." },
];

const CHART_TYPES = [
  { id: "barras", text: "Gráfico de barras" },
  { id: "circular", text: "Gráfico circular" },
  { id: "histo", text: "Histograma" },
  { id: "poli", text: "Polígono de frecuencias" },
];

const CHART_ITEMS = [
  { id: "g1", text: "Mostrar qué porcentaje del curso eligió cada materia favorita, como partes de un todo.", answer: "circular", why: "El circular muestra cómo se reparte el 100 % entre las categorías." },
  { id: "g2", text: "Comparar cuántos estudiantes tienen 0, 1, 2, 3 o 4 hermanos.", answer: "barras", why: "Cada valor tiene su barra separada; la altura es la frecuencia." },
  { id: "g3", text: "Representar las estaturas de 40 estudiantes agrupadas en intervalos de 5 cm.", answer: "histo", why: "Los datos están agrupados en intervalos: las barras van pegadas." },
  { id: "g4", text: "Unir con una línea los puntos medios de los techos de las barras de un histograma.", answer: "poli", why: "Esa línea cerrada en el eje es el polígono de frecuencias." },
];

function QuickQuiz({ title, items, options }) {
  const [picked, setPicked] = useState({});
  const done = Object.keys(picked).length;
  const score = items.filter((it) => picked[it.id] === it.answer).length;
  return (
    <div className="qq">
      <div className="qq__head">
        <h4 className="charts-title" style={{ margin: 0 }}>{title}</h4>
        <div className="qq__score">
          {score} de {items.length} correctas
          {done > 0 && (
            <button className="btn btn--ghost" onClick={() => setPicked({})}>
              <RotateCcw size={13} /> reiniciar
            </button>
          )}
        </div>
      </div>
      {items.map((it) => {
        const p = picked[it.id];
        return (
          <div className="qq__item" key={it.id}>
            <p className="qq__text">{it.text}</p>
            <div className="qq__opts">
              {options.map((o) => {
                const cls = p ? (o.id === it.answer ? "qq__btn--ok" : o.id === p ? "qq__btn--bad" : "") : "";
                return (
                  <button key={o.id} className={`qq__btn ${cls}`} disabled={!!p} onClick={() => setPicked((s) => ({ ...s, [it.id]: o.id }))}>
                    {o.text}
                  </button>
                );
              })}
            </div>
            {p && (
              <p className={`ex-feedback ${p === it.answer ? "ex-feedback--ok" : "ex-feedback--bad"}`}>
                {p === it.answer ? "¡Correcto! " : "Todavía no. "}
                {it.why}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Intro({ goTo }) {
  return (
    <div className="intro">
      <h3 className="ex-title">¿Qué es la estadística?</h3>
      <p className="intro__p">
        La <strong>estadística</strong> es la parte de la matemática que se ocupa de <strong>recolectar, organizar, representar e interpretar datos</strong>. Con ella
        podemos responder preguntas como: ¿cuántos hermanos tienen en promedio mis compañeros?, ¿cuál es el medio de transporte más usado?, ¿qué estatura es la más común?
      </p>
      <p className="intro__p">
        Cuando solo describimos los datos que tenemos (con tablas, gráficos y números que los resumen) hacemos <strong>análisis descriptivo</strong>. Eso es lo que vas a
        practicar acá.
      </p>

      <h4 className="charts-title">El vocabulario básico</h4>
      <dl className="vocab">
        <div><dt>Población</dt><dd>Todo el conjunto que queremos estudiar. Ej.: todos los estudiantes de 3.º año del colegio.</dd></div>
        <div><dt>Muestra</dt><dd>Una parte de la población, la que realmente se consulta. Ej.: los 20 estudiantes de un curso.</dd></div>
        <div><dt>Individuo</dt><dd>Cada elemento que se estudia. Ej.: cada estudiante.</dd></div>
        <div><dt>Variable</dt><dd>La característica que se estudia. Ej.: cantidad de hermanos.</dd></div>
        <div><dt>Dato</dt><dd>El valor que toma la variable en cada individuo. Ej.: “2 hermanos”.</dd></div>
        <div><dt>n</dt><dd>La cantidad total de datos. Ej.: n = 20.</dd></div>
      </dl>

      <h4 className="charts-title">Tipos de variable</h4>
      <div className="type-grid">
        <div className="type-card">
          <div className="type-card__name">Cualitativa</div>
          <p>Expresa una <strong>cualidad</strong> o categoría (palabras).</p>
          <p className="type-card__ex">Color de pelo, deporte favorito, medio de transporte.</p>
        </div>
        <div className="type-card">
          <div className="type-card__name">Cuantitativa discreta</div>
          <p>Es un número que se <strong>cuenta</strong>: solo valores sueltos, generalmente enteros.</p>
          <p className="type-card__ex">Hermanos, goles, cantidad de mascotas.</p>
        </div>
        <div className="type-card">
          <div className="type-card__name">Cuantitativa continua</div>
          <p>Es un número que se <strong>mide</strong>: puede tomar cualquier valor dentro de un intervalo.</p>
          <p className="type-card__ex">Estatura, peso, tiempo.</p>
        </div>
      </div>
      <QuickQuiz title="Practicá: ¿qué tipo de variable es?" items={VARIABLE_ITEMS} options={VARIABLE_TYPES} />

      <h4 className="charts-title">Los pasos del análisis descriptivo</h4>
      <ol className="steps">
        <li><strong>Recolectar</strong> los datos (encuesta, medición, registro).</li>
        <li>
          <strong>Organizarlos</strong> en una tabla de frecuencias (f, fr, fr %, FA).{" "}
          <button className="link-btn" onClick={() => goTo("sueltos")}>Ir a datos sueltos →</button>{" "}
          <button className="link-btn" onClick={() => goTo("agrupados")}>Ir a datos agrupados →</button>
        </li>
        <li><strong>Representarlos</strong> con un gráfico (barras, circular, histograma, polígono).</li>
        <li>
          <strong>Resumirlos</strong> con un número: moda, mediana o media.{" "}
          <button className="link-btn" onClick={() => goTo("medidas")}>Ir a las medidas →</button>
        </li>
        <li><strong>Interpretar</strong>: responder la pregunta con lo que muestran los datos.</li>
      </ol>

      <h4 className="charts-title">¿Qué gráfico uso?</h4>
      <div className="table-wrap">
        <table className="freq-table freq-table--compact">
          <thead>
            <tr><th>Tipo de datos</th><th>Gráfico</th><th>Idea clave</th></tr>
          </thead>
          <tbody>
            <tr><td className="fc fc--label">Cualitativos o discretos</td><td className="fc">Barras</td><td className="fc">Barras separadas; altura = f</td></tr>
            <tr><td className="fc fc--label">Cualitativos o discretos (partes de un todo)</td><td className="fc">Circular</td><td className="fc">Ángulo = fr × 360°</td></tr>
            <tr><td className="fc fc--label">Agrupados en intervalos</td><td className="fc">Histograma</td><td className="fc">Barras pegadas; altura = f</td></tr>
            <tr><td className="fc fc--label">Agrupados en intervalos</td><td className="fc">Polígono de frecuencias</td><td className="fc">Une las marcas de clase y se cierra en 0</td></tr>
          </tbody>
        </table>
      </div>
      <QuickQuiz title="Practicá: elegí el gráfico" items={CHART_ITEMS} options={CHART_TYPES} />

      <Callout title="Dónde seguir" tone="tip">
        <p>
          Cuando termines de leer, andá a <strong>2 · Datos sueltos</strong> para armar tu primera tabla de frecuencias. Si te trabás, usá el modo guiado: te explica una
          columna por vez.
        </p>
      </Callout>
    </div>
  );
}
