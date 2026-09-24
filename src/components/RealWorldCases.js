import katex from 'katex';
import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createRealWorldCases() {
  const container = document.createElement('div');
  container.className = 'real-world-page';

  let activeCase = 'robotics'; // 'robotics' | 'pipeline' | 'fourier'
  let animId = null;

  // Robotics arm state
  let theta1 = 35; // degrees
  let theta2 = 45; // degrees
  const L1 = 120;
  const L2 = 90;

  // Graphics MVP state
  let fov = 60;
  let camDist = 3.5;
  let objRot = 25;

  // Fourier state
  let h1 = 1.0, h2 = 0.5, h3 = 0.25;
  let isFourierAudio = false;

  function render() {
    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <div class="section-icon-badge">06</div>
          <div>
            <div class="section-meta-tag">APLICAÇÕES DA ENGENHARIA MODERNA // BNCC EM13MAT501</div>
            <h2 class="section-title">Casos de Uso Reais: Onde a Matemática Move o Mundo</h2>
            <p class="section-subtitle">Robótica industrial, motores de computação gráfica e engenharia de áudio construídos com matrizes e trigonometria</p>
          </div>
        </div>
      </div>

      <div class="subtabs" id="case-tabs" role="tablist">
        <button class="subtab-btn ${activeCase === 'robotics' ? 'active' : ''}" data-case="robotics" role="tab">
          [01] ROBÓTICA & CINEMÁTICA
        </button>
        <button class="subtab-btn ${activeCase === 'pipeline' ? 'active' : ''}" data-case="pipeline" role="tab">
          [02] COMPUTAÇÃO GRÁFICA & MVP
        </button>
        <button class="subtab-btn ${activeCase === 'fourier' ? 'active' : ''}" data-case="fourier" role="tab">
          [03] ENGENHARIA DE ÁUDIO & FOURIER
        </button>
      </div>

      <div id="case-content-mount"></div>
    `;

    container.querySelectorAll('#case-tabs .subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        activeCase = btn.getAttribute('data-case');
        container.querySelectorAll('#case-tabs .subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mountCase();
      });
    });

    mountCase();
  }

  function mountCase() {
    if (animId) cancelAnimationFrame(animId);
    if (isFourierAudio) {
      soundFx.stopContinuousTone();
      isFourierAudio = false;
    }

    const mount = container.querySelector('#case-content-mount');
    if (!mount) return;

    if (activeCase === 'robotics') {
      renderRoboticsCase(mount);
    } else if (activeCase === 'pipeline') {
      renderGraphicsPipelineCase(mount);
    } else if (activeCase === 'fourier') {
      renderFourierCase(mount);
    }
  }

  // ============================================================
  // CASE 1: ROBÓTICA E CINEMÁTICA DIRETA / INVERSA
  // ============================================================
  function renderRoboticsCase(mount) {
    mount.innerHTML = `
      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <span class="section-meta-tag" style="margin: 0;">BRAÇO ARTICULADO 2-DOF</span>
            <span id="robot-telemetry" style="font-family: var(--font-tech); font-size: 0.78rem; color: var(--pen-x); background: var(--bp-bg); padding: 0.3rem 0.65rem; border: 1px solid var(--bp-border);">
              GARRA: (X=150.0cm, Y=120.0cm)
            </span>
          </div>
          <canvas id="robot-canvas" width="840" height="480" style="width: 100%; height: 100%; cursor: crosshair;" aria-label="Simulador de braço robótico 2-DOF"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">Cinemática Direta de Braços Robóticos</h3>
            <p style="font-size: 0.85rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 1rem;">
              Em linhas de montagem industrial (indústria automobilística e aeroespacial), a posição $(X, Y)$ da ferramenta de solda é obtida pela composição trigonométrica de cada junta articulada:
            </p>

            <div id="katex-robot-formula" style="margin-bottom: 1rem; overflow-x: auto;"></div>

            <div class="control-group">
              <div class="control-label-row">
                <span style="color: var(--pen-x);">Ângulo da Base (θ₁)</span>
                <span id="txt-th1" class="control-value">${theta1}°</span>
              </div>
              <input type="range" id="sl-th1" min="-90" max="120" value="${theta1}" class="slider-cyan" aria-label="Ângulo da Base">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span style="color: var(--pen-y);">Ângulo do Cotovelo (θ₂)</span>
                <span id="txt-th2" class="control-value">${theta2}°</span>
              </div>
              <input type="range" id="sl-th2" min="-140" max="140" value="${theta2}" class="slider-magenta" aria-label="Ângulo do Cotovelo">
            </div>

            <div class="telemetry-row" style="margin-top: 1rem;">
              <span style="color: var(--bp-ink-secondary);">Dimensões dos Elos:</span>
              <span class="telemetry-val">L₁ = ${L1}cm, L₂ = ${L2}cm</span>
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const elF = mount.querySelector('#katex-robot-formula');
      if (elF) {
        katex.render('\\begin{cases} X = L_1 \\cos\\theta_1 + L_2 \\cos(\\theta_1 + \\theta_2) \\\\ Y = L_1 \\sin\\theta_1 + L_2 \\sin(\\theta_1 + \\theta_2) \\end{cases}', elF, { displayMode: true });
      }
    } catch (e) {}

    const canvas = mount.querySelector('#robot-canvas');
    const ctx = canvas.getContext('2d');
    const slTh1 = mount.querySelector('#sl-th1');
    const slTh2 = mount.querySelector('#sl-th2');
    const txtTh1 = mount.querySelector('#txt-th1');
    const txtTh2 = mount.querySelector('#txt-th2');
    const telemetry = mount.querySelector('#robot-telemetry');

    slTh1.addEventListener('input', (e) => {
      theta1 = parseFloat(e.target.value);
      txtTh1.textContent = `${Math.round(theta1)}°`;
    });

    slTh2.addEventListener('input', (e) => {
      theta2 = parseFloat(e.target.value);
      txtTh2.textContent = `${Math.round(theta2)}°`;
    });

    function loop() {
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseX = canvas.width * 0.35;
      const baseY = canvas.height * 0.75;

      const rad1 = (theta1 * Math.PI) / 180;
      const rad2 = ((theta1 + theta2) * Math.PI) / 180;

      // Joint 1 pos
      const j1x = baseX + Math.cos(rad1) * L1;
      const j1y = baseY - Math.sin(rad1) * L1;

      // End-effector (gripper) pos
      const gx = j1x + Math.cos(rad2) * L2;
      const gy = j1y - Math.sin(rad2) * L2;

      // Base Pedestal
      ctx.fillStyle = colors.border;
      ctx.fillRect(baseX - 45, baseY, 90, 16);

      // Link 1 (Pen X)
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(j1x, j1y);
      ctx.stroke();

      // Joint 1 Hub
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(baseX, baseY, 9, 0, Math.PI * 2);
      ctx.fill();

      // Joint 2 Hub
      ctx.fillStyle = colors.penX;
      ctx.beginPath();
      ctx.arc(j1x, j1y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Link 2 (Pen Y)
      ctx.strokeStyle = colors.penY;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(j1x, j1y);
      ctx.lineTo(gx, gy);
      ctx.stroke();

      // Gripper Claw
      ctx.fillStyle = colors.penAngle;
      ctx.beginPath();
      ctx.arc(gx, gy, 8, 0, Math.PI * 2);
      ctx.fill();

      // Telemetry
      const relativeX = (gx - baseX).toFixed(1);
      const relativeY = (baseY - gy).toFixed(1);
      if (telemetry) {
        telemetry.textContent = `GARRA: X = ${relativeX}cm, Y = ${relativeY}cm`;
      }

      animId = requestAnimationFrame(loop);
    }
    loop();
  }

  // ============================================================
  // CASE 2: GRAPHICS MVP PIPELINE
  // ============================================================
  function renderGraphicsPipelineCase(mount) {
    mount.innerHTML = `
      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <span class="section-meta-tag" style="margin: 0;">GPU SHADERS & 3D GRAPHICS</span>
            <span style="font-family: var(--font-tech); font-size: 0.78rem; color: var(--pen-area); background: var(--bp-bg); padding: 0.3rem 0.65rem; border: 1px solid var(--bp-border); font-weight: 700;">
              MATRIZ MVP 4x4
            </span>
          </div>
          <canvas id="pipeline-canvas" width="840" height="480" style="width: 100%; height: 100%;" aria-label="Projeção 3D perspectiva"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">O Pipeline de Projeção em Jogos 3D</h3>
            <p style="font-size: 0.85rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 1rem;">
              Em videogames e simulações, a placa de vídeo multiplica cada vértice por três matrizes 4x4:
            </p>

            <div id="katex-mvp-formula" style="margin-bottom: 1rem; overflow-x: auto;"></div>

            <div class="control-group">
              <div class="control-label-row">
                <span>Distância da Câmera (View)</span>
                <span id="txt-cam" class="control-value">${camDist.toFixed(1)}m</span>
              </div>
              <input type="range" id="sl-cam" min="2.0" max="6.0" step="0.1" value="${camDist}" class="slider-cyan" aria-label="Distância da Câmera">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span>Campo de Visão FOV (Projection)</span>
                <span id="txt-fov" class="control-value">${fov}°</span>
              </div>
              <input type="range" id="sl-fov" min="30" max="100" value="${fov}" class="slider-gold" aria-label="Campo de Visão FOV">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span>Rotação do Objeto (Model Matrix)</span>
                <span id="txt-rot" class="control-value">${objRot}°</span>
              </div>
              <input type="range" id="sl-rot" min="0" max="360" value="${objRot}" class="slider-magenta" aria-label="Rotação do Objeto">
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const elF = mount.querySelector('#katex-mvp-formula');
      if (elF) {
        katex.render('V_{\\text{tela}} = \\mathbf{P}_{\\text{proj}} \\times \\mathbf{V}_{\\text{câmera}} \\times \\mathbf{M}_{\\text{modelo}} \\times V_{\\text{local}}', elF, { displayMode: true });
      }
    } catch (e) {}

    const canvas = mount.querySelector('#pipeline-canvas');
    const ctx = canvas.getContext('2d');
    const slCam = mount.querySelector('#sl-cam');
    const slFov = mount.querySelector('#sl-fov');
    const slRot = mount.querySelector('#sl-rot');
    const txtCam = mount.querySelector('#txt-cam');
    const txtFov = mount.querySelector('#txt-fov');
    const txtRot = mount.querySelector('#txt-rot');

    slCam.addEventListener('input', (e) => {
      camDist = parseFloat(e.target.value);
      txtCam.textContent = `${camDist.toFixed(1)}m`;
    });

    slFov.addEventListener('input', (e) => {
      fov = parseFloat(e.target.value);
      txtFov.textContent = `${fov}°`;
    });

    slRot.addEventListener('input', (e) => {
      objRot = parseFloat(e.target.value);
      txtRot.textContent = `${objRot}°`;
    });

    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
    ];

    const edges = [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [7,4],
      [0,4], [1,5], [2,6], [3,7]
    ];

    function loop() {
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radRot = (objRot * Math.PI) / 180;
      const radFov = (fov * Math.PI) / 180;
      const fovFactor = 1.0 / Math.tan(radFov / 2);

      const cosR = Math.cos(radRot);
      const sinR = Math.sin(radRot);

      const projected = vertices.map(v => {
        const mx = cosR * v[0] + sinR * v[2];
        const my = v[1];
        const mz = -sinR * v[0] + cosR * v[2];

        const vz = mz + camDist;
        const scale = (fovFactor / vz) * 160;
        return {
          x: cx + mx * scale,
          y: cy - my * scale,
          z: vz
        };
      });

      // Draw Edges
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 2;
      edges.forEach(([i1, i2]) => {
        const p1 = projected[i1];
        const p2 = projected[i2];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw Vertices
      projected.forEach(p => {
        ctx.fillStyle = colors.penY;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(loop);
    }
    loop();
  }

  // ============================================================
  // CASE 3: FOURIER AUDIO SYNTHESIS
  // ============================================================
  function renderFourierCase(mount) {
    mount.innerHTML = `
      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <span class="section-meta-tag" style="margin: 0;">SÉRIE DE FOURIER</span>
            <button class="btn-primary" id="btn-toggle-fourier-audio" style="font-size: 0.78rem; padding: 0.35rem 0.85rem;" aria-label="Ouvir Som Harmônico">
              🔊 OU VIR SOM HARMÔNICO
            </button>
          </div>
          <canvas id="fourier-canvas" width="840" height="480" style="width: 100%; height: 100%;" aria-label="Série de Fourier e decomposição harmônica"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">Como Instrumentos e Timbres Funcionam</h3>
            <p style="font-size: 0.85rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 1rem;">
              O Teorema de Fourier provou que <strong>QUALQUER SOM DO MUNDO</strong> (um piano, sua voz ou uma flauta) é nada mais que uma soma ponderada de senos e cossenos em frequências harmônicas:
            </p>

            <div id="katex-fourier-formula" style="margin-bottom: 1rem; overflow-x: auto;"></div>

            <div class="control-group">
              <div class="control-label-row">
                <span style="color: var(--pen-x);">Harmônico 1 (Fundamental - f)</span>
                <span id="txt-h1" class="control-value">${h1.toFixed(2)}</span>
              </div>
              <input type="range" id="sl-h1" min="0" max="1" step="0.05" value="${h1}" class="slider-cyan" aria-label="Harmônico 1">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span style="color: var(--pen-y);">Harmônico 2 (Oitava - 2f)</span>
                <span id="txt-h2" class="control-value">${h2.toFixed(2)}</span>
              </div>
              <input type="range" id="sl-h2" min="0" max="1" step="0.05" value="${h2}" class="slider-magenta" aria-label="Harmônico 2">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span style="color: var(--pen-angle);">Harmônico 3 (Quinta - 3f)</span>
                <span id="txt-h3" class="control-value">${h3.toFixed(2)}</span>
              </div>
              <input type="range" id="sl-h3" min="0" max="1" step="0.05" value="${h3}" class="slider-gold" aria-label="Harmônico 3">
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const elF = mount.querySelector('#katex-fourier-formula');
      if (elF) {
        katex.render('f(t) = A_1 \\sin(\\omega t) + A_2 \\sin(2\\omega t) + A_3 \\sin(3\\omega t)', elF, { displayMode: true });
      }
    } catch (e) {}

    const canvas = mount.querySelector('#fourier-canvas');
    const ctx = canvas.getContext('2d');
    const slH1 = mount.querySelector('#sl-h1');
    const slH2 = mount.querySelector('#sl-h2');
    const slH3 = mount.querySelector('#sl-h3');
    const txtH1 = mount.querySelector('#txt-h1');
    const txtH2 = mount.querySelector('#txt-h2');
    const txtH3 = mount.querySelector('#txt-h3');
    const btnAudio = mount.querySelector('#btn-toggle-fourier-audio');

    slH1.addEventListener('input', (e) => {
      h1 = parseFloat(e.target.value);
      txtH1.textContent = h1.toFixed(2);
    });

    slH2.addEventListener('input', (e) => {
      h2 = parseFloat(e.target.value);
      txtH2.textContent = h2.toFixed(2);
    });

    slH3.addEventListener('input', (e) => {
      h3 = parseFloat(e.target.value);
      txtH3.textContent = h3.toFixed(2);
    });

    btnAudio.addEventListener('click', () => {
      isFourierAudio = !isFourierAudio;
      btnAudio.textContent = isFourierAudio ? '⏸ SILENCIAR ÁUDIO' : '🔊 OUVIR SOM HARMÔNICO';
      if (isFourierAudio) {
        soundFx.startContinuousTone(220);
      } else {
        soundFx.stopContinuousTone();
      }
    });

    let t = 0;
    function loop() {
      t += 0.04;
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cy = canvas.height / 2;
      const baseAmp = 65;

      // Axis
      ctx.strokeStyle = colors.gridMajor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, cy);
      ctx.lineTo(canvas.width - 20, cy);
      ctx.stroke();

      // Combined Fourier Wave
      ctx.strokeStyle = colors.penPass;
      ctx.lineWidth = 3;
      ctx.beginPath();

      for (let x = 20; x < canvas.width - 20; x++) {
        const rad = (x * 0.015) + t;
        const y = cy - (
          Math.sin(rad) * h1 +
          Math.sin(rad * 2) * h2 +
          Math.sin(rad * 3) * h3
        ) * baseAmp;

        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(loop);
    }
    loop();
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (animId) cancelAnimationFrame(animId);
      if (isFourierAudio) {
        soundFx.stopContinuousTone();
      }
    }
  };
}
