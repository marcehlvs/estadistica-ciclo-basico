# Estadística desde cero · 3.º año

App web (React + Vite) para aprender **análisis descriptivo** desde cero, pensada para 3.º año de secundaria. El estudiante practica con datos reales de su edad (hermanos, goles, estaturas, tiempo de viaje…), completa tablas, ve cómo se construyen los gráficos y calcula moda, mediana y media. Todo corre en el navegador: no hay servidor ni cuentas.

> Proyecto nuevo, armado de cero a partir de la idea de la app de estadística de 5.º año (repo `estadistica-app`). Acá no están Sturges, percentiles, desvío ni CV: eso queda para 5.º.

---

## 1. Temario de 3.º año y dónde se practica

| Tema | Pestaña | Qué hace el estudiante |
|---|---|---|
| Qué es la estadística, población, muestra, variable (cualitativa / discreta / continua), pasos del análisis descriptivo | **1 · ¿Qué es la estadística?** | Lee la teoría breve y practica con dos mini-juegos de respuesta inmediata (tipo de variable y elección de gráfico) |
| Frecuencias **f, fr, fr %, FA** con datos sueltos | **2 · Datos sueltos** | Completa la tabla (modo guiado, una columna por vez) |
| **Gráfico de barras** y **gráfico circular** | **2 · Datos sueltos** | Al resolver la tabla se desbloquean los gráficos, con la tabla de ángulos del circular (ángulo = fr × 360°) |
| Datos agrupados: intervalos, marca de clase, f, fr, fr %, FA | **3 · Datos agrupados** | Completa la tabla con los intervalos ya armados |
| **Histograma** y **polígono de frecuencias** | **3 · Datos agrupados** | Ve el histograma, el polígono o los dos juntos para entender cómo se relacionan |
| **Moda, mediana y media aritmética** | **4 · Moda, mediana y media** | Las calcula con datos sueltos y con datos agrupados, y ve el desarrollo paso a paso |
| Integración | **5 · Modo evaluación** | Evaluación con 3 ejercicios, corregida automáticamente, con datos que cambian en cada número de evaluación |
| Apoyo | **6 · Hoja de fórmulas** · **7 · Mi progreso** · **8 · Armar grupos** | Hoja imprimible, historial de resultados y sorteo de parejas para el aula |

---

## 2. Qué cambió respecto de la app de 5.º año

La app de 5.º estaba hecha para 5.º año: asumía que el estudiante ya sabía qué es una frecuencia y se iba directo a medidas avanzadas. Para 3.º hacía falta **explicar desde cero** y **sacar lo que no corresponde**.

### Se agregó

- **Pestaña de conceptos (nueva).** Vocabulario básico, tipos de variable, pasos del análisis descriptivo y guía de qué gráfico usar, con dos mini-juegos.
- **Modo guiado en las tablas.** Se completa **una columna por vez** (f → fr → fr % → FA). Cada columna muestra qué significa, su fórmula y un ejemplo resuelto. Hay un botón para pasar a “Completar toda la tabla”.
- **Columnas separadas fr y fr %.** Antes solo existía el porcentaje; ahora se distingue la frecuencia relativa (decimal, suma 1) de la porcentual (suma 100 %), como en el temario.
- **Fila de control de totales.** Se calcula con lo que el estudiante va escribiendo: Σf debe dar n, Σfr debe dar 1 y Σfr % debe dar 100 %. Le permite detectar errores por sí mismo.
- **Variables cualitativas.** Hay conjuntos de datos con categorías (medio de transporte, materia favorita). En esos casos la tabla no tiene FA, porque las categorías no se pueden ordenar.
- **Gráfico circular con ángulos.** Tabla “ángulo = fr × 360°” junto al gráfico.
- **Histograma y polígono de frecuencias (nuevos).** Tres vistas: histograma, polígono y los dos juntos. El polígono une las marcas de clase y se cierra en cero con un intervalo vacío a cada lado.
- **Moda, mediana y media con explicación de cada paso.** Con datos sueltos se resaltan los datos centrales ordenados (mediana) y se muestra la cuenta de la media con frecuencias. Con datos agrupados se trabaja el intervalo modal, el intervalo mediano y la media aproximada con marcas de clase.
- **Evaluación rediseñada** (ver sección 4).
- **Test automático** de los conjuntos de datos y del generador de evaluaciones (`npm test`).

### Se quitó (es contenido de 5.º año)

| Quitado | Motivo |
|---|---|
| Regla de Sturges para calcular la cantidad de intervalos | En 3.º los intervalos vienen dados; lo que se practica es armar la tabla y leerla |
| Percentiles, cuartiles y rango intercuartil | Fuera del temario |
| Rango, varianza y desvío estándar | Fuera del temario |
| Coeficiente de variación y comparación de muestras | Fuera del temario |
| Ojiva y diagrama de caja | Fuera del temario (el polígono de frecuencias ocupa su lugar) |
| Moda y mediana por interpolación en datos agrupados | Demasiado formal para 3.º: se usan intervalo modal e intervalo mediano |

### Se mantuvo (con ajustes)

- **Hoja de fórmulas:** reducida a lo que se ve en 3.º.
- **Mi progreso:** ahora solo registra evaluaciones. Guarda en `localStorage` con su propia clave (`estadistica-ciclo-basico:progreso:v1`), así que no se mezcla con la app de 5.º.
- **Armar grupos:** sin cambios.
- **Estilos:** el CSS que estaba dentro de `App.jsx` pasó a `src/board.css`; los módulos usan `src/extras.css`.

