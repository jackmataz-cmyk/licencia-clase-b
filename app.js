// app.js – Licencia Clase B Chile
// Mantiene index.html igual y agrega bancos extra: 35, 50 y 200 preguntas.

const unitsConfig = [
  { id: 1, name: 'Unidad 1', topic: 'El problema de los siniestros de tránsito', icon: '⚠️', file: 'TRANSITO-PRUEBA_UNIDAD_1.txt' },
  { id: 2, name: 'Unidad 2', topic: 'Principios de la Conducción',               icon: '⚙️', file: 'TRANSITO-PRUEBA_UNIDAD_2.txt' },
  { id: 3, name: 'Unidad 3', topic: 'Convivencia Vial',                           icon: '🤝', file: 'TRANSITO-PRUEBA_UNIDAD_3.txt' },
  { id: 4, name: 'Unidad 4', topic: 'El Individuo en el Tránsito',                icon: '👤', file: 'TRANSITO-PRUEBA_UNIDAD_4.txt' },
  { id: 5, name: 'Unidad 5', topic: 'Usuarios Vulnerables',                       icon: '🚸', file: 'TRANSITO-PRUEBA_UNIDAD_5.txt' },
  { id: 6, name: 'Unidad 6', topic: 'Normas de Circulación',                      icon: '🛣️', file: 'TRANSITO-PRUEBA_UNIDAD_6.txt' },
  { id: 7, name: 'Unidad 7', topic: 'Circunstancias Especiales',                  icon: '🌧️', file: 'TRANSITO-PRUEBA_UNIDAD_7.txt' },
  { id: 8, name: 'Unidad 8', topic: 'Informaciones Importantes',                  icon: '📋', file: 'TRANSITO-PRUEBA_UNIDAD_8.txt' },
  { id: 9, name: 'Unidad 9', topic: 'Señalización de Tránsito',                   icon: '🛑', file: 'TRANSITO-PRUEBA_UNIDAD_9.txt' },
];

// Bancos adicionales. No requieren modificar el index.html: los botones se crean desde JavaScript.
const extraBanks = [
  {
    id: 'banco35',
    name: 'Banco 35',
    topic: '35 preguntas NEXTEO / Municipalidad',
    icon: '🏛️',
    file: '35_preguntas_nexteo.txt'
  },
  {
    id: 'banco50',
    name: 'Refuerzo 50',
    topic: '50 preguntas de refuerzo CONASET',
    icon: '📘',
    file: '50_preguntas_refuerzo.txt'
  },
  {
    id: 'banco200',
    name: 'Examen 200',
    topic: 'Banco completo 200 preguntas',
    icon: '🎯',
    file: '200_preguntas_examen_completo.txt'
  },
];

let currentQuestions = [];
let currentIndex = 0;
let score = 0;

// Elementos del DOM
const chapterList  = document.getElementById('chapterList');
const quizPanel    = document.getElementById('quizPanel');
const introPanel   = document.getElementById('introPanel');
const quizTitle    = document.getElementById('quizTitle');
const quizMeta     = document.getElementById('quizMeta');
const questionText = document.getElementById('questionText');
const questionImage = document.getElementById('questionImage');
const answers      = document.getElementById('answers');
const nextBtn      = document.getElementById('nextBtn');
const feedback     = document.getElementById('feedback');
const scoreValue   = document.getElementById('scoreValue');

// ===== INIT =====
function init() {
  // Crear botones de unidades
  unitsConfig.forEach(unit => {
    const btn = document.createElement('button');
    btn.className = 'chapter-btn';
    btn.innerHTML = `<span class="ch-icon">${unit.icon}</span><span class="ch-text">${unit.name}<small>${unit.topic}</small></span>`;
    btn.onclick = () => loadUnit(unit);
    chapterList.appendChild(btn);
  });

  // Crear botones para los bancos 35, 50 y 200 sin tocar index.html
  createExtraBankButtons();

  const totalEl = document.getElementById('totalQuestions');
  if (totalEl) totalEl.textContent = '9 unidades + bancos 35 / 50 / 200';

  // Ajuste visual de la tarjeta inicial sin modificar index.html
  const introCards = document.querySelectorAll('.intro-card');
  if (introCards[0]) {
    const strong = introCards[0].querySelector('strong');
    const small = introCards[0].querySelector('small');
    if (strong) strong.textContent = 'Bancos ampliados';
    if (small) small.textContent = 'Unidades + 35, 50 y 200';
  }

  // Botón modo mixto: mezcla solo las 9 unidades oficiales.
  const mixBtn = document.getElementById('mixMode');
  if (mixBtn) mixBtn.onclick = () => loadMixMode();

  // Botón señaléticas: si no hay biblioteca cargada, avisa sin romper la app.
  const signsBtn = document.getElementById('showSigns');
  if (signsBtn) {
    signsBtn.onclick = () => {
      alert('🚸 La sección de señaléticas aún no tiene imágenes cargadas. Las preguntas siguen funcionando correctamente.');
    };
  }

  // Botón inicio/reset
  const resetBtn = document.getElementById('resetProgress');
  if (resetBtn) resetBtn.onclick = () => location.reload();
}

