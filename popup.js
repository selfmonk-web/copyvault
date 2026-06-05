// CopyVault — popup.js
'use strict';

var items        = [];
var searchQuery  = '';
var toastTimer   = null;
var isWindowMode = false;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
var listPinned   = document.getElementById('list-pinned');
var listUnpinned = document.getElementById('list-unpinned');
var labelPinned  = document.getElementById('label-pinned');
var labelHistory = document.getElementById('label-history');
var emptyState   = document.getElementById('empty-state');
var noResults    = document.getElementById('no-results');
var searchInput  = document.getElementById('search');
var searchClear  = document.getElementById('search-clear');
var footerCount  = document.getElementById('footer-count');
var toast        = document.getElementById('toast');
var modalOverlay = document.getElementById('modal-overlay');
var btnHelp      = document.getElementById('btn-help');
var modalClose   = document.getElementById('modal-close');
var btnDetach    = document.getElementById('btn-detach');
var btnClear     = document.getElementById('btn-clear-unpinned');
var btnSaveUrl   = document.getElementById('btn-save-url');
var manualInput  = document.getElementById('manual-input');
var btnAdd       = document.getElementById('btn-add');

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  var isPanelMode = document.body.id === 'panel-body';

  if (isPanelMode) {
    document.body.classList.add('panel-mode');
    // In panel mode il bottone detach non serve
    if (btnDetach) {
      btnDetach.style.display = 'none';
    }
  } else if (window.location.search.includes('window=1')) {
    isWindowMode = true;
    document.body.classList.add('window-mode');
    if (btnDetach) {
      btnDetach.style.opacity = '0.3';
      btnDetach.style.pointerEvents = 'none';
    }
  }

  await loadAndRender();
  setInterval(syncItems, 800);
}

async function loadAndRender() {
  var resp = await chrome.runtime.sendMessage({ type: 'GET_ITEMS' }).catch(function() { return null; });
  if (resp && resp.items) { items = resp.items; render(); }
}

async function syncItems() {
  var resp = await chrome.runtime.sendMessage({ type: 'GET_ITEMS' }).catch(function() { return null; });
  if (!resp || !resp.items) return;
  if (JSON.stringify(resp.items) !== JSON.stringify(items)) {
    items = resp.items;
    render();
  }
}

// ─── Aggiunta manuale ─────────────────────────────────────────────────────────
btnAdd.addEventListener('click', async function() {
  var text = manualInput.value.trim();
  if (!text) { manualInput.focus(); return; }
  await chrome.runtime.sendMessage({ type: 'ADD_CLIP', text: text });
  manualInput.value = '';
  await loadAndRender();
  showToast('Saved!');
});

manualInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); btnAdd.click(); }
});

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  var q       = searchQuery.toLowerCase();
  var pinned  = items.filter(function(i) { return i.pinned; });
  var regular = items.filter(function(i) { return !i.pinned; });
  var filteredPin = q ? pinned.filter(function(i)  { return i.text.toLowerCase().includes(q); }) : pinned;
  var filteredReg = q ? regular.filter(function(i) { return i.text.toLowerCase().includes(q); }) : regular;
  var total      = items.length;
  var hasAny     = total > 0;
  var hasResults = filteredPin.length + filteredReg.length > 0;

  emptyState.classList.toggle('hidden', hasAny || !!q);
  noResults.classList.toggle('hidden', !q || hasResults);
  labelPinned.classList.toggle('hidden',  filteredPin.length === 0);
  labelHistory.classList.toggle('hidden', filteredReg.length === 0 || (!q && pinned.length === 0));

  renderList(listPinned,   filteredPin,  'pinned');
  renderList(listUnpinned, filteredReg,  'unpinned');

  footerCount.textContent = total + ' / 20';
  footerCount.className   = 'footer-count' + (total === 20 ? ' full' : total >= 16 ? ' near-full' : '');
}

function renderList(container, list, zone) {
  list.forEach(function(item, idx) {
    var el = container.querySelector('[data-id="' + item.id + '"]');
    if (!el) { el = createItemEl(item, zone); container.appendChild(el); }
    else      { updateItemEl(el, item); }
    if (container.children[idx] !== el) container.insertBefore(el, container.children[idx] || null);
  });
  Array.from(container.children).forEach(function(el) {
    if (!list.find(function(i) { return i.id === el.dataset.id; })) el.remove();
  });
}

