import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createTrigSandbox() {
  const container = document.createElement('div');
  container.className = 'sandbox-page';

  let angleDeg = 45;
  let isPlaying = true;
  let animSpeed = 1.0;
  let amplitude = 1.0;
  let frequency = 1.0;

  let showSine = true;
  let showCosine = true;
  let showLaser = true;

  let simMode = 'pure'; // 'pure' | 'pendulum' | 'boat' | 'audio'
  let isAudioPlaying = false;
  let isDraggingCircle = false;
  let animFrameId = null;

  const waveSineHistory = [];
  const waveCosHistory = [];

  function render() {
    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <div class="section-icon-badge">01</div>
          <div>
            <div class="section-meta-tag">PRANCHA TÉCNICA 01 // BNCC EM13MAT301</div>
            <h2 class="section-title">Laboratório de Trigonometria, Ondas & Movimento Harmônico</h2>
            <p class="section-subtitle">O círculo unitário como gerador polar contínuo de ondas sonoras, oscilações de pêndulos MHS e sinais periódicos</p>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <div class="canvas-badge-group">
            <span style="color: var(--pen-x);">● Cos (X): <span id="telemetry-cos">0.71</span></span>
            <span style="color: var(--pen-y); margin-left: 0.5rem;">● Sin (Y): <span id="telemetry-sin">0.71</span></span>
            <span style="color: var(--pen-angle); margin-left: 0.5rem;">● Tan: <span id="telemetry-tan">1.00</span></span>
          </div>

          <button class="btn-primary" id="btn-play-pause" style="padding: 0.45rem 0.95rem; font-size: 0.8rem;" aria-label="Pausar ou Iniciar Animação">
            ${isPlaying ? '⏸ PAUSAR' : '▶ ANIMAR'}
          </button>
        </div>
      </div>

      <div class="sandbox-container">
        <div class="sandbox-canvas-panel" style="min-height: 540px;">
          <div class="sandbox-toolbar">
            <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
              <button class="preset-btn ${simMode === 'pure' ? 'active' : ''}" id="btn-mode-pure">[1] ONDA PURA</button>
              <button class="preset-btn ${simMode === 'pendulum' ? 'active' : ''}" id="btn-mode-pendulum">[2] PÊNDULO MHS</button>
              <button class="preset-btn ${simMode === 'boat' ? 'active' : ''}" id="btn-mode-boat">[3] BARCO NO MAR</button>
              <button class="preset-btn ${simMode === 'audio' ? 'active' : ''}" id="btn-mode-audio">[4] ÁUDIO REAL</button>
            </div>
            <span id="canvas-angle-badge" style="font-family: var(--font-tech); font-weight: 700; color: var(--bp-ink); background: var(--bp-bg); padding: 0.3rem 0.65rem; border: 1px solid var(--bp-border); font-size: 0.78rem;">
              θ = 45.0° (0.79 rad)
            </span>
          </div>

          <canvas id="trig-main-canvas" width="860" height="540" style="width: 100%; height: 100%; cursor: crosshair;" aria-label="Gráfico do círculo trigonométrico e desdobramento de ondas"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <!-- PENDULUM DIDACTIC PANEL (Visible when Pendulum mode is active) -->
          <div class="control-card" id="pendulum-didactic-card" style="display: ${simMode === 'pendulum' ? 'block' : 'none'}; border-color: var(--pen-pass);">
            <h3 class="control-title" style="color: var(--pen-pass);">
              <span>A Didática do Pêndulo</span>
              <span style="font-size: 0.7rem; color: var(--bp-ink); background: var(--bp-bg); padding: 0.15rem 0.4rem; border: 1px solid var(--bp-border);">MHS</span>
            </h3>
            <p style="font-size: 0.8rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 0.75rem;">
              O pêndulo oscila rigorosamente travado à <strong>sombra horizontal do círculo</strong> ($x = A \\cos\\theta$):
            </p>
            <div style="font-family: var(--font-tech); font-size: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; background: var(--bp-bg); padding: 0.65rem; border: 1px solid var(--bp-border); margin-bottom: 0.75rem;">
              <div><strong style="color: var(--pen-x);">Posição x(t):</strong> Projeção de $\\cos(\\omega t)$</div>
              <div><strong style="color: var(--pen-pass);">Velocidade v(t):</strong> Projeção de $-\\sin(\\omega t)$ (Máxima no centro!)</div>
              <div><strong style="color: var(--pen-alert);">Aceleração a(t):</strong> Projeção de $-\\cos(\\omega t)$ (Máxima nos extremos!)</div>
            </div>

            <!-- Energy Conservation Bars (sin^2 + cos^2 = 1) -->
            <div style="border-top: 1px solid var(--bp-border); padding-top: 0.65rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                <span style="color: var(--pen-x);">Energia Potencial ($E_p \\propto \\cos^2$)</span>
                <span id="txt-ep" style="font-family: var(--font-tech); font-weight: 700;">50%</span>
              </div>
              <div style="height: 6px; background: var(--bp-bg); border: 1px solid var(--bp-border); overflow: hidden; margin-bottom: 0.6rem;">
                <div id="bar-ep" style="height: 100%; width: 50%; background: var(--pen-x); transition: width 0.05s linear;"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                <span style="color: var(--pen-pass);">Energia Cinética ($E_c \\propto \\sin^2$)</span>
                <span id="txt-ec" style="font-family: var(--font-tech); font-weight: 700;">50%</span>
              </div>
              <div style="height: 6px; background: var(--bp-bg); border: 1px solid var(--bp-border); overflow: hidden; margin-bottom: 0.6rem;">
                <div id="bar-ec" style="height: 100%; width: 50%; background: var(--pen-pass); transition: width 0.05s linear;"></div>
              </div>
              <p style="font-size: 0.72rem; color: var(--bp-ink-muted); font-family: var(--font-tech);">
                ✓ $E_p + E_c = 100\\%$ constante, porque $\\cos^2\\theta + \\sin^2\\theta = 1$!
              </p>
            </div>
          </div>

          <div class="control-card">
            <h3 class="control-title">
              <span>Controle do Ângulo θ</span>
              <span id="val-angle-display" class="control-value">45°</span>
            </h3>
            <div class="control-group">
              <input type="range" id="slider-angle" min="0" max="360" step="0.5" value="45" class="slider-cyan" aria-label="Ajustar ângulo theta">
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.35rem; margin-top: 0.5rem;">
              <button class="preset-btn" data-angle="0">0°</button>
              <button class="preset-btn" data-angle="90">90° (π/2)</button>
              <button class="preset-btn" data-angle="180">180° (π)</button>
              <button class="preset-btn" data-angle="270">270°</button>
            </div>
          </div>

          <div class="control-card">
            <h3 class="control-title">Parâmetros da Oscilação</h3>
            
            <div class="control-group">
              <div class="control-label-row">
                <span>Frequência / Pulsação (ω)</span>
                <span id="val-freq" class="control-value">1.0x</span>
              </div>
              <input type="range" id="slider-freq" min="0.2" max="3.0" step="0.1" value="1.0" class="slider-magenta" aria-label="Frequência">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span>Amplitude (A)</span>
                <span id="val-amp" class="control-value">1.0</span>
              </div>
              <input type="range" id="slider-amp" min="0.2" max="1.8" step="0.1" value="1.0" class="slider-gold" aria-label="Amplitude">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span>Velocidade de Varredura</span>
                <span id="val-speed" class="control-value">1.0x</span>
              </div>
              <input type="range" id="slider-speed" min="0.1" max="2.5" step="0.1" value="1.0" aria-label="Velocidade">
            </div>
          </div>

          <div class="control-card">
            <h3 class="control-title">Camadas Visuais de Traçado</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.78rem; font-family: var(--font-tech);">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="chk-show-cosine" ${showCosine ? 'checked' : ''}>
                <span style="color: var(--pen-x);">■ Traçado do Cosseno (Eixo X)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="chk-show-sine" ${showSine ? 'checked' : ''}>
                <span style="color: var(--pen-y);">■ Traçado do Seno (Eixo Y)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="chk-show-laser" ${showLaser ? 'checked' : ''}>
                <span style="color: var(--bp-ink-secondary);">╌ Guia de Projeção Laser</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;

    setupLogic();
  }

  function setupLogic() {
    const canvas = container.querySelector('#trig-main-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderAngle = container.querySelector('#slider-angle');
    const valAngleDisp = container.querySelector('#val-angle-display');
    const canvasAngleBadge = container.querySelector('#canvas-angle-badge');

    const sliderFreq = container.querySelector('#slider-freq');
    const valFreq = container.querySelector('#val-freq');

    const sliderAmp = container.querySelector('#slider-amp');
    const valAmp = container.querySelector('#val-amp');

    const sliderSpeed = container.querySelector('#slider-speed');
    const valSpeed = container.querySelector('#val-speed');

    const telemCos = container.querySelector('#telemetry-cos');
    const telemSin = container.querySelector('#telemetry-sin');
    const telemTan = container.querySelector('#telemetry-tan');

    const btnPlayPause = container.querySelector('#btn-play-pause');
    const pendulumCard = container.querySelector('#pendulum-didactic-card');

    const barEp = container.querySelector('#bar-ep');
    const barEc = container.querySelector('#bar-ec');
    const txtEp = container.querySelector('#txt-ep');
    const txtEc = container.querySelector('#txt-ec');

    const updateTelemetry = () => {
      const rad = (angleDeg * Math.PI) / 180;
      const cosVal = Math.cos(rad);
      const sinVal = Math.sin(rad);
      const tanVal = Math.abs(cosVal) > 0.001 ? Math.tan(rad) : (sinVal > 0 ? 999 : -999);

      if (telemCos) telemCos.textContent = cosVal.toFixed(2);
      if (telemSin) telemSin.textContent = sinVal.toFixed(2);
      if (telemTan) telemTan.textContent = Math.abs(tanVal) > 50 ? '∞' : tanVal.toFixed(2);

      if (valAngleDisp) valAngleDisp.textContent = `${Math.round(angleDeg)}°`;
      if (canvasAngleBadge) canvasAngleBadge.textContent = `θ = ${angleDeg.toFixed(1)}° (${rad.toFixed(2)} rad)`;

      // Energy Conservation
      const epPercent = Math.round(cosVal * cosVal * 100);
      const ecPercent = Math.round(sinVal * sinVal * 100);
      if (barEp) barEp.style.width = `${epPercent}%`;
      if (barEc) barEc.style.width = `${ecPercent}%`;
      if (txtEp) txtEp.textContent = `${epPercent}%`;
      if (txtEc) txtEc.textContent = `${ecPercent}%`;

      if (isAudioPlaying) {
        const baseFreq = 220;
        const currentTone = baseFreq + (sinVal + 1) * 110;
        soundFx.playContinuousTone(currentTone, 'sine');
      }
    };

    sliderAngle?.addEventListener('input', (e) => {
      angleDeg = parseFloat(e.target.value);
      updateTelemetry();
    });

    sliderFreq?.addEventListener('input', (e) => {
      frequency = parseFloat(e.target.value);
      if (valFreq) valFreq.textContent = `${frequency.toFixed(1)}x`;
    });

    sliderAmp?.addEventListener('input', (e) => {
      amplitude = parseFloat(e.target.value);
      if (valAmp) valAmp.textContent = amplitude.toFixed(1);
    });

    sliderSpeed?.addEventListener('input', (e) => {
      animSpeed = parseFloat(e.target.value);
      if (valSpeed) valSpeed.textContent = `${animSpeed.toFixed(1)}x`;
    });

    btnPlayPause?.addEventListener('click', () => {
      soundFx.playClick();
      isPlaying = !isPlaying;
      btnPlayPause.textContent = isPlaying ? '⏸ PAUSAR' : '▶ ANIMAR';
    });

    // Angle presets
    container.querySelectorAll('[data-angle]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        angleDeg = parseFloat(btn.getAttribute('data-angle'));
        if (sliderAngle) sliderAngle.value = angleDeg;
        updateTelemetry();
      });
    });

    // Mode toggles
    const setMode = (mode) => {
      soundFx.playClick();
      simMode = mode;

      if (mode !== 'audio' && isAudioPlaying) {
        soundFx.stopContinuousTone();
        isAudioPlaying = false;
      } else if (mode === 'audio' && !isAudioPlaying) {
        isAudioPlaying = true;
      }

      ['pure', 'pendulum', 'boat', 'audio'].forEach(m => {
        const btn = container.querySelector(`#btn-mode-${m}`);
        if (btn) {
          if (m === mode) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      });

      if (pendulumCard) {
        pendulumCard.style.display = mode === 'pendulum' ? 'block' : 'none';
      }
    };

    container.querySelector('#btn-mode-pure')?.addEventListener('click', () => setMode('pure'));
    container.querySelector('#btn-mode-pendulum')?.addEventListener('click', () => setMode('pendulum'));
    container.querySelector('#btn-mode-boat')?.addEventListener('click', () => setMode('boat'));
    container.querySelector('#btn-mode-audio')?.addEventListener('click', () => setMode('audio'));

    // Checkbox toggles
    container.querySelector('#chk-show-cosine')?.addEventListener('change', (e) => {
      showCosine = e.target.checked;
    });
    container.querySelector('#chk-show-sine')?.addEventListener('change', (e) => {
      showSine = e.target.checked;
    });
    container.querySelector('#chk-show-laser')?.addEventListener('change', (e) => {
      showLaser = e.target.checked;
    });

    // Interactive Dragging on Circle
    const getPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
    };

    const handlePointerDown = (e) => {
      const pt = getPointer(e);
      const circleCX = simMode === 'pendulum' ? canvas.width * 0.28 : canvas.width * 0.22;
      const circleCY = simMode === 'pendulum' ? canvas.height * 0.32 : canvas.height * 0.5;
      const dist = Math.hypot(pt.x - circleCX, pt.y - circleCY);

      if (dist < 140) {
        isDraggingCircle = true;
        handlePointerMove(e);
      }
    };

    const handlePointerMove = (e) => {
      if (!isDraggingCircle) return;
      const pt = getPointer(e);
      const circleCX = simMode === 'pendulum' ? canvas.width * 0.28 : canvas.width * 0.22;
      const circleCY = simMode === 'pendulum' ? canvas.height * 0.32 : canvas.height * 0.5;

      let angle = Math.atan2(-(pt.y - circleCY), pt.x - circleCX);
      if (angle < 0) angle += Math.PI * 2;
      angleDeg = (angle * 180) / Math.PI;
      if (sliderAngle) sliderAngle.value = angleDeg;
      updateTelemetry();
    };

    const handlePointerUp = () => {
      if (isDraggingCircle) {
        isDraggingCircle = false;
        gameState.addXp(10, 'Ângulo Ajustado');
      }
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    // Touch
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        handlePointerDown(e.touches[0]);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingCircle && e.touches.length === 1) {
        handlePointerMove(e.touches[0]);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', handlePointerUp);

    // 60FPS Animation Loop
    function loop() {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
      }

      if (isPlaying && !isDraggingCircle) {
        angleDeg = (angleDeg + animSpeed * frequency * 0.8) % 360;
        if (sliderAngle) sliderAngle.value = angleDeg;
        updateTelemetry();
      }

      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rad = (angleDeg * Math.PI) / 180;
      const cosVal = Math.cos(rad);
      const sinVal = Math.sin(rad);

      if (simMode === 'pendulum') {
        drawPendulumDidacticScene(ctx, canvas, rad, cosVal, sinVal, colors);
      } else {
        drawStandardWaveScene(ctx, canvas, rad, cosVal, sinVal, colors);
      }

      animFrameId = requestAnimationFrame(loop);
    }

    function drawPendulumDidacticScene(ctx, canvas, rad, cosVal, sinVal, colors) {
      const circleCX = canvas.width * 0.28;
      const circleCY = canvas.height * 0.32;
      const R = 85 * amplitude;

      const px = circleCX + cosVal * R;
      const py = circleCY - sinVal * R;

      // 1. Circle Axis & Perimeter
      ctx.strokeStyle = colors.gridMinor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(circleCX - R - 30, circleCY);
      ctx.lineTo(circleCX + R + 30, circleCY);
      ctx.moveTo(circleCX, circleCY - R - 30);
      ctx.lineTo(circleCX, circleCY + R + 30);
      ctx.stroke();

      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(circleCX, circleCY, R, 0, Math.PI * 2);
      ctx.stroke();

      // Right Triangle on circle
      ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.1)';
      ctx.beginPath();
      ctx.moveTo(circleCX, circleCY);
      ctx.lineTo(px, circleCY);
      ctx.lineTo(px, py);
      ctx.closePath();
      ctx.fill();

      // Cosine Line (Horizontal projection, Pen X)
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(circleCX, circleCY);
      ctx.lineTo(px, circleCY);
      ctx.stroke();

      // Radius vector
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(circleCX, circleCY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Circle pointer dot
      ctx.fillStyle = colors.penX;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bgSurface;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Pendulum
      const pivotX = canvas.width * 0.72;
      const pivotY = 70;
      const rodLength = 220;

      const bobX = pivotX + cosVal * (R * 1.5);
      const dx = bobX - pivotX;
      const bobY = pivotY + Math.sqrt(Math.max(10, rodLength * rodLength - dx * dx));

      // 3. Connect Circle shadow to Pendulum with Technical Laser Beam
      if (showLaser) {
        ctx.strokeStyle = colors.penX;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, circleCY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(px, circleCY);
        ctx.lineTo(bobX, circleCY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Pendulum Mount & Ceiling
      ctx.fillStyle = colors.border;
      ctx.fillRect(pivotX - 60, pivotY - 10, 120, 10);

      // Equilibrium vertical center line
      ctx.strokeStyle = colors.gridMajor;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + rodLength + 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pivot joint
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Pendulum Rod
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // 5. Vectors at the Pendulum Bob:
      // a) Velocity Vector: v = -omega * sin(theta)
      const velMag = -sinVal * 70;
      ctx.strokeStyle = colors.penPass;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bobX, bobY);
      ctx.lineTo(bobX + velMag, bobY);
      ctx.stroke();

      if (Math.abs(velMag) > 5) {
        ctx.fillStyle = colors.penPass;
        ctx.beginPath();
        const dir = Math.sign(velMag);
        ctx.moveTo(bobX + velMag, bobY);
        ctx.lineTo(bobX + velMag - dir * 8, bobY - 4);
        ctx.lineTo(bobX + velMag - dir * 8, bobY + 4);
        ctx.closePath();
        ctx.fill();
      }

      // b) Acceleration / Restoring Force: a = -cos(theta)
      const accMag = -cosVal * 55;
      ctx.strokeStyle = colors.penAlert;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bobX, bobY + 12);
      ctx.lineTo(bobX + accMag, bobY + 12);
      ctx.stroke();

      // c) Pendulum Bob
      ctx.fillStyle = colors.penPass;
      ctx.beginPath();
      ctx.arc(bobX, bobY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bgSurface;
      ctx.beginPath();
      ctx.arc(bobX, bobY, 4, 0, Math.PI * 2);
      ctx.fill();

      // 6. Technical Labels and Pedagogical Annotations
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.penX;
      ctx.fillText(`CÍRCULO: cos(θ) = ${cosVal.toFixed(2)}`, circleCX - 70, circleCY + R + 25);

      ctx.fillStyle = colors.penPass;
      ctx.fillText(`VELOCIDADE v ∝ -sin(θ) [${(-sinVal).toFixed(2)}]`, bobX - 60, bobY - 24);

      ctx.fillStyle = colors.penAlert;
      ctx.fillText(`FORÇA RESTAURADORA F ∝ -cos(θ)`, bobX - 60, bobY + 30);

      // Floor displacement guide
      const floorY = pivotY + rodLength + 25;
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, floorY);
      ctx.lineTo(bobX, floorY);
      ctx.stroke();

      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.penX;
      ctx.fillText(`DESLOCAMENTO x(t) = A·cos(θ)`, pivotX + (bobX - pivotX) * 0.5 - 65, floorY + 18);
    }

    function drawStandardWaveScene(ctx, canvas, rad, cosVal, sinVal, colors) {
      const circleCX = canvas.width * 0.22;
      const circleCY = canvas.height * 0.5;
      const baseR = Math.min(canvas.width * 0.16, canvas.height * 0.32);
      const R = baseR * amplitude;

      const px = circleCX + cosVal * R;
      const py = circleCY - sinVal * R;

      // Buffers
      waveSineHistory.unshift(sinVal * amplitude);
      waveCosHistory.unshift(cosVal * amplitude);
      const maxHistory = Math.floor(canvas.width * 0.55);
      if (waveSineHistory.length > maxHistory) waveSineHistory.pop();
      if (waveCosHistory.length > maxHistory) waveCosHistory.pop();

      // Axis
      ctx.strokeStyle = colors.gridMinor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(circleCX - R - 30, circleCY);
      ctx.lineTo(circleCX + R + 30, circleCY);
      ctx.moveTo(circleCX, circleCY - R - 30);
      ctx.lineTo(circleCX, circleCY + R + 30);
      ctx.stroke();

      // Unit Circle
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(circleCX, circleCY, R, 0, Math.PI * 2);
      ctx.stroke();

      // Triangle
      ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.1)';
      ctx.beginPath();
      ctx.moveTo(circleCX, circleCY);
      ctx.lineTo(px, circleCY);
      ctx.lineTo(px, py);
      ctx.closePath();
      ctx.fill();

      // Cosine projection (Pen X)
      if (showCosine) {
        ctx.strokeStyle = colors.penX;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(circleCX, circleCY);
        ctx.lineTo(px, circleCY);
        ctx.stroke();
      }

      // Sine projection (Pen Y)
      if (showSine) {
        ctx.strokeStyle = colors.penY;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(px, circleCY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // Radius
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(circleCX, circleCY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Pointer dot
      ctx.fillStyle = colors.penY;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bgSurface;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Wave Unrolling
      const waveStartX = canvas.width * 0.44;
      const waveWidth = canvas.width - waveStartX - 25;

      ctx.strokeStyle = colors.gridMajor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(waveStartX, circleCY);
      ctx.lineTo(waveStartX + waveWidth, circleCY);
      ctx.stroke();

      // Laser guide line
      if (showLaser && showSine) {
        ctx.strokeStyle = colors.penY;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(waveStartX, py);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Cosine Wave (Dashed)
      if (showCosine) {
        ctx.strokeStyle = colors.penX;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let i = 0; i < waveCosHistory.length; i++) {
          const wx = waveStartX + i;
          const wy = circleCY - waveCosHistory[i] * baseR;
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Sine Wave (Solid)
      if (showSine) {
        ctx.strokeStyle = colors.penY;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < waveSineHistory.length; i++) {
          const wx = waveStartX + i;
          const wy = circleCY - waveSineHistory[i] * baseR;
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      if (simMode === 'boat') {
        const boatX = waveStartX + 140;
        const waveY = circleCY - Math.sin(rad * frequency) * (baseR * amplitude);
        const slope = -Math.cos(rad * frequency) * ((baseR * amplitude) / 75);

        ctx.save();
        ctx.translate(boatX, waveY);
        ctx.rotate(slope * 0.4);

        ctx.fillStyle = colors.penAngle;
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        ctx.lineTo(28, 0);
        ctx.lineTo(20, 14);
        ctx.lineTo(-20, 14);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -32);
        ctx.stroke();

        ctx.fillStyle = colors.isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(18, -12);
        ctx.lineTo(0, -6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    loop();
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (isAudioPlaying) soundFx.stopContinuousTone();
    }
  };
}
