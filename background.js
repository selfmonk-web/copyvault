// CopyVault — background.js

var MAX_ITEMS    = 20;
var MAX_TEXT_LEN = 5000;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function loadItems() {
  var data = await chrome.storage.local.get('items');
  return data.items || [];
}

async function saveItems(items) {
  await chrome.storage.local.set({ items: items });
}

async function addClipItem(text) {
  if (!text || typeof text !== 'string') return;
  var trimmed = text.trim();
  if (!trimmed) return;
  var stored = trimmed.length > MAX_TEXT_LEN ? trimmed.slice(0, MAX_TEXT_LEN) : trimmed;
  var items  = await loadItems();
  if (items.length > 0 && items[0].text === stored) return;
  var deduped = items.filter(function(i) { return i.text !== stored; });
  var newItem = { id: generateId(), text: stored, timestamp: Date.now(), pinned: false };
  var result  = [newItem].concat(deduped);
  if (result.length > MAX_ITEMS) {
    for (var i = result.length - 1; i >= 0; i--) {
      if (!result[i].pinned) { result.splice(i, 1); break; }
    }
    if (result.length > MAX_ITEMS) result = result.slice(0, MAX_ITEMS);
  }
  await saveItems(result);
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async function(details) {
  // Ricrea sempre il context menu (evita duplicati al reload)
  chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
      id:       'clipstack-save',
      title:    'Save to CopyVault',
      contexts: ['selection', 'link', 'page']
    });
  });

  if (details.reason === 'install') {
    await chrome.storage.local.set({ items: [] });
    chrome.notifications.create('welcome', {
      type:    'basic',
      iconUrl: 'icons/icon48.png',
      title:   'CopyVault installed!',
      message: 'Select text on any page → right-click → Save to CopyVault'
    });
  }
});

chrome.contextMenus.onClicked.addListener(async function(info) {
  if (info.menuItemId !== 'clipstack-save') return;
  var text = info.selectionText || info.linkUrl || info.pageUrl;
  if (!text || !text.trim()) return;
  await addClipItem(text);
  chrome.notifications.create({
    type:    'basic',
    iconUrl: 'icons/icon48.png',
    title:   'CopyVault',
    message: 'Salvato: "' + text.slice(0, 60) + (text.length > 60 ? '...' : '') + '"'
  });
});

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(function(msg, _sender, sendResponse) {
  (async function() {
    switch (msg.type) {

      case 'ADD_CLIP':
        await addClipItem(msg.text);
        sendResponse({ ok: true });
        break;

      case 'GET_ITEMS':
        sendResponse({ items: await loadItems() });
        break;

      case 'SAVE_ITEMS':
        await saveItems(msg.items);
        sendResponse({ ok: true });
        break;

      case 'DELETE_ITEM':
        var items = await loadItems();
        await saveItems(items.filter(function(i) { return i.id !== msg.id; }));
        sendResponse({ ok: true });
        break;

      case 'TOGGLE_PIN':
        var items2    = await loadItems();
        var target    = items2.find(function(i) { return i.id === msg.id; });
        if (!target) { sendResponse({ ok: false, reason: 'not_found' }); break; }
        var pinCount  = items2.filter(function(i) { return i.pinned && i.id !== msg.id; }).length;
        if (!target.pinned && pinCount >= MAX_ITEMS) {
          sendResponse({ ok: false, reason: 'all_pinned' }); break;
        }
        await saveItems(items2.map(function(i) {
          return i.id === msg.id ? Object.assign({}, i, { pinned: !i.pinned }) : i;
        }));
        sendResponse({ ok: true });
        break;

      case 'CLEAR_UNPINNED':
        var all = await loadItems();
        await saveItems(all.filter(function(i) { return i.pinned; }));
        sendResponse({ ok: true });
        break;

      default:
        sendResponse({ ok: false });
    }
  })();
  return true;
});