function createExtraBankButtons() {
  const actions = document.querySelector('.sidebar-actions');
  if (!actions) return;

  const title = document.createElement('div');
  title.style.margin = '10px 0 4px';
  title.style.fontSize = '13px';
  title.style.fontWeight = '700';
  title.style.color = 'var(--muted)';
  title.textContent = 'Bancos extra';

  const signsBtn = document.getElementById('showSigns');
  actions.insertBefore(title, signsBtn || null);

  extraBanks.forEach(bank => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-mix';
    btn.type = 'button';
    btn.innerHTML = `${bank.icon} ${bank.name}<br><small style="font-weight:400;">${bank.topic}</small>`;
    btn.onclick = () => loadExtraBank(bank);
    actions.insertBefore(btn, signsBtn || null);
  });
}

// ===== CARGA DE UNIDAD =====
async function loadUnit(unit) {
  try {
    const questions = await loadQuestionsFromFile(unit.file);
    startQuiz({
      questions,
      title: unit.topic,
      badge: unit.name,
      shuffle: true
    });
  } catch (error) {
    console.error(error);
    alert('❌ Error cargando las preguntas.\nArchivo buscado: ' + unit.file + '\n\nAsegúrate de que el nombre del archivo en GitHub coincide exactamente.');
  }
}

// ===== CARGA DE BANCOS EXTRA =====
async function loadExtraBank(bank) {
  try {
    const questions = await loadQuestionsFromFile(bank.file);
    startQuiz({
      questions,
      title: bank.topic,
      badge: `${bank.icon} ${bank.name}`,
      shuffle: true
    });
  } catch (error) {
    console.error(error);
    alert('❌ Error cargando el banco extra.\nArchivo buscado: ' + bank.file + '\n\nVerifica que el archivo esté subido en la raíz del repositorio.');
  }
}

async function loadQuestionsFromFile(file) {
  const response = await fetch(file, { cache: 'no-store' });
  if (!response.ok) throw new Error('Archivo no encontrado: ' + file);

  const text = await response.text();
  const parsed = parseTxtQuestions(text);

  if (!parsed.length) {
    throw new Error('El archivo no contiene preguntas válidas: ' + file);
  }

  return parsed;
}

function startQuiz({ questions, title, badge, shuffle = true }) {
  currentQuestions = shuffle ? shuffleArray(questions) : questions;
  currentIndex = 0;
  score = 0;

  if (scoreValue) scoreValue.textContent = '0';
  if (quizTitle) quizTitle.textContent = `${title} — ${currentQuestions.length} preguntas`;

  const badgeEl = document.getElementById('modeBadge');
  if (badgeEl) badgeEl.textContent = badge;

  showPanel(quizPanel);
  renderQuestion();
}

// ===== MODO MIXTO =====
async function loadMixMode() {
  try {
    let allQuestions = [];

    for (const unit of unitsConfig) {
      try {
        const parsed = await loadQuestionsFromFile(unit.file);
        allQuestions = allQuestions.concat(parsed);
      } catch (err) {
        console.warn('No se pudo cargar:', unit.file, err);
      }
    }

    if (allQuestions.length === 0) throw new Error('No se cargaron preguntas.');

    currentQuestions = shuffleArray(allQuestions).slice(0, 50);
    currentIndex = 0;
    score = 0;
    scoreValue.textContent = '0';
    quizTitle.textContent = 'Modo Mixto — 50 preguntas aleatorias';

    const badge = document.getElementById('modeBadge');
    if (badge) badge.textContent = '🔀 Mixto';

    showPanel(quizPanel);
    renderQuestion();
  } catch (error) {
    console.error(error);
    alert('❌ Error cargando el modo mixto: ' + error.message);
  }
}

