import { CONFIG, EXERCISES, exercisesForSession } from './data/catalog.js';
import { todayISO, weekAndDayFor, sessionFor, formatLong, dateForWeekDay, formatShort } from './data/dates.js';
import { muscleIconSvg } from './data/muscleIcons.js';
import { SUBSTITUTE_IMAGES } from './data/substituteImages.js';
import { auth, signIn, onAuthStateChanged, signOut } from './data/firebase.js';
import * as store from './data/store.js';

const app = document.getElementById('app');
const bottomnav = document.getElementById('bottomnav');

let route = { screen: 'hoy' };
let currentDateISO = todayISO();
let progresoState = { exercise: null };

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
  const blank = exercise.unilateral
    ? { kgR: '', repsR: '', kgL: '', repsL: '', done: false }
    : { kg: '', reps: '', done: false };
  for (let i = 0; i < exercise.sets; i++) {
    sets.push((existing && existing.sets && existing.sets[i]) || { ...blank });
  }
  return sets;
}

// Nombre bajo el cual se registra hoy este cupo de la sesión: el del catálogo, o el sustituto
// elegido para este día si el usuario cambió de ejercicio (ver store.setSubstitution).
function effectiveNameFor(ex, week, day) {
  return store.getSubstitution(week, day, ex.name) || ex.name;
}

function findNextPending(week, day, session) {
  const list = exercisesForSession(session);
  for (const ex of list) {
    const log = store.getSetLog(week, day, effectiveNameFor(ex, week, day));
    if (!isSetComplete(log, ex.sets)) return ex;
  }
  return null;
}

// ---------------- Temporizador de descanso ----------------

let restEndAt = null;
let restTotalSeconds = 0;
let restTimerHandle = null;

function parseRestSeconds(restStr) {
  const m = String(restStr || '').match(/(\d+):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 90;
}

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function startRestTimer(seconds) {
  restTotalSeconds = seconds;
  restEndAt = Date.now() + seconds * 1000;
  ensureRestBanner();
  clearInterval(restTimerHandle);
  restTimerHandle = setInterval(tickRestTimer, 250);
  tickRestTimer();
}

function stopRestTimer() {
  restEndAt = null;
  clearInterval(restTimerHandle);
  document.getElementById('restBanner')?.remove();
}

function ensureRestBanner() {
  if (document.getElementById('restBanner')) return;
  const el = document.createElement('div');
  el.id = 'restBanner';
  el.className = 'rest-banner';
  el.innerHTML = `
    <div class="rest-fill"></div>
    <div class="rest-content">
      <span>Descanso</span>
      <span class="rest-time"></span>
      <button class="rest-skip">Saltar</button>
    </div>
  `;
  document.body.appendChild(el);
  el.querySelector('.rest-skip').addEventListener('click', stopRestTimer);
}

function tickRestTimer() {
  if (restEndAt === null) return;
  const el = document.getElementById('restBanner');
  if (!el) return;
  const remaining = Math.max(0, Math.round((restEndAt - Date.now()) / 1000));
  el.querySelector('.rest-time').textContent = formatMMSS(remaining);
  const pct = Math.max(0, Math.min(100, 100 * (1 - remaining / restTotalSeconds)));
  el.querySelector('.rest-fill').style.width = `${pct}%`;
  if (remaining <= 0) {
    clearInterval(restTimerHandle);
    el.classList.add('done');
    el.querySelector('span').textContent = '¡Listo!';
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    setTimeout(stopRestTimer, 2500);
  }
}

// ---------------- Detección de PR ----------------

function computeE1RM(kg, reps) {
  if (!kg || !reps) return 0;
  return kg * (1 + reps / 30);
}

function e1rmsForSet(s, unilateral) {
  if (unilateral) return [computeE1RM(s.kgR, s.repsR), computeE1RM(s.kgL, s.repsL)];
  return [computeE1RM(s.kg, s.reps)];
}

function bestPriorE1RM(effName, day, beforeWeek, unilateral) {
  let best = 0;
  const logs = store.allSetLogs();
  for (const key of Object.keys(logs)) {
    const parts = key.split('_');
    const week = Number(parts[0]);
    const keyDay = parts[1];
    const name = parts.slice(2).join('_');
    if (name !== effName || keyDay !== day || week >= beforeWeek) continue;
    const entry = logs[key];
    (entry.sets || []).forEach((s) => e1rmsForSet(s, unilateral).forEach((v) => { if (v > best) best = v; }));
    if (entry.dropSet) computeE1RM(entry.dropSet.kg, entry.dropSet.reps) > best && (best = computeE1RM(entry.dropSet.kg, entry.dropSet.reps));
  }
  return best;
}

function checkForPR(effName, day, week, s, unilateral) {
  const prior = bestPriorE1RM(effName, day, week, unilateral);
  if (prior <= 0) return;
  const currentBest = Math.max(...e1rmsForSet(s, unilateral));
  if (currentBest > prior) {
    const detail = unilateral
      ? `${fmtVal(s.kgR)}×${fmtVal(s.repsR)} / ${fmtVal(s.kgL)}×${fmtVal(s.repsL)}`
      : `${s.kg}×${s.reps}`;
    toast(`⚔️ ¡Nuevo PR en ${effName}! ${detail}`);
  }
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

// ---------------- Foto personal (tu foto, no de terceros) ----------------

function photoWidgetHtml() {
  const photo = store.getProfilePhoto();
  return `
    <div class="photo-widget" id="photoWidget" title="Toca para cambiar tu foto">
      ${photo ? `<img src="${photo}" alt="Tu foto" />` : `<span class="photo-placeholder">＋</span>`}
      <input type="file" accept="image/*" id="photoInput" hidden />
    </div>
  `;
}

function bindPhotoWidget() {
  const widget = document.getElementById('photoWidget');
  const input = document.getElementById('photoInput');
  if (!widget || !input) return;
  widget.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 320, 0.75);
      store.setProfilePhoto(dataUrl);
      render();
    } catch {
      toast('No se pudo cargar la foto');
    }
  });
}

