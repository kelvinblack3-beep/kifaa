const assert = require('assert');
const scoring = require('../lib/scoring.js');

// Node require of ES module: use dynamic import wrapper
(async ()=>{
  const mod = await import('../lib/scoring.js');
  const {scoreAnswer, aggregateAttempts, computePriority} = mod;

  // test scoring
  const q = {id:'t1', marks:2, correct_answer:'42', topic:'Test'};
  const r1 = scoreAnswer(q, '42');
  assert.strictEqual(r1.correct, true);
  assert.strictEqual(r1.marks, 2);

  const r2 = scoreAnswer(q, ' 42 ');
  assert.strictEqual(r2.correct, true);

  const attempts = [ {question_id:'t1', correct:true, marks:2}, {question_id:'t1', correct:false, marks:0} ];
  const qs = [q];
  const stats = aggregateAttempts(attempts, qs);
  assert(stats['Test']);
  assert.strictEqual(stats['Test'].attempts, 2);

  const pri = computePriority({mastery:50}, 0.5);
  assert(pri >= 0 && pri <= 1);

  console.log('All tests passed');
})();
