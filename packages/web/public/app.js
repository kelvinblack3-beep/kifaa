// Minimal browser app using scoring.js functions loaded via module
import {scoreAnswer, aggregateAttempts, computePriority} from '../lib/scoring.js';

const QUESTIONS_URL = '/questions.json';
let questions = [];
let state = {student:{}, attempts:[], diagIndex:0, practiceIndex:0};

function saveState(){ try{ localStorage.setItem('sharpboyz_state', JSON.stringify(state)); }catch(e){ console.warn('Failed to save state', e); }}
function loadState(){ try{ const s = localStorage.getItem('sharpboyz_state'); if(s){ state = JSON.parse(s); if(!state.attempts) state.attempts = []; } } catch(e){ console.warn('Failed to load state, resetting', e); state = {student:{}, attempts:[], diagIndex:0, practiceIndex:0}; localStorage.removeItem('sharpboyz_state'); } }

async function loadQuestions(){ const res = await fetch(QUESTIONS_URL); questions = await res.json(); }

function show(el){ document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden')); document.getElementById(el).classList.remove('hidden'); }

function init(){
  loadState();
  document.getElementById('start-setup').addEventListener('click', ()=> show('setup'));
  document.getElementById('start-diagnostic').addEventListener('click', startDiagnostic);
  document.getElementById('diag-next').addEventListener('click', onDiagNext);
  document.getElementById('to-practice').addEventListener('click', ()=>{ preparePractice(); show('practice'); });
  document.getElementById('practice-next').addEventListener('click', onPracticeNext);
  loadQuestions().then(()=>{ show('landing'); });
}

function startDiagnostic(){
  const name = document.getElementById('student-name').value || 'Student';
  state.student.name = name;
  state.student.level = document.getElementById('student-level').value;
  state.student.subject = document.getElementById('student-subject').value;
  state.attempts = state.attempts || [];
  state.diagIndex = 0;
  saveState();
  show('diagnostic');
  renderDiagQuestion();
}

function renderDiagQuestion(){
  const area = document.getElementById('question-area');
  const q = questions.filter(x=>x.subject==='Mathematics')[state.diagIndex];
  if(!q){ area.innerHTML = '<p>No more questions.</p>'; return; }
  area.innerHTML = `<h3>Q${state.diagIndex+1}: ${q.prompt}</h3>` +
    (q.options ? `<ul>${q.options.map(o=>`<li><label><input type="radio" name="opt" value="${o}"> ${o}</label></li>`).join('')}</ul>` : `<input id="ans" placeholder="Answer">`);
}

function onDiagNext(){
  const q = questions.filter(x=>x.subject==='Mathematics')[state.diagIndex];
  if(!q) return;
  let ans = null;
  if(q.options){ const r = document.querySelector('input[name="opt"]:checked'); if(r) ans = r.value; }
  else{ ans = document.getElementById('ans').value; }
  const result = scoreAnswer(q, ans);
  state.attempts.push({question_id:q.id, correct:result.correct, marks:result.marks, timestamp:Date.now()});
  state.diagIndex++;
  saveState();
  if(state.diagIndex >= 5){ renderResults(); show('results'); }
  else renderDiagQuestion();
}

function renderResults(){
  const summary = document.getElementById('score-summary');
  const stats = aggregateAttempts(state.attempts, questions);
  summary.innerHTML = `<pre>${JSON.stringify(stats, null, 2)}</pre>`;
  const weaknesses = document.getElementById('weaknesses');
  // compute priorities per topic
  const topics = Object.keys(stats);
  const rows = topics.map(t=>{
    const qSample = questions.find(x=>x.topic===t);
    const hist = qSample ? (qSample.historical_frequency||0) : 0;
    const pr = computePriority(stats[t], hist);
    return `<div class="topic"><h4>${t}</h4><p>Accuracy: ${stats[t].accuracy}%, Mastery: ${stats[t].mastery}%</p><p>Historical likelihood: ${Math.round((hist||0)*100)}% <em>(DEMO/historical baseline)</em></p><p>Priority score: ${pr}</p></div>`;
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
  const pool = questions.filter(x=>x.topic===state.practiceTopic);
  const q = pool[state.practiceIndex % pool.length];
  if(!q) { area.innerHTML = 'No practice available.'; return; }
  area.innerHTML = `<h3>${q.prompt}</h3>` + (q.options ? `<ul>${q.options.map(o=>`<li><label><input type="radio" name="popt" value="${o}"> ${o}</label></li>`).join('')}</ul>` : `<input id="pans" placeholder="Answer">`);
}

function onPracticeNext(){
  const pool = questions.filter(x=>x.topic===state.practiceTopic);
  const q = pool[state.practiceIndex % pool.length];
  let ans = null;
  if(q.options){ const r = document.querySelector('input[name="popt"]:checked'); if(r) ans = r.value; }
  else{ ans = document.getElementById('pans').value; }
  const res = scoreAnswer(q, ans);
  state.attempts.push({question_id:q.id, correct:res.correct, marks:res.marks, timestamp:Date.now()});
  state.practiceIndex++;
  saveState();
  renderPractice();
}

loadState();
init();
