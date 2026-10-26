const { app, BrowserWindow, shell, Tray, Menu, globalShortcut, nativeImage, ipcMain, net } = require('electron');
const path = require('path');
const fs = require('fs');

const WHATSAPP_URL = 'https://web.whatsapp.com';

// Fix notifications on Windows/Linux
if (process.platform === 'linux' || process.platform === 'win32') {
  app.setAppUserModelId('com.ramoncardena.whatsdesk');
}

// Versions up to 2.0.0 were named "WhatsApp" and stored their data in ~/.config/WhatsApp.
// Move it to the WhatsDesk folder on first launch so users stay logged in.
// Must run before the app is ready, i.e. before Chromium starts using the user data folder.
function migrateLegacyUserData() {
  const legacyDir = path.join(app.getPath('appData'), 'WhatsApp');
  const userDataDir = app.getPath('userData');
  // Electron creates an empty userData folder before this runs, so only skip if it already holds data
  const hasUserData = fs.existsSync(userDataDir) && fs.readdirSync(userDataDir).length > 0;
  if (!fs.existsSync(legacyDir) || hasUserData) {
    return;
  }
  try {
    if (fs.existsSync(userDataDir)) {
      fs.rmdirSync(userDataDir); // only removes it if empty
    }
    fs.renameSync(legacyDir, userDataDir);
    console.log(`Migrated user data from ${legacyDir} to ${userDataDir}`);
  } catch (e) {
    console.error('Failed to migrate user data, starting with a fresh profile:', e);
  }
}
migrateLegacyUserData();

// Security: Only disable sandbox if explicitly requested via command line
// This is a significant security reduction and should only be used when necessary
if (process.argv.includes('--no-sandbox')) {
  console.warn('⚠️  WARNING: Running with sandbox disabled. This significantly reduces security.');
  console.warn('⚠️  Only use this flag on trusted networks and if you understand the risks.');
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-setuid-sandbox');
} else {
  console.log('✓ Running with Chromium sandbox enabled (secure mode)');
}

let mainWindow;
let tray = null;
let isQuitting = false;

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show WhatsDesk',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Toggle Privacy Blur (Ctrl+Shift+B)',
      click: () => {
        togglePrivacy();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('WhatsDesk');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

function togglePrivacy() {
  if (mainWindow) {
    // Security: Use IPC to trigger privacy toggle instead of injecting code
    mainWindow.webContents.send('toggle-privacy');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Note: renderer sandbox disabled for WhatsApp Web compatibility
      // Main Chromium sandbox still provides critical protection
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png')
  });

  // Open DevTools for debugging (disabled in production)
  // mainWindow.webContents.openDevTools();

  // correct User Agent is often crucial for WhatsApp Web to work in Electron
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  mainWindow.webContents.setUserAgent(userAgent);

  // Security: CSP temporarily disabled for debugging
  // TODO: Re-enable with proper configuration after testing
  // mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': [
  //         "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: wss: https:; " +
  //         "script-src * 'unsafe-inline' 'unsafe-eval'; " +
  //         "connect-src * wss: https:; " +
  //         "img-src * data: blob: https: http:; " +
  //         "media-src * data: blob: https: http: mediastream:; " +
  //         "style-src * 'unsafe-inline'; " +
  //         "font-src * data:; " +
  //         "object-src 'none';"
  //       ]
  //     }
  //   });
  // });

  // Load failures are handled by the did-fail-load listener below
  mainWindow.loadURL(WHATSAPP_URL).catch(() => {});

  // Show a local offline page instead of a blank window when WhatsApp Web can't be reached,
  // and reload automatically once the network is back
  let reconnectTimer = null;
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    // -3 (ERR_ABORTED) happens on normal redirects/navigations and is not a real failure
    if (!isMainFrame || errorCode === -3 || !validatedURL.startsWith(WHATSAPP_URL)) {
      return;
    }
    console.warn(`Failed to load WhatsApp Web (${errorDescription}), showing offline page`);
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));

    if (!reconnectTimer) {
      reconnectTimer = setInterval(() => {
        if (net.isOnline()) {
          clearInterval(reconnectTimer);
          reconnectTimer = null;
          mainWindow.loadURL(WHATSAPP_URL).catch(() => {});
        }
      }, 5000);
    }
  });

  // Security: Open links in external browser with proper validation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsedUrl = new URL(url);
      // Only allow http and https protocols
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    } catch (e) {
      console.error('Invalid URL attempted to open:', url);
    }
    return { action: 'deny' }; // Deny by default for security
  });

  // Hide instead of close
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  // Handle Notifications permission
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === 'notifications') {
      return true;
    }
    return false;
  });
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'notifications') {
      callback(true);
    } else {
      callback(false);
    }
  });

  // The badge is drawn on top of the app's own icon
  const badgeBaseIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'))
    .resize({ width: 64, height: 64 })
    .toDataURL();

  // Update Tray Tooltip with unread count
  mainWindow.on('page-title-updated', (event, title) => {
    // WhatsApp title format: "(3) WhatsApp" or just "WhatsApp"
    const countMatch = title.match(/^\((\d+)\)/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;

    // Update badge on Dock/Taskbar directly
    if (process.platform === 'darwin' && app.dock) {
      app.dock.setBadge(count > 0 ? count.toString() : '');
    } else {
      app.setBadgeCount(count);
    }

    // Security: Request badge generation via IPC instead of injecting code
    // This sends a message to the preload script which will generate the badge safely
    mainWindow.webContents.send('generate-badge', count, badgeBaseIcon);

    if (tray) {
      if (count > 0) {
        tray.setToolTip(`WhatsDesk (${count} unread)`);
      } else {
        tray.setToolTip('WhatsDesk');
      }
    }
  });

  // Dynamic Icon Sync (Legacy fallback)
  mainWindow.webContents.on('page-favicon-updated', (event, favicons) => {
    // Keep this as fallback, but the canvas method above is superior
    if (favicons && favicons.length > 0) {
      // ...
    }
  });

  // Security: Set up IPC listener for badge data URL from renderer
  ipcMain.on('badge-data-url', (event, dataUrl) => {
    if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:image/png;base64,')) {
      try {
        const img = nativeImage.createFromDataURL(dataUrl);
        mainWindow.setIcon(img);
        if (tray) tray.setImage(img);
      } catch (e) {
        console.error('Failed to set badge icon:', e);
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register global shortcut for Privacy Mode (Boss Mode)
  // Using Ctrl+Shift+B to avoid conflicts with VS Code's command palette
  globalShortcut.register('CommandOrControl+Shift+B', () => {
    togglePrivacy();
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// We don't want the default window-all-closed behavior because of the tray
app.on('window-all-closed', () => {
  // Do nothing
});
