# CopyVault — Chrome Extension

> Save text with right-click, edit snippets inline, pin favorites, reorder with drag & drop, and copy back in one click.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-7c6af7?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-88+-4ade80?style=flat-square&logo=googlechrome&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-fbbf24?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-4ade80?style=flat-square)

---

## What is CopyVault?

CopyVault is a lightweight clipboard history manager for Chrome. No bloat, no cloud, no accounts — just a clean popup that keeps your last 20 text snippets ready to use, with pins, inline editing, drag & drop reordering, and side panel support for hands-free browsing.

---

## Features

- **Right-click to save** — select any text on any page, right-click, and choose *Save to CopyVault*
- **Save page URL** — click the 🔗 icon in the header to save the current tab's URL instantly
- **Save links** — right-click any link to save its URL directly
- **Manual add** — open the extension and paste or type directly into the input field
- **One-click copy** — click any saved item to instantly copy it back to your clipboard
- **Inline editing** — expand any item to edit, add, or remove text before copying
- **Pin items** — pin your favorites so they're never auto-deleted
- **Drag & drop reorder** — arrange items in any order you like
- **Side panel** — open CopyVault as a persistent side panel that stays visible while you browse (Chrome 114+)
- **Search** — filter your saved items in real time
- **Auto-rotation** — holds up to 20 items; oldest unpinned item is dropped when full
- **Dark & light theme** — automatically matches your system preference
- **100% local** — nothing ever leaves your device, no server, no tracking

---

## How to Use

| Action | How |
|---|---|
| Save text | Select text → right-click → **Save to CopyVault** |
| Save a link | Right-click any link → **Save to CopyVault** |
| Save current URL | Click the 🔗 icon in the header |
| Add manually | Open extension → paste in the top field → **Enter** or **+** |
| Copy an item | Click the item in the list |
| Edit an item | Click the **∨** icon → edit freely → **Save** or **Cancel** |
| Pin an item | Click the 📌 icon on the item |
| Reorder | Drag the ⠿ handle up or down |
| Side panel | Click the ⊞ icon — opens as a persistent side panel (Chrome 114+) |
| Delete one | Hover item → click **×** |
| Delete all unpinned | Click the 🗑️ icon in the header |

> **Note:** The right-click menu and the 🔗 URL button are not available on Chrome system pages (`chrome://`) or the Chrome Web Store. This is a Chrome security restriction that applies to all extensions — it is not a bug. To save a URL from those pages, copy it manually and paste it into the extension's input field.

---

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the `copyvault` folder
5. The extension icon will appear in your toolbar

---

## Tech Stack

- **Vanilla JavaScript** — no frameworks, no build tools, no npm
- **Chrome Storage API** — all data stored locally
- **Context Menus API** — right-click integration
- **Side Panel API** — persistent panel support (Chrome 114+)
- **Manifest V3** — built for modern Chrome security standards

---

## Privacy

CopyVault stores everything locally on your device using Chrome's built-in storage. No data is ever sent to any server. See [PRIVACY.md](PRIVACY.md) for the full policy.

---

## Support the Project

If CopyVault saves you time, consider buying me a coffee ☕

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-nightintel-fbbf24?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/nightintel)

---

## Contact

- Email: [selfmonk@gmail.com](mailto:selfmonk@gmail.com)
- Buy Me a Coffee: [nightintel](https://buymeacoffee.com/nightintel)

---

## License

MIT — free to use, modify and distribute. See [LICENSE](LICENSE) for details.