function formatTime(ts) {
  var diff = Date.now() - ts, secs = Math.floor(diff/1000), mins = Math.floor(secs/60), hours = Math.floor(mins/60), days = Math.floor(hours/24);
  if (secs < 60)  return 'just now';
  if (mins < 60)  return mins + 'm ago';
  if (hours < 24) return hours + 'h ago';
  return days + 'd ago';
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function highlight(text, q) {
  if (!q) return escHtml(text);
  var idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return escHtml(text);
  return escHtml(text.slice(0,idx)) + '<mark style="background:var(--accent-glow);color:var(--accent);border-radius:2px">' + escHtml(text.slice(idx, idx+q.length)) + '</mark>' + escHtml(text.slice(idx+q.length));
}

function pinIcon(active) {
  return active
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1l-1.5 1.5L16 4 9.5 10.5 7 9l-1.5 1.5 3 3-5.5 5.5 1.5 1.5 5.5-5.5 3 3L14.5 16l-1.5-2.5 6.5-6.5 1.5 1.5z"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z"/></svg>';
}

function buildItemHTML(item) {
  var p = item.text.slice(0,120), q = searchQuery.toLowerCase(), len = item.text.length >= 50 ? item.text.length + ' chars' : '';
  var expandBtn = item.text.length >= 0
    ? '<button class="expand-btn" title="Expand"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>'
    : '';
  return '<span class="drag-handle" title="Drag">\u2807</span>'
    + '<div class="clip-text"><span class="clip-preview">' + highlight(p,q) + '</span>'
    + '<div class="clip-meta"><span class="clip-time">' + formatTime(item.timestamp) + '</span>' + (len ? '<span class="clip-len">'+len+'</span>' : '') + '</div></div>'
    + '<div class="clip-actions">'
    + expandBtn
    + '<button class="clip-btn pin-btn' + (item.pinned?' active':'') + '" title="' + (item.pinned?'Unpin':'Pin') + '">' + pinIcon(item.pinned) + '</button>'
    + '<button class="clip-btn del-btn" title="Delete"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
    + '</div>';
}

function createItemEl(item, zone) {
  var el = document.createElement('div');
  el.className = 'clip-item' + (item.pinned ? ' pinned' : '');
  el.dataset.id = item.id; el.dataset.zone = zone; el.draggable = true;
  el.innerHTML = buildItemHTML(item);
  attachItemEvents(el, item);
  return el;
}

function updateItemEl(el, item) {
  el.className = 'clip-item' + (item.pinned ? ' pinned' : '');
  el.dataset.zone = item.pinned ? 'pinned' : 'unpinned';
  var preview = el.querySelector('.clip-preview'), time = el.querySelector('.clip-time'), pinBtn = el.querySelector('.pin-btn');
  if (preview) preview.innerHTML = highlight(item.text.slice(0,80), searchQuery.toLowerCase());
  if (time)    time.textContent  = formatTime(item.timestamp);
  if (pinBtn)  { pinBtn.classList.toggle('active', item.pinned); pinBtn.title = item.pinned?'Unpin':'Pin'; pinBtn.innerHTML = pinIcon(item.pinned); }
}

function attachItemEvents(el, item) {
  el.addEventListener('click', function(e) {
    if (e.target.closest('.clip-btn') || e.target.closest('.drag-handle') || e.target.closest('.expand-btn')) return;
    copyItem(item.id);
  });
  el.querySelector('.pin-btn').addEventListener('click', function(e) { e.stopPropagation(); togglePin(item.id); });
  el.querySelector('.del-btn').addEventListener('click', function(e) { e.stopPropagation(); deleteItem(item.id, el); });
  var expandBtn = el.querySelector('.expand-btn');
  if (expandBtn) {
    expandBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var alreadyExpanded = el.classList.contains('expanded');
      if (alreadyExpanded) {
        collapseItem(el, item);
      } else {
        expandItem(el, item, expandBtn);
      }
    });
  }
  attachDrag(el);
}