function resizeImageFile(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------- HOY ----------------

function renderHoy() {
  const { week, day } = weekAndDayFor(currentDateISO);
  const session = sessionFor(currentDateISO);
  const dayLog = store.getDayLog(week, day);

  if (!session) {
    app.innerHTML = `
      <div class="header hoy-header">
        <div>
          <div class="week">Semana ${week}</div>
          <div class="session">Descanso</div>
          <div class="date">${cap(formatLong(currentDateISO))}</div>
        </div>
        ${photoWidgetHtml()}
      </div>
      <div class="restday">Hoy toca descanso. Aprovecha para revisar Medidas si aún no registraste el peso de hoy.</div>
    `;
    bindPhotoWidget();
    return;
  }

  const list = exercisesForSession(session);
  const total = list.length;
  const doneCount = list.filter((ex) => isSetComplete(store.getSetLog(week, day, effectiveNameFor(ex, week, day)), ex.sets)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const allDone = doneCount === total;
  const cierre = dayLog || {};

  app.innerHTML = `
    <div class="header hoy-header">
      <div>
        <div class="week">Semana ${week}</div>
        <div class="session">${session}</div>
        <div class="date">${cap(formatLong(currentDateISO))}</div>
      </div>
      ${photoWidgetHtml()}
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
          const effName = effectiveNameFor(ex, week, day);
          const isSub = effName !== ex.name;
          const log = store.getSetLog(week, day, effName);
          const c = completedCount(log);
          const complete = c >= ex.sets;
          return `<li data-ex="${escapeAttr(ex.name)}" class="${complete ? 'done' : ''}">
            <div>
              <div class="exname">${effName}${isSub ? ' <span class="tag">sustituto</span>' : ''}</div>
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

  bindPhotoWidget();

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

function fmtVal(v) {
  return v === '' || v === null || v === undefined ? '—' : v;
}

function setRowBilateral(labelHtml, kg, reps, done, extraAttr) {
  return `
    <div class="setrow" ${extraAttr}>
      <div class="setnum">${labelHtml}</div>
      <div class="stepper" data-field="kg">
        <button data-d="-1">−</button>
        <div class="val">${fmtVal(kg)}<span class="unit"> kg</span></div>
        <button data-d="1">+</button>
      </div>
      <div class="stepper" data-field="reps">
        <button data-d="-1">−</button>
        <div class="val">${fmtVal(reps)}<span class="unit"> reps</span></div>
        <button data-d="1">+</button>
      </div>
      <button class="checkbtn ${done ? 'checked' : ''}" data-check>✓</button>
    </div>
  `;
}

function miniStepper(field, val, unit) {
  return `
    <div class="stepper mini" data-field="${field}">
      <button data-d="-1">−</button>
      <div class="val">${fmtVal(val)}<span class="unit"> ${unit}</span></div>
      <button data-d="1">+</button>
    </div>
  `;
}

function setRowUnilateral(labelHtml, s, extraAttr) {
  return `
    <div class="setrow unilateral" ${extraAttr}>
      <div class="setnum">${labelHtml}</div>
      <div class="uni-sides">
        <div class="side-row">
          <span class="side-label">Der.</span>
          ${miniStepper('kgR', s.kgR, 'kg')}
          ${miniStepper('repsR', s.repsR, 'reps')}
        </div>
        <div class="side-row">
          <span class="side-label">Izq.</span>
          ${miniStepper('kgL', s.kgL, 'kg')}
          ${miniStepper('repsL', s.repsL, 'reps')}
        </div>
      </div>
      <button class="checkbtn ${s.done ? 'checked' : ''}" data-check>✓</button>
    </div>
  `;
}

function formatSetsSummary(sets, unilateral) {
  if (unilateral) {
    return sets.filter((s) => s.kgR || s.kgL).map((s) => `D:${fmtVal(s.kgR)}×${fmtVal(s.repsR)} I:${fmtVal(s.kgL)}×${fmtVal(s.repsL)}`).join(', ');
  }
  return sets.filter((s) => s.kg).map((s) => `${s.kg}×${s.reps}`).join(', ');
}

function renderEjercicio(session, name) {
  const ex = exercisesForSession(session).find((e) => e.name === name);
  const { week, day } = weekAndDayFor(currentDateISO);
  const subName = store.getSubstitution(week, day, ex.name);
  const effName = subName || ex.name;
  const existing = store.getSetLog(week, day, effName);
  const sets = ensureSets(ex, existing);
  const rirFinal = existing?.rirFinal ?? '';
  const discomfort = existing?.discomfort ?? 0;
  const notes = existing?.notes ?? '';
  const prev = store.lastSetLogFor(effName, day, week);
  let localDropSet = existing?.dropSet ? { ...existing.dropSet } : null;

  function dropSetSectionHtml() {
    if (localDropSet) {
      return setRowBilateral('D', localDropSet.kg, localDropSet.reps, localDropSet.done, 'data-dropset="1"')
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
      <h2>${effName}</h2>
      ${subName ? `<div class="exmeta">Sustituto de ${ex.name}</div>` : ''}
      <div>
        <span class="tag">${ex.muscle}</span>
        <span class="tag focus-${ex.focus.toLowerCase().includes('fuerza') ? 'fuerza' : 'hipertrofia'}">${ex.focus}</span>
      </div>
    </div>

    <div class="card">
      <div class="muscle-icon-wrap">
        ${(() => {
          const imgId = subName ? SUBSTITUTE_IMAGES[subName] : ex.image;
          return imgId
            ? `<img class="ex-photo" src="icons/exercises/${imgId}/0.jpg" alt="${escapeAttr(effName)}" /><div class="mi-equip">${ex.equipment}</div>`
            : muscleIconSvg(ex.muscle, ex.equipment, !!ex.unilateral);
        })()}
      </div>
      <div class="exmeta">Objetivo: ${ex.repsTarget} reps · RIR ${ex.rir} · Descanso ${ex.rest}${ex.initialLoad ? ` · Carga inicial ${ex.initialLoad}` : ''}</div>
      ${ex.notes ? `<div class="exmeta" style="margin-top:4px">${ex.notes}</div>` : ''}
      ${prev ? `<button class="chip-prev" id="fillPrev">Última vez: ${formatSetsSummary(prev.sets, ex.unilateral) || '—'} · tocar para copiar</button>` : ''}
      ${ex.substitutes?.length ? `
        <div class="substitutes">
          <div class="subs-label">${subName ? 'Sustituyendo el original:' : 'Sustituir por (si no hay esta máquina):'}</div>
          <div class="subs-options" id="subsOptions">
            ${subName ? `<button class="chip-sub back" data-sub="">↩ Volver a ${escapeAttr(ex.name)}</button>` : ''}
            ${ex.substitutes.filter((s) => s !== subName).map((s) => `<button class="chip-sub" data-sub="${escapeAttr(s)}">${s}</button>`).join('')}
          </div>
        </div>
      ` : ''}

      <div id="setrows">
        ${sets.map((s, i) => ex.unilateral
          ? setRowUnilateral(i + 1, s, `data-i="${i}"`)
          : setRowBilateral(i + 1, s.kg, s.reps, s.done, `data-i="${i}"`)
        ).join('')}
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

  document.getElementById('subsOptions')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sub]');
    if (!b) return;
    store.setSubstitution(week, day, ex.name, b.dataset.sub || null);
    setRoute({ screen: 'ejercicio', session, name: ex.name });
  });

  let localSets = sets.map((s) => ({ ...s }));

  function persistSets() {
    store.saveSetLog(week, day, effName, {
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
    const isKg = field.startsWith('kg');
    const step = isKg ? 2.5 : 1;
    const cur = Number(getVal()) || 0;
    const next = Math.max(0, Math.round((cur + delta * step) * 100) / 100);
    setVal(next);
    stepperEl.querySelector('.val').innerHTML = `${next}<span class="unit"> ${isKg ? 'kg' : 'reps'}</span>`;
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
      if (localSets[i].done) {
        startRestTimer(parseRestSeconds(ex.rest));
        checkForPR(effName, day, week, localSets[i], ex.unilateral);
      }
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
        // El drop set siempre es un valor combinado; en unilaterales se basa en el lado
        // derecho (referencia principal según la nota de la lesión de pierna).
        const lastWithKg = ex.unilateral
          ? [...localSets].reverse().find((s) => s.kgR)
          : [...localSets].reverse().find((s) => s.kg);
        const baseKg = ex.unilateral ? lastWithKg?.kgR : lastWithKg?.kg;
        const baseReps = ex.unilateral ? lastWithKg?.repsR : lastWithKg?.reps;
        const kg = baseKg ? Math.max(0, Math.round((baseKg * 0.5) / 2.5) * 2.5) : '';
        const reps = baseReps ? Math.round(baseReps * 1.6) : '';
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
      if (localDropSet.done) {
        startRestTimer(parseRestSeconds(ex.rest));
        checkForPR(effName, day, week, localDropSet, false);
      }
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
        if (!localSets[i]) return;
        if (ex.unilateral) {
          if (s.kgR) { localSets[i].kgR = s.kgR; localSets[i].repsR = s.repsR; }
          if (s.kgL) { localSets[i].kgL = s.kgL; localSets[i].repsL = s.repsL; }
        } else if (s.kg) {
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

    ${discomfortChartHtml()}
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

// ---------------- Gráfico de molestia de pierna ----------------
// Combina la molestia general del cierre de sesión (dayLogs) y la de Medidas diarias,
// promediada por semana. Es la señal de seguimiento más directa para la neuropraxia de pierna.

function weeklyDiscomfortSeries() {
  const sums = {};
  const add = (week, val) => {
    if (val === null || val === undefined || val === '' || Number.isNaN(Number(val))) return;
    if (!sums[week]) sums[week] = { total: 0, count: 0 };
    sums[week].total += Number(val);
    sums[week].count += 1;
  };
  Object.entries(store.allDayLogs()).forEach(([key, log]) => add(Number(key.split('_')[0]), log.discomfort));
  Object.values(store.allMeasurements()).forEach((m) => add(m.week, m.discomfort));

  const series = [];
  for (let w = 1; w <= CONFIG.weeks; w++) {
    const s = sums[w];
    series.push({ week: w, avg: s ? s.total / s.count : null });
  }
  return series;
}

function discomfortTrendAlert(series) {
  const withData = series.filter((w) => w.avg !== null);
  if (withData.length < 3) return null;
  const [a, b, c] = withData.slice(-3);
  if (c.avg > b.avg && b.avg > a.avg && c.avg >= 3) {
    return `⚠️ La molestia de pierna lleva 3 semanas seguidas subiendo (semana ${a.week}: ${a.avg.toFixed(1)} → semana ${c.week}: ${c.avg.toFixed(1)}). Si continúa, considera bajar el rango/carga en pierna afectada o consultar con tu especialista.`;
  }
  return null;
}

function discomfortChartHtml() {
  const series = weeklyDiscomfortSeries();
  const alert = discomfortTrendAlert(series);
  const barW = 22;
  const gap = 6;
  const chartW = series.length * (barW + gap);
  const bars = series.map((pt, i) => {
    const x = i * (barW + gap);
    const h = pt.avg === null ? 0 : Math.max(2, (pt.avg / 10) * 68);
    const y = 70 - h;
    const fill = pt.avg === null ? 'var(--border)' : pt.avg >= 6 ? 'var(--bad)' : pt.avg >= 3 ? 'var(--warn)' : 'var(--good)';
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${fill}" />
            <text x="${x + barW / 2}" y="86" text-anchor="middle" class="chart-label">${pt.week}</text>`;
  }).join('');
  return `
    <div class="section-title">Molestia de pierna · tendencia semanal</div>
    <div class="card">
      ${alert ? `<div class="alert-box">${alert}</div>` : ''}
      <svg viewBox="0 0 ${chartW} 92" class="discomfort-chart" preserveAspectRatio="xMinYMid meet">${bars}</svg>
      <div class="exmeta">Promedio semanal (0-10): cierres de sesión + Medidas diarias. Semana = número de semana del plan.</div>
    </div>
  `;
}

// ---------------- PROGRESO (peso corporal y peso cargado, comparables día a día) ----------------

function lineChartSvg(values, labels, color) {
  const valid = values.filter((v) => v !== null && v !== undefined);
  if (!valid.length) return '<div class="exmeta">Sin datos todavía.</div>';
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const w = Math.max(240, values.length * 40);
  const h = 100;
  const padY = 14;
  const stepX = values.length > 1 ? (w - 20) / (values.length - 1) : 0;
  const pts = values.map((v, i) => {
    if (v === null || v === undefined) return null;
    const x = 10 + i * stepX;
    const y = h - padY - ((v - min) / range) * (h - padY * 2);
    return { x, y };
  });
  const pathPts = pts.filter(Boolean);
  const path = pathPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const dots = pathPts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${color}" />`).join('');
  const labelEls = labels.map((l, i) => `<text x="${(10 + i * stepX).toFixed(1)}" y="${h + 8}" text-anchor="middle" class="chart-label">${l}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h + 12}" class="line-chart" preserveAspectRatio="xMinYMid meet"><path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" />${dots}${labelEls}</svg>`;
}

function exercisePoints(name) {
  const logs = store.allSetLogs();
  const points = [];
  for (const key of Object.keys(logs)) {
    const parts = key.split('_');
    const week = Number(parts[0]);
    const day = parts[1];
    const exName = parts.slice(2).join('_');
    if (exName !== name) continue;
    const entry = logs[key];
    const doneSets = (entry.sets || []).filter((s) => s.done);
    let bestKg = 0;
    let bestReps = 0;
    doneSets.forEach((s) => {
      const kg = Number(s.kg || s.kgR || 0);
      const reps = Number(s.reps || s.repsR || 0);
      if (kg > bestKg) { bestKg = kg; bestReps = reps; }
    });
    if (bestKg > 0) points.push({ date: dateForWeekDay(week, day), kg: bestKg, reps: bestReps });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}

function renderProgreso() {
  const measurements = store.allMeasurements();
  const weightDates = Object.keys(measurements).filter((d) => measurements[d].weightKg != null).sort();
  const weightValues = weightDates.map((d) => measurements[d].weightKg);
  const weightLabels = weightDates.map((d) => formatShort(d));
  const firstW = weightValues[0];
  const lastW = weightValues[weightValues.length - 1];
  const deltaW = firstW != null && lastW != null && weightValues.length > 1 ? lastW - firstW : null;

  const exerciseNames = [...new Set(EXERCISES.map((e) => e.name))].sort();
  if (!progresoState.exercise || !exerciseNames.includes(progresoState.exercise)) progresoState.exercise = exerciseNames[0];
  const points = exercisePoints(progresoState.exercise);
  const kgValues = points.map((p) => p.kg);
  const kgLabels = points.map((p) => formatShort(p.date));

  app.innerHTML = `
    <div class="header">
      <div class="session">Progreso</div>
      <div class="date">Peso corporal y peso cargado, comparables día a día</div>
    </div>

    <div class="section-title">Peso corporal</div>
    <div class="card">
      ${lineChartSvg(weightValues, weightLabels, 'var(--accent2)')}
      ${deltaW !== null ? `<div class="exmeta" style="margin-top:6px">${deltaW <= 0 ? '↓' : '↑'} ${Math.abs(deltaW).toFixed(1)} kg desde el ${formatShort(weightDates[0])} (${firstW} kg → ${lastW} kg)</div>` : ''}
    </div>

    <div class="section-title">Peso cargado por ejercicio</div>
    <div class="card">
      <select id="exerciseSelect">
        ${exerciseNames.map((n) => `<option value="${escapeAttr(n)}" ${n === progresoState.exercise ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
      <div style="margin-top:10px">${lineChartSvg(kgValues, kgLabels, 'var(--accent)')}</div>
      ${points.length ? `
        <table class="progress-table">
          <thead><tr><th>Fecha</th><th>Kg</th><th>Reps</th></tr></thead>
          <tbody>
            ${points.slice().reverse().map((p) => `<tr><td>${formatShort(p.date)}</td><td>${p.kg}</td><td>${p.reps}</td></tr>`).join('')}
          </tbody>
        </table>
      ` : '<div class="exmeta">Sin series registradas para este ejercicio todavía.</div>'}
    </div>

    <div class="section-title">Comparar dos días</div>
    <div class="card">
      ${weightDates.length >= 2 ? `
        <div class="grid2">
          <div>
            <label class="field-label">Día A</label>
            <select id="dayA">${weightDates.map((d) => `<option value="${d}">${formatShort(d)}</option>`).join('')}</select>
          </div>
          <div>
            <label class="field-label">Día B</label>
            <select id="dayB">${weightDates.map((d, i) => `<option value="${d}" ${i === weightDates.length - 1 ? 'selected' : ''}>${formatShort(d)}</option>`).join('')}</select>
          </div>
        </div>
        <div id="compareResult" class="exmeta" style="margin-top:10px"></div>
      ` : '<div class="exmeta">Registra medidas en al menos 2 días distintos para poder comparar.</div>'}
    </div>
  `;

  document.getElementById('exerciseSelect')?.addEventListener('change', (e) => {
    progresoState.exercise = e.target.value;
    render();
  });

  function updateCompare() {
    const a = document.getElementById('dayA').value;
    const b = document.getElementById('dayB').value;
    const ma = measurements[a] || {};
    const mb = measurements[b] || {};
    const diff = ma.weightKg != null && mb.weightKg != null ? mb.weightKg - ma.weightKg : null;
    document.getElementById('compareResult').innerHTML = `
      ${formatShort(a)}: ${ma.weightKg ?? '—'} kg${ma.waistCm ? ` · cintura ${ma.waistCm} cm` : ''}<br/>
      ${formatShort(b)}: ${mb.weightKg ?? '—'} kg${mb.waistCm ? ` · cintura ${mb.waistCm} cm` : ''}
      ${diff !== null ? `<br/><b>${diff <= 0 ? '↓' : '↑'} ${Math.abs(diff).toFixed(1)} kg de diferencia</b>` : ''}
    `;
  }
  if (weightDates.length >= 2) {
    document.getElementById('dayA').addEventListener('change', updateCompare);
    document.getElementById('dayB').addEventListener('change', updateCompare);
    updateCompare();
  }
}

// ---------------- PLAN (referencia de solo lectura) ----------------

function renderPlan() {
  const sessions = ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'];
  app.innerHTML = `
    <div class="header">
      <div class="session">Plan · referencia</div>
      <div class="date">Semana ${CONFIG.weeks}-semanas · Objetivo ${CONFIG.calorieTarget} kcal / ${CONFIG.proteinTarget} g proteína</div>
    </div>
    <div class="section-title">Calendario</div>
    <div class="card">
      <div class="exmeta">Un solo evento recurrente por día de sesión (Lunes = Push A, Martes = Pull A, …), 12 semanas, todo el día.</div>
      <a class="btn-secondary" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="calendario.ics" download="calendario.ics">⬇ Descargar calendario.ics</a>
      <div class="exmeta" style="margin-top:8px">
        <b>Google Calendar (PC):</b> Configuración → Importar y exportar → Importar → elige este archivo.<br/>
        <b>Google Calendar (celular):</b> primero impórtalo desde el PC con tu cuenta de Google — se sincroniza solo al celular.<br/>
        Cuando la app esté publicada en un link fijo, este mismo calendario se podrá "suscribir por URL" para que se actualice solo si cambias el plan.
      </div>
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
    <div class="card">
      <div class="exmeta" style="margin-bottom:8px">Sesión: ${auth.currentUser?.email || ''}</div>
      <button class="btn-secondary" id="signOutBtn">Cerrar sesión</button>
    </div>
  `;
  document.getElementById('signOutBtn').addEventListener('click', () => signOut(auth));
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
  else if (route.screen === 'progreso') renderProgreso();
  else if (route.screen === 'plan') renderPlan();
}

// Cuando llega un cambio desde el otro dispositivo (Firestore), refresca la pantalla actual.
store.onChange(() => render());

// ---------------- Sesión (Google) ----------------
// La app no muestra nada hasta saber si hay sesión: evita que se vea/edite sin login,
// que es justo lo que protegen las reglas de Firestore del lado del servidor.

let currentUser = null;

function renderSignIn() {
  bottomnav.style.display = 'none';
  app.innerHTML = `
    <div class="signin">
      <h1>Entrenamiento</h1>
      <p class="exmeta">Inicia sesión con tu cuenta de Google para sincronizar tu registro entre el celular y el PC.</p>
      <button class="btn-primary" id="googleSignIn">Iniciar sesión con Google</button>
    </div>
  `;
  document.getElementById('googleSignIn').addEventListener('click', () => {
    signIn().catch((err) => toast('No se pudo iniciar sesión: ' + err.message));
  });
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    store.initCloudSync(user.uid);
    bottomnav.style.display = 'flex';
    render();
  } else {
    store.stopCloudSync();
    renderSignIn();
  }
});
