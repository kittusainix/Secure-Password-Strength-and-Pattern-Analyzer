'use strict';
const $ = (id) => document.getElementById(id);
const passwordInput = $('passwordInput');
const togglePassword = $('togglePassword');

// All analysis happens locally in this browser. The password is not uploaded or saved.
togglePassword.addEventListener('click', () => {
  const shouldShow = passwordInput.type === 'password';
  passwordInput.type = shouldShow ? 'text' : 'password';
  togglePassword.textContent = shouldShow ? 'Hide' : 'Show';
});
passwordInput.addEventListener('input', () => analyzePassword(passwordInput.value));

function setCheck(id, passed) {
  const element = $(id);
  element.classList.toggle('pass', passed);
  element.querySelector('.check-icon').textContent = passed ? '✓' : '·';
}

function analyzePassword(password) {
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const variety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  const repeated = /(.)\1{2,}/.test(password);
  const sequence = /0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|mnop|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz|qwerty|asdf|zxcv/i.test(password);
  const common = /password|passw0rd|admin|welcome|letmein|qwerty|iloveyou|abc123|123456/i.test(password);

  let score = Math.min(length, 20) * 2.5 + variety * 10;
  if (length >= 12) score += 8;
  if (length >= 16) score += 7;
  if (repeated) score -= 12;
  if (sequence) score -= 12;
  if (common) score -= 25;
  score = password ? Math.max(0, Math.min(100, Math.round(score))) : 0;

  let level = 'Not checked';
  let color = '#657392';
  if (password) {
    if (score >= 80) { level = 'Strong'; color = 'var(--good)'; }
    else if (score >= 60) { level = 'Good'; color = 'var(--cyan)'; }
    else if (score >= 35) { level = 'Fair'; color = 'var(--warn)'; }
    else { level = 'Very weak'; color = 'var(--bad)'; }
  }

  setCheck('checkLength', length >= 12);
  setCheck('checkUpper', hasUpper);
  setCheck('checkLower', hasLower);
  setCheck('checkNumber', hasNumber);
  setCheck('checkSymbol', hasSymbol);
  setCheck('checkPattern', !repeated && !sequence && !common);

  $('scoreValue').textContent = score;
  $('ringValue').textContent = score;
  $('characterCount').textContent = length;
  $('varietyCount').textContent = `${variety} / 4`;
  $('strengthMeter').style.width = `${score}%`;
  $('strengthMeter').style.background = color;
  $('strengthLabel').textContent = level;
  $('strengthLabel').style.color = color;
  $('scoreRing').style.background = `conic-gradient(${color} ${score * 3.6}deg, #253451 0deg)`;

  $('summaryTitle').textContent = !password ? 'Ready to analyze' : score >= 80 ? 'Strong password' : score >= 60 ? 'Good foundation' : score >= 35 ? 'Could be stronger' : 'Needs improvement';
  $('summaryText').textContent = !password
    ? 'Enter a sample password to view your results.'
    : score >= 80
      ? 'Good length and character variety. Keep this password unique for every account.'
      : 'Use more length and variety, and avoid common words or predictable patterns.';

  renderPatterns(password, { repeated, sequence, common, length, variety });
  renderRecommendations(password, { repeated, sequence, common, length, variety });
}

function renderPatterns(password, checks) {
  const container = $('patternResults');
  if (!password) {
    container.innerHTML = '<div class="pattern-item"><span class="pattern-icon">⌕</span><div><strong>Waiting for input</strong><p>Pattern checks will appear here as you type.</p></div></div>';
    return;
  }
  const items = [
    [checks.common, 'Common password pattern', checks.common ? 'Contains a commonly used word or password pattern.' : 'No listed common password keyword detected.'],
    [checks.sequence, 'Predictable sequence', checks.sequence ? 'Contains a sequence such as 1234, qwerty, or abcde.' : 'No listed keyboard or character sequence detected.'],
    [checks.repeated, 'Repeated characters', checks.repeated ? 'Three or more consecutive identical characters were found.' : 'No long repeated-character run detected.'],
    [checks.length < 12, 'Password length', checks.length < 12 ? 'Consider using at least 12 characters; longer is generally better.' : 'Length meets the 12-character guideline.'],
    [checks.variety < 3, 'Character variety', checks.variety < 3 ? 'Try mixing uppercase, lowercase, numbers, and symbols.' : 'Good variety across character types.']
  ];
  container.innerHTML = items.map(([problem, title, detail]) => `<div class="pattern-item ${problem ? 'bad' : 'good'}"><span class="pattern-icon">${problem ? '!' : '✓'}</span><div><strong>${title}</strong><p>${detail}</p></div></div>`).join('');
}

function renderRecommendations(password, checks) {
  const tips = [];
  if (!password || checks.length < 12) tips.push('Increase length to 12–16 or more characters.');
  if (!password || checks.variety < 3) tips.push('Mix uppercase, lowercase, numbers, and symbols.');
  if (checks.common) tips.push('Avoid common words such as “password” or “welcome”.');
  if (checks.sequence) tips.push('Avoid keyboard patterns and counting sequences.');
  if (checks.repeated) tips.push('Avoid repeating the same character several times.');
  if (!password || !tips.length || checks.length >= 12) tips.push('Use a unique password for each account; a trusted password manager can help.');
  $('recommendations').innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
}

analyzePassword('');
