# Privacy Policy — CopyVault

**Last updated: June 2026**

---

## Overview

CopyVault is a Chrome extension that helps you save, pin, edit, and reorder text snippets. This privacy policy explains how the extension handles your data.

**Short version: CopyVault stores everything locally on your device. Nothing is ever sent anywhere.**

---

## Data Collection

CopyVault does **not** collect, transmit, sell, or share any personal data.

The extension does not:
- Send any data to external servers
- Use analytics or tracking of any kind
- Require an account or login
- Access your browsing history
- Read your clipboard automatically (text is only saved when you explicitly choose *Save to CopyVault* via right-click, click the 🔗 URL button, or manually type/paste into the extension)

---

## Data Storage

Text snippets and URLs you save are stored **locally on your device** using Chrome's built-in `chrome.storage.local` API. This data:

- Never leaves your device
- Is not synced to Google or any cloud service
- Is automatically managed by the extension (up to 20 items, oldest unpinned items are removed when full)
- Can be edited or deleted at any time directly within the extension
- Is permanently removed by uninstalling the extension

---

## Permissions Used

| Permission | Why it's needed |
|---|---|
| `storage` | Save your text snippets locally on your device |
| `contextMenus` | Add the "Save to CopyVault" option to the right-click menu |
| `windows` | Open CopyVault as a floating detached window (Chrome < 114) |
| `notifications` | Show a confirmation when text is saved via right-click |
| `tabs` | Read the current tab's URL when you click the 🔗 save button |
| `sidePanel` | Open CopyVault as a persistent side panel (Chrome 114+) |

No permission is used beyond its stated purpose.

---

## Third-Party Services

CopyVault does not integrate with any third-party services.

The footer contains a voluntary link to [buymeacoffee.com/nightintel](https://buymeacoffee.com/nightintel). This link is only opened if you choose to click it — no data is sent automatically.

---

## Children's Privacy

CopyVault does not knowingly collect any information from anyone, including children under 13.

---

## Changes to This Policy

If this policy is updated, the new version will be published in this repository with an updated date. Continued use of the extension after changes constitutes acceptance of the updated policy.

---

## Contact

If you have any questions about this privacy policy, you can reach out at:

- Email: [selfmonk@gmail.com](mailto:selfmonk@gmail.com)
- Buy Me a Coffee: [nightintel](https://buymeacoffee.com/nightintel)
