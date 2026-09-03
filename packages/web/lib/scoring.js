// Simple deterministic scoring and priority functions used by both browser and tests

/**
 * Normalize a numeric comma-separated answer for comparison.
 * Handles whitespace and, for unordered sets, treats equivalent orderings as equal.
 * @param {string} answer - The answer to normalize
 * @returns {string} - Normalized answer
 */
function normalizeAnswer(answer) {
  const str = String(answer || '').trim();
  
  // Check if it's a comma-separated list of numbers
  const parts = str.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  if (parts.length > 1 && parts.every(p => /^-?\d+\.?\d*$/.test(p))) {
    // It's a numeric list; sort to normalize order
    const nums = parts.map(p => parseFloat(p)).sort((a, b) => a - b);
    return nums.join(',');
  }
  
  // Not a numeric list; return lowercased trimmed version
  return str.toLowerCase();
}

export function scoreAnswer(question, answer){
  const correct = (normalizeAnswer(String(answer||'')) === normalizeAnswer(String(question.correct_answer||'')));
  const marks = correct ? (question.marks || 1) : 0;
  return {correct, marks};
}

export function aggregateAttempts(attempts, questions){
  // attempts: [{question_id, correct, marks}]
  const byTopic = {};
  for(const a of attempts){
    const q = questions.find(x=>x.id===a.question_id);
    if(!q) continue;
    const topic = q.topic || 'unknown';
    if(!byTopic[topic]) byTopic[topic]={correct:0,totalMarks:0,maxMarks:0,attempts:0};
    byTopic[topic].attempts++;
    byTopic[topic].correct += a.correct ? 1:0;
    byTopic[topic].totalMarks += a.marks;
    byTopic[topic].maxMarks += q.marks || 1;
  }
  const stats = {};
  for(const t of Object.keys(byTopic)){
    const b = byTopic[t];
    stats[t] = {
      attempts: b.attempts,
      accuracy: b.attempts ? Math.round(100*(b.correct/b.attempts)) : 0,
      mastery: b.maxMarks ? +( (b.totalMarks / b.maxMarks)*100 ).toFixed(1) : 0
    };
  }
  return stats;
}

export function computePriority(topicStat, historicalFrequency){
  // Simple transparent formula: priority = (1 - mastery%) * historicalFrequency
  // historicalFrequency is 0..1
  const weakness = 1 - ((topicStat.mastery||0)/100);
  return +(weakness * (historicalFrequency||0)).toFixed(3);
}
