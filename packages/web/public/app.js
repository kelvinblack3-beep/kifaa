// Minimal browser app using scoring.js functions loaded via module
import {scoreAnswer, aggregateAttempts, computePriority} from '../lib/scoring.js';

const QUESTIONS_URL = '/questions.json';
let questions = [];
let state = {student:{}, attempts:[], diagIndex:0, practiceIndex:0};

function saveState(){ 
  try{ 
    localStorage.setItem('sharpboyz_state', JSON.stringify(state)); 
  } catch(e){ 
    console.warn('Failed to save state', e); 
  }
}

function loadState(){ 
  try{ 
    const s = localStorage.getItem('sharpboyz_state'); 
    if(s){ 
      const parsed = JSON.parse(s); 
      if(parsed && typeof parsed === 'object') {
        state = parsed;
        if(!state.attempts) state.attempts = [];
      }
    } 
  } catch(e){ 
    console.warn('Failed to load state, continuing with defaults', e); 
    // State already initialized to safe defaults above
  }
}

async function loadQuestions(){ 
  try {
    const res = await fetch(QUESTIONS_URL); 
    if (!res.ok) throw new Error(`Failed to fetch questions: ${res.status}`);
    questions = await res.json(); 
  } catch(e) {
    console.error('Failed to load questions', e);
    questions = [];
  }
}

function show(el){ 
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden')); 
  const target = document.getElementById(el);
  if(target) target.classList.remove('hidden');
}

function init(){
  loadState();
  const startSetup = document.getElementById('start-setup');
  const startDiag = document.getElementById('start-diagnostic');
  const diagNext = document.getElementById('diag-next');
  const toPractice = document.getElementById('to-practice');
  const practiceNext = document.getElementById('practice-next');
  
  if(startSetup) startSetup.addEventListener('click', ()=> show('setup'));
  if(startDiag) startDiag.addEventListener('click', startDiagnostic);
  if(diagNext) diagNext.addEventListener('click', onDiagNext);
  if(toPractice) toPractice.addEventListener('click', ()=>{ preparePractice(); show('practice'); });
  if(practiceNext) practiceNext.addEventListener('click', onPracticeNext);
  
  loadQuestions().then(()=>{ show('landing'); });
}

function startDiagnostic(){
  const nameEl = document.getElementById('student-name');
  const levelEl = document.getElementById('student-level');
  const subjEl = document.getElementById('student-subject');
  
  const name = (nameEl && nameEl.value) || 'Student';
  state.student.name = name;
  state.student.level = levelEl ? levelEl.value : 'Form 1';
  state.student.subject = subjEl ? subjEl.value : 'Mathematics';
  state.attempts = state.attempts || [];
  state.diagIndex = 0;
  saveState();
  show('diagnostic');
  renderDiagQuestion();
}

function renderDiagQuestion(){
  const area = document.getElementById('question-area');
  if(!area) return;
  
  const q = questions.filter(x=>x.subject==='Mathematics')[state.diagIndex];
  if(!q){ area.innerHTML = '<p>No more questions.</p>'; return; }
  area.innerHTML = `<h3>Q${state.diagIndex+1}: ${q.prompt}</h3>` +
    (q.options ? `<ul>${q.options.map(o=>`<li><label><input type="radio" name="opt" value="${o}"> ${o}</label></li>`).join('')}</ul>` : `<input id="ans" placeholder="Answer">`);
}

function onDiagNext(){
  const q = questions.filter(x=>x.subject==='Mathematics')[state.diagIndex];
  if(!q) return;
  let ans = null;
  if(q.options){ 
    const r = document.querySelector('input[name="opt"]:checked'); 
    if(r) ans = r.value; 
  } else{ 
    const ansEl = document.getElementById('ans');
    if(ansEl) ans = ansEl.value; 
  }
  const result = scoreAnswer(q, ans);
  state.attempts.push({question_id:q.id, correct:result.correct, marks:result.marks, timestamp:Date.now()});
  state.diagIndex++;
  saveState();
  if(state.diagIndex >= 5){ renderResults(); show('results'); }
  else renderDiagQuestion();
}

function renderResults(){
  const summary = document.getElementById('score-summary');
  if(!summary) return;
  
  const stats = aggregateAttempts(state.attempts, questions);
  summary.innerHTML = `<pre>${JSON.stringify(stats, null, 2)}</pre>`;
  const weaknesses = document.getElementById('weaknesses');
  if(!weaknesses) return;
  
  // compute priorities per topic
  const topics = Object.keys(stats);
  const rows = topics.map(t=>{
    const qSample = questions.find(x=>x.topic===t);
    const hist = qSample ? (qSample.historical_frequency||0) : 0;
    const pr = computePriority(stats[t], hist);
    return `<div class="topic"><h4>${t}</h4><p>Accuracy: ${stats[t].accuracy}%, Mastery: ${stats[t].mastery}%</p><p>Historical likelihood: ${Math.round((hist||0)*100)}% <em>(DEMO/historical baseline, not official KNEC data)</em></p></div>`;
  }).join('');
  weaknesses.innerHTML = rows;
}

function preparePractice(){
  // select highest priority topic
  const stats = aggregateAttempts(state.attempts, questions);
  const topicScores = Object.keys(stats).map(t=>{
    const qSample = questions.find(x=>x.topic===t);
    const hist = qSample ? (qSample.historical_frequency||0) : 0;
    return {topic:t,priority:computePriority(stats[t], hist)};
  }).sort((a,b)=>b.priority - a.priority);
  state.practiceTopic = topicScores.length ? topicScores[0].topic : (questions[0].topic||'unknown');
  state.practiceIndex = 0;
  saveState();
  renderPractice();
}

function renderPractice(){
  const area = document.getElementById('practice-area');
  if(!area) return;
  
  const pool = questions.filter(x=>x.topic===state.practiceTopic);
  const q = pool[state.practiceIndex % pool.length];
  if(!q) { area.innerHTML = 'No practice available.'; return; }
  area.innerHTML = `<h3>${q.prompt}</h3>` + (q.options ? `<ul>${q.options.map(o=>`<li><label><input type="radio" name="popt" value="${o}"> ${o}</label></li>`).join('')}</ul>` : `<input id="pans" placeholder="Answer">`);
}

function onPracticeNext(){
  const pool = questions.filter(x=>x.topic===state.practiceTopic);
  const q = pool[state.practiceIndex % pool.length];
  if(!q) return;
  
  let ans = null;
  if(q.options){ 
    const r = document.querySelector('input[name="popt"]:checked'); 
    if(r) ans = r.value; 
  } else{ 
    const ansEl = document.getElementById('pans');
    if(ansEl) ans = ansEl.value; 
  }
  const res = scoreAnswer(q, ans);
  state.attempts.push({question_id:q.id, correct:res.correct, marks:res.marks, timestamp:Date.now()});
  state.practiceIndex++;
  saveState();
  renderPractice();
}

loadState();
init();
