(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const inputEl = $('input');
  const outputEl = $('output');
  const modeEl = $('mode');
  const rotShiftEl = $('rot-shift');
  const rotOptionsEl = $('rot-options');
  const decodeBtn = $('decode-btn');
  const swapBtn = $('swap-btn');
  const clearInputBtn = $('clear-input');
  const copyOutputBtn = $('copy-output');
  const loadSampleBtn = $('load-sample');
  const inputStatsEl = $('input-stats');
  const outputStatsEl = $('output-stats');
  const statusEl = $('status');
  const historyListEl = $('history-list');
  const clearHistoryBtn = $('clear-history');

  const morseMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
  };
  const reverseMorseMap = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

  const samples = {
    'base64-decode': 'SGVsbG8sIFdvcmxkIQ==',
    'base64-encode': 'Hello, World!',
    'url-decode': 'Hello%2C%20World%21',
    'url-encode': 'Hello, World!',
    'rot13': 'Uryyb, Jbeyq!',
    'rot-bruteforce': 'Uryyb, Jbeyq!',
    'hex-decode': '48656c6c6f2c20576f726c6421',
    'hex-encode': 'Hello, World!',
    'binary-decode': '01001000 01100101 01101100 01101100 01101111',
    'binary-encode': 'Hello',
    'morse-decode': '.... . .-.. .-.. --- / .-- --- .-. .-.. -..',
    'morse-encode': 'HELLO WORLD',
    'jwt-decode': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    'html-decode': '&lt;div&gt;Hello &amp; goodbye&lt;/div&gt;',
    'html-encode': '<div>Hello & goodbye</div>'
  };

  function setStatus(message, type) {
    statusEl.textContent = message || '';
    statusEl.className = 'status' + (type ? ' ' + type : '');
    if (message) {
      setTimeout(() => {
        if (statusEl.textContent === message) {
          statusEl.textContent = '';
          statusEl.className = 'status';
        }
      }, 3000);
    }
  }

  function updateStats() {
    inputStatsEl.textContent = `${inputEl.value.length} chars, ${new Blob([inputEl.value]).size} bytes`;
    outputStatsEl.textContent = `${outputEl.value.length} chars, ${new Blob([outputEl.value]).size} bytes`;
  }

  function rot(text, shift) {
    return text.replace(/[a-zA-Z]/g, (ch) => {
      const base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
    });
  }

  function base64Decode(str) {
    try {
      const decoded = atob(str);
      try {
        return decodeURIComponent(escape(decoded));
      } catch (e) {
        return decoded;
      }
    } catch (e) {
      throw new Error('Invalid Base64 input');
    }
  }

  function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function hexDecode(str) {
    const cleaned = str.replace(/\s+/g, '');
    if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length % 2 !== 0) {
      throw new Error('Invalid hex input');
    }
    let out = '';
    for (let i = 0; i < cleaned.length; i += 2) {
      out += String.fromCharCode(parseInt(cleaned.substr(i, 2), 16));
    }
    try {
      return decodeURIComponent(escape(out));
    } catch (e) {
      return out;
    }
  }

  function hexEncode(str) {
    return Array.from(str)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  function binaryDecode(str) {
    const cleaned = str.replace(/\s+/g, '');
    if (!/^[01]*$/.test(cleaned) || cleaned.length % 8 !== 0) {
      throw new Error('Invalid binary input');
    }
    let out = '';
    for (let i = 0; i < cleaned.length; i += 8) {
      out += String.fromCharCode(parseInt(cleaned.substr(i, 8), 2));
    }
    try {
      return decodeURIComponent(escape(out));
    } catch (e) {
      return out;
    }
  }

  function binaryEncode(str) {
    return Array.from(str)
      .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  }

  function morseEncode(str) {
    return str.toUpperCase()
      .split('')
      .map((ch) => morseMap[ch] || ch)
      .join(' ');
  }

  function morseDecode(str) {
    return str.trim()
      .split(/\s+/)
      .map((code) => reverseMorseMap[code] || code)
      .join('');
  }

  function htmlEncode(str) {
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
  }

  function htmlDecode(str) {
    const el = document.createElement('div');
    el.innerHTML = str;
    return el.textContent;
  }

  function jwtDecode(str) {
    const parts = str.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT must have header.payload.signature format');
    }
    const decodePart = (part) => {
      const padded = part + '='.repeat((4 - part.length % 4) % 4);
      return JSON.parse(base64Decode(padded));
    };
    return JSON.stringify({
      header: decodePart(parts[0]),
      payload: decodePart(parts[1]),
      signature: parts[2]
    }, null, 2);
  }

  function transform(mode, text) {
    switch (mode) {
      case 'base64-decode': return base64Decode(text);
      case 'base64-encode': return base64Encode(text);
      case 'url-decode': return decodeURIComponent(text);
      case 'url-encode': return encodeURIComponent(text);
      case 'rot13': {
        const shift = parseInt(rotShiftEl.value, 10) || 13;
        return rot(text, shift);
      }
      case 'rot-bruteforce': {
        const lines = [];
        for (let i = 1; i <= 25; i++) {
          lines.push(`ROT${i.toString().padStart(2, '0')}: ${rot(text, i)}`);
        }
        return lines.join('\n');
      }
      case 'hex-decode': return hexDecode(text);
      case 'hex-encode': return hexEncode(text);
      case 'binary-decode': return binaryDecode(text);
      case 'binary-encode': return binaryEncode(text);
      case 'morse-decode': return morseDecode(text);
      case 'morse-encode': return morseEncode(text);
      case 'jwt-decode': return jwtDecode(text);
      case 'html-decode': return htmlDecode(text);
      case 'html-encode': return htmlEncode(text);
      default: return text;
    }
  }

  function run() {
    const mode = modeEl.value;
    const text = inputEl.value;
    if (!text) {
      outputEl.value = '';
      setStatus('Enter input to decode/transform', '');
      updateStats();
      return;
    }
    try {
      outputEl.value = transform(mode, text);
      setStatus('Done', 'ok');
      addHistory(mode, text, outputEl.value);
    } catch (err) {
      outputEl.value = '';
      setStatus(err.message || 'Error', 'error');
    }
    updateStats();
  }

  function addHistory(mode, original, result) {
    const li = document.createElement('li');
    const modeSpan = document.createElement('span');
    modeSpan.className = 'h-mode';
    modeSpan.textContent = mode;
    const previewSpan = document.createElement('span');
    previewSpan.className = 'h-preview';
    previewSpan.textContent = result.slice(0, 120).replace(/\n/g, ' ');
    li.appendChild(modeSpan);
    li.appendChild(previewSpan);
    li.addEventListener('click', () => {
      modeEl.value = mode;
      inputEl.value = original;
      outputEl.value = result;
      updateModeOptions();
      updateStats();
    });
    historyListEl.prepend(li);
    while (historyListEl.children.length > 20) {
      historyListEl.removeChild(historyListEl.lastChild);
    }
  }

  function updateModeOptions() {
    const mode = modeEl.value;
    rotOptionsEl.hidden = !mode.startsWith('rot') || mode === 'rot-bruteforce';
    decodeBtn.textContent = mode.includes('encode') ? 'Encode / Transform' : 'Decode / Transform';
    if (mode === 'rot13') {
      rotShiftEl.value = 13;
    }
  }

  modeEl.addEventListener('change', () => {
    updateModeOptions();
    if (modeEl.value !== 'rot13') {
      rotShiftEl.value = 13;
    }
    run();
  });

  rotShiftEl.addEventListener('input', () => {
    run();
  });

  decodeBtn.addEventListener('click', run);

  swapBtn.addEventListener('click', () => {
    const temp = inputEl.value;
    inputEl.value = outputEl.value;
    outputEl.value = temp;
    const currentMode = modeEl.value;
    const pair = {
      'base64-decode': 'base64-encode',
      'base64-encode': 'base64-decode',
      'url-decode': 'url-encode',
      'url-encode': 'url-decode',
      'hex-decode': 'hex-encode',
      'hex-encode': 'hex-decode',
      'binary-decode': 'binary-encode',
      'binary-encode': 'binary-decode',
      'morse-decode': 'morse-encode',
      'morse-encode': 'morse-decode',
      'html-decode': 'html-encode',
      'html-encode': 'html-decode'
    };
    if (pair[currentMode]) {
      modeEl.value = pair[currentMode];
    }
    updateModeOptions();
    updateStats();
  });

  clearInputBtn.addEventListener('click', () => {
    inputEl.value = '';
    outputEl.value = '';
    statusEl.textContent = '';
    statusEl.className = 'status';
    updateStats();
  });

  copyOutputBtn.addEventListener('click', async () => {
    if (!outputEl.value) return;
    try {
      await navigator.clipboard.writeText(outputEl.value);
      setStatus('Copied to clipboard', 'ok');
    } catch (err) {
      setStatus('Copy failed', 'error');
    }
  });

  loadSampleBtn.addEventListener('click', () => {
    const mode = modeEl.value;
    inputEl.value = samples[mode] || samples['base64-decode'];
    run();
  });

  clearHistoryBtn.addEventListener('click', () => {
    historyListEl.innerHTML = '';
  });

  inputEl.addEventListener('input', updateStats);
  outputEl.addEventListener('input', updateStats);

  updateModeOptions();
  updateStats();
})();
