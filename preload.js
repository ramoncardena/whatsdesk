const { contextBridge, ipcRenderer } = require('electron');

// Security: Set up IPC listeners that run in the context of the page
// This is safer than executing code strings with template literals

// Toggle privacy blur mode when requested
ipcRenderer.on('toggle-privacy', () => {
  if (document.body.style.filter === 'blur(10px)') {
    document.body.style.filter = 'none';
  } else {
    document.body.style.filter = 'blur(10px)';
    document.body.style.transition = 'filter 0.3s ease';
  }
});

// Generate badge icon when requested
ipcRenderer.on('generate-badge', (event, count, iconDataUrl) => {
  // Sanitize count to ensure it's a safe number
  const safeCount = Math.max(0, Math.min(9999, parseInt(count, 10) || 0));
  if (typeof iconDataUrl !== 'string' || !iconDataUrl.startsWith('data:image/png;base64,')) {
    return;
  }

  // Generate badge with count overlay
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const img = new Image();

  // Draw on the app's own icon, not the page favicon (which is WhatsApp's logo)
  img.src = iconDataUrl;

  img.onload = () => {
    try {
      ctx.drawImage(img, 0, 0, 64, 64);

      if (safeCount > 0) {
        // Red circle
        ctx.fillStyle = '#f44336'; // Material Red
        ctx.beginPath();
        ctx.arc(48, 16, 18, 0, 2 * Math.PI);
        ctx.fill();

        // Count text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Handle large numbers
        const text = safeCount > 99 ? '99+' : safeCount.toString();
        ctx.fillText(text, 48, 17);
      }

      // Send the data URL back to main process
      const dataUrl = canvas.toDataURL();
      ipcRenderer.send('badge-data-url', dataUrl);
    } catch (e) {
      console.error('Badge generation error:', e);
    }
  };

  img.onerror = () => {
    console.error('Failed to load app icon for badge generation');
  };
});

// Expose a minimal secure API to the renderer process if needed
// Currently not used but available for future extensions
contextBridge.exposeInMainWorld('electronAPI', {
  // Placeholder for future secure APIs
  version: '2.1.0'
});
