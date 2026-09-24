import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createMatrixSandbox2D() {
  const container = document.createElement('div');
  container.className = 'sandbox-page';

  // Matrix values: M = [[a, b], [c, d]]
  // i-hat = [a, c]^T (Column 1)
  // j-hat = [b, d]^T (Column 2)
  let a = 1.0, c = 0.0;
  let b = 0.0, d = 1.0;

  let activeShape = 'grid'; // 'grid' | 'ship' | 'f' | 'circle'
  let draggingVector = null; // 'i' | 'j' | null
  let animFrameId = null;

  // Composition mode state
  let isComposingAnim = false;
  let compTime = 0;

  function render() {
    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <div class="section-icon-badge">02</div>
          <div>
            <div class="section-meta-tag">PRANCHA TÉCNICA 02 // BNCC EM13MAT401</div>
            <h2 class="section-title">Laboratório Cartesiano de Transformações Lineares 2D</h2>
            <p class="section-subtitle">Manipule os vetores base î e ĵ no plano cartesiano para observar a deformação geométrica contínua do espaço</p>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <div class="canvas-badge-group">
            <span style="color: var(--pen-x);">î = [<span id="top-i-coord">1.00, 0.00</span>]</span>
            <span style="color: var(--pen-y); margin-left: 0.5rem;">ĵ = [<span id="top-j-coord">0.00, 1.00</span>]</span>
            <span id="top-det-badge" style="color: var(--pen-area); margin-left: 0.65rem; font-weight: 700;">
              det(M) = 1.00
            </span>
          </div>

          <button class="btn-secondary" id="btn-reset-matrix" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" aria-label="Redefinir para matriz identidade">
            ↺ IDENTIDADE
          </button>
        </div>
      </div>

      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
              <button class="preset-btn active" data-shape="grid">[1] GRADE CARTESIANA</button>
              <button class="preset-btn" data-shape="ship">[2] ESPAÇONAVE</button>
              <button class="preset-btn" data-shape="f">[3] LETRA "F"</button>
              <button class="preset-btn" data-shape="circle">[4] CÍRCULO ➜ ELIPSE</button>
            </div>

            <div id="canvas-det-indicator" class="det-status normal" style="margin: 0; padding: 0.3rem 0.65rem;">
              <span>ÁREA PRESERVADA: det = 1.00</span>
            </div>
          </div>

          <canvas id="matrix-canvas" width="860" height="540" style="width: 100%; height: 100%; cursor: grab;" aria-label="Plano cartesiano com vetores base arrastáveis"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">A Matriz de Transformação M</h3>
            
            <div class="matrix-bracket-view">
              <span style="font-family: var(--font-tech); font-size: 1.2rem; color: var(--bp-ink); margin-right: 0.4rem; font-weight: 700;">M =</span>
              <div class="matrix-grid-input">
                <input type="number" step="0.1" id="mat-a" value="1.0" class="matrix-cell-input col-i" title="Coluna 1, Linha 1 (î_x)" aria-label="î_x">
                <input type="number" step="0.1" id="mat-b" value="0.0" class="matrix-cell-input col-j" title="Coluna 2, Linha 1 (ĵ_x)" aria-label="ĵ_x">
                <input type="number" step="0.1" id="mat-c" value="0.0" class="matrix-cell-input col-i" title="Coluna 1, Linha 2 (î_y)" aria-label="î_y">
                <input type="number" step="0.1" id="mat-d" value="1.0" class="matrix-cell-input col-j" title="Coluna 2, Linha 2 (ĵ_y)" aria-label="ĵ_y">
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--bp-ink-muted); margin-bottom: 0.6rem; font-family: var(--font-tech);">
              <span style="color: var(--pen-x);">Coluna 1: Destino de î</span>
              <span style="color: var(--pen-y);">Coluna 2: Destino de ĵ</span>
            </div>

            <div class="telemetry-row">
              <span style="color: var(--bp-ink-secondary);">Determinante (Escala de Área):</span>
              <span id="control-det-val" class="telemetry-val" style="color: var(--pen-area); font-size: 0.95rem;">1.00</span>
            </div>

            <div id="det-desc-box" class="det-status normal">
              A transformação preserva a área original e a orientação do espaço.
            </div>
          </div>

          <div class="control-card">
            <h3 class="control-title">Transformações Canônicas</h3>
            <div class="preset-grid">
              <button class="preset-btn" id="pre-ident">IDENTIDADE I</button>
              <button class="preset-btn" id="pre-rot45">ROTAÇÃO R(45°)</button>
              <button class="preset-btn" id="pre-rot90">ROTAÇÃO R(90°)</button>
              <button class="preset-btn" id="pre-shear-x">CISALHAMENTO X</button>
              <button class="preset-btn" id="pre-shear-y">CISALHAMENTO Y</button>
              <button class="preset-btn" id="pre-scale2">ESCALA 2.0X</button>
              <button class="preset-btn" id="pre-reflect">REFLEXÃO (det < 0)</button>
              <button class="preset-btn" id="pre-collapse" style="color: var(--pen-alert);">COLAPSO 1D (det = 0)</button>
            </div>
          </div>

          <div class="control-card">
            <h3 class="control-title">
              <span>Composição Linear (A × B)</span>
              <span style="font-size: 0.7rem; color: var(--bp-ink-muted); font-family: var(--font-tech);">ENCADEAMENTO</span>
            </h3>
            <p style="font-size: 0.78rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 0.65rem;">
              Multiplicar matrizes significa aplicar transformações geométricas sucessivas. Veja o plano sofrer rotação de 45° seguida de cisalhamento:
            </p>
            <button class="btn-primary" id="btn-demo-composition" style="width: 100%; justify-content: center; font-size: 0.8rem;" aria-label="Executar animação de composição de matrizes">
              ▶ EXECUTAR COMPOSIÇÃO PASSO A PASSO
            </button>
          </div>
        </div>
      </div>
    `;

    setupLogic();
  }

  function setupLogic() {
    const canvas = container.querySelector('#matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const inputA = container.querySelector('#mat-a');
    const inputB = container.querySelector('#mat-b');
    const inputC = container.querySelector('#mat-c');
    const inputD = container.querySelector('#mat-d');

    const topI = container.querySelector('#top-i-coord');
    const topJ = container.querySelector('#top-j-coord');
    const topDet = container.querySelector('#top-det-badge');
    const ctrlDet = container.querySelector('#control-det-val');
    const detDesc = container.querySelector('#det-desc-box');
    const canvasDetInd = container.querySelector('#canvas-det-indicator');

    const updateInputs = () => {
      inputA.value = a.toFixed(2);
      inputB.value = b.toFixed(2);
      inputC.value = c.toFixed(2);
      inputD.value = d.toFixed(2);

      topI.textContent = `${a.toFixed(2)}, ${c.toFixed(2)}`;
      topJ.textContent = `${b.toFixed(2)}, ${d.toFixed(2)}`;

      const det = a * d - b * c;
      const detStr = det.toFixed(2);
      topDet.textContent = `det(M) = ${detStr}`;
      ctrlDet.textContent = `${detStr}x`;

      if (Math.abs(det) < 0.05) {
        topDet.style.color = 'var(--pen-alert)';
        ctrlDet.style.color = 'var(--pen-alert)';
        if (canvasDetInd) {
          canvasDetInd.className = 'det-status collapsed';
          canvasDetInd.innerHTML = `COLAPSO DIMENSIONAL: det = 0.00`;
        }
        if (detDesc) {
          detDesc.className = 'det-status collapsed';
          detDesc.innerHTML = `<strong>COLAPSO DIMENSIONAL:</strong> O plano 2D colapsou em uma linha 1D ou em um ponto. Esta matriz não possui inversa!`;
        }
      } else if (det < 0) {
        topDet.style.color = 'var(--pen-angle)';
        ctrlDet.style.color = 'var(--pen-angle)';
        if (canvasDetInd) {
          canvasDetInd.className = 'det-status flipped';
          canvasDetInd.innerHTML = `ORIENTAÇÃO INVERTIDA (det = ${detStr})`;
        }
        if (detDesc) {
          detDesc.className = 'det-status flipped';
          detDesc.innerHTML = `<strong>ORIENTAÇÃO INVERTIDA:</strong> O espaço foi virado do avesso como uma folha de papel refletida no espelho (det negativo).`;
        }
      } else {
        topDet.style.color = 'var(--pen-area)';
        ctrlDet.style.color = 'var(--pen-area)';
        if (canvasDetInd) {
          canvasDetInd.className = 'det-status normal';
          canvasDetInd.innerHTML = `ÁREA ESCALADA: ${detStr}x (det = ${detStr})`;
        }
        if (detDesc) {
          detDesc.className = 'det-status normal';
          detDesc.innerHTML = `<strong>ÁREA ESCALADA:</strong> Toda figura geométrica no plano tem sua área multiplicada pelo fator de ${detStr}x.`;
        }
      }
    };

    [inputA, inputB, inputC, inputD].forEach(inp => {
      inp.addEventListener('input', () => {
        a = parseFloat(inputA.value) || 0;
        b = parseFloat(inputB.value) || 0;
        c = parseFloat(inputC.value) || 0;
        d = parseFloat(inputD.value) || 0;
        updateInputs();
      });
    });

    // Preset handlers
    container.querySelector('#btn-reset-matrix')?.addEventListener('click', () => {
      soundFx.playClick();
      a = 1; b = 0; c = 0; d = 1;
      updateInputs();
    });

    container.querySelector('#pre-ident')?.addEventListener('click', () => {
      soundFx.playClick();
      a = 1; b = 0; c = 0; d = 1;
      updateInputs();
    });

    container.querySelector('#pre-rot45')?.addEventListener('click', () => {
      soundFx.playClick();
      const r = Math.PI / 4;
      a = Math.cos(r); b = -Math.sin(r);
      c = Math.sin(r); d = Math.cos(r);
      updateInputs();
    });

    container.querySelector('#pre-rot90')?.addEventListener('click', () => {
      soundFx.playClick();
      a = 0; b = -1; c = 1; d = 0;
      updateInputs();
    });

    container.querySelector('#pre-shear-x')?.addEventListener('click', () => {
      soundFx.playClick();
      a = 1; b = 1.2; c = 0; d = 1;
      updateInputs();
    });

    container.querySelector('#pre-shear-y')?.addEventListener('click', () => {
      soundFx.playClick();
      a = 1; b = 0; c = 1.0; d = 1;
      updateInputs();
    });

    container.querySelector('#pre-scale2')?.addEventListener('click', () => {
      soundFx.playClick();
      a = 2; b = 0; c = 0; d = 2;
      updateInputs();
    });

    container.querySelector('#pre-reflect')?.addEventListener('click', () => {
      soundFx.playClick();
      a = -1; b = 0; c = 0; d = 1;
      updateInputs();
    });

    container.querySelector('#pre-collapse')?.addEventListener('click', () => {
      soundFx.playLaser();
      a = 1; b = 2; c = 0.5; d = 1;
      updateInputs();
    });

    // Shape toggles
    container.querySelectorAll('[data-shape]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        activeShape = btn.getAttribute('data-shape');
        container.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    container.querySelector('#btn-demo-composition')?.addEventListener('click', () => {
      soundFx.playWarp();
      isComposingAnim = true;
      compTime = 0;
    });

    const getPointerCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const handlePointerDown = (e) => {
      const { x, y } = getPointerCoords(e);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = 80;

      const ix = cx + a * scale;
      const iy = cy - c * scale;
      const jx = cx + b * scale;
      const jy = cy - d * scale;

      if (Math.hypot(x - ix, y - iy) < 24) {
        draggingVector = 'i';
        canvas.style.cursor = 'grabbing';
      } else if (Math.hypot(x - jx, y - jy) < 24) {
        draggingVector = 'j';
        canvas.style.cursor = 'grabbing';
      }
    };

    const handlePointerMove = (e) => {
      if (!draggingVector) return;
      const { x, y } = getPointerCoords(e);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = 80;

      const vx = (x - cx) / scale;
      const vy = -(y - cy) / scale;

      if (draggingVector === 'i') {
        a = vx;
        c = vy;
      } else if (draggingVector === 'j') {
        b = vx;
        d = vy;
      }

      updateInputs();
    };

    const handlePointerUp = () => {
      if (draggingVector) {
        draggingVector = null;
        canvas.style.cursor = 'grab';
        gameState.addXp(10, 'Transformação Ajustada');
      }
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    // Touch support for mobile devices
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        handlePointerDown(e.touches[0]);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (draggingVector && e.touches.length === 1) {
        handlePointerMove(e.touches[0]);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', handlePointerUp);

    function loop() {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
      }

      const colors = getThemeColors();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = 80;

      if (isComposingAnim) {
        compTime += 0.016;
        if (compTime < 1.0) {
          const t = compTime;
          const theta = t * (Math.PI / 4);
          a = Math.cos(theta);
          c = Math.sin(theta);
          b = -Math.sin(theta);
          d = Math.cos(theta);
          updateInputs();
        } else if (compTime < 2.0) {
          const t = compTime - 1.0;
          const shearX = t * 1.2;
          const cos45 = Math.cos(Math.PI / 4);
          const sin45 = Math.sin(Math.PI / 4);
          a = cos45 + shearX * sin45;
          c = sin45;
          b = -sin45 + shearX * cos45;
          d = cos45;
          updateInputs();
        } else {
          isComposingAnim = false;
        }
      }

      const tx = (x, y) => {
        const nx = a * x + b * y;
        const ny = c * x + d * y;
        return {
          px: cx + nx * scale,
          py: cy - ny * scale
        };
      };

      const det = a * d - b * c;
      const gridExtent = 6;

      // 1. Draw Subtle Original Grid & Axis Markings
      ctx.strokeStyle = colors.gridMinor;
      ctx.lineWidth = 1;
      for (let i = -gridExtent; i <= gridExtent; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * scale, cy - gridExtent * scale);
        ctx.lineTo(cx + i * scale, cy + gridExtent * scale);
        ctx.moveTo(cx - gridExtent * scale, cy + i * scale);
        ctx.lineTo(cx + gridExtent * scale, cy + i * scale);
        ctx.stroke();

        // Axis Ticks
        if (i !== 0) {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.axisLabel;
          ctx.fillText(`${i}`, cx + i * scale - 4, cy + 14);
          ctx.fillText(`${i}`, cx - 18, cy - i * scale + 3);
        }
      }

      // Draw Main Reference Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - gridExtent * scale, cy);
      ctx.lineTo(cx + gridExtent * scale, cy);
      ctx.moveTo(cx, cy - gridExtent * scale);
      ctx.lineTo(cx, cy + gridExtent * scale);
      ctx.stroke();

      // 2. Draw Transformed Grid Lines
      ctx.strokeStyle = colors.gridMajor;
      ctx.lineWidth = 1;

      for (let x = -gridExtent; x <= gridExtent; x++) {
        const p1 = tx(x, -gridExtent);
        const p2 = tx(x, gridExtent);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      for (let y = -gridExtent; y <= gridExtent; y++) {
        const p1 = tx(-gridExtent, y);
        const p2 = tx(gridExtent, y);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      // 3. Draw Determinant Area Parallelogram (Crisp Architectural Style)
      const p00 = tx(0, 0);
      const p10 = tx(1, 0); // i-hat
      const p11 = tx(1, 1);
      const p01 = tx(0, 1); // j-hat

      ctx.fillStyle = Math.abs(det) < 0.05 
        ? (colors.isLight ? 'rgba(185, 28, 28, 0.2)' : 'rgba(239, 68, 68, 0.25)') 
        : det < 0 
          ? (colors.isLight ? 'rgba(180, 83, 9, 0.2)' : 'rgba(245, 158, 11, 0.22)') 
          : (colors.isLight ? 'rgba(109, 40, 217, 0.16)' : 'rgba(192, 132, 252, 0.22)');

      ctx.strokeStyle = Math.abs(det) < 0.05 ? colors.penAlert : det < 0 ? colors.penAngle : colors.penArea;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p00.px, p00.py);
      ctx.lineTo(p10.px, p10.py);
      ctx.lineTo(p11.px, p11.py);
      ctx.lineTo(p01.px, p01.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Draw Selected Shape Deformed
      if (activeShape === 'ship') {
        drawTransformedShip(ctx, tx, colors);
      } else if (activeShape === 'f') {
        drawTransformedLetterF(ctx, tx, colors);
      } else if (activeShape === 'circle') {
        drawTransformedCircle(ctx, tx, colors);
      }

      // 5. Draw i-hat Vector (Drafting Cyan / Pen X)
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p00.px, p00.py);
      ctx.lineTo(p10.px, p10.py);
      ctx.stroke();

      // Arrowhead i-hat
      drawCleanArrow(ctx, p00.px, p00.py, p10.px, p10.py, colors.penX);

      // Draggable handle i-hat
      ctx.fillStyle = colors.penX;
      ctx.beginPath();
      ctx.arc(p10.px, p10.py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bgSurface;
      ctx.beginPath();
      ctx.arc(p10.px, p10.py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 6. Draw j-hat Vector (Drafting Rose / Pen Y)
      ctx.strokeStyle = colors.penY;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p00.px, p00.py);
      ctx.lineTo(p01.px, p01.py);
      ctx.stroke();

      // Arrowhead j-hat
      drawCleanArrow(ctx, p00.px, p00.py, p01.px, p01.py, colors.penY);

      // Draggable handle j-hat
      ctx.fillStyle = colors.penY;
      ctx.beginPath();
      ctx.arc(p01.px, p01.py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bgSurface;
      ctx.beginPath();
      ctx.arc(p01.px, p01.py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Technical Labels
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.penX;
      ctx.fillText(`î (${a.toFixed(2)}, ${c.toFixed(2)})`, p10.px + 10, p10.py - 4);

      ctx.fillStyle = colors.penY;
      ctx.fillText(`ĵ (${b.toFixed(2)}, ${d.toFixed(2)})`, p01.px + 10, p01.py - 4);

      // Origin dot
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(p00.px, p00.py, 3, 0, Math.PI * 2);
      ctx.fill();

      animFrameId = requestAnimationFrame(loop);
    }

    loop();
  }

  function drawCleanArrow(ctx, fromX, fromY, toX, toY, color) {
    const headlen = 9;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  function drawTransformedShip(ctx, tx, colors) {
    const shipPts = [
      { x: 0, y: 1.5 },
      { x: 0.8, y: -0.9 },
      { x: 0.3, y: -0.5 },
      { x: -0.3, y: -0.5 },
      { x: -0.8, y: -0.9 }
    ];

    const tPts = shipPts.map(p => tx(p.x, p.y));

    ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.18)';
    ctx.strokeStyle = colors.penX;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(tPts[0].px, tPts[0].py);
    for (let i = 1; i < tPts.length; i++) {
      ctx.lineTo(tPts[i].px, tPts[i].py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawTransformedLetterF(ctx, tx, colors) {
    const fPoints = [
      { x: 0, y: 0 },
      { x: 0, y: 2 },
      { x: 1.2, y: 2 },
      { x: 1.2, y: 1.6 },
      { x: 0.4, y: 1.6 },
      { x: 0.4, y: 1.2 },
      { x: 1.0, y: 1.2 },
      { x: 1.0, y: 0.8 },
      { x: 0.4, y: 0.8 },
      { x: 0.4, y: 0 }
    ];

    const tPts = fPoints.map(p => tx(p.x, p.y));

    ctx.fillStyle = colors.isLight ? 'rgba(180, 83, 9, 0.12)' : 'rgba(245, 158, 11, 0.18)';
    ctx.strokeStyle = colors.penAngle;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(tPts[0].px, tPts[0].py);
    for (let i = 1; i < tPts.length; i++) {
      ctx.lineTo(tPts[i].px, tPts[i].py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawTransformedCircle(ctx, tx, colors) {
    const segments = 48;
    ctx.strokeStyle = colors.penPass;
    ctx.lineWidth = 1.8;
    ctx.beginPath();

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      const pt = tx(x, y);

      if (i === 0) ctx.moveTo(pt.px, pt.py);
      else ctx.lineTo(pt.px, pt.py);
    }

    ctx.closePath();
    ctx.fillStyle = colors.isLight ? 'rgba(4, 120, 87, 0.1)' : 'rgba(16, 185, 129, 0.12)';
    ctx.fill();
    ctx.stroke();
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    }
  };
}
