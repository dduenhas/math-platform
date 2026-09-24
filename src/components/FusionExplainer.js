import katex from 'katex';
import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createFusionExplainer(onOpenSandbox) {
  const container = document.createElement('div');
  container.className = 'explainer-module';

  let angleDeg = 30;
  let shipPos = { x: 0, y: 0 };
  let shipVel = { x: 0, y: 0 };
  let lasers = [];
  let isThrusting = false;
  let animId = null;

  function render() {
    container.innerHTML = `
      <div class="lesson-layout">
        <div class="section-header">
          <div>
            <div class="section-meta-tag">
              <span>PRANCHA TEÓRICA 03 // BNCC EM13MAT501</span>
              <span>•</span>
              <span>COMPUTAÇÃO GRÁFICA & GAMES</span>
            </div>
            <h2 class="lesson-title">A Grande Fusão: A Matriz de Rotação da Espaçonave</h2>
            <p class="lesson-subtitle">Entenda como Seno e Cosseno formam o motor de rotação, física vetorial e renderização de qualquer jogo 2D/3D</p>
          </div>
          <button class="btn-primary" id="btn-jump-3d-sandbox" style="font-size: 0.8rem; padding: 0.6rem 1.1rem;" aria-label="Abrir Bancada 3D">
            ▶ ABRIR BANCADA 3D
          </button>
        </div>

        <div class="lesson-body-grid">
          <!-- Text Explanation Column -->
          <div class="lesson-text-col">
            <div class="explainer-text-card">
              <h3 style="color: var(--bp-ink); margin-bottom: 0.75rem; font-family: var(--font-display); font-size: 1.15rem;">
                1. O Desenho da Nave no Computador (Espaço Local)
              </h3>
              <p>
                Quando um desenvolvedor de jogos cria uma nave na Unity, Unreal ou Godot, ele a modela inicialmente em repouso na origem cartesiana $(0, 0)$:
              </p>
              
              <ul class="benefit-list" style="margin: 0.75rem 0;">
                <li><strong style="color: var(--pen-x);">A Asa Direita</strong> aponta ao longo do eixo horizontal: $\\hat{i} = (1, 0)$.</li>
                <li><strong style="color: var(--pen-y);">O Bico (Frente)</strong> aponta para onde a nave viaja: $\\hat{j} = (0, 1)$.</li>
              </ul>

              <h3 style="color: var(--bp-ink); margin: 1.25rem 0 0.5rem 0; font-family: var(--font-display); font-size: 1.15rem;">
                2. O Que Acontece Quando a Nave Gira em um Ângulo $\\theta$?
              </h3>
              <p>
                Quando o piloto gira o manche em um ângulo $\\theta$, <strong>os dois eixos da nave giram solidariamente</strong> pelo ciclo trigonométrico:
              </p>

              <div class="dual-concept-grid" style="margin: 0.75rem 0;">
                <div class="concept-card cyan-border">
                  <span class="concept-badge cyan">Coluna 1 da Matriz</span>
                  <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.3rem;">Vetor da Asa Direita</div>
                  <p style="font-size: 0.82rem;">O vetor $(1, 0)$ gira e vai parar em:</p>
                  <div id="katex-wing-vec" style="font-size: 0.95rem; margin-top: 0.4rem;"></div>
                </div>
                <div class="concept-card magenta-border">
                  <span class="concept-badge magenta">Coluna 2 da Matriz</span>
                  <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.3rem;">Vetor do Bico (Frente)</div>
                  <p style="font-size: 0.82rem;">O vetor $(0, 1)$ gira e vai parar em:</p>
                  <div id="katex-nose-vec" style="font-size: 0.95rem; margin-top: 0.4rem;"></div>
                </div>
              </div>

              <div class="highlight-callout gold">
                <strong>A REVELAÇÃO DA ÁLGEBRA LINEAR:</strong><br>
                A primeira coluna da matriz de rotação <strong>É O VETOR DA ASA</strong>!<br>
                A segunda coluna da matriz de rotação <strong>É O VETOR DO BICO</strong>!
              </div>

              <div id="katex-ship-matrix" style="margin: 1rem 0; overflow-x: auto;"></div>

              <h3 style="color: var(--bp-ink); margin: 1.25rem 0 0.5rem 0; font-family: var(--font-display); font-size: 1.15rem;">
                3. Como a Física e os Disparos Funcionam no Jogo?
              </h3>
              <ul class="benefit-list">
                <li>
                  <strong>Propulsão / Aceleração:</strong> Os motores empurram a nave na direção exata da <strong>Coluna 2 (Vetor do Bico)</strong>:
                  <div id="katex-thrust-formula" style="margin: 0.4rem 0; overflow-x: auto;"></div>
                </li>
                <li>
                  <strong>Disparo de Lasers:</strong> Os feixes saem da ponta do bico com velocidade direcionada pela Coluna 2.
                </li>
                <li>
                  <strong>Multiplicação pela GPU:</strong> A placa de vídeo multiplica todos os milhares de vértices da nave por essa mesma matriz $R(\\theta)$ a cada quadro.
                </li>
              </ul>
            </div>
          </div>

          <!-- Interactive Simulator Column -->
          <div class="lesson-visual-col">
            <div class="interactive-preview-canvas-card">
              <div class="canvas-preview-header">
                <span class="section-meta-tag" style="margin: 0;">SIMULADOR VETORIAL</span>
                <span id="ship-telemetry-hud" style="font-family: var(--font-tech); font-size: 0.78rem; color: var(--pen-x);">
                  θ = 30° | Bico: [-0.50, 0.87]
                </span>
              </div>

              <div class="canvas-wrapper">
                <canvas id="ship-sim-canvas" width="480" height="380" style="cursor: crosshair;" aria-label="Simulador jogável da espaçonave orientada por matriz"></canvas>
              </div>

              <div class="mini-canvas-controls" style="margin-top: 1rem;">
                <div class="control-label-row">
                  <span>Girar Ângulo da Nave (θ):</span>
                  <span id="txt-ship-angle" class="control-value">30°</span>
                </div>
                <input type="range" id="sl-ship-angle" min="0" max="360" value="30" class="slider-gold" aria-label="Girar Ângulo da Nave">

                <!-- Interactive Game Controls -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-top: 0.85rem;">
                  <button class="preset-btn" id="btn-ship-thrust" style="color: var(--pen-y);" aria-label="Acelerar Nave">
                    🔥 PROPULSÃO (W)
                  </button>
                  <button class="preset-btn" id="btn-ship-fire" style="color: var(--pen-pass);" aria-label="Disparar Laser">
                    ⚡ LASER (SPACE)
                  </button>
                  <button class="preset-btn" id="btn-ship-reset" aria-label="Centralizar Nave">
                    ↺ CENTRO
                  </button>
                </div>

                <!-- Live Vertex Transformation Table -->
                <div style="margin-top: 0.85rem; background: var(--bp-bg); padding: 0.75rem; border: 1px solid var(--bp-border); font-family: var(--font-tech); font-size: 0.72rem;">
                  <div style="color: var(--bp-ink-muted); margin-bottom: 0.35rem; font-weight: 700; text-transform: uppercase;">
                    Cálculo de Vértices pela GPU (p' = M · p):
                  </div>
                  <div style="color: var(--pen-y);">Bico: (0, 1.5) ➜ (<span id="txt-v-nose">-0.75, 1.30</span>)</div>
                  <div style="color: var(--pen-x);">Asa Dir: (1, -0.8) ➜ (<span id="txt-v-rwing">1.27, -0.19</span>)</div>
                  <div style="color: var(--pen-x);">Asa Esq: (-1, -0.8) ➜ (<span id="txt-v-lwing">-0.47, -1.19</span>)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render KaTeX Formulas
    try {
      const elW = container.querySelector('#katex-wing-vec');
      if (elW) katex.render('\\vec{V}_{\\text{asa}} = \\begin{pmatrix} \\cos\\theta \\\\ \\sin\\theta \\end{pmatrix}', elW);

      const elN = container.querySelector('#katex-nose-vec');
      if (elN) katex.render('\\vec{V}_{\\text{bico}} = \\begin{pmatrix} -\\sin\\theta \\\\ \\cos\\theta \\end{pmatrix}', elN);

      const elM = container.querySelector('#katex-ship-matrix');
      if (elM) katex.render('M_{\\text{nave}} = \\begin{pmatrix} \\vec{V}_{\\text{asa}} & \\vec{V}_{\\text{bico}} \\end{pmatrix} = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}', elM, { displayMode: true });

      const elT = container.querySelector('#katex-thrust-formula');
      if (elT) katex.render('\\vec{v}_{\\text{nova}} = \\vec{v}_{\\text{atual}} + a_{\\text{empuxo}} \\cdot \\begin{pmatrix} -\\sin\\theta \\\\ \\cos\\theta \\end{pmatrix}', elT, { displayMode: true });
    } catch (e) {}

    container.querySelector('#btn-jump-3d-sandbox')?.addEventListener('click', () => {
      soundFx.playClick();
      onOpenSandbox('matrix-3d-sandbox');
    });

    setupShipSimulator();
  }

  function setupShipSimulator() {
    if (animId) cancelAnimationFrame(animId);

    const canvas = container.querySelector('#ship-sim-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const slAngle = container.querySelector('#sl-ship-angle');
    const txtAngle = container.querySelector('#txt-ship-angle');
    const hud = container.querySelector('#ship-telemetry-hud');
    const btnThrust = container.querySelector('#btn-ship-thrust');
    const btnFire = container.querySelector('#btn-ship-fire');
    const btnReset = container.querySelector('#btn-ship-reset');

    const txtNose = container.querySelector('#txt-v-nose');
    const txtRWing = container.querySelector('#txt-v-rwing');
    const txtLWing = container.querySelector('#txt-v-lwing');

    // Controls
    slAngle.addEventListener('input', (e) => {
      angleDeg = parseFloat(e.target.value);
      updateShipAngle();
    });

    const fireLaser = () => {
      soundFx.playLaser();
      const rad = (angleDeg * Math.PI) / 180;
      const nx = -Math.sin(rad);
      const ny = Math.cos(rad);
      lasers.push({
        x: shipPos.x + nx * 35,
        y: shipPos.y + ny * 35,
        vx: nx * 8,
        vy: ny * 8,
        life: 55
      });
      gameState.addXp(5, 'Disparo Laser');
    };

    const applyThrust = () => {
      soundFx.playWarp();
      isThrusting = true;
      const rad = (angleDeg * Math.PI) / 180;
      const nx = -Math.sin(rad);
      const ny = Math.cos(rad);
      shipVel.x += nx * 1.6;
      shipVel.y += ny * 1.6;
      setTimeout(() => isThrusting = false, 200);
    };

    btnThrust.addEventListener('mousedown', applyThrust);
    btnFire.addEventListener('click', fireLaser);

    btnReset.addEventListener('click', () => {
      soundFx.playClick();
      shipPos = { x: 0, y: 0 };
      shipVel = { x: 0, y: 0 };
      angleDeg = 30;
      slAngle.value = 30;
      updateShipAngle();
    });

    // Touch support for mobile controls
    btnThrust.addEventListener('touchstart', (e) => {
      e.preventDefault();
      applyThrust();
    }, { passive: false });

    // Keyboard support
    const handleKeyDown = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        angleDeg = (angleDeg - 6 + 360) % 360;
        slAngle.value = angleDeg;
        updateShipAngle();
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        angleDeg = (angleDeg + 6) % 360;
        slAngle.value = angleDeg;
        updateShipAngle();
      } else if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        applyThrust();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        fireLaser();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    function updateShipAngle() {
      txtAngle.textContent = `${Math.round(angleDeg)}°`;
      const rad = (angleDeg * Math.PI) / 180;
      const cosVal = Math.cos(rad);
      const sinVal = Math.sin(rad);
      const nx = -sinVal;
      const ny = cosVal;

      if (hud) {
        hud.textContent = `θ = ${Math.round(angleDeg)}° | Bico [${nx.toFixed(2)}, ${ny.toFixed(2)}]`;
      }

      // Live matrix vertex calculation
      const noseX = 0 * cosVal + 1.5 * nx;
      const noseY = 0 * sinVal + 1.5 * ny;
      if (txtNose) txtNose.textContent = `${noseX.toFixed(2)}, ${noseY.toFixed(2)}`;

      const rwx = 1.0 * cosVal - 0.8 * nx;
      const rwy = 1.0 * sinVal - 0.8 * ny;
      if (txtRWing) txtRWing.textContent = `${rwx.toFixed(2)}, ${rwy.toFixed(2)}`;

      const lwx = -1.0 * cosVal - 0.8 * nx;
      const lwy = -1.0 * sinVal - 0.8 * ny;
      if (txtLWing) txtLWing.textContent = `${lwx.toFixed(2)}, ${lwy.toFixed(2)}`;
    }

    updateShipAngle();

    // Starfield Background
    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    function loop() {
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Physics integration
      shipPos.x += shipVel.x;
      shipPos.y += shipVel.y;
      shipVel.x *= 0.96;
      shipVel.y *= 0.96;

      // Screen wrapping
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxDistX = canvas.width / 2 - 20;
      const maxDistY = canvas.height / 2 - 20;

      if (shipPos.x > maxDistX) shipPos.x = -maxDistX;
      if (shipPos.x < -maxDistX) shipPos.x = maxDistX;
      if (shipPos.y > maxDistY) shipPos.y = -maxDistY;
      if (shipPos.y < -maxDistY) shipPos.y = maxDistY;

      // Draw Starfield / Dust
      ctx.fillStyle = colors.isLight ? colors.border : colors.ink;
      stars.forEach(s => {
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Grid / Coordinate origin
      ctx.strokeStyle = colors.gridMinor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 10);
      ctx.lineTo(cx, canvas.height - 10);
      ctx.moveTo(10, cy);
      ctx.lineTo(canvas.width - 10, cy);
      ctx.stroke();

      const rad = (angleDeg * Math.PI) / 180;
      const cosVal = Math.cos(rad);
      const sinVal = Math.sin(rad);

      // The Matrix Columns:
      const wx = cosVal;
      const wy = sinVal;
      const nx = -sinVal;
      const ny = cosVal;

      const sx = cx + shipPos.x;
      const sy = cy - shipPos.y;

      // Local model coordinates
      const localVertices = [
        { x: 0, y: 1.5 },     // Nose Tip
        { x: 0.9, y: -0.8 },  // Right Wing Tip
        { x: 0.3, y: -0.5 },  // Right Thruster Indent
        { x: 0, y: -0.7 },    // Engine Exhaust Center
        { x: -0.3, y: -0.5 }, // Left Thruster Indent
        { x: -0.9, y: -0.8 }  // Left Wing Tip
      ];

      // GPU Vertex Transform: p' = M * p
      const scale = 26;
      const screenVertices = localVertices.map(p => {
        const tx = p.x * wx + p.y * nx;
        const ty = p.x * wy + p.y * ny;
        return {
          px: sx + tx * scale,
          py: sy - ty * scale
        };
      });

      // Thruster Flame when accelerating
      if (isThrusting) {
        ctx.fillStyle = colors.penAlert;
        ctx.beginPath();
        const flameLength = 32 + Math.random() * 12;
        const fx = sx - nx * flameLength;
        const fy = sy + ny * flameLength;
        ctx.moveTo(screenVertices[2].px, screenVertices[2].py);
        ctx.lineTo(fx, fy);
        ctx.lineTo(screenVertices[4].px, screenVertices[4].py);
        ctx.closePath();
        ctx.fill();
      }

      // Ship Hull Polygon
      ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenVertices[0].px, screenVertices[0].py);
      for (let i = 1; i < screenVertices.length; i++) {
        ctx.lineTo(screenVertices[i].px, screenVertices[i].py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wing Vector Arrow (Col 1, Pen X)
      const wingVecScreen = { px: sx + wx * 45, py: sy - wy * 45 };
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(wingVecScreen.px, wingVecScreen.py);
      ctx.stroke();

      // Nose Vector Arrow (Col 2, Pen Y)
      const noseVecScreen = { px: sx + nx * 55, py: sy - ny * 55 };
      ctx.strokeStyle = colors.penY;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(noseVecScreen.px, noseVecScreen.py);
      ctx.stroke();

      // Lasers update and render
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.x += l.vx;
        l.y += l.vy;
        l.life--;

        const lx = cx + l.x;
        const ly = cy - l.y;

        ctx.strokeStyle = colors.penPass;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + l.vx * 1.5, ly - l.vy * 1.5);
        ctx.stroke();

        if (l.life <= 0) lasers.splice(i, 1);
      }

      // Center point
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(loop);
    }

    loop();
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (animId) cancelAnimationFrame(animId);
    }
  };
}
