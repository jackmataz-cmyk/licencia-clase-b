// app.js – Licencia Clase B Chile
// Nombres de archivo con espacio (como fueron subidos a GitHub)

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

let currentQuestions = [];
let currentIndex = 0;
let score = 0;

// Elementos del DOM
const chapterList  = document.getElementById('chapterList');
const quizPanel    = document.getElementById('quizPanel');
const welcomePanel = document.getElementById('welcomePanel');
const quizTitle    = document.getElementById('quizTitle');
const quizMeta     = document.getElementById('quizMeta');
const questionText = document.getElementById('questionText');
const answers      = document.getElementById('answers');
const nextBtn      = document.getElementById('nextBtn');
const feedback     = document.getElementById('feedback');
const scoreValue   = document.getElementById('scoreValue');

// ===== INIT =====
function init() {
  unitsConfig.forEach(unit => {
    const btn = document.createElement('button');
    btn.className = 'chapter-btn';
    btn.innerHTML = `<span class="ch-icon">${unit.icon}</span><span class="ch-text">${unit.name}<small>${unit.topic}</small></span>`;
    btn.onclick = () => loadUnit(unit);
    chapterList.appendChild(btn);
  });

  const totalEl = document.getElementById('totalQuestions');
  if (totalEl) totalEl.textContent = '450 Preguntas disponibles';

  // Botón modo mixto
  const mixBtn = document.getElementById('mixMode');
  if (mixBtn) mixBtn.onclick = () => loadMixMode();

  // Botón inicio/reset
  const resetBtn = document.getElementById('resetProgress');
  if (resetBtn) resetBtn.onclick = () => location.reload();
}

// ===== CARGA DE UNIDAD =====
async function loadUnit(unit) {
  try {
    const response = await fetch(unit.file);
    if (!response.ok) throw new Error('Archivo no encontrado: ' + unit.file);
    const text = await response.text();

    currentQuestions = shuffleArray(parseTxtQuestions(text));
    currentIndex = 0;
    score = 0;
    scoreValue.textContent = '0';
    quizTitle.textContent = unit.topic;

    const badge = document.getElementById('modeBadge');
    if (badge) badge.textContent = unit.name;

    showPanel(quizPanel);
    renderQuestion();
  } catch (error) {
    console.error(error);
    alert('❌ Error cargando las preguntas.\nArchivo buscado: ' + unit.file + '\n\nAsegúrate de que el nombre del archivo en GitHub coincide exactamente.');
  }
}

// ===== MODO MIXTO =====
async function loadMixMode() {
  try {
    let allQuestions = [];

    for (const unit of unitsConfig) {
      const response = await fetch(unit.file);
      if (!response.ok) continue;
      const text = await response.text();
      const parsed = parseTxtQuestions(text);
      allQuestions = allQuestions.concat(parsed);
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

  // Extraer solucionario
  const solIndex = clean.search(/SOLUCIONARIO/i);
  if (solIndex !== -1) {
    const solText = clean.slice(solIndex).replace(/\n/g, ' ');
    const regex = /(\d+)\.\s*([abc])/gi;
    let m;
    while ((m = regex.exec(solText)) !== null) {
      answersMap[m[1]] = m[2].toLowerCase();
    }
  }

  // Parsear preguntas
  let currentQ = null;

  for (const line of lines) {
    if (/^SOLUCIONARIO/i.test(line)) break;
    if (/^(CORRECTA|Respuesta correcta):/i.test(line)) {
      // formato alternativo "CORRECTA: b"
      const match = line.match(/:\s*([abc])/i);
      if (match && currentQ) {
        currentQ.correct = ['a','b','c'].indexOf(match[1].toLowerCase());
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
        correct: ['a','b','c'].indexOf((answersMap[num] || '').toLowerCase())
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
    btn.innerHTML = `<span class="opt-letter">${['A','B','C'][index]}</span> ${opt}`;
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
    feedback.innerHTML = `✅ <strong>¡Correcto!</strong> Respuesta: <strong>${['A','B','C'][q.correct]}</strong>`;
  } else {
    buttons[selected].classList.add('incorrect');
    if (q.correct > -1 && buttons[q.correct]) {
      buttons[q.correct].classList.add('correct');
    }
    feedback.className = 'feedback bad';
    feedback.innerHTML = `❌ <strong>Incorrecto.</strong> La respuesta correcta era: <strong>${['A','B','C'][q.correct] || '?'}</strong>`;
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
      <h2>Unidad completada</h2>
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
