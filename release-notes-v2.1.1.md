# 🛠️ v2.1.1 - Single Instance Fix

## 🐛 Fixed

- **Only one WhatsDesk at a time**: launching the app while it is already running (for example, double-clicking the launcher) used to start a second copy with a second tray icon. Now the existing window is brought to the front instead.

## 📦 Repository renamed

The GitHub repository is now **[ramoncardena/whatsdesk](https://github.com/ramoncardena/whatsdesk)**, matching the app's new name. Old `whatsapp-appimage` links and clones redirect automatically.

---

## 🚀 Upgrading

1. Quit WhatsDesk (right-click the tray icon → **Quit**)
2. Download `WhatsDesk-2.1.1.AppImage` below
3. Make it executable and run it:
   ```bash
   chmod +x WhatsDesk-2.1.1.AppImage
   ./WhatsDesk-2.1.1.AppImage
   ```

Upgrading from v2.0.0 or earlier? Your session moves automatically from `~/.config/WhatsApp` to `~/.config/WhatsDesk`, see the [v2.1.0 release notes](https://github.com/ramoncardena/whatsdesk/releases/tag/v2.1.0).

---

## ⚖️ Disclaimer

WhatsDesk is an unofficial wrapper around WhatsApp Web and is not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with WhatsApp or Meta. WhatsApp is a trademark of WhatsApp LLC.