function expandItem(el, item, expandBtn) {
  el.classList.add('expanded');
  el.draggable = false;                          // ← disabilita drag
  var handle = el.querySelector('.drag-handle');
  if (handle) { handle.style.opacity = '0.2'; handle.style.cursor = 'default'; handle.style.pointerEvents = 'none'; }

  expandBtn.title = 'Collapse';
  expandBtn.querySelector('polyline').setAttribute('points', '18 15 12 9 6 15');

  var preview = el.querySelector('.clip-preview');
  preview.style.display = 'none';

  // Crea textarea editabile
  var textarea = document.createElement('textarea');
  textarea.className = 'clip-editor';
  textarea.value = item.text;
  textarea.spellcheck = false;

  // Bottoni save / cancel
  var actions = document.createElement('div');
  actions.className = 'clip-editor-actions';
  actions.innerHTML =
    '<button class="editor-btn save-btn">Save</button>' +
    '<button class="editor-btn cancel-btn">Cancel</button>';

  var clipText = el.querySelector('.clip-text');
  clipText.appendChild(textarea);
  clipText.appendChild(actions);

  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);

  // Stop click sulla textarea/bottoni dal copiare l'item
  textarea.addEventListener('click',  function(e) { e.stopPropagation(); });
  textarea.addEventListener('mousedown', function(e) { e.stopPropagation(); });

  actions.querySelector('.save-btn').addEventListener('click', async function(e) {
    e.stopPropagation();
    var newText = textarea.value.trim();
    if (!newText) { showToast('Text cannot be empty', 'warning'); return; }
    item.text = newText;
    // Aggiorna nello storage
    var all = await chrome.runtime.sendMessage({ type: 'GET_ITEMS' });
    var updated = all.items.map(function(i) { return i.id === item.id ? Object.assign({}, i, { text: newText }) : i; });
    await chrome.runtime.sendMessage({ type: 'SAVE_ITEMS', items: updated });
    items = updated;
    collapseItem(el, item);
    render();
    showToast('Saved!');
  });

  actions.querySelector('.cancel-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    collapseItem(el, item);
  });
}

function collapseItem(el, item) {
  el.classList.remove('expanded');
  el.draggable = true;                           // ← riabilita drag
  var handle = el.querySelector('.drag-handle');
  if (handle) { handle.style.opacity = ''; handle.style.cursor = ''; handle.style.pointerEvents = ''; }
  var expandBtn = el.querySelector('.expand-btn');
  if (expandBtn) {
    expandBtn.title = 'Expand';
    expandBtn.querySelector('polyline').setAttribute('points', '6 9 12 15 18 9');
  }
  var preview = el.querySelector('.clip-preview');
  preview.innerHTML = highlight(item.text.slice(0, 120), searchQuery.toLowerCase());
  preview.style.display = '';
  var editor   = el.querySelector('.clip-editor');
  var edActions = el.querySelector('.clip-editor-actions');
  if (editor)   editor.remove();
  if (edActions) edActions.remove();
}

// ─── Azioni ───────────────────────────────────────────────────────────────────
async function copyItem(id) {
  var item = items.find(function(i) { return i.id === id; });
  if (!item) return;
  try {
    await navigator.clipboard.writeText(item.text);
    var el = document.querySelector('[data-id="' + id + '"]');
    if (el) { el.classList.add('copied-flash'); setTimeout(function() { el.classList.remove('copied-flash'); }, 300); }
    showToast('Copied!');
  } catch(_) { showToast('Error', 'error'); }
}

async function togglePin(id) {
  var resp = await chrome.runtime.sendMessage({ type: 'TOGGLE_PIN', id: id }).catch(function() { return null; });
  if (resp && resp.ok === false && resp.reason === 'all_pinned') { showToast('Unpin an item first', 'warning'); return; }
  await loadAndRender();
}

async function deleteItem(id, el) {
  el.style.transition = 'opacity 150ms ease, transform 150ms ease';
  el.style.opacity = '0'; el.style.transform = 'translateX(8px)';
  await sleep(150);
  await chrome.runtime.sendMessage({ type: 'DELETE_ITEM', id: id });
  items = items.filter(function(i) { return i.id !== id; });
  render();
}

