# Entrenamiento

App móvil de registro de entrenamiento (PPL x2, 12 semanas): kg, reps, RIR, asistencia,
cardio y medidas, con pocos toques. HTML/CSS/JS plano, sin build step.

## Desarrollo local

```
python -m http.server 8088
```

Abrir http://localhost:8088

## Estado actual

- [x] Catálogo de 42 ejercicios y configuración migrados 1:1 desde Dashboard_Entrenamiento_V2.xlsx
- [x] Pantalla Hoy: asistencia, progreso de sesión, "siguiente pendiente", cierre de sesión
- [x] Pantalla Ejercicio: registro de series (kg/reps con steppers), RIR, molestia, "igual que antes"
- [x] Pantalla Medidas: peso, cintura, sueño, calorías, proteína
- [x] Pantalla Plan: catálogo de referencia (solo lectura)
- [x] PWA instalable (manifest + service worker, funciona offline)
- [ ] Sincronización entre dispositivos (Firebase Firestore) — pendiente de config del proyecto
- [ ] Edición del plan desde la app
- [ ] Gráficos de progreso (e1RM, volumen, adherencia)
- [ ] Integración con Google Calendar

## Estructura

```
index.html
manifest.webmanifest
sw.js
css/style.css
js/
  app.js            pantallas y navegación
  data/catalog.js   ejercicios y configuración del plan (no editar sin justificar el cambio)
  data/dates.js     cálculo de semana/día a partir de la fecha de inicio del programa
  data/store.js     capa de datos (hoy: localStorage; mañana: Firestore, misma interfaz)
```

## Notas de la lesión de pierna

El campo de molestia (0-10) existe a nivel de ejercicio y de cierre de sesión precisamente
para poder detectar temprano un empeoramiento relacionado con la neuropraxia. No se ha
automatizado ninguna alerta todavía; revisar manualmente si la molestia sube de forma sostenida.
