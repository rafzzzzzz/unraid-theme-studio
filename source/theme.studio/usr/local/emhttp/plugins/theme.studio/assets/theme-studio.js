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
    dracula: Object.assign({}, defaults, {name:'Dracula',background:'#282A36',surface:'#21222C',surfaceAlt:'#44475A',text:'#F8F8F2',textMuted:'#A6ACCD',accent:'#BD93F9',accentHover:'#FF79C6',border:'#44475A',headerBackground:'#191A21',headerText:'#F8F8F2',positive:'#50FA7B',warning:'#F1FA8C',danger:'#FF5555'}),
    catppuccin: Object.assign({}, defaults, {name:'Catppuccin Mocha',background:'#1E1E2E',surface:'#181825',surfaceAlt:'#313244',text:'#CDD6F4',textMuted:'#A6ADC8',accent:'#CBA6F7',accentHover:'#F5C2E7',border:'#45475A',headerBackground:'#11111B',headerText:'#CDD6F4',positive:'#A6E3A1',warning:'#F9E2AF',danger:'#F38BA8'}),
    oblivion: Object.assign({}, defaults, {name:'Oblivion Dark',background:'#1B2026',surface:'#1F262E',surfaceAlt:'#282F38',text:'#AACBF0',textMuted:'#899FC4',accent:'#29EBAA',accentHover:'#18D5DB',border:'#333D49',headerBackground:'#1B2026',headerText:'#B2CEE6',positive:'#29EBAA',warning:'#FFD651',danger:'#FF5165'}),
    nord: Object.assign({}, defaults, {name:'Nord',background:'#2E3440',surface:'#3B4252',surfaceAlt:'#434C5E',text:'#ECEFF4',textMuted:'#D8DEE9',accent:'#88C0D0',accentHover:'#8FBCBB',border:'#4C566A',headerBackground:'#242933',headerText:'#ECEFF4',positive:'#A3BE8C',warning:'#EBCB8B',danger:'#BF616A'}),
    tokyo: Object.assign({}, defaults, {name:'Tokyo Night',background:'#1A1B26',surface:'#16161E',surfaceAlt:'#24283B',text:'#C0CAF5',textMuted:'#9AA5CE',accent:'#7AA2F7',accentHover:'#BB9AF7',border:'#3B4261',headerBackground:'#101014',headerText:'#C0CAF5',positive:'#9ECE6A',warning:'#E0AF68',danger:'#F7768E'}),
    gruvbox: Object.assign({}, defaults, {name:'Gruvbox Dark',background:'#282828',surface:'#32302F',surfaceAlt:'#3C3836',text:'#EBDBB2',textMuted:'#A89984',accent:'#FABD2F',accentHover:'#FE8019',border:'#504945',headerBackground:'#1D2021',headerText:'#FBF1C7',positive:'#B8BB26',warning:'#FABD2F',danger:'#FB4934'}),
    solarized: Object.assign({}, defaults, {name:'Solarized Dark',background:'#002B36',surface:'#073642',surfaceAlt:'#0B4654',text:'#EEE8D5',textMuted:'#93A1A1',accent:'#2AA198',accentHover:'#268BD2',border:'#586E75',headerBackground:'#00212B',headerText:'#FDF6E3',positive:'#859900',warning:'#B58900',danger:'#DC322F'}),
    everforest: Object.assign({}, defaults, {name:'Everforest Dark',background:'#2D353B',surface:'#343F44',surfaceAlt:'#3D484D',text:'#D3C6AA',textMuted:'#859289',accent:'#A7C080',accentHover:'#83C092',border:'#4F585E',headerBackground:'#232A2E',headerText:'#D3C6AA',positive:'#A7C080',warning:'#DBBC7F',danger:'#E67E80'}),
    rosepine: Object.assign({}, defaults, {name:'Rosé Pine',background:'#191724',surface:'#1F1D2E',surfaceAlt:'#26233A',text:'#E0DEF4',textMuted:'#908CAA',accent:'#C4A7E7',accentHover:'#EBBCBA',border:'#524F67',headerBackground:'#191724',headerText:'#E0DEF4',positive:'#31748F',warning:'#F6C177',danger:'#EB6F92'}),
    plex: Object.assign({}, defaults, {name:'Plex Inspired',background:'#101010',surface:'#1F1F1F',surfaceAlt:'#282828',text:'#E5E5E5',textMuted:'#999999',accent:'#E5A00D',accentHover:'#F9BE03',border:'#3A3A3A',headerBackground:'#0B0B0B',headerText:'#FFFFFF',positive:'#21D07A',warning:'#E5A00D',danger:'#E05A5A'}),
    arctic: Object.assign({}, defaults, {name:'Arctic Light',background:'#EDF2F7',surface:'#FFFFFF',surfaceAlt:'#E2E8F0',text:'#172033',textMuted:'#64748B',accent:'#E8590C',accentHover:'#FF7A2D',border:'#CBD5E1',headerBackground:'#FFFFFF',headerText:'#172033',positive:'#198754',warning:'#B7791F',danger:'#DC3545'})
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function query(selector) { return root.querySelector(selector); }
  function queryAll(selector) { return Array.prototype.slice.call(root.querySelectorAll(selector)); }
  function validHex(value) { return /^#[0-9A-F]{6}$/i.test(value); }
  function clampNumber(value, minimum, maximum, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
  }
  function hexToRgba(hex, alpha) {
    var value = hex.replace('#', '');
    return 'rgba(' + parseInt(value.substr(0,2),16) + ',' + parseInt(value.substr(2,2),16) + ',' + parseInt(value.substr(4,2),16) + ',' + Math.max(0,Math.min(1,alpha)).toFixed(3) + ')';
  }

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
    query('#ts-theme-enabled').checked = state.enabled !== false;
    query('#ts-theme-name').value = state.name;
    query('#ts-radius').value = state.radius;
    query('#ts-radius-output').textContent = state.radius + ' px';
    query('#ts-transparency').value = state.transparency;
    query('#ts-transparency-output').textContent = state.transparency + '%';
    query('#ts-gradient-strength').value = state.gradientStrength;
    query('#ts-gradient-output').textContent = state.gradientStrength + '%';
    query('#ts-glow-strength').value = state.glowStrength;
    query('#ts-glow-output').textContent = state.glowStrength === 0 ? 'Off' : state.glowStrength + ' px';
    query('#ts-animated-background').checked = state.animatedBackground === true;
    query('#ts-animation-speed').value = state.animationSpeed;
    query('#ts-animation-speed-output').textContent = state.animationSpeed + ' sec';
    query('#ts-animation-speed').disabled = state.animatedBackground !== true;
    query('.ts-animation-speed').classList.toggle('is-disabled', state.animatedBackground !== true);
    queryAll('.ts-color-row').forEach(function (row) {
      var value = state[row.dataset.key];
      row.style.setProperty('--swatch', value);
      row.querySelector('input[type="color"]').value = value;
      row.querySelector('.ts-hex').value = value;
    });
    updateEnabledState();
    updatePreview();
    updateHistoryButtons();
  }

  function updateEnabledState() {
    var enabled = state.enabled !== false;
    root.classList.toggle('is-theme-disabled', !enabled);
    query('#ts-enabled-copy').textContent = enabled
      ? 'Generated theme overrides will be active after Apply'
      : 'Apply to remove overrides; your palette stays saved';
  }

  function updatePreview() {
    var preview = query('#ts-dashboard-preview');
    var map = {
      background:'--p-bg',text:'--p-text',textMuted:'--p-muted',accent:'--p-accent',accentHover:'--p-accent-hover',border:'--p-border',headerBackground:'--p-header',headerText:'--p-header-text',positive:'--p-good',warning:'--p-warn',danger:'--p-danger'
    };
    Object.keys(map).forEach(function (key) { preview.style.setProperty(map[key], state[key]); });
    var panelOpacity = 1 - (state.transparency / 100);
    var gradientPrimary = hexToRgba(state.accent, (state.gradientStrength / 100) * 0.36);
    var gradientSecondary = hexToRgba(state.accentHover, (state.gradientStrength / 100) * 0.24);
    preview.style.setProperty('--p-surface', hexToRgba(state.surface, panelOpacity));
    preview.style.setProperty('--p-surface-alt', hexToRgba(state.surfaceAlt, panelOpacity));
    preview.style.setProperty('--p-glow', state.glowStrength > 0 ? 'inset 0 0 ' + state.glowStrength + 'px ' + hexToRgba(state.accent, Math.min(0.75, 0.25 + state.glowStrength / 60)) : 'none');
    preview.style.backgroundImage = 'radial-gradient(circle at 12% 8%,' + gradientPrimary + ' 0,transparent 34%),radial-gradient(circle at 88% 18%,' + gradientSecondary + ' 0,transparent 38%)';
    preview.style.backgroundSize = '145% 145%,165% 165%';
    preview.style.animationDuration = state.animationSpeed + 's';
    preview.classList.toggle('is-effects-animated', state.animatedBackground === true && state.gradientStrength > 0);
    preview.style.setProperty('--p-radius', state.radius + 'px');
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
        button.disabled = false; button.innerHTML = original;
        toast(state.enabled === false ? 'Theming disabled in preview mode' : 'Theme applied in preview mode');
      }, 450);
      return;
    }

    var body = new URLSearchParams();
    body.set('csrf_token', boot.csrf || '');
    body.set('action', 'save');
    body.set('theme', JSON.stringify(state));
    fetch(boot.endpoint, {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:body.toString(),credentials:'same-origin'})
      .then(function (response) { if (!response.ok) throw new Error('Save failed (' + response.status + ')'); return response.json(); })
      .then(function (result) {
        if (!result.ok) throw new Error(result.error || 'Save failed');
        toast(state.enabled === false
          ? 'Theming disabled — refresh any open UNRAID tabs'
          : 'Theme applied — refresh any open UNRAID tabs');
      })
      .catch(function (error) { toast(error.message, true); })
      .finally(function () { button.disabled = false; button.innerHTML = original; });
  }

  function cssForTheme(theme) {
    var transparency = Math.max(0, Math.min(60, Number(theme.transparency) || 0));
    var gradientStrength = Math.max(0, Math.min(100, Number(theme.gradientStrength) || 0));
    var glowStrength = Math.max(0, Math.min(30, Number(theme.glowStrength) || 0));
    var panelSurface = hexToRgba(theme.surface, 1 - transparency / 100);
    var raisedSurface = hexToRgba(theme.surfaceAlt, 1 - transparency / 100);
    var gradientPrimary = hexToRgba(theme.accent, gradientStrength / 100 * 0.36);
    var gradientSecondary = hexToRgba(theme.accentHover, gradientStrength / 100 * 0.24);
    var glow = glowStrength > 0 ? 'inset 0 0 ' + glowStrength + 'px ' + hexToRgba(theme.accent, Math.min(0.75, 0.25 + glowStrength / 60)) : 'none';
    var animation = theme.animatedBackground === true && gradientStrength > 0
      ? 'animation:theme-studio-background ' + Math.max(5,Math.min(60,Number(theme.animationSpeed)||20)) + 's ease-in-out infinite alternate;'
      : '';
    return '/* UNRAID Theme Studio — ' + theme.name.replace(/[\r\n]/g,'') + ' */\nhtml:root[class*="Theme--"] {\n' +
      '  --text-color: ' + theme.text + ';\n  --alt-text-color: ' + theme.textMuted + ';\n' +
      '  --blockquote-text-color: ' + theme.textMuted + ';\n  --disabled-text-color: ' + theme.textMuted + ';\n  --inverse-text-color: ' + theme.background + ';\n' +
      '  --link-text-color: ' + theme.accent + ';\n  --background-color: ' + theme.background + ';\n' +
      '  --mild-background-color: ' + raisedSurface + ';\n  --alt-background-color: ' + panelSurface + ';\n' +
      '  --dashboard-background-color: ' + panelSurface + ';\n  --dashboard-title-action-color: ' + theme.textMuted + ';\n' +
      '  --disabled-input-background-color: ' + raisedSurface + ';\n  --border-color: ' + theme.border + ';\n  --alt-border-color: ' + theme.border + ';\n' +
      '  --disabled-border-color: ' + theme.border + ';\n  --inverse-border-color: ' + theme.border + ';\n  --table-border-color: ' + theme.border + ';\n  --table-alt-border-color: ' + theme.border + ';\n' +
      '  --table-background-color: ' + panelSurface + ';\n  --table-header-background-color: ' + raisedSurface + ';\n  --hover-table-row-background-color: ' + raisedSurface + ';\n' +
      '  --header-text-color: ' + theme.headerText + ';\n  --header-background-color: ' + theme.headerBackground + ';\n' +
      '  --dashboard-border-color: ' + theme.border + ';\n  --hr-color: ' + theme.border + ';\n  --scrollbar-color: ' + theme.textMuted + ';\n  --scrollbar-hover-color: ' + theme.text + ';\n' +
      '  --checkbox-color: ' + theme.surfaceAlt + ';\n  --checkbox-hover-color: ' + theme.accent + ';\n' +
      '  --brand-orange: ' + theme.accent + ';\n  --brand-red: ' + theme.danger + ';\n' +
      '  --focus-input-background-color: ' + raisedSurface + ';\n  --focus-input-border-color: ' + theme.accent + ';\n' +
      '  --dynamix-ui-dropdownchecklist-color: ' + theme.text + ';\n  --dynamix-ui-dropdownchecklist-color-alt1: ' + panelSurface + ';\n  --dynamix-ui-dropdownchecklist-color-alt2: ' + raisedSurface + ';\n' +
      '  --dynamix-ui-dropdownchecklist-dropcontainer-border-color: ' + theme.border + ';\n  --dynamix-ui-state-active-border-color: ' + theme.accent + ';\n' +
      '  --dynamix-sb-message-bg-color: ' + panelSurface + ';\n  --dynamix-sb-message-text-color: ' + theme.text + ';\n  --dynamix-sb-message-link-color: ' + theme.accent + ';\n' +
      '  --dynamix-sb-title-bg-color: ' + raisedSurface + ';\n  --dynamix-sb-title-text-color: ' + theme.text + ';\n' +
      '  --dynamix-sb-wrapper-bg-color: ' + panelSurface + ';\n  --dynamix-sb-wrapper-border-color: ' + theme.border + ';\n  --dynamix-sb-wrapper-text-color: ' + theme.text + ';\n' +
      '  --dynamix-sb-body-text-color: ' + theme.text + ';\n  --dynamix-sb-body-bg-color: ' + panelSurface + ';\n' +
      '  --dynamix-sweet-alert-text-color: ' + theme.text + ';\n  --dynamix-sweet-alert-icon-bg-color: ' + panelSurface + ';\n' +
      '  --dynamix-tablesorter-thead-row-border-color: ' + theme.border + ';\n  --dynamix-tablesorter-thead-th-text-color: ' + theme.text + ';\n  --dynamix-tablesorter-thead-th-bg-color: ' + raisedSurface + ';\n' +
      '  --dynamix-tablesorter-tbody-row-bg-color: ' + panelSurface + ';\n  --dynamix-tablesorter-tbody-row-alt-bg-color: ' + raisedSurface + ';\n  --dynamix-tablesorter-tbody-row-border-color: ' + theme.border + ';\n' +
      '  --dynamix-select-bg-color: ' + panelSurface + ';\n  --dynamix-select-box-shadow: 0 0 0 1px ' + theme.border + ';\n  --dynamix-select-disabled-bg-color: ' + raisedSurface + ';\n' +
      '  --dynamix-select-disabled-border-color: ' + theme.border + ';\n  --dynamix-select-disabled-color: ' + theme.textMuted + ';\n  --dynamix-box-text-color: ' + theme.text + ';\n  --dynamix-box-inner-div-border-color: ' + theme.border + ';\n' +
      '  --dynamix-tooltipster-sidetip-bg-from: ' + raisedSurface + ';\n  --dynamix-tooltipster-sidetip-bg-to: ' + panelSurface + ';\n  --dynamix-tooltipster-sidetip-content-text-color: ' + theme.text + ';\n' +
      '  --dynamix-tooltipster-sidetip-arrow-bg-color: ' + panelSurface + ';\n  --dynamix-tooltipster-sidetip-arrow-border-color: ' + theme.border + ';\n  --dynamix-tooltipster-sidetip-box-border-color: ' + theme.accent + ';\n' +
      '  --dynamix-filetree-bg-color: ' + panelSurface + ';\n  --dynamix-awesomplete-text-color: ' + theme.text + ';\n  --dynamix-awesomplete-list-bg-color: ' + panelSurface + ';\n' +
      '  --dynamix-awesomplete-list-bg-from-color: ' + raisedSurface + ';\n  --dynamix-awesomplete-list-bg-to-color: ' + panelSurface + ';\n  --dynamix-awesomplete-list-border-color: ' + theme.border + ';\n' +
      '  --dynamix-awesomplete-list-shadow-color: ' + theme.border + ';\n  --dynamix-awesomplete-list-before-bg-color: ' + panelSurface + ';\n  --dynamix-awesomplete-list-item-hover-bg-color: ' + raisedSurface + ';\n' +
      '  --dynamix-awesomplete-list-item-hover-text-color: ' + theme.text + ';\n  --dynamix-awesomplete-list-item-selected-bg-color: ' + theme.accent + ';\n  --dynamix-awesomplete-list-item-selected-text-color: ' + theme.background + ';\n' +
      '  --dynamix-awesomplete-mark-bg-color: ' + theme.warning + ';\n  --dynamix-awesomplete-mark-hover-bg-color: ' + theme.accentHover + ';\n  --dynamix-awesomplete-mark-selected-bg-color: ' + theme.positive + ';\n' +
      '  --theme-studio-positive: ' + theme.positive + ';\n  --theme-studio-warning: ' + theme.warning + ';\n' +
      '  --theme-studio-danger: ' + theme.danger + ';\n  --theme-studio-radius: ' + theme.radius + 'px;\n' +
      '  --theme-studio-panel: ' + panelSurface + ';\n  --theme-studio-panel-raised: ' + raisedSurface + ';\n  --theme-studio-glow: ' + glow + ';\n}\n\n' +
      'body{background-color:' + theme.background + ';background-image:radial-gradient(circle at 12% 8%,' + gradientPrimary + ' 0,transparent 34%),radial-gradient(circle at 88% 18%,' + gradientSecondary + ' 0,transparent 38%);background-attachment:fixed;background-position:0% 0%,100% 0%;background-repeat:no-repeat;background-size:220% 220%,240% 240%;' + animation + '}\n' +
      '#displaybox{background-color:transparent;background-image:none}\n' +
      '#header .logo:not(:has(.partner-logo)) svg{display:none!important}\n' +
      '#header .logo:not(:has(.partner-logo))>a::before,#header .logo:not(:has(.partner-logo)):not(:has(>a))::before{content:"UNRAID";display:block;box-sizing:border-box;width:160px;margin:19px 0 5px;color:var(--brand-orange);font-family:clear-sans,sans-serif;font-size:28px;font-weight:800;line-height:39px;letter-spacing:.18em;text-align:center;text-indent:.18em}\n' +
      '.dashboard-card,.ui-dialog,.sweet-alert,.context-menu-list{background-color:var(--theme-studio-panel);}\n' +
      '.dashboard-card,.ui-dialog,.sweet-alert,.context-menu-list,div.title,fieldset,table.tablesorter,table.disk_status,table.share_status,table.usb_mounts,table.samba_mounts,table.usb_absent,table.preclear,input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]),select,textarea,span.select{border-radius:var(--theme-studio-radius)!important;}\n' +
      'table.dashboard>tbody{background-color:transparent!important;border:0!important;border-radius:var(--theme-studio-radius);overflow:hidden;clip-path:inset(0 round var(--theme-studio-radius));}\n' +
      'table.dashboard>tbody>tr>td{background-color:var(--dashboard-background-color)}table.dashboard>tbody>tr.alert>td{background-color:var(--red-300)}table.dashboard>tbody>tr.warn>td{background-color:var(--yellow-200)}table.dashboard>tbody>tr.past>td{background-color:var(--red-100)}table.dashboard>tbody>tr>td:first-child{border-left:1px solid var(--dashboard-border-color)!important}table.dashboard>tbody>tr>td:last-child{border-right:1px solid var(--dashboard-border-color)!important}table.dashboard>tbody>tr:first-child>td{border-top:1px solid var(--dashboard-border-color)!important}table.dashboard>tbody>tr:last-child>td{border-bottom:1px solid var(--dashboard-border-color)!important}\n' +
      'table.dashboard>tbody>tr:first-child>td:first-child{border-top-left-radius:var(--theme-studio-radius)}table.dashboard>tbody>tr:first-child>td:last-child{border-top-right-radius:var(--theme-studio-radius)}table.dashboard>tbody>tr:last-child>td:first-child{border-bottom-left-radius:var(--theme-studio-radius)}table.dashboard>tbody>tr:last-child>td:last-child{border-bottom-right-radius:var(--theme-studio-radius)}\n' +
      'table.dashboard>thead.stopgap,table.dashboard>thead.stopgap>tr,table.dashboard td.stopgap{background-color:transparent!important;border:0!important;box-shadow:none!important}\n' +
      'table.tablesorter,table.disk_status,table.share_status,table.usb_mounts,table.samba_mounts,table.usb_absent,table.preclear{overflow:hidden;clip-path:inset(0 round var(--theme-studio-radius));}\n' +
      'table.dashboard>tbody:hover,.dashboard-card:hover,div.title:hover,fieldset:hover,.ui-dialog:focus-within,.sweet-alert:focus-within,.context-menu-list:focus-within,input:focus,select:focus,textarea:focus{box-shadow:var(--theme-studio-glow);}\n' +
      '@keyframes theme-studio-background{from{background-position:0% 5%,100% 5%}to{background-position:55% 45%,45% 60%}}\n' +
      '@media (prefers-reduced-motion:reduce){body{animation:none}}\n\n' +
      'table.tablesorter { background-color: var(--dynamix-tablesorter-tbody-row-bg-color); }\n' +
      'html:root[class*="Theme--"] table.usb_mounts,\n' +
      'html:root[class*="Theme--"] table.samba_mounts,\n' +
      'html:root[class*="Theme--"] table.usb_absent,\n' +
      'html:root[class*="Theme--"] table.preclear { background-color: var(--dynamix-tablesorter-tbody-row-bg-color); }\n' +
      'html:root[class*="Theme--"] table.usb_mounts thead tr:first-child td,\n' +
      'html:root[class*="Theme--"] table.samba_mounts thead tr:first-child td,\n' +
      'html:root[class*="Theme--"] table.usb_absent thead tr:first-child td,\n' +
      'html:root[class*="Theme--"] table.preclear thead tr:first-child td { background-color: var(--dynamix-tablesorter-thead-th-bg-color); }\n' +
      'html:root[class*="Theme--"] table.usb_mounts tbody tr:nth-child(even),\n' +
      'html:root[class*="Theme--"] table.samba_mounts tbody tr:nth-child(even),\n' +
      'html:root[class*="Theme--"] table.usb_absent tbody tr:nth-child(even),\n' +
      'html:root[class*="Theme--"] table.preclear tbody tr:nth-child(even) { background-color: var(--dynamix-tablesorter-tbody-row-alt-bg-color); }\n' +
      'html:root[class*="Theme--"] table.usb_mounts tbody tr:not(.tr_last):hover > td,\n' +
      'html:root[class*="Theme--"] table.samba_mounts tbody tr:not(.tr_last):hover > td,\n' +
      'html:root[class*="Theme--"] table.usb_absent tbody tr:not(.tr_last):hover > td,\n' +
      'html:root[class*="Theme--"] table.preclear tbody tr:not(.tr_last):hover > td { background-color: var(--hover-table-row-background-color); opacity: 1; }\n' +
      '.Theme--nav-top .nav-item a,\n.Theme--nav-top .nav-user a { color: var(--text-color); }\n' +
      '.Theme--nav-top .nav-item:hover a,\n.Theme--nav-top .nav-item:focus-within a { color: var(--link-text-color); }\n' +
      '.Theme--nav-top .nav-item:focus:after,\n.Theme--nav-top .nav-item:hover:after,\n.Theme--nav-top .nav-item.active:after { background-color: var(--brand-orange); }\n' +
      '.Theme--sidebar .nav-item a { color: var(--alt-text-color); }\n' +
      '.Theme--sidebar .nav-item:hover a,\n.Theme--sidebar .nav-item.active a { color: var(--text-color); }\n';
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
    query('#ts-theme-enabled').addEventListener('change', function (event) {
      state.enabled = event.target.checked;
      updateEnabledState();
      scheduleHistory();
    });
    query('#ts-theme-name').addEventListener('input', function (event) { state.name = event.target.value; scheduleHistory(); });
    query('#ts-radius').addEventListener('input', function (event) { state.radius = Number(event.target.value); query('#ts-radius-output').textContent = state.radius + ' px'; updatePreview(); scheduleHistory(); });
    query('#ts-transparency').addEventListener('input', function (event) { state.transparency = Number(event.target.value); query('#ts-transparency-output').textContent = state.transparency + '%'; updatePreview(); scheduleHistory(); });
    query('#ts-gradient-strength').addEventListener('input', function (event) { state.gradientStrength = Number(event.target.value); query('#ts-gradient-output').textContent = state.gradientStrength + '%'; updatePreview(); scheduleHistory(); });
    query('#ts-glow-strength').addEventListener('input', function (event) { state.glowStrength = Number(event.target.value); query('#ts-glow-output').textContent = state.glowStrength === 0 ? 'Off' : state.glowStrength + ' px'; updatePreview(); scheduleHistory(); });
    query('#ts-animated-background').addEventListener('change', function (event) { state.animatedBackground = event.target.checked; query('#ts-animation-speed').disabled = !state.animatedBackground; query('.ts-animation-speed').classList.toggle('is-disabled', !state.animatedBackground); updatePreview(); scheduleHistory(); });
    query('#ts-animation-speed').addEventListener('input', function (event) { state.animationSpeed = Number(event.target.value); query('#ts-animation-speed-output').textContent = state.animationSpeed + ' sec'; updatePreview(); scheduleHistory(); });

    queryAll('.ts-color-row').forEach(function (row) {
      var picker = row.querySelector('input[type="color"]');
      var hex = row.querySelector('.ts-hex');
      picker.addEventListener('input', function () { state[row.dataset.key] = picker.value.toUpperCase(); hex.value = state[row.dataset.key]; row.style.setProperty('--swatch', state[row.dataset.key]); updatePreview(); scheduleHistory(); });
      hex.addEventListener('input', function () { var value = hex.value.toUpperCase(); if (validHex(value)) { state[row.dataset.key] = value; picker.value = value; row.style.setProperty('--swatch', value); updatePreview(); scheduleHistory(); } });
      hex.addEventListener('blur', function () { hex.value = state[row.dataset.key]; });
    });

    queryAll('[data-tab]').forEach(function (tab) { tab.addEventListener('click', function () { queryAll('[data-tab]').forEach(function (x) { x.classList.toggle('is-active', x === tab); }); queryAll('[data-panel]').forEach(function (panel) { panel.classList.toggle('is-active', panel.dataset.panel === tab.dataset.tab); }); }); });
    queryAll('[data-preset]').forEach(function (button) {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', function () {
        var preset = presets[button.dataset.preset];
        if (!preset) {
          toast('Preset unavailable — refresh this page and try again', true);
          return;
        }
        setState(Object.assign({}, preset, {
          enabled: state.enabled !== false,
          transparency: state.transparency,
          gradientStrength: state.gradientStrength,
          glowStrength: state.glowStrength,
          animatedBackground: state.animatedBackground,
          animationSpeed: state.animationSpeed
        }));
        queryAll('[data-preset]').forEach(function (item) {
          var selected = item === button;
          item.classList.toggle('is-active', selected);
          item.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        toast(button.textContent.trim() + ' preset loaded');
      });
    });
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
      file.text().then(function (text) {
        var parsed = JSON.parse(text);
        var legacyDensityConfig = Object.prototype.hasOwnProperty.call(parsed, 'density');
        var animationTimingVersion = Number(parsed.animationTimingVersion) || 0;
        var incoming = Object.assign({}, defaults, parsed);
        colorFields.forEach(function (field) { if (!validHex(incoming[field[0]])) throw new Error('Invalid ' + field[1] + ' color'); });
        incoming.enabled = incoming.enabled !== false;
        incoming.transparency = clampNumber(incoming.transparency, 0, 60, defaults.transparency);
        incoming.gradientStrength = clampNumber(incoming.gradientStrength, 0, 100, defaults.gradientStrength);
        incoming.glowStrength = clampNumber(incoming.glowStrength, 0, 30, defaults.glowStrength);
        incoming.animatedBackground = incoming.animatedBackground === true;
        var importedSpeed = Number(incoming.animationSpeed);
        if (Object.prototype.hasOwnProperty.call(parsed, 'animationSpeed') && animationTimingVersion < 2) {
          importedSpeed = legacyDensityConfig || importedSpeed > 12 ? importedSpeed / 2 : importedSpeed * 5;
        }
        incoming.animationSpeed = clampNumber(importedSpeed, 5, 60, defaults.animationSpeed);
        incoming.animationTimingVersion = 2;
        setState(incoming);
        toast('Theme imported — review and apply');
      }).catch(function (error) { toast('Import failed: ' + error.message, true); }).finally(function () { event.target.value = ''; });
    });
  }

  buildColorControls();
  bindEvents();
  syncControls();
}());