// ===== PARSER TXT =====
function parseTxtQuestions(text) {
  const clean = text.replace(/\r/g, '');
  const lines = clean.split('\n').map(l => l.trim()).filter(l => l !== '');
  const questions = [];
  const answersMap = {};

  // Extraer solucionario si existe.
  // Soporta formatos: "1.b", "1. b", "1) b".
  const solIndex = clean.search(/SOLUCIONARIO/i);
  if (solIndex !== -1) {
    const solText = clean.slice(solIndex).replace(/\n/g, ' ');
    const regex = /(\d+)\s*[\.)]\s*([abc])/gi;
    let m;
    while ((m = regex.exec(solText)) !== null) {
      answersMap[m[1]] = m[2].toLowerCase();
    }
  }

  let currentQ = null;

  for (const line of lines) {
    if (/^SOLUCIONARIO/i.test(line) || /^✅\s*SOLUCIONARIO/i.test(line)) break;

    // Formato alternativo: "CORRECTA: b"
    if (/^(CORRECTA|Respuesta correcta):/i.test(line)) {
      const match = line.match(/:\s*([abc])/i);
      if (match && currentQ) {
        currentQ.correct = ['a', 'b', 'c'].indexOf(match[1].toLowerCase());
      }
      continue;
    }

    // "12. Texto de pregunta"
    const qMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (qMatch) {
      if (currentQ) questions.push(currentQ);
      const num = qMatch[1];
      currentQ = {
        id: parseInt(num, 10),
        question: qMatch[2].trim(),
        options: [],
        correct: ['a', 'b', 'c'].indexOf((answersMap[num] || '').toLowerCase())
      };
      continue;
    }

    // "a) texto", "b) texto", "c) texto"
    const optMatch = line.match(/^([abc])\)?\s+(.+)$/i);
    if (optMatch && currentQ) {
      currentQ.options.push(optMatch[2].trim());
    }
  }

  if (currentQ) questions.push(currentQ);

  // Deja fuera encabezados o bloques incompletos.
  return questions.filter(q => q.options.length >= 2);
}

// ===== SHUFFLE =====
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== RENDER PREGUNTA =====
function renderQuestion() {
  const q = currentQuestions[currentIndex];
  if (!q) return;

  if (questionImage) {
    questionImage.style.display = 'none';
    questionImage.src = '';
  }

  quizMeta.textContent = `Pregunta ${currentIndex + 1} de ${currentQuestions.length}`;
  questionText.textContent = q.question;
  answers.innerHTML = '';
  feedback.className = 'feedback hidden';
  feedback.innerHTML = '';
  nextBtn.disabled = true;
  nextBtn.style.display = '';

  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="opt-letter">${['A', 'B', 'C'][index]}</span> ${opt}`;
    btn.onclick = () => checkAnswer(index);
    answers.appendChild(btn);
  });
}

// ===== CHEQUEO DE RESPUESTA =====
function checkAnswer(selected) {
  const q = currentQuestions[currentIndex];
  const buttons = answers.querySelectorAll('.answer-btn');

  buttons.forEach(b => b.disabled = true);

  if (selected === q.correct) {
    buttons[selected].classList.add('correct');
    score++;
    scoreValue.textContent = String(score);
    feedback.className = 'feedback ok';
    feedback.innerHTML = `✅ <strong>¡Correcto!</strong> Respuesta: <strong>${['A', 'B', 'C'][q.correct]}</strong>`;
  } else {
    buttons[selected].classList.add('incorrect');
    if (q.correct > -1 && buttons[q.correct]) {
      buttons[q.correct].classList.add('correct');
    }
    feedback.className = 'feedback bad';
    feedback.innerHTML = `❌ <strong>Incorrecto.</strong> La respuesta correcta era: <strong>${['A', 'B', 'C'][q.correct] || '?'}</strong>`;
  }

  nextBtn.disabled = false;
}

// ===== NAVEGACIÓN =====
function showPanel(panel) {
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  panel.classList.remove('hidden');
}

nextBtn.onclick = () => {
  currentIndex++;
  if (currentIndex < currentQuestions.length) {
    renderQuestion();
  } else {
    showResults();
  }
};

function showResults() {
  const total = currentQuestions.length;
  const pct   = total ? Math.round(score * 100 / total) : 0;
  const emoji = pct >= 70 ? '🎉' : pct >= 50 ? '📘' : '💪';
  const msg   = pct >= 70 ? '¡Excelente! Estás listo para el examen.' : pct >= 50 ? 'Buen avance, sigue repasando.' : 'Repasa las unidades con más calma.';

  questionText.textContent = 'Resultados';
  answers.innerHTML = `
    <div class="result-box">
      <div class="result-emoji">${emoji}</div>
      <h2>Cuestionario completado</h2>
      <div class="result-score">${score} / ${total}</div>
      <p class="result-pct">${pct}% de efectividad</p>
      <p class="result-msg">${msg}</p>
      <button class="btn btn-next" style="margin: 16px auto; display:block;" onclick="location.reload()">↩ Volver al inicio</button>
    </div>
  `;
  feedback.className = 'feedback hidden';
  feedback.innerHTML = '';
  nextBtn.disabled = true;
  nextBtn.style.display = 'none';
}

// ===== LANZAR =====
init();
