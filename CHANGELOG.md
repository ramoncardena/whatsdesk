# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-10-26

### Fixed

- Launching the app while it is already running no longer starts a second instance with a second tray icon; the existing window is brought to the front instead

### Changed

- The GitHub repository was renamed from `whatsapp-appimage` to `whatsdesk` (old links redirect automatically)

## [2.1.0] - 2026-10-26

### Changed

- Renamed the app from "WhatsApp" to **WhatsDesk** to make clear it is an unofficial client and avoid trademark issues
  - App ID changed from `com.whatsapp.appimage` to `com.ramoncardena.whatsdesk`
  - The AppImage is now named `WhatsDesk-<version>.AppImage`
  - Existing user data is moved automatically from `~/.config/WhatsApp` to `~/.config/WhatsDesk` on first launch, so users stay logged in
- New original app icon (source in `icon.svg`) replacing the WhatsApp logo
- The unread badge on the window and tray icon is now drawn on the app's own icon instead of WhatsApp's favicon

### Added

- Offline page shown when WhatsApp Web can't be reached, instead of a blank window; the app reconnects automatically once the network is back

## [2.0.0] - 2026-01-12

### 🔒 Security (BREAKING CHANGES)

This is a major security release that addresses multiple vulnerabilities reported by security researchers. **All users should upgrade immediately.**

#### Fixed Vulnerabilities

- **CRITICAL**: Fixed disabled Chromium sandbox vulnerability (CVE pending)
  - Chromium sandbox is now **enabled by default**
  - Users can still disable with `--no-sandbox` flag if needed (with security warnings)
  - This was the most severe vulnerability, allowing potential remote code execution

- **HIGH**: Eliminated code injection risk in executeJavaScript calls
  - Replaced all `executeJavaScript` with template literals with secure IPC communication
  - Implemented proper preload script with context isolation
  - All data passing through IPC is now validated and sanitized

- **MEDIUM**: Strengthened URL validation
  - Replaced string prefix checks with proper URL parsing
  - Protocol validation now uses URL constructor
  - Prevents bypass attempts with encoded URLs

### Added

- **SECURITY.md**: Comprehensive security policy and responsible disclosure guidelines
- **Preload script**: Secure IPC bridge between main and renderer processes
- **Security warnings**: Console warnings when running with reduced security
- **CSP implementation**: Content Security Policy enforcement
- **Input validation**: All external inputs are now sanitized

### Changed

- **BREAKING**: Sandbox now enabled by default (may require system configuration)
- Refactored privacy toggle to use IPC instead of code injection
- Refactored badge generation to use IPC instead of code injection
- Improved URL opening handler with proper parsing
- Updated README with security information and troubleshooting
- Version bump to 2.0.0 to reflect breaking security changes

### Security Features

- ✅ Chromium sandbox enabled by default (critical fix!)
- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Secure IPC communication (no code injection)
- ✅ Input validation and sanitization
- ✅ Protocol validation for external URLs
- ✅ Preload script with proper isolation

### Migration Guide

Users upgrading from v1.x to v2.0.0:

1. **Recommended**: Configure your system for sandbox support
   ```bash
   echo "kernel.apparmor_restrict_unprivileged_userns=0" | sudo tee /etc/sysctl.d/99-appimage.conf
   sudo sysctl --system
   ```

2. **Alternative**: Run with `--no-sandbox` flag (not recommended)
   ```bash
   ./WhatsApp-2.0.0.AppImage --no-sandbox
   ```

### For Security Researchers

If you discover security vulnerabilities, please report them responsibly:
- Email: info@ramoncardena.com
- See SECURITY.md for full disclosure policy

### Acknowledgments

Thank you to the security researcher who responsibly disclosed the sandbox vulnerability.

---

## [1.4.0] - 2025-12-30

### Added
- Native notifications support
- Dynamic unread badge on tray icon
- System tray integration
- Privacy "Boss Mode" with global shortcut (Ctrl+Shift+P)

### Changed
- Updated project metadata in package.json

---

## [1.0.2] - 2025-12-30

### Fixed
- Sandbox configuration improvements
- Version bump

---

## [1.0.0] - 2025-12-20

### Added
- Initial release
- Basic Electron wrapper for WhatsApp Web
- AppImage packaging
- System tray support
- Auto-hide menu bar

---

[2.0.0]: https://github.com/yourusername/whatsapp-appimage/compare/v1.4.0...v2.0.0
[1.4.0]: https://github.com/yourusername/whatsapp-appimage/compare/v1.0.2...v1.4.0
[1.0.2]: https://github.com/yourusername/whatsapp-appimage/compare/v1.0.0...v1.0.2
[1.0.0]: https://github.com/yourusername/whatsapp-appimage/releases/tag/v1.0.0
