import katex from 'katex';
import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createMatrixExplainer(onOpenSandbox) {
  const container = document.createElement('div');
  container.className = 'explainer-module';

  let currentStep = 0;

  const steps = [
    {
      title: 'O Choque de Realidade: O Que É Uma Matriz?',
      subtitle: 'Uma matriz não é uma lista de números: é um operador geométrico que deforma o espaço!',
      content: `
        <div class="explainer-text-card">
          <p>
            No colégio, quando nos mostram uma matriz pela primeira vez, ela parece apenas uma grade burocrática de números cercada por colchetes:
          </p>
          <div class="formula-box" id="formula-static-matrix"></div>
          <p>
            Depois nos obrigam a memorizar a regra de <em>"linha vezes coluna"</em> sem jamais responder: <strong>Para que serve isso? O que isso faz no espaço físico?</strong>
          </p>
          <div class="highlight-callout cyan">
            <strong>A Revelação de MATHmana:</strong> Uma matriz 2x2 é uma <strong>instrução geométrica contínua</strong>. Ela pega o plano cartesiano inteiro e o estica, gira, distorce ou comprime, preservando duas regras fundamentais:
          </div>
          <ul class="benefit-list">
            <li>A origem $(0, 0)$ permanece estritamente imóvel no centro.</li>
            <li>Todas as linhas da grade continuam retas e paralelas entre si (transformação linear).</li>
          </ul>
        </div>
      `,
      matrix: [[1, 0], [0, 1]],
      interactiveMode: 'identity'
    },
    {
      title: 'O Segredo dos Vetores Base: î e ĵ',
      subtitle: 'Você não precisa calcular infinitos pontos. Basta saber o destino de dois pequenos vetores!',
      content: `
        <div class="explainer-text-card">
          <p>
            Como a transformação é linear, o comportamento de <strong>todo o universo 2D</strong> é determinado exclusivamente por dois vetores unitários de tamanho 1:
          </p>
          <div class="dual-concept-grid">
            <div class="concept-card cyan-border">
              <span class="concept-badge cyan">Vetor Base X</span>
              <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.3rem;">$\\hat{i}$ (i-chapéu)</div>
              <p style="font-size: 0.82rem;">Começa apontando para a direita em $(1, 0)$. Ele governa a largura do espaço.</p>
            </div>
            <div class="concept-card magenta-border">
              <span class="concept-badge magenta">Vetor Base Y</span>
              <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.3rem;">$\\hat{j}$ (j-chapéu)</div>
              <p style="font-size: 0.82rem;">Começa apontando para cima em $(0, 1)$. Ele governa a altura do espaço.</p>
            </div>
          </div>
          <div class="highlight-callout gold">
            <strong>A Chave de Ouro:</strong> As colunas da matriz são EXATAMENTE onde $\\hat{i}$ e $\\hat{j}$ aterrissam no plano transformado!
          </div>
          <div class="formula-box" id="formula-columns-landing"></div>
        </div>
      `,
      matrix: [[2, 1], [0.5, 1.5]],
      interactiveMode: 'basis'
    },
    {
      title: 'O Determinante: O Fator de Escala de Área',
      subtitle: 'O determinante mede matematicamente quanto a área do plano aumentou, inverteu ou colapsou!',
      content: `
        <div class="explainer-text-card">
          <p>
            Considere o quadrado formado pelos vetores base originais $\\hat{i}$ e $\\hat{j}$. Sua área original é exatamente $1 \\times 1 = 1$.
          </p>
          <p>
            Após a matriz distorcer o plano, esse quadrado se transforma em um paralelogramo. <strong>A área desse novo paralelogramo é exatamente o DETERMINANTE!</strong>
          </p>
          <div class="formula-box" id="formula-determinant-geom"></div>
          <div class="det-status normal" style="margin-bottom: 0.75rem;">
            <span><strong>det > 0:</strong> O espaço manteve sua orientação e a área foi multiplicada pelo valor do determinante.</span>
          </div>
          <div class="det-status collapsed" style="margin-bottom: 0.75rem;">
            <span><strong>det = 0 (Colapso):</strong> O plano 2D foi esmagado numa linha 1D ou num ponto! Toda a informação dimensional foi perdida (a matriz não tem inversa!).</span>
          </div>
          <div class="det-status flipped">
            <span><strong>det < 0 (Inversão):</strong> O espaço foi virado do avesso, como se você olhasse através de um espelho!</span>
          </div>
        </div>
      `,
      matrix: [[1.5, 1], [0.5, 2]],
      interactiveMode: 'det'
    }
  ];

  function render() {
    const step = steps[currentStep];

    container.innerHTML = `
      <div class="lesson-layout">
        <div class="section-header">
          <div class="step-indicator-bar">
            ${steps.map((s, idx) => `
              <button class="step-pill ${idx === currentStep ? 'active' : ''}" data-step="${idx}">
                ETAPA 0${idx + 1}: ${s.title.substring(0, 22).toUpperCase()}
              </button>
            `).join('')}
          </div>
          <button class="btn-primary" id="btn-jump-matrix-sandbox" style="font-size: 0.8rem; padding: 0.5rem 1rem;" aria-label="Abrir Laboratório de Matrizes 2D">
            ABRIR BANCADA MATRIZES 2D →
          </button>
        </div>

        <div class="lesson-body-grid">
          <div class="lesson-text-col">
            <h2 class="lesson-title">${step.title}</h2>
            <p class="lesson-subtitle">${step.subtitle}</p>
            ${step.content}

            <div class="lesson-nav-buttons">
              <button class="btn-secondary" id="btn-prev-step-mat" ${currentStep === 0 ? 'disabled style="opacity: 0.4;"' : ''}>
                ← ETAPA ANTERIOR
              </button>
              <button class="btn-primary" id="btn-next-step-mat">
                ${currentStep === steps.length - 1 ? 'EXPLORAR NA BANCADA 2D →' : 'PRÓXIMA ETAPA →'}
              </button>
            </div>
          </div>

          <div class="lesson-visual-col">
            <div class="interactive-preview-canvas-card">
              <div class="canvas-preview-header">
                <span class="section-meta-tag" style="margin: 0;">GRADE LINEAR DEFORMADA</span>
                <span id="matrix-telemetry-badge" style="font-family: var(--font-tech); font-size: 0.78rem; color: var(--pen-area); font-weight: 700;">
                  det(M) = 1.00
                </span>
              </div>

              <div class="canvas-wrapper">
                <canvas id="matrix-mini-canvas" width="460" height="340" style="cursor: crosshair;" aria-label="Animação explicativa de deformação de matriz"></canvas>
              </div>

              <div class="mini-canvas-controls" style="margin-top: 1rem;">
                <div style="font-size: 0.72rem; color: var(--bp-ink-muted); font-family: var(--font-tech); margin-bottom: 0.4rem; text-transform: uppercase;">
                  Predefinições de Operação Linear:
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.35rem;">
                  <button class="preset-btn active" id="btn-step-preset-1">IDENTIDADE I</button>
                  <button class="preset-btn" id="btn-step-preset-2">CISALHAMENTO X</button>
                  <button class="preset-btn" id="btn-step-preset-3">ROTAÇÃO 45°</button>
                  <button class="preset-btn" id="btn-step-preset-4" style="color: var(--pen-alert);">COLAPSO (det=0)</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render KaTeX Formulas
    try {
      if (currentStep === 0) {
        const el = container.querySelector('#formula-static-matrix');
        if (el) katex.render('M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', el, { displayMode: true });
      } else if (currentStep === 1) {
        const el = container.querySelector('#formula-columns-landing');
        if (el) katex.render('M = \\begin{pmatrix} \\hat{i}_x & \\hat{j}_x \\\\ \\hat{i}_y & \\hat{j}_y \\end{pmatrix}', el, { displayMode: true });
      } else if (currentStep === 2) {
        const el = container.querySelector('#formula-determinant-geom');
        if (el) katex.render('\\det(M) = ad - bc = \\text{Área do Paralelogramo}', el, { displayMode: true });
      }
    } catch (e) {}

    // Event handlers
    container.querySelectorAll('.step-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        currentStep = parseInt(btn.getAttribute('data-step'), 10);
        render();
      });
    });

    container.querySelector('#btn-prev-step-mat')?.addEventListener('click', () => {
      if (currentStep > 0) {
        soundFx.playClick();
        currentStep--;
        render();
      }
    });

    container.querySelector('#btn-next-step-mat')?.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        soundFx.playClick();
        currentStep++;
        render();
      } else {
        soundFx.playClick();
        onOpenSandbox('matrix-2d-sandbox');
      }
    });

    container.querySelector('#btn-jump-matrix-sandbox')?.addEventListener('click', () => {
      soundFx.playClick();
      onOpenSandbox('matrix-2d-sandbox');
    });

    setupMatrixMiniDemo();
  }

  let miniAnimId = null;
  let currentM = [1, 0, 0, 1]; // [a, c, b, d]
  let targetM = [1, 0, 0, 1];

  function setupMatrixMiniDemo() {
    if (miniAnimId) cancelAnimationFrame(miniAnimId);

    const canvas = container.querySelector('#matrix-mini-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const badge = container.querySelector('#matrix-telemetry-badge');

    const btn1 = container.querySelector('#btn-step-preset-1');
    const btn2 = container.querySelector('#btn-step-preset-2');
    const btn3 = container.querySelector('#btn-step-preset-3');
    const btn4 = container.querySelector('#btn-step-preset-4');

    const setPreset = (a, c, b, d, activeBtn) => {
      soundFx.playWarp();
      targetM = [a, c, b, d];
      container.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
      activeBtn?.classList.add('active');
    };

    btn1?.addEventListener('click', () => setPreset(1, 0, 0, 1, btn1));
    btn2?.addEventListener('click', () => setPreset(1, 0, 1.2, 1, btn2));
    btn3?.addEventListener('click', () => {
      const cos45 = Math.cos(Math.PI / 4);
      const sin45 = Math.sin(Math.PI / 4);
      setPreset(cos45, sin45, -sin45, cos45, btn3);
    });
    btn4?.addEventListener('click', () => setPreset(1, 1, 1, 1, btn4));

    function draw() {
      const colors = getThemeColors();

      // Smooth interpolation
      for (let i = 0; i < 4; i++) {
        currentM[i] += (targetM[i] - currentM[i]) * 0.1;
      }

      const [a, c, b, d] = currentM;
      const det = a * d - b * c;

      if (badge) {
        badge.textContent = `det(M) = ${det.toFixed(2)} ${Math.abs(det) < 0.05 ? '(COLAPSO!)' : det < 0 ? '(INVERSÃO)' : ''}`;
        badge.style.color = Math.abs(det) < 0.05 ? colors.penAlert : det < 0 ? colors.penAngle : colors.penArea;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = 50;

      const transform = (x, y) => {
        const tx = a * x + b * y;
        const ty = c * x + d * y;
        return {
          px: cx + tx * scale,
          py: cy - ty * scale
        };
      };

      // Draw transformed grid
      ctx.strokeStyle = colors.gridMajor;
      ctx.lineWidth = 1;
      const gridRange = 4;

      for (let x = -gridRange; x <= gridRange; x++) {
        ctx.beginPath();
        const p1 = transform(x, -gridRange);
        const p2 = transform(x, gridRange);
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      for (let y = -gridRange; y <= gridRange; y++) {
        ctx.beginPath();
        const p1 = transform(-gridRange, y);
        const p2 = transform(gridRange, y);
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      // Draw original square outline (dashed)
      ctx.strokeStyle = colors.gridMinor;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(cx, cy - scale, scale, scale);
      ctx.setLineDash([]);

      // Draw Transformed Unit Parallelogram (Determinant Area)
      const p00 = transform(0, 0);
      const p10 = transform(1, 0); // i-hat
      const p11 = transform(1, 1);
      const p01 = transform(0, 1); // j-hat

      ctx.fillStyle = det < 0 
        ? (colors.isLight ? 'rgba(180, 83, 9, 0.2)' : 'rgba(245, 158, 11, 0.22)') 
        : (colors.isLight ? 'rgba(109, 40, 217, 0.16)' : 'rgba(192, 132, 252, 0.25)');
      ctx.strokeStyle = det < 0 ? colors.penAngle : colors.penArea;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p00.px, p00.py);
      ctx.lineTo(p10.px, p10.py);
      ctx.lineTo(p11.px, p11.py);
      ctx.lineTo(p01.px, p01.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw i-hat vector (Pen X)
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p00.px, p00.py);
      ctx.lineTo(p10.px, p10.py);
      ctx.stroke();
      drawArrowHead(ctx, p00.px, p00.py, p10.px, p10.py, colors.penX);

      // Draw j-hat vector (Pen Y)
      ctx.strokeStyle = colors.penY;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p00.px, p00.py);
      ctx.lineTo(p01.px, p01.py);
      ctx.stroke();
      drawArrowHead(ctx, p00.px, p00.py, p01.px, p01.py, colors.penY);

      // Vector labels
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.penX;
      ctx.fillText(`î (${a.toFixed(1)}, ${c.toFixed(1)})`, p10.px + 6, p10.py - 6);

      ctx.fillStyle = colors.penY;
      ctx.fillText(`ĵ (${b.toFixed(1)}, ${d.toFixed(1)})`, p01.px + 6, p01.py - 6);

      miniAnimId = requestAnimationFrame(draw);
    }

    draw();
  }

  function drawArrowHead(ctx, fromX, fromY, toX, toY, color) {
    const headlen = 8;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (miniAnimId) cancelAnimationFrame(miniAnimId);
    }
  };
}
