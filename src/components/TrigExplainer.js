import katex from 'katex';
import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createTrigExplainer(onOpenSandbox) {
  const container = document.createElement('div');
  container.className = 'explainer-module';

  let currentStep = 0;

  const steps = [
    {
      title: 'A Ilusão do Triângulo Retângulo',
      subtitle: 'Por que o ensino tradicional gera bloqueio cognitivo e limita nossa visão',
      content: `
        <div class="explainer-text-card">
          <p>
            Na escola tradicional, fomos ensinados que <strong>Seno</strong> e <strong>Cosseno</strong> existem apenas dentro de um triângulo retângulo preso num papel estático:
          </p>
          <div class="formula-box" id="formula-soh-cah"></div>
          <p>
            Isso funciona para calcular a altura de um prédio, <strong>mas falha</strong> quando você tenta entender:
          </p>
          <ul class="benefit-list">
            <li>O que acontece quando o ângulo é maior que 90° ou negativo?</li>
            <li>Por que ondas de rádio, som, luz e corrente alternada (AC) usam seno e cosseno?</li>
            <li>Como a câmera de um jogo 3D gira continuamente 360 graus em qualquer eixo?</li>
          </ul>
          <div class="highlight-callout cyan">
            <strong>A Revelação de MATHmana:</strong> O triângulo retângulo é apenas uma "foto estática". Para entender a verdade, precisamos libertar o triângulo e colocá-lo para <strong>GIRAR num Círculo Unitário</strong>!
          </div>
        </div>
      `,
      interactiveType: 'triangle-vs-circle',
      formulaLatex: '\\sin(\\theta) = \\frac{\\text{Cateto Oposto}}{\\text{Hipotenusa}}, \\quad \\cos(\\theta) = \\frac{\\text{Cateto Adjacente}}{\\text{Hipotenusa}}'
    },
    {
      title: 'O Círculo Unitário: O Farol das Coordenadas',
      subtitle: 'Cosseno é a sombra horizontal (X). Seno é a altura vertical (Y).',
      content: `
        <div class="explainer-text-card">
          <p>
            Imagine um círculo de <strong>raio exato igual a 1</strong> centrado na origem cartesiana $(0, 0)$. 
            Quando um ponteiro gira por um ângulo $\\theta$:
          </p>
          <div class="formula-box" id="formula-circle-coords"></div>
          <div class="dual-concept-grid">
            <div class="concept-card cyan-border">
              <span class="concept-badge cyan">Eixo X (Horizontal)</span>
              <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.3rem;">Cosseno: $\\cos(\\theta)$</div>
              <p style="font-size: 0.82rem;">É a posição horizontal do ponto! Olhando o ponteiro da perspectiva do chão, você vê apenas a sombra projetada oscilando entre $-1$ e $+1$.</p>
            </div>
            <div class="concept-card magenta-border">
              <span class="concept-badge magenta">Eixo Y (Vertical)</span>
              <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.3rem;">Seno: $\\sin(\\theta)$</div>
              <p style="font-size: 0.82rem;">É a altura vertical do ponto! Olhando de lado, você vê o ponto subindo e descendo suavemente entre $-1$ e $+1$.</p>
            </div>
          </div>
          <div class="highlight-callout gold">
            <strong>O Teorema de Pitágoras Ganha Vida:</strong> Como a hipotenusa é sempre o raio $R = 1$, pela equação do círculo $x^2 + y^2 = 1$, temos instantaneamente:
          </div>
          <div class="formula-box" id="formula-pythagoras"></div>
        </div>
      `,
      interactiveType: 'unit-circle-demo',
      formulaLatex: 'P(\\theta) = (\\cos\\theta, \\sin\\theta)',
      secondaryLatex: '\\cos^2(\\theta) + \\sin^2(\\theta) = 1'
    },
    {
      title: 'Desenrolando o Círculo: O Nascimento da Onda',
      subtitle: 'Como o giro circular se desdobra no tempo gerando ondas sonoras e eletromagnéticas',
      content: `
        <div class="explainer-text-card">
          <p>
            O momento culminante do vídeo de MATHmana é quando <strong>o tempo começa a correr para a direita</strong>:
          </p>
          <ul class="benefit-list">
            <li>Conforme o ponto gira em torno do círculo a uma velocidade constante $\\omega$...</li>
            <li>Se projetarmos a altura $Y$ num papel que se move horizontalmente, traçamos a famosa <strong>Onda Senoidal</strong>!</li>
            <li>Se projetarmos a sombra horizontal $X$, obtemos a <strong>Onda Cossenoidal</strong> — adiantada em um quarto de volta ($90^\\circ$ ou $\\pi/2$ radianos)!</li>
          </ul>
          <div class="formula-box" id="formula-wave-func"></div>
          <div class="highlight-callout cyan">
            <strong>A Física Ondulatória:</strong> Tudo no universo que vibra — uma corda de violão, o sinal do Wi-Fi, ondas sonoras ou batimentos cardíacos — é o desdobramento natural de um círculo girando no tempo!
          </div>
        </div>
      `,
      interactiveType: 'wave-unroll-demo',
      formulaLatex: 'y(t) = A \\cdot \\sin(\\omega t + \\phi)'
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
                ETAPA 0${idx + 1}: ${s.title.toUpperCase()}
              </button>
            `).join('')}
          </div>
          <button class="btn-primary" id="btn-jump-sandbox" style="font-size: 0.8rem; padding: 0.5rem 1rem;" aria-label="Abrir Laboratório de Círculo e Ondas">
            ABRIR BANCADA DE ONDAS →
          </button>
        </div>

        <div class="lesson-body-grid">
          <!-- Text Explanation Column -->
          <div class="lesson-text-col">
            <h2 class="lesson-title">${step.title}</h2>
            <p class="lesson-subtitle">${step.subtitle}</p>
            ${step.content}

            <div class="lesson-nav-buttons">
              <button class="btn-secondary" id="btn-prev-step" ${currentStep === 0 ? 'disabled style="opacity: 0.4;"' : ''}>
                ← ETAPA ANTERIOR
              </button>
              <button class="btn-primary" id="btn-next-step">
                ${currentStep === steps.length - 1 ? 'ABRIR LABORATÓRIO →' : 'PRÓXIMA ETAPA →'}
              </button>
            </div>
          </div>

          <!-- Interactive Graphic Column -->
          <div class="lesson-visual-col">
            <div class="interactive-preview-canvas-card">
              <div class="canvas-preview-header">
                <span class="section-meta-tag" style="margin: 0;">VISUALIZADOR TÉCNICO</span>
                <span id="angle-telemetry" style="font-family: var(--font-tech); font-size: 0.78rem; color: var(--pen-x);">
                  θ = 45°
                </span>
              </div>

              <div class="canvas-wrapper">
                <canvas id="trig-mini-canvas" width="460" height="340" style="cursor: crosshair;" aria-label="Animação explicativa de trigonometria"></canvas>
              </div>

              <div class="mini-canvas-controls" style="margin-top: 1rem;">
                <div class="control-label-row">
                  <span>Ajustar Ângulo (θ):</span>
                  <span id="slider-val-text" class="control-value">45°</span>
                </div>
                <input type="range" id="mini-angle-slider" min="0" max="360" value="45" class="slider-cyan" aria-label="Ajustar ângulo da animação">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render KaTeX Formulas
    try {
      if (step.formulaLatex) {
        const f1 = container.querySelector('#formula-soh-cah') || container.querySelector('#formula-circle-coords') || container.querySelector('#formula-wave-func');
        if (f1) katex.render(step.formulaLatex, f1, { displayMode: true });
      }
      if (step.secondaryLatex) {
        const f2 = container.querySelector('#formula-pythagoras');
        if (f2) katex.render(step.secondaryLatex, f2, { displayMode: true });
      }
    } catch (e) {}

    // Attach step click handlers
    container.querySelectorAll('.step-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        currentStep = parseInt(btn.getAttribute('data-step'), 10);
        render();
      });
    });

    container.querySelector('#btn-prev-step')?.addEventListener('click', () => {
      if (currentStep > 0) {
        soundFx.playClick();
        currentStep--;
        render();
      }
    });

    container.querySelector('#btn-next-step')?.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        soundFx.playClick();
        currentStep++;
        render();
      } else {
        soundFx.playClick();
        onOpenSandbox('trig-sandbox');
      }
    });

    container.querySelector('#btn-jump-sandbox')?.addEventListener('click', () => {
      soundFx.playClick();
      onOpenSandbox('trig-sandbox');
    });

    startMiniAnimation();
  }

  let animationFrameId = null;
  let angleDeg = 45;

  function startMiniAnimation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const canvas = container.querySelector('#trig-mini-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const slider = container.querySelector('#mini-angle-slider');
    const angleText = container.querySelector('#slider-val-text');
    const telemetry = container.querySelector('#angle-telemetry');

    slider?.addEventListener('input', (e) => {
      angleDeg = parseFloat(e.target.value);
      if (angleText) angleText.textContent = `${Math.round(angleDeg)}°`;
      if (telemetry) telemetry.textContent = `θ = ${Math.round(angleDeg)}°`;
    });

    let waveHistory = [];

    function animate() {
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rad = (angleDeg * Math.PI) / 180;
      const cosVal = Math.cos(rad);
      const sinVal = Math.sin(rad);

      if (currentStep === 2) {
        // Step 3: Draw circle on left and wave unfolding to right!
        const circleCenterX = 110;
        const circleCenterY = canvas.height / 2;
        const R = 72;

        // Coordinate axes for circle
        ctx.strokeStyle = colors.gridMinor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(circleCenterX - R - 20, circleCenterY);
        ctx.lineTo(circleCenterX + R + 20, circleCenterY);
        ctx.moveTo(circleCenterX, circleCenterY - R - 20);
        ctx.lineTo(circleCenterX, circleCenterY + R + 20);
        ctx.stroke();

        // Circle perimeter
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, R, 0, Math.PI * 2);
        ctx.stroke();

        const px = circleCenterX + cosVal * R;
        const py = circleCenterY - sinVal * R;

        // Store wave point
        waveHistory.unshift(py);
        if (waveHistory.length > 220) waveHistory.pop();

        // Wave axes
        const waveStartX = 220;
        ctx.strokeStyle = colors.gridMajor;
        ctx.beginPath();
        ctx.moveTo(waveStartX, circleCenterY);
        ctx.lineTo(canvas.width - 15, circleCenterY);
        ctx.stroke();

        // Connecting laser
        ctx.strokeStyle = colors.penY;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(waveStartX, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw sine wave
        ctx.strokeStyle = colors.penY;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < waveHistory.length; i++) {
          const wx = waveStartX + i;
          const wy = waveHistory[i];
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        // Pointer vector
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(circleCenterX, circleCenterY);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Rotating point
        ctx.fillStyle = colors.penY;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.bgSurface;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Auto increment angle smoothly for step 3
        angleDeg = (angleDeg + 1.0) % 360;
        if (slider) slider.value = angleDeg;
        if (angleText) angleText.textContent = `${Math.round(angleDeg)}°`;
      } else {
        // Step 1 & 2: Focused Unit Circle with Projections
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const R = 115;

        // Grid lines
        ctx.strokeStyle = colors.gridMinor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - R - 30, cy);
        ctx.lineTo(cx + R + 30, cy);
        ctx.moveTo(cx, cy - R - 30);
        ctx.lineTo(cx + R + 30, cy);
        ctx.stroke();

        // Unit Circle
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

        const px = cx + cosVal * R;
        const py = cy - sinVal * R;

        // Filled right triangle inside
        ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.1)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, cy);
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.fill();

        // Cosine line (horizontal, penX)
        ctx.strokeStyle = colors.penX;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, cy);
        ctx.stroke();

        // Sine line (vertical, penY)
        ctx.strokeStyle = colors.penY;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(px, cy);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Hypotenuse (ink, R=1)
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Angle Arc (penAngle)
        ctx.strokeStyle = colors.penAngle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, -rad, true);
        ctx.stroke();

        // Text indicators
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.penX;
        ctx.fillText(`cos = ${cosVal.toFixed(2)}`, px / 2 + cx / 2 - 25, cy + 18);

        ctx.fillStyle = colors.penY;
        ctx.fillText(`sin = ${sinVal.toFixed(2)}`, px + 8, py / 2 + cy / 2);

        // Rotating point
        ctx.fillStyle = colors.penX;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.bgSurface;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  };
}
