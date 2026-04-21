function initDotsPage() {
  var root = document.documentElement;

  function hasDotsPage() {
    return !!document.querySelector('.bg-dots');
  }

  function updateDotsForZoom() {
    var dpr = window.devicePixelRatio || 1;
    var styles = getComputedStyle(root);
    var sizeBase = parseFloat(styles.getPropertyValue('--dots-size-base')) || 16;
    var radiusBase = parseFloat(styles.getPropertyValue('--dots-radius-base')) || 1;

    root.style.setProperty('--dots-size', (sizeBase / dpr) + 'px');
    root.style.setProperty('--dots-radius', (radiusBase / dpr) + 'px');
  }

  // Keep dot sizing stable across browser zoom
  updateDotsForZoom();
  window.addEventListener('resize', updateDotsForZoom, { passive: true });

  var lastDpr = window.devicePixelRatio || 1;
  setInterval(function () {
    if (document.hidden) return;
    var now = window.devicePixelRatio || 1;
    if (now !== lastDpr) {
      lastDpr = now;
      updateDotsForZoom();
    }
  }, 250);

  // Canvas dot-grid + effects
  var canvas = document.getElementById('dots-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var off = document.createElement('canvas');
  var offCtx = off.getContext('2d');
  if (!offCtx) return;

  var spacing = 16;
  var radius = 1;
  var baseColor = 'rgba(0,0,0,0.12)';
  var highlightNear = '#f59794';
  var highlightCenter = '#c94d4a';
  var textColor = '#0a0a0a';

  var mouseX = null;
  var mouseY = null;
  var typedText = '';
  var raf = null;
  var dotsOn = false;

  // 5x7 dot font (A-Z, 0-9, space). Each char is 7 rows, 5 columns.
  var FONT_5X7 = {
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    6: ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
    7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  };

  function readVars() {
    var styles = getComputedStyle(root);
    spacing = parseFloat(styles.getPropertyValue('--dots-size')) || 16;
    radius = parseFloat(styles.getPropertyValue('--dots-radius')) || 1;
    baseColor = (styles.getPropertyValue('--dots-color') || '').trim() || baseColor;
    textColor = (styles.getPropertyValue('--color-ink') || '').trim() || textColor;
  }

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    off.width = canvas.width;
    off.height = canvas.height;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildBase() {
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    offCtx.clearRect(0, 0, w, h);
    offCtx.fillStyle = baseColor;

    for (var y = 0; y <= h + spacing; y += spacing) {
      for (var x = 0; x <= w + spacing; x += spacing) {
        offCtx.beginPath();
        offCtx.arc(x, y, radius, 0, Math.PI * 2);
        offCtx.fill();
      }
    }
  }

  function sanitizeText(raw) {
    var up = String(raw || '').toUpperCase();
    up = up.replace(/[^A-Z0-9 ]/g, '');
    up = up.replace(/\s+/g, ' ').trimStart();
    return up.slice(0, 7);
  }

  function drawTextDots(text, w, h) {
    if (!text) return;
    var t = sanitizeText(text);
    if (!t) return;

    var charW = 5;
    var charH = 7;
    var gap = 1;
    var totalCols = t.length * (charW + gap) - gap;

    var gridCols = Math.floor(w / spacing);
    var gridRows = Math.floor(h / spacing);

    var startCol = Math.max(0, Math.floor((gridCols - totalCols) / 2));
    var targetRowCenter = Math.floor(gridRows * 0.38);
    var startRow = Math.max(0, targetRowCenter - Math.floor(charH / 2));

    ctx.fillStyle = textColor;

    for (var ci = 0; ci < t.length; ci++) {
      var ch = t[ci];
      var glyph = FONT_5X7[ch] || FONT_5X7[' '];
      var colOffset = startCol + ci * (charW + gap);

      for (var r = 0; r < charH; r++) {
        var rowBits = glyph[r] || '00000';
        for (var c = 0; c < charW; c++) {
          if (rowBits.charAt(c) !== '1') continue;
          var x = (colOffset + c) * spacing;
          var y = (startRow + r) * spacing;
          if (x < 0 || y < 0 || x > w || y > h) continue;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function draw() {
    raf = null;
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(off, 0, 0, w, h);

    if (dotsOn) drawTextDots(typedText, w, h);

    if (!dotsOn) return;
    if (mouseX == null || mouseY == null) return;

    var gx = Math.round(mouseX / spacing) * spacing;
    var gy = Math.round(mouseY / spacing) * spacing;

    // Draw 4x4 matrix highlight (nearest dot is the dark-red "center")
    for (var j = -1; j <= 2; j++) {
      for (var i = -1; i <= 2; i++) {
        var x = gx + i * spacing;
        var y = gy + j * spacing;
        if (x < -spacing || y < -spacing || x > w + spacing || y > h + spacing) continue;

        ctx.fillStyle = i === 0 && j === 0 ? highlightCenter : highlightNear;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function requestDraw() {
    if (raf) return;
    raf = requestAnimationFrame(draw);
  }

  function setDotsOn(next) {
    dotsOn = !!next;
    root.classList.toggle('dots-canvas-on', dotsOn);
    requestDraw();
  }

  function enableIfNeeded() {
    var enabled = hasDotsPage();
    root.classList.toggle('dots-canvas-enabled', enabled);
    if (!enabled) return;
    readVars();
    resize();
    buildBase();
    requestDraw();
  }

  function bindInput() {
    var input = document.getElementById('test-input');
    if (!input) return;
    typedText = sanitizeText(input.value);
    input.value = typedText;
    input.addEventListener('input', function () {
      typedText = sanitizeText(input.value);
      if (input.value !== typedText) input.value = typedText;
      requestDraw();
    });
  }

  function bindToggle() {
    var toggle = document.getElementById('dots-toggle');
    if (!toggle) return;
    setDotsOn(!!toggle.checked);
    toggle.addEventListener('change', function () {
      setDotsOn(!!toggle.checked);
    });
  }

  window.addEventListener(
    'mousemove',
    function (e) {
      if (!hasDotsPage()) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      requestDraw();
    },
    { passive: true }
  );

  window.addEventListener('mouseleave', function () {
    mouseX = null;
    mouseY = null;
    requestDraw();
  });

  window.addEventListener(
    'resize',
    function () {
      if (!hasDotsPage()) return;
      readVars();
      resize();
      buildBase();
      requestDraw();
    },
    { passive: true }
  );

  var mo = new MutationObserver(function () {
    if (!hasDotsPage()) return;
    readVars();
    buildBase();
    requestDraw();
  });
  mo.observe(root, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });

  enableIfNeeded();
  bindInput();
  bindToggle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDotsPage);
} else {
  initDotsPage();
}

