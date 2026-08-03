(function () {
  'use strict';

  var root = document.getElementById('theme-studio-app');
  if (!root) return;

  var boot = window.ThemeStudioBootstrap || {};
  var defaults = boot.defaults || {};
  var state = Object.assign({}, defaults, boot.config || {});
  var history = [clone(state)];
  var historyIndex = 0;
  var changeTimer = null;

  var colorFields = [
    ['background', 'Page background', 'Canvas behind every panel'],
    ['surface', 'Panel background', 'Cards, dialogs, and fields'],
    ['surfaceAlt', 'Raised surface', 'Headers, hover states, and tracks'],
    ['text', 'Primary text', 'Headings and main content'],
    ['textMuted', 'Secondary text', 'Labels, metadata, and hints'],
    ['accent', 'Accent', 'Links, active tabs, and progress'],
    ['accentHover', 'Accent hover', 'Hovered primary controls'],
    ['border', 'Borders', 'Dividers and control outlines'],
    ['headerBackground', 'Header background', 'Top webGUI banner'],
    ['headerText', 'Header text', 'Server name and header icons'],
    ['positive', 'Success', 'Healthy and running states'],
    ['warning', 'Warning', 'Attention states'],
    ['danger', 'Danger', 'Errors and stopped states']
  ];

  var presets = {
    midnight: Object.assign({}, defaults, {name:'Midnight Orange'}),
    graphite: Object.assign({}, defaults, {name:'Graphite Blue',background:'#15181C',surface:'#20242A',surfaceAlt:'#2B3038',text:'#F4F7FB',textMuted:'#9BA6B2',accent:'#5AA9FF',accentHover:'#86C0FF',border:'#3A414B',headerBackground:'#101317',positive:'#48D597',warning:'#F3C969',danger:'#FF6B6B'}),
    arctic: Object.assign({}, defaults, {name:'Arctic Light',background:'#EDF2F7',surface:'#FFFFFF',surfaceAlt:'#E2E8F0',text:'#172033',textMuted:'#64748B',accent:'#E8590C',accentHover:'#FF7A2D',border:'#CBD5E1',headerBackground:'#FFFFFF',headerText:'#172033',positive:'#198754',warning:'#B7791F',danger:'#DC3545'}),
    ember: Object.assign({}, defaults, {name:'Ember',background:'#140E0D',surface:'#211412',surfaceAlt:'#34201B',text:'#FFF2EA',textMuted:'#C49D8E',accent:'#FF6B35',accentHover:'#FF986F',border:'#573027',headerBackground:'#1B100E',positive:'#63D27B',warning:'#F6C453',danger:'#FF4D4F'})
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function query(selector) { return root.querySelector(selector); }
  function queryAll(selector) { return Array.prototype.slice.call(root.querySelectorAll(selector)); }
  function validHex(value) { return /^#[0-9A-F]{6}$/i.test(value); }

  function buildColorControls() {
    var host = query('#ts-color-controls');
    colorFields.forEach(function (field) {
      var row = document.createElement('div');
      row.className = 'ts-color-row';
      row.innerHTML = '<span class="ts-color-swatch"><input type="color" aria-label="' + field[1] + '"></span>' +
        '<label>' + field[1] + '<small>' + field[2] + '</small></label>' +
        '<input class="ts-hex" type="text" maxlength="7" spellcheck="false" aria-label="' + field[1] + ' hex value">';
      row.dataset.key = field[0];
      host.appendChild(row);
    });
  }

  function syncControls() {
    query('#ts-theme-name').value = state.name;
    query('#ts-radius').value = state.radius;
    query('#ts-radius-output').textContent = state.radius + ' px';
    queryAll('input[name="ts-density"]').forEach(function (input) { input.checked = input.value === state.density; });
    queryAll('.ts-color-row').forEach(function (row) {
      var value = state[row.dataset.key];
      row.style.setProperty('--swatch', value);
      row.querySelector('input[type="color"]').value = value;
      row.querySelector('.ts-hex').value = value;
    });
    updatePreview();
    updateHistoryButtons();
  }

  function updatePreview() {
    var preview = query('#ts-dashboard-preview');
    var map = {
      background:'--p-bg',surface:'--p-surface',surfaceAlt:'--p-surface-alt',text:'--p-text',textMuted:'--p-muted',accent:'--p-accent',accentHover:'--p-accent-hover',border:'--p-border',headerBackground:'--p-header',headerText:'--p-header-text',positive:'--p-good',warning:'--p-warn',danger:'--p-danger'
    };
    Object.keys(map).forEach(function (key) { preview.style.setProperty(map[key], state[key]); });
    preview.style.setProperty('--p-radius', state.radius + 'px');
    preview.style.setProperty('--p-gap', state.density === 'compact' ? '8px' : '14px');
    updateContrast();
  }

  function luminance(hex) {
    return [1,3,5].map(function (start) {
      var channel = parseInt(hex.substr(start, 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    }).reduce(function (sum, value, index) { return sum + value * [0.2126,0.7152,0.0722][index]; }, 0);
  }

  function contrast(foreground, background) {
    var a = luminance(foreground), b = luminance(background);
    return (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05);
  }

  function updateContrast() {
    var ratio = contrast(state.text, state.background);
    var pass = ratio >= 4.5;
    query('#ts-contrast-copy').textContent = ratio.toFixed(1) + ':1 on the page background';
    var badge = query('#ts-contrast-badge');
    badge.textContent = pass ? (ratio >= 7 ? 'AAA' : 'AA') : 'Low';
    badge.className = 'ts-badge ' + (pass ? 'is-pass' : 'is-fail');
  }

  function scheduleHistory() {
    window.clearTimeout(changeTimer);
    changeTimer = window.setTimeout(function () {
      var serialized = JSON.stringify(state);
      if (serialized === JSON.stringify(history[historyIndex])) return;
      history = history.slice(0, historyIndex + 1);
      history.push(clone(state));
      if (history.length > 40) history.shift();
      historyIndex = history.length - 1;
      updateHistoryButtons();
    }, 180);
  }

  function updateHistoryButtons() {
    query('[data-action="undo"]').disabled = historyIndex <= 0;
    query('[data-action="redo"]').disabled = historyIndex >= history.length - 1;
  }

  function setState(next, record) {
    state = Object.assign({}, defaults, next);
    syncControls();
    if (record !== false) {
      history = history.slice(0, historyIndex + 1);
      history.push(clone(state));
      historyIndex = history.length - 1;
      updateHistoryButtons();
    }
  }

  function toast(message, error) {
    var element = query('#ts-toast');
    element.textContent = message;
    element.className = 'ts-toast is-visible' + (error ? ' is-error' : '');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () { element.className = 'ts-toast'; }, 2600);
  }

  function saveTheme() {
    var button = query('[data-action="save"]');
    var original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i> Applying…';

    if (boot.mock) {
      window.setTimeout(function () {
        button.disabled = false; button.innerHTML = original; toast('Theme applied in preview mode');
      }, 450);
      return;
    }

    var body = new URLSearchParams();
    body.set('csrf_token', boot.csrf || '');
    body.set('action', 'save');
    body.set('theme', JSON.stringify(state));
    fetch(boot.endpoint, {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:body.toString(),credentials:'same-origin'})
      .then(function (response) { if (!response.ok) throw new Error('Save failed (' + response.status + ')'); return response.json(); })
      .then(function (result) { if (!result.ok) throw new Error(result.error || 'Save failed'); toast('Theme applied — refresh any open UNRAID tabs'); })
      .catch(function (error) { toast(error.message, true); })
      .finally(function () { button.disabled = false; button.innerHTML = original; });
  }

  function cssForTheme(theme) {
    var gap = theme.density === 'compact' ? '6px' : '10px';
    return '/* UNRAID Theme Studio — ' + theme.name.replace(/[\r\n]/g,'') + ' */\nhtml:root[class*="Theme--"] {\n' +
      '  --text-color: ' + theme.text + ';\n  --alt-text-color: ' + theme.textMuted + ';\n' +
      '  --link-text-color: ' + theme.accent + ';\n  --background-color: ' + theme.background + ';\n' +
      '  --mild-background-color: ' + theme.surfaceAlt + ';\n  --dashboard-background-color: ' + theme.surface + ';\n' +
      '  --border-color: ' + theme.border + ';\n  --table-border-color: ' + theme.border + ';\n' +
      '  --table-background-color: ' + theme.surface + ';\n  --table-header-background-color: ' + theme.surfaceAlt + ';\n' +
      '  --header-text-color: ' + theme.headerText + ';\n  --header-background-color: ' + theme.headerBackground + ';\n' +
      '  --brand-orange: ' + theme.accent + ';\n  --brand-red: ' + theme.danger + ';\n' +
      '  --theme-studio-positive: ' + theme.positive + ';\n  --theme-studio-warning: ' + theme.warning + ';\n' +
      '  --theme-studio-danger: ' + theme.danger + ';\n  --theme-studio-radius: ' + theme.radius + 'px;\n' +
      '  --theme-studio-gap: ' + gap + ';\n}\n';
  }

  function download(filename, contents, type) {
    var link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([contents], {type:type}));
    link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 0);
  }

  function safeFilename() { return (state.name || 'unraid-theme').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'unraid-theme'; }

  function bindEvents() {
    query('#ts-theme-name').addEventListener('input', function (event) { state.name = event.target.value; scheduleHistory(); });
    query('#ts-radius').addEventListener('input', function (event) { state.radius = Number(event.target.value); query('#ts-radius-output').textContent = state.radius + ' px'; updatePreview(); scheduleHistory(); });
    queryAll('input[name="ts-density"]').forEach(function (input) { input.addEventListener('change', function () { if (input.checked) { state.density = input.value; updatePreview(); scheduleHistory(); } }); });

    queryAll('.ts-color-row').forEach(function (row) {
      var picker = row.querySelector('input[type="color"]');
      var hex = row.querySelector('.ts-hex');
      picker.addEventListener('input', function () { state[row.dataset.key] = picker.value.toUpperCase(); hex.value = state[row.dataset.key]; row.style.setProperty('--swatch', state[row.dataset.key]); updatePreview(); scheduleHistory(); });
      hex.addEventListener('input', function () { var value = hex.value.toUpperCase(); if (validHex(value)) { state[row.dataset.key] = value; picker.value = value; row.style.setProperty('--swatch', value); updatePreview(); scheduleHistory(); } });
      hex.addEventListener('blur', function () { hex.value = state[row.dataset.key]; });
    });

    queryAll('[data-tab]').forEach(function (tab) { tab.addEventListener('click', function () { queryAll('[data-tab]').forEach(function (x) { x.classList.toggle('is-active', x === tab); }); queryAll('[data-panel]').forEach(function (panel) { panel.classList.toggle('is-active', panel.dataset.panel === tab.dataset.tab); }); }); });
    queryAll('[data-preset]').forEach(function (button) { button.addEventListener('click', function () { setState(presets[button.dataset.preset]); toast(button.textContent.trim() + ' preset loaded'); }); });
    queryAll('[data-viewport]').forEach(function (button) { button.addEventListener('click', function () { queryAll('[data-viewport]').forEach(function (x) { x.classList.toggle('is-active', x === button); }); query('#ts-preview-stage').classList.toggle('is-mobile', button.dataset.viewport === 'mobile'); }); });

    query('[data-action="undo"]').addEventListener('click', function () { if (historyIndex > 0) { historyIndex -= 1; state = clone(history[historyIndex]); syncControls(); } });
    query('[data-action="redo"]').addEventListener('click', function () { if (historyIndex < history.length - 1) { historyIndex += 1; state = clone(history[historyIndex]); syncControls(); } });
    query('[data-action="save"]').addEventListener('click', saveTheme);
    query('[data-action="reset"]').addEventListener('click', function () { setState(defaults); toast('Defaults restored — apply to save'); });
    query('[data-action="export-json"]').addEventListener('click', function () { download(safeFilename() + '.json', JSON.stringify(state,null,2) + '\n', 'application/json'); toast('Theme JSON exported'); });
    query('[data-action="export-css"]').addEventListener('click', function () { download(safeFilename() + '.css', cssForTheme(state), 'text/css'); toast('CSS exported'); });
    query('[data-action="import"]').addEventListener('click', function () { query('#ts-import-file').click(); });
    query('#ts-import-file').addEventListener('change', function (event) {
      var file = event.target.files[0]; if (!file) return;
      file.text().then(function (text) { var incoming = JSON.parse(text); colorFields.forEach(function (field) { if (!validHex(incoming[field[0]])) throw new Error('Invalid ' + field[1] + ' color'); }); setState(Object.assign({}, defaults, incoming)); toast('Theme imported — review and apply'); }).catch(function (error) { toast('Import failed: ' + error.message, true); }).finally(function () { event.target.value = ''; });
    });
  }

  buildColorControls();
  bindEvents();
  syncControls();
}());
