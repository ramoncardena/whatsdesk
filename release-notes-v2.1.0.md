# 🖥️ v2.1.0 - Meet WhatsDesk

## ✨ New Name: WhatsDesk

This project is now called **WhatsDesk**. The new name makes it clear that this is an **unofficial** client for WhatsApp Web, not an app made by WhatsApp or Meta, and avoids using the WhatsApp trademark as the app's name.

- 🎨 **New original icon**: a desktop monitor with a typing indicator, replacing the WhatsApp logo
- 📦 The AppImage is now named `WhatsDesk-2.1.0.AppImage`
- 🔔 The unread badge on the window and tray icon is now drawn on the WhatsDesk icon

### Your data moves automatically

When you upgrade from v2.0.0 or earlier, WhatsDesk moves your existing session and settings from `~/.config/WhatsApp` to `~/.config/WhatsDesk` on first launch. **You stay logged in**, no action needed.

> Note: if you go back to v2.0.0 after upgrading, you will need to log in again.

---

## 🌐 Offline Page

Previously, starting the app without an internet connection showed a blank window. WhatsDesk now shows a clear **"No internet connection"** page instead, with a **Try again** button, and reconnects automatically as soon as the network is back.

---

## 🚀 Upgrading

1. Download `WhatsDesk-2.1.0.AppImage` below
2. Make it executable:
   ```bash
   chmod +x WhatsDesk-2.1.0.AppImage
   ```
3. Run it:
   ```bash
   ./WhatsDesk-2.1.0.AppImage
   ```

You can delete the old `WhatsApp-*.AppImage` file afterwards.

---

## ⚖️ Disclaimer

WhatsDesk is an unofficial wrapper around WhatsApp Web and is not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with WhatsApp or Meta. WhatsApp is a trademark of WhatsApp LLC.