async function clearUnpinned() {
  var n = items.filter(function(i) { return !i.pinned; }).length;
  if (n === 0) { showToast('Nothing to delete'); return; }
  await chrome.runtime.sendMessage({ type: 'CLEAR_UNPINNED' });
  items = items.filter(function(i) { return i.pinned; });
  render(); showToast('Deleted ' + n + ' items');
}

// ─── Drag & Drop ──────────────────────────────────────────────────────────────
var dragSrc = null, dragZone = null;

function attachDrag(el) {
  el.addEventListener('dragstart', function(e) {
    dragSrc = el; dragZone = el.dataset.zone; e.dataTransfer.effectAllowed = 'move';
    setTimeout(function() { el.classList.add('dragging'); }, 0);
  });
  el.addEventListener('dragend', function() {
    el.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(function(x) { x.classList.remove('drag-over'); });
    dragSrc = null; dragZone = null;
  });
  el.addEventListener('dragover', function(e) {
    e.preventDefault();
    if (!dragSrc || dragSrc === el || el.dataset.zone !== dragZone) return;
    document.querySelectorAll('.drag-over').forEach(function(x) { x.classList.remove('drag-over'); });
    el.classList.add('drag-over');
  });
  el.addEventListener('drop', async function(e) {
    e.preventDefault(); el.classList.remove('drag-over');
    if (!dragSrc || dragSrc === el || el.dataset.zone !== dragZone) return;
    var zoneList = dragZone === 'pinned' ? listPinned : listUnpinned;
    var children = Array.from(zoneList.children);
    var si = children.indexOf(dragSrc), di = children.indexOf(el);
    if (si === -1 || di === -1) return;
    if (si < di) { el.after(dragSrc); } else { el.before(dragSrc); }
    await persistOrder();
  });
}

async function persistOrder() {
  var p = Array.from(listPinned.children).map(function(el) { return el.dataset.id; });
  var r = Array.from(listUnpinned.children).map(function(el) { return el.dataset.id; });
  var all = p.concat(r);
  var ordered = all.map(function(id) { return items.find(function(i) { return i.id === id; }); }).filter(Boolean);
  var hidden  = items.filter(function(i) { return all.indexOf(i.id) === -1; });
  items = ordered.concat(hidden);
  await chrome.runtime.sendMessage({ type: 'SAVE_ITEMS', items: items });
}

// ─── Search ───────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', function() {
  searchQuery = searchInput.value;
  searchClear.classList.toggle('hidden', !searchQuery);
  render();
});
searchClear.addEventListener('click', function() {
  searchInput.value = ''; searchQuery = '';
  searchClear.classList.add('hidden'); searchInput.focus(); render();
});

// ─── Save current URL ─────────────────────────────────────────────────────────
btnSaveUrl.addEventListener('click', async function() {
  // When running as detached popup window, currentWindow is the popup itself
  // so we query all windows and pick the last focused normal window
  var tabs = await chrome.tabs.query({ active: true, windowType: 'normal' });
  var tab  = tabs && tabs[0];
  var url  = tab && tab.url;
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    showToast('Cannot save this page URL', 'warning');
    return;
  }
  var resp = await chrome.runtime.sendMessage({ type: 'ADD_CLIP', text: url });
  if (resp && resp.ok) {
    items = (await chrome.runtime.sendMessage({ type: 'GET_ITEMS' })).items;
    render();
    showToast('URL saved!', 'success');
  }
});

// ─── Detach ───────────────────────────────────────────────────────────────────
btnDetach.addEventListener('click', async function() {
  var url = chrome.runtime.getURL('popup.html') + '?window=1';
  var w = 400, h = 640;
  var left = Math.max(0, Math.round((screen.availWidth - w) / 2));
  var top  = Math.max(0, Math.round((screen.availHeight - h) / 2));
  await chrome.windows.create({ url: url, type: 'normal', width: w, height: h, left: left, top: top });
  window.close();
});

// ─── Clear / Help ─────────────────────────────────────────────────────────────
btnClear.addEventListener('click', function() { clearUnpinned(); });
btnHelp.addEventListener('click',  function() { modalOverlay.classList.remove('hidden'); });
modalClose.addEventListener('click', function() { modalOverlay.classList.add('hidden'); });
modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) modalOverlay.classList.add('hidden'); });

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2200);
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

init();