---

## 3. Decisiones pedagógicas

1. **De lo concreto a lo abstracto.** Primero los datos sueltos (cualitativos y discretos), después los agrupados, después las medidas.
2. **Una idea por vez.** El modo guiado evita que el estudiante enfrente 5 columnas a la vez.
3. **Autocontrol.** La fila de totales enseña a verificar una tabla sin depender del docente.
4. **Cantidades de datos “amigables”.** n vale 20, 25, 40 o 50, así fr y la media tienen como mucho 3 decimales exactos y se pueden calcular a mano sin decimales periódicos.
5. **Sin ambigüedades en la corrección.** Los conjuntos y el generador garantizan: moda única, ningún intervalo vacío y ninguna FA exactamente igual a n/2 (que dejaría la mediana entre dos intervalos).
6. **Se explica el error, no solo se marca.** Al verificar, la app indica qué columna revisar y repite su fórmula.

---

## 4. Modo evaluación

La evaluación N.º *k* genera **siempre los mismos datos** (semilla), así dos estudiantes con el mismo número pueden comparar resultados.

- **Ejercicio 1 · datos sueltos.** Tabla (f, fr, fr %, FA) y moda, mediana, media.
- **Ejercicio 2 · datos agrupados.** Tabla (marca, f, fr %, FA), intervalo modal, intervalo mediano y media aproximada. Los intervalos ya vienen armados.
- **Ejercicio 3 · interpretación.** Cuántos datos son menores o iguales que un valor (FA), qué porcentaje es mayor (complemento), cuántos grados mide un sector circular y qué gráfico se dibuja con barras pegadas.

**Corrección y tolerancias** (aceptan el redondeo hecho a mano):

| Dato | Tolerancia |
|---|---|
| f, FA, moda, FA de interpretación | exacto |
| fr | ± 0,006 |
| fr %, porcentaje, ángulo | ± 0,5 |
| marca de clase | ± 0,01 |
| mediana y media | el mayor entre 0,05 y 0,3 % del valor |

Al entregar, las respuestas incorrectas muestran el valor correcto y el resultado se guarda en “Mi progreso” (solo en el navegador, con opción de descargar CSV).

---

## 5. Estructura del proyecto

```
src/
├── App.jsx            Estructura y pestañas
├── Intro.jsx          1 · Conceptos y mini-juegos
├── FreqTable.jsx      2 y 3 · Tabla de frecuencias (sueltos / agrupados), modo guiado y gráficos
├── Measures.jsx       4 · Moda, mediana y media
├── Evaluation.jsx     5 · Modo evaluación
├── FormulaSheet.jsx   6 · Hoja de fórmulas imprimible
├── Progress.jsx       7 · Mi progreso
├── Groups.jsx         8 · Armar grupos
├── Charts.jsx         Barras, circular (+ ángulos), histograma y polígono
├── ui.jsx             Componentes compartidos (campos de respuesta, ayudas, opción múltiple)
├── freqColumns.js     Definición, fórmula y ejemplo de cada columna (f, fr, fr %, FA, marca)
├── datasets.js        Conjuntos de práctica fijos
├── stats.js           Cálculos y generador de ejercicios con semilla
├── progress.js        Registro de resultados (localStorage)
├── board.css          Estilos base (pizarra)
└── extras.css         Estilos de los módulos
test/
└── verify-stats.mjs   Verifica datos fijos y 3000 semillas de evaluación
```

---

## 6. Cómo usarlo

```bash
npm install
npm run dev        # desarrollo
npm test           # verifica datos y generador de ejercicios
npm run lint
npm run build
npm run deploy     # publica en GitHub Pages (rama gh-pages)
```

La app se publica en `/estadistica-ciclo-basico/` (ver `base` en `vite.config.js`).

---

## 7. Cómo agregar contenido

**Un conjunto de práctica con datos sueltos** — en `src/datasets.js`, dentro de `FREQ_DEFS`:

```js
{
  id: "mascotas",
  kind: "discreta",              // "cualitativa" (sin FA) o "discreta"
  title: "Mascotas en casa",
  prompt: "Se le preguntó a 20 estudiantes de 3.º año cuántas mascotas tienen.",
  variable: "Cantidad de mascotas",
  unit: "mascotas",
  counts: [[0, 5], [1, 8], [2, 5], [3, 2]],   // [valor, cantidad]; las cantidades deben sumar 20, 25, 40 o 50
  seed: 16,
}
```

**Un conjunto con datos agrupados** — en `GROUPED_DEFS`: `start` (primer límite), `width` (amplitud) y `counts` (f de cada intervalo; intervalos `[a - b)`).

Después de agregar datos, ejecutá `npm test`: comprueba que n sea amigable, que la moda sea única y que la mediana no quede ambigua.

**Otro tema para el generador de evaluaciones** — en `src/stats.js`, `UNGROUPED_THEMES` o `GROUPED_THEMES`.

---

## 8. Notas

- Los intervalos se escriben `[a - b)`: el límite inferior **entra** y el superior **no**.
- Con datos agrupados la media es **aproximada** (se usan marcas de clase) y la app lo aclara.
- Con variables cualitativas solo corresponde la moda; la FA no se usa.
- El progreso vive en el navegador del estudiante: si borra los datos del navegador o cambia de dispositivo, empieza de cero.
