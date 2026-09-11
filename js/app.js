import { CONFIG, EXERCISES, exercisesForSession } from './data/catalog.js';
import { todayISO, weekAndDayFor, sessionFor, formatLong } from './data/dates.js';
import * as store from './data/store.js';

const app = document.getElementById('app');
const bottomnav = document.getElementById('bottomnav');

let route = { screen: 'hoy' };
let currentDateISO = todayISO();

function setRoute(next) {
  route = next;
  render();
  window.scrollTo(0, 0);
}

bottomnav.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-nav]');
  if (!btn) return;
  const target = btn.dataset.nav;
  document.querySelectorAll('.navbtn').forEach((b) => b.classList.toggle('active', b.dataset.nav === target));
  setRoute({ screen: target });
});

function isSetComplete(setLog, sets) {
  if (!setLog || !setLog.sets) return false;
  const done = setLog.sets.slice(0, sets).filter((s) => s && s.done);
  return done.length >= sets;
}

function completedCount(setLog) {
  if (!setLog || !setLog.sets) return 0;
  return setLog.sets.filter((s) => s && s.done).length;
}

function ensureSets(exercise, existing) {
  const sets = [];
  for (let i = 0; i < exercise.sets; i++) {
    sets.push((existing && existing.sets && existing.sets[i]) || { kg: '', reps: '', done: false });
  }
  return sets;
}

function findNextPending(week, day, session) {
  const list = exercisesForSession(session);
  for (const ex of list) {
    const log = store.getSetLog(week, day, ex.name);
    if (!isSetComplete(log, ex.sets)) return ex;
  }
  return null;
}

function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1400);
}

// ---------------- HOY ----------------

function renderHoy() {
  const { week, day } = weekAndDayFor(currentDateISO);
  const session = sessionFor(currentDateISO);
  const dayLog = store.getDayLog(week, day);

  if (!session) {
    app.innerHTML = `
      <div class="header">
        <div class="week">Semana ${week}</div>
        <div class="session">Descanso</div>
        <div class="date">${cap(formatLong(currentDateISO))}</div>
      </div>
      <div class="restday">Hoy toca descanso. Aprovecha para revisar Medidas si aún no registraste el peso de hoy.</div>
    `;
    return;
  }

  const list = exercisesForSession(session);
  const total = list.length;
  const doneCount = list.filter((ex) => isSetComplete(store.getSetLog(week, day, ex.name), ex.sets)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const allDone = doneCount === total;
  const cierre = dayLog || {};

  app.innerHTML = `
    <div class="header">
      <div class="week">Semana ${week}</div>
      <div class="session">${session}</div>
      <div class="date">${cap(formatLong(currentDateISO))}</div>
    </div>

    <div class="card">
      <div class="segmented" id="attendance">
        ${CONFIG.attendanceStates.map((s) => `<button data-val="${s}" class="${dayLog.attendance === s ? 'active' : ''}">${s}</button>`).join('')}
      </div>
      <div class="progress-row">
        <div class="progress-bar"><div style="width:${pct}%"></div></div>
        <div class="progress-label">${doneCount}/${total} ejercicios</div>
      </div>
      <button class="btn-primary ${allDone ? 'done' : ''}" id="nextpending">
        ${allDone ? '✓ Sesión completa · registrar cierre abajo' : '▶ Siguiente pendiente'}
      </button>
    </div>

    <div class="card">
      <ul class="exlist" id="exlist">
        ${list.map((ex) => {
          const log = store.getSetLog(week, day, ex.name);
          const c = completedCount(log);
          const complete = c >= ex.sets;
          return `<li data-ex="${escapeAttr(ex.name)}" class="${complete ? 'done' : ''}">
            <div>
              <div class="exname">${ex.name}</div>
              <div class="exmeta">${ex.muscle} · ${ex.repsTarget} reps · RIR ${ex.rir}</div>
            </div>
            <div class="exstatus ${complete ? 'complete' : ''}">${complete ? '✓' : `${c}/${ex.sets}`}</div>
          </li>`;
        }).join('')}
      </ul>
    </div>

    <div class="section-title">Cierre de sesión</div>
    <div class="card" id="cierre">
      ${stepperHtml('duration', 'Duración', cierre.duration ?? 0, 5, 0, 240, 'min')}
      <label class="field-label">Cardio</label>
      <select id="cardioType">
        <option value="">Sin cardio</option>
        ${CONFIG.cardioTypes.map((c) => `<option value="${c}" ${cierre.cardioType === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      ${stepperHtml('cardioMin', 'Minutos de cardio', cierre.cardioMin ?? 0, 5, 0, 120, 'min')}
      ${stepperHtml('discomfort', 'Molestia general', cierre.discomfort ?? 0, 1, 0, CONFIG.discomfortScale, '/10')}
      <label class="field-label">Nota rápida</label>
      <textarea id="note" placeholder="Opcional">${cierre.notes || ''}</textarea>
      <button class="btn-primary" id="saveCierre">Guardar cierre</button>
    </div>
  `;

  document.getElementById('attendance').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    store.saveDayLog(week, day, { attendance: b.dataset.val });
    render();
  });

  document.getElementById('nextpending').addEventListener('click', () => {
    if (allDone) {
      document.getElementById('cierre').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const ex = findNextPending(week, day, session);
    if (ex) setRoute({ screen: 'ejercicio', session, name: ex.name });
  });

  document.getElementById('exlist').addEventListener('click', (e) => {
    const li = e.target.closest('[data-ex]');
    if (!li) return;
    setRoute({ screen: 'ejercicio', session, name: li.dataset.ex });
  });

  bindStepper('duration', (v) => store.saveDayLog(week, day, { duration: v }));
  bindStepper('cardioMin', (v) => store.saveDayLog(week, day, { cardioMin: v }));
  bindStepper('discomfort', (v) => store.saveDayLog(week, day, { discomfort: v }));

  document.getElementById('cardioType').addEventListener('change', (e) => {
    store.saveDayLog(week, day, { cardioType: e.target.value });
  });

  document.getElementById('saveCierre').addEventListener('click', () => {
    const notes = document.getElementById('note').value;
    const current = store.getDayLog(week, day);
    store.saveDayLog(week, day, {
      notes,
      attendance: current.attendance === 'No' ? 'No' : 'Sí',
    });
    toast('Cierre guardado');
    render();
  });
}

// ---------------- EJERCICIO ----------------

function renderEjercicio(session, name) {
  const ex = exercisesForSession(session).find((e) => e.name === name);
  const { week, day } = weekAndDayFor(currentDateISO);
  const existing = store.getSetLog(week, day, ex.name);
  const sets = ensureSets(ex, existing);
  const rirFinal = existing?.rirFinal ?? '';
  const discomfort = existing?.discomfort ?? 0;
  const notes = existing?.notes ?? '';
  const prev = store.lastSetLogFor(ex.name, day, week);
  let localDropSet = existing?.dropSet ? { ...existing.dropSet } : null;

  function setRowHtml(labelHtml, kg, reps, done, extraAttr) {
    return `
      <div class="setrow" ${extraAttr}>
        <div class="setnum">${labelHtml}</div>
        <div class="stepper" data-field="kg">
          <button data-d="-1">−</button>
          <div class="val">${kg === '' || kg === null || kg === undefined ? '—' : kg}<span class="unit"> kg</span></div>
          <button data-d="1">+</button>
        </div>
        <div class="stepper" data-field="reps">
          <button data-d="-1">−</button>
          <div class="val">${reps === '' || reps === null || reps === undefined ? '—' : reps}<span class="unit"> reps</span></div>
          <button data-d="1">+</button>
        </div>
        <button class="checkbtn ${done ? 'checked' : ''}" data-check>✓</button>
      </div>
    `;
  }

  function dropSetSectionHtml() {
    if (localDropSet) {
      return setRowHtml('D', localDropSet.kg, localDropSet.reps, localDropSet.done, 'data-dropset="1"')
        + `<button class="btn-secondary" id="removeDropset">Quitar drop set</button>`;
    }
    const hint = ex.dropSetSuggested ? ' <span class="tag" style="margin-left:4px">sugerido aquí</span>' : '';
    return `<button class="btn-secondary" id="addDropset">+ Añadir drop set${hint}</button>`;
  }

  app.innerHTML = `
    <div class="backbar">
      <button class="backbtn" id="back">← Volver</button>
    </div>
    <div class="header">
      <div class="week">${ex.session} · ${ex.day}</div>
      <h2>${ex.name}</h2>
      <div>
        <span class="tag">${ex.muscle}</span>
        <span class="tag focus-${ex.focus.toLowerCase().includes('fuerza') ? 'fuerza' : 'hipertrofia'}">${ex.focus}</span>
      </div>
    </div>

    <div class="card">
      <div class="exmeta">Objetivo: ${ex.repsTarget} reps · RIR ${ex.rir} · Descanso ${ex.rest}${ex.initialLoad ? ` · Carga inicial ${ex.initialLoad}` : ''}</div>
      ${ex.notes ? `<div class="exmeta" style="margin-top:4px">${ex.notes}</div>` : ''}
      ${prev ? `<button class="chip-prev" id="fillPrev">Última vez: ${prev.sets.filter(s=>s.kg).map(s=>`${s.kg}×${s.reps}`).join(', ') || '—'} · tocar para copiar</button>` : ''}
      ${ex.substitutes?.length ? `
        <details class="substitutes">
          <summary>Sustitutos si no hay esta máquina</summary>
          <ul>${ex.substitutes.map((s) => `<li>${s}</li>`).join('')}</ul>
        </details>
      ` : ''}

      <div id="setrows">
        ${sets.map((s, i) => setRowHtml(i + 1, s.kg, s.reps, s.done, `data-i="${i}"`)).join('')}
      </div>

      <div id="dropsetContainer">${dropSetSectionHtml()}</div>

      <label class="field-label">RIR final</label>
      <div class="rirrow" id="rirrow">
        ${CONFIG.rirScale.map((r) => `<button data-r="${r}" class="${String(rirFinal) === String(r) ? 'active' : ''}">${r}</button>`).join('')}
      </div>

      ${stepperHtml('exDiscomfort', 'Molestia en este ejercicio', discomfort, 1, 0, CONFIG.discomfortScale, '/10')}

      <label class="field-label">Nota</label>
      <textarea id="exNote" placeholder="Opcional">${notes}</textarea>
    </div>
  `;

  document.getElementById('back').addEventListener('click', () => setRoute({ screen: 'hoy' }));

  let localSets = sets.map((s) => ({ ...s }));

  function persistSets() {
    store.saveSetLog(week, day, ex.name, {
      sets: localSets,
      dropSet: localDropSet,
      rirFinal: document.querySelector('#rirrow button.active')?.dataset.r ?? '',
      discomfort: readStepperValue('exDiscomfort'),
      notes: document.getElementById('exNote').value,
    });
  }

  function stepRowField(target, field, delta, getVal, setVal) {
    const stepperEl = target.closest('.stepper');
    if (!stepperEl || stepperEl.dataset.field !== field) return false;
    const step = field === 'kg' ? 2.5 : 1;
    const cur = Number(getVal()) || 0;
    const next = Math.max(0, Math.round((cur + delta * step) * 100) / 100);
    setVal(next);
    stepperEl.querySelector('.val').innerHTML = `${next}<span class="unit"> ${field === 'kg' ? 'kg' : 'reps'}</span>`;
    return true;
  }

  document.getElementById('setrows').addEventListener('click', (e) => {
    const row = e.target.closest('.setrow');
    if (!row) return;
    const i = Number(row.dataset.i);
    if (e.target.matches('[data-check]')) {
      localSets[i].done = !localSets[i].done;
      e.target.classList.toggle('checked', localSets[i].done);
      persistSets();
      return;
    }
    const stepperEl = e.target.closest('.stepper');
    if (stepperEl && e.target.matches('button')) {
      const field = stepperEl.dataset.field;
      const delta = Number(e.target.dataset.d);
      stepRowField(e.target, field, delta, () => localSets[i][field], (v) => { localSets[i][field] = v; });
      persistSets();
    }
  });

  function renderDropsetContainer() {
    document.getElementById('dropsetContainer').innerHTML = dropSetSectionHtml();
    bindDropsetButtons();
  }

  function bindDropsetButtons() {
    const addBtn = document.getElementById('addDropset');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const lastWithKg = [...localSets].reverse().find((s) => s.kg);
        const kg = lastWithKg ? Math.max(0, Math.round((lastWithKg.kg * 0.5) / 2.5) * 2.5) : '';
        const reps = lastWithKg ? Math.round(lastWithKg.reps * 1.6) : '';
        localDropSet = { kg, reps, done: false };
        persistSets();
        renderDropsetContainer();
      });
      return;
    }
    document.getElementById('removeDropset').addEventListener('click', () => {
      localDropSet = null;
      persistSets();
      renderDropsetContainer();
    });
  }

  // Delegación fija en el contenedor (se une una sola vez); los botones internos
  // (agregar/quitar) se re-vinculan cada vez que se reconstruye su HTML.
  document.getElementById('dropsetContainer').addEventListener('click', (e) => {
    if (!localDropSet) return;
    if (e.target.matches('[data-check]')) {
      localDropSet.done = !localDropSet.done;
      e.target.classList.toggle('checked', localDropSet.done);
      persistSets();
      return;
    }
    if (e.target.matches('.stepper button')) {
      const field = e.target.closest('.stepper').dataset.field;
      const delta = Number(e.target.dataset.d);
      stepRowField(e.target, field, delta, () => localDropSet[field], (v) => { localDropSet[field] = v; });
      persistSets();
    }
  });

  bindDropsetButtons();

  if (prev) {
    document.getElementById('fillPrev').addEventListener('click', () => {
      prev.sets.forEach((s, i) => {
        if (localSets[i] && s.kg) {
          localSets[i].kg = s.kg;
          localSets[i].reps = s.reps;
        }
      });
      persistSets();
      renderEjercicio(session, name);
    });
  }

  document.getElementById('rirrow').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    document.querySelectorAll('#rirrow button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    persistSets();
  });

  bindStepper('exDiscomfort', () => persistSets());
  document.getElementById('exNote').addEventListener('change', persistSets);

  function updateHeaderIfDone() {
    // no-op: recalculated when returning to "Hoy"
  }
}

// ---------------- MEDIDAS ----------------

function renderMedidas() {
  const m = store.getMeasurement(currentDateISO) || {};
  app.innerHTML = `
    <div class="header">
      <div class="week">Medidas</div>
      <div class="session">${cap(formatLong(currentDateISO))}</div>
    </div>
    <div class="card">
      ${stepperHtml('weight', 'Peso corporal', m.weightKg ?? CONFIG.initialWeightKg, 0.1, 30, 250, 'kg')}
      ${stepperHtml('waist', 'Cintura', m.waistCm ?? '', 0.5, 40, 200, 'cm')}
      ${stepperHtml('sleep', 'Sueño', m.sleepHours ?? '', 0.5, 0, 14, 'h')}
      <div class="grid2">
        <div>
          <label class="field-label">Calorías</label>
          <input type="text" inputmode="numeric" id="cal" value="${m.calories ?? ''}" placeholder="${CONFIG.calorieTarget}" />
        </div>
        <div>
          <label class="field-label">Proteína (g)</label>
          <input type="text" inputmode="numeric" id="prot" value="${m.protein ?? ''}" placeholder="${CONFIG.proteinTarget}" />
        </div>
      </div>
      ${stepperHtml('mDiscomfort', 'Molestia general', m.discomfort ?? 0, 1, 0, CONFIG.discomfortScale, '/10')}
      <label class="field-label">Nota</label>
      <textarea id="mNote" placeholder="Opcional">${m.notes || ''}</textarea>
      <button class="btn-primary" id="saveMed">Guardar medidas de hoy</button>
    </div>
  `;

  bindStepper('weight', () => {});
  bindStepper('waist', () => {});
  bindStepper('sleep', () => {});
  bindStepper('mDiscomfort', () => {});

  document.getElementById('saveMed').addEventListener('click', () => {
    const { week } = weekAndDayFor(currentDateISO);
    store.saveMeasurement(currentDateISO, {
      week,
      weightKg: readStepperValue('weight'),
      waistCm: readStepperValue('waist') || null,
      sleepHours: readStepperValue('sleep') || null,
      calories: Number(document.getElementById('cal').value) || null,
      protein: Number(document.getElementById('prot').value) || null,
      discomfort: readStepperValue('mDiscomfort'),
      notes: document.getElementById('mNote').value,
    });
    toast('Medidas guardadas');
  });
}

// ---------------- PLAN (referencia de solo lectura) ----------------

function renderPlan() {
  const sessions = ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'];
  app.innerHTML = `
    <div class="header">
      <div class="session">Plan · referencia</div>
      <div class="date">Semana ${CONFIG.weeks}-semanas · Objetivo ${CONFIG.calorieTarget} kcal / ${CONFIG.proteinTarget} g proteína</div>
    </div>
    ${sessions.map((s) => `
      <div class="section-title">${s} · ${exercisesForSession(s)[0]?.day || ''}</div>
      <div class="card">
        <ul class="exlist">
          ${exercisesForSession(s).map((ex) => `
            <li>
              <div>
                <div class="exname">${ex.name}</div>
                <div class="exmeta">${ex.muscle} · ${ex.sets}×${ex.repsTarget} · RIR ${ex.rir} · ${ex.rest}</div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('')}
    <div class="card exmeta">Edición del plan disponible próximamente. Por ahora, si quieres ajustar algo, dímelo directamente.</div>
  `;
}

// ---------------- helpers de UI ----------------

function stepperHtml(id, label, value, step, min, max, unit) {
  const hasValue = !(value === '' || value === null || value === undefined);
  return `
    <label class="field-label">${label}</label>
    <div class="stepper" id="${id}" data-step="${step}" data-min="${min}" data-max="${max}" data-unit="${unit}" data-value="${hasValue ? value : ''}">
      <button data-d="-1">−</button>
      <div class="val">${hasValue ? value : '—'}<span class="unit"> ${unit}</span></div>
      <button data-d="1">+</button>
    </div>
  `;
}

function bindStepper(id, onChange) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const step = Number(el.dataset.step);
    const min = Number(el.dataset.min);
    const max = Number(el.dataset.max);
    const unit = el.dataset.unit;
    const valEl = el.querySelector('.val');
    const cur = el.dataset.value === '' ? 0 : Number(el.dataset.value);
    const delta = Number(b.dataset.d) * step;
    let next = Math.round((cur + delta) * 100) / 100;
    next = Math.min(max, Math.max(min, next));
    el.dataset.value = next;
    valEl.innerHTML = `${next}<span class="unit"> ${unit}</span>`;
    onChange(next);
  });
}

function readStepperValue(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const v = el.dataset.value;
  return v === '' || v === undefined ? null : Number(v);
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeAttr(s) {
  return s.replace(/"/g, '&quot;');
}

function render() {
  if (route.screen === 'hoy') renderHoy();
  else if (route.screen === 'ejercicio') renderEjercicio(route.session, route.name);
  else if (route.screen === 'medidas') renderMedidas();
  else if (route.screen === 'plan') renderPlan();
}

render();
