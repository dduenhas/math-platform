import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createLandingPage(onNavigate) {
  const container = document.createElement('div');
  container.className = 'landing-page';

  let animFrameId = null;

  function render() {
    container.innerHTML = `
      <!-- TOP REGISTRATION BAR (BLUEPRINT HEADER) -->
      <header class="section-header" style="margin-bottom: 2rem;">
        <div>
          <div class="section-meta-tag">
            <span>[FOLHA-REF: MATH-001]</span>
            <span>•</span>
            <span>PROJETO DE ENGENHARIA DIDÁTICA VISUAL</span>
            <span>•</span>
            <span>BNCC ENSINO MÉDIO</span>
          </div>
          <div style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--bp-ink-muted);">
            SISTEMA INTEGRADO DE MODELAGEM ESPACIAL, TRIGONOMETRIA E MATRIZES
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center; font-family: var(--font-tech); font-size: 0.72rem; flex-wrap: wrap;">
          <span style="color: var(--pen-pass); border: 1px solid var(--pen-pass); padding: 0.2rem 0.5rem;">
            ✓ PADRÃO W3C / WCAG AAA
          </span>
          <span style="color: var(--pen-x); border: 1px solid var(--pen-x); padding: 0.2rem 0.5rem;">
            REVISÃO: 2026.4
          </span>
        </div>
      </header>

      <!-- HERO SECTION: SWISS MINIMALIST BLUEPRINT -->
      <section class="landing-hero-grid" aria-labelledby="hero-heading">
        <div>
          <div class="section-meta-tag">
            <span>PLANTAS BAIXAS DA GEOMETRIA VIVA</span>
            <span>•</span>
            <span>INSPIRADO EM MATHMANA</span>
          </div>

          <h1 id="hero-heading" class="landing-hero-title">
            A MATEMÁTICA É A PLANTA BAIXA DO UNIVERSO.
          </h1>

          <p style="font-size: 1.05rem; line-height: 1.65; color: var(--bp-ink-secondary); margin-bottom: 2rem; max-width: 640px;">
            Elimine a memorização cega de números em tabelas estáticas. Aprenda como cada matriz dobra e deforma o espaço em tempo real e como o círculo trigonométrico projeta as ondas do som, da luz e dos motores 3D que movem a tecnologia moderna.
          </p>

          <div style="display: flex; gap: 0.85rem; flex-wrap: wrap;">
            <button class="btn-primary" id="btn-hero-launch-workbench" style="padding: 0.75rem 1.6rem; font-size: 0.9rem;" aria-label="Abrir Bancada de Laboratórios">
              ▶ ABRIR BANCADA DE LABORATÓRIOS
            </button>
            <button class="btn-secondary" id="btn-hero-learn-bncc" style="padding: 0.75rem 1.4rem; font-size: 0.9rem;" aria-label="Ver Diretrizes Pedagógicas BNCC">
              📖 DIRETRIZES PEDAGÓGICAS (BNCC)
            </button>
          </div>

          <!-- Quick Metrics Bar -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--bp-border);">
            <div>
              <div style="font-family: var(--font-tech); font-size: 1.6rem; font-weight: 700; color: var(--pen-x); line-height: 1;">03</div>
              <div style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--bp-ink-muted); text-transform: uppercase; margin-top: 0.3rem;">Pranchas Teóricas</div>
            </div>
            <div>
              <div style="font-family: var(--font-tech); font-size: 1.6rem; font-weight: 700; color: var(--pen-y); line-height: 1;">03</div>
              <div style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--bp-ink-muted); text-transform: uppercase; margin-top: 0.3rem;">Bancadas 2D/3D</div>
            </div>
            <div>
              <div style="font-family: var(--font-tech); font-size: 1.6rem; font-weight: 700; color: var(--pen-pass); line-height: 1;">05</div>
              <div style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--bp-ink-muted); text-transform: uppercase; margin-top: 0.3rem;">Missões de Maestria</div>
            </div>
          </div>
        </div>

        <!-- HERO INTERACTIVE BLUEPRINT PREVIEW (Canvas with live drafting line rendering) -->
        <div class="control-card" style="padding: 1rem;" role="region" aria-label="Simulação Geométrica em Tempo Real">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-family: var(--font-tech); font-size: 0.75rem;">
            <span style="color: var(--pen-x); font-weight: 700;">FIG 0.1 // CIANÓTIPO DE TRANSFORMAÇÃO</span>
            <span id="hero-angle-label" style="color: var(--bp-ink-muted);">θ = 45°</span>
          </div>

          <div class="canvas-wrapper" style="height: 330px; position: relative;">
            <canvas id="hero-blueprint-canvas" width="500" height="330" style="width: 100%; height: 100%; display: block;" aria-label="Animação do círculo unitário e vetores transformados"></canvas>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.85rem; font-family: var(--font-tech); font-size: 0.75rem; color: var(--bp-ink-secondary); flex-wrap: wrap; gap: 0.5rem;">
            <span>MATRIZ: R(θ) = [ [ cos, -sin ], [ sin, cos ] ]</span>
            <span style="color: var(--pen-pass); font-weight: 600;">ÁREA PRESERVADA: det = 1.00</span>
          </div>
        </div>
      </section>

      <!-- THE 3 ARCHITECTURAL PILLARS (AS 3 PRANCHAS DE ENGENHARIA) -->
      <section style="margin-bottom: 4rem;" aria-labelledby="pillars-heading">
        <div style="border-bottom: 1px solid var(--bp-border); padding-bottom: 0.75rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="section-meta-tag">CURRÍCULO ESTRUTURADO</div>
            <h2 id="pillars-heading" style="font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 700; letter-spacing: -0.02em;">
              AS TRÊS PRANCHAS DO CONHECIMENTO
            </h2>
          </div>
          <span style="font-family: var(--font-tech); font-size: 0.78rem; color: var(--bp-ink-muted);">MÓDULOS 01 A 03</span>
        </div>

        <div class="landing-pillars-grid">
          <!-- PRANCHA 01 -->
          <article class="control-card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
              <span class="bncc-code">PRANCHA 01 // BNCC EM13MAT301</span>
              <span style="font-family: var(--font-tech); font-size: 0.85rem; color: var(--pen-x); font-weight: 700;">01</span>
            </div>
            <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; margin-bottom: 0.6rem; color: var(--bp-ink);">
              O Círculo Unitário & A Mecânica Periódica
            </h3>
            <p style="font-size: 0.88rem; color: var(--bp-ink-secondary); line-height: 1.6; margin-bottom: 1.25rem; flex: 1;">
              Libertando a trigonometria do triângulo retângulo estático. Entenda visualmente por que o cosseno é a sombra horizontal, o seno é a altura vertical e como o desenrolar circular no tempo gera ondas sonoras, oscilação de pêndulos MHS e sinais eletromagnéticos.
            </p>
            <div style="border-top: 1px solid var(--bp-border); padding-top: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--pen-x);">BANCADA TRIGONOMÉTRICA</span>
              <button class="tech-btn" data-target-tab="trig-sandbox" aria-label="Acessar Prancha 01">ACESSAR PRANCHA 01 →</button>
            </div>
          </article>

          <!-- PRANCHA 02 -->
          <article class="control-card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
              <span class="bncc-code">PRANCHA 02 // BNCC EM13MAT401</span>
              <span style="font-family: var(--font-tech); font-size: 0.85rem; color: var(--pen-y); font-weight: 700;">02</span>
            </div>
            <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; margin-bottom: 0.6rem; color: var(--bp-ink);">
              O Motor do Espaço: Transformações Lineares
            </h3>
            <p style="font-size: 0.88rem; color: var(--bp-ink-secondary); line-height: 1.6; margin-bottom: 1.25rem; flex: 1;">
              Uma matriz não é uma lista burocrática de números: é um operador geométrico que deforma o espaço. As colunas são os destinos dos vetores base î e ĵ. O determinante mede matematicamente quanto a área do plano é ampliada, refletida ou colapsada.
            </p>
            <div style="border-top: 1px solid var(--bp-border); padding-top: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--pen-y);">BANCADA 2D CARTESIANA</span>
              <button class="tech-btn" data-target-tab="matrix-2d-sandbox" aria-label="Acessar Prancha 02">ACESSAR PRANCHA 02 →</button>
            </div>
          </article>

          <!-- PRANCHA 03 -->
          <article class="control-card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
              <span class="bncc-code">PRANCHA 03 // BNCC EM13MAT501</span>
              <span style="font-family: var(--font-tech); font-size: 0.85rem; color: var(--pen-angle); font-weight: 700;">03</span>
            </div>
            <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; margin-bottom: 0.6rem; color: var(--bp-ink);">
              A Grande Síntese: A Matriz da Espaçonave
            </h3>
            <p style="font-size: 0.88rem; color: var(--bp-ink-secondary); line-height: 1.6; margin-bottom: 1.25rem; flex: 1;">
              O momento onde trigonometria e álgebra linear convergem. A primeira coluna é a asa da espaçonave; a segunda coluna é o bico. Veja como videogames, placas de vídeo e robôs industriais calculam trajetórias e física em tempo real.
            </p>
            <div style="border-top: 1px solid var(--bp-border); padding-top: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--pen-angle);">BANCADA 3D WEBGL</span>
              <button class="tech-btn" data-target-tab="matrix-3d-sandbox" aria-label="Acessar Prancha 03">ACESSAR PRANCHA 03 →</button>
            </div>
          </article>
        </div>
      </section>

      <!-- FUNDAMENTAÇÃO PEDAGÓGICA ALINHADA À BNCC -->
      <section id="secao-bncc" class="control-card" style="padding: 2rem; margin-bottom: 4rem;" aria-labelledby="bncc-heading">
        <div style="border-bottom: 1px solid var(--bp-border); padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="section-meta-tag">DOCUMENTAÇÃO NORMATIVA INSTITUCIONAL</div>
            <h2 id="bncc-heading" style="font-family: var(--font-display); font-size: clamp(1.4rem, 2.5vw, 1.9rem); font-weight: 700; letter-spacing: -0.02em;">
              FUNDAMENTAÇÃO PEDAGÓGICA & ALINHAMENTO À BNCC
            </h2>
          </div>
          <span style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--pen-pass); border: 1px solid var(--pen-pass); padding: 0.35rem 0.75rem; font-weight: 600;">
            ✓ 100% EM CONFORMIDADE COM A BNCC
          </span>
        </div>

        <p style="color: var(--bp-ink-secondary); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.8rem; max-width: 980px;">
          Esta plataforma foi concebida a partir das diretrizes da <strong>Base Nacional Comum Curricular (BNCC - Área de Matemática e suas Tecnologias para o Ensino Médio)</strong>, superando a mera aplicação mecânica de algoritmos para desenvolver competências cognitivas de modelagem, pensamento computacional e raciocínio geométrico intuitivo:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
          <div class="bncc-card">
            <span class="bncc-code">HABILIDADE EM13MAT301</span>
            <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.4rem; font-size: 0.95rem;">Fenômenos Periódicos & Ciclo Trigonométrico</div>
            <p class="bncc-desc">
              "Investigar e analisar características de funções trigonométricas (seno, cosseno), modelando fenômenos periódicos (ondas sonoras, movimentos oscilatórios, marés) com auxílio de tecnologias digitais de visualização contínua."
            </p>
          </div>

          <div class="bncc-card">
            <span class="bncc-code">HABILIDADE EM13MAT401</span>
            <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.4rem; font-size: 0.95rem;">Matrizes & Transformações Geométricas no Plano</div>
            <p class="bncc-desc">
              "Compreender matrizes como operadores lineares de transformações no plano (rotações, reflexões, dilatações e cisalhamentos), associando o determinante ao fator de escala de área de figuras poligonais."
            </p>
          </div>

          <div class="bncc-card">
            <span class="bncc-code">HABILIDADE EM13MAT501</span>
            <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.4rem; font-size: 0.95rem;">Modelagem Computacional & Cinemática Tridimensional</div>
            <p class="bncc-desc">
              "Investigar problemas reais em computação gráfica, robótica e física cinemática, utilizando álgebra linear matricial e trigonometria como linguagem de programação visual e espacial."
            </p>
          </div>
        </div>

        <!-- COMPARATIVE MATRIX: TRADICIONAL VS VISUAL ATIVO -->
        <div style="border: 1px solid var(--bp-border); background: var(--bp-bg); padding: 1.5rem;">
          <div style="font-family: var(--font-tech); font-size: 0.75rem; color: var(--pen-x); text-transform: uppercase; margin-bottom: 0.85rem; font-weight: 700;">
            TABELA 1.0 // MATRIZ PEDAGÓGICA COMPARATIVA
          </div>
          <div class="landing-comparison-grid">
            <div style="border-left: 2px solid var(--pen-alert); padding-left: 1rem;">
              <div style="font-weight: 700; color: var(--pen-alert); margin-bottom: 0.5rem; font-family: var(--font-tech); font-size: 0.85rem;">
                [!] ENSINO TRADICIONAL MECÂNICO
              </div>
              <ul style="font-size: 0.85rem; color: var(--bp-ink-muted); display: flex; flex-direction: column; gap: 0.5rem; padding-left: 0.85rem;">
                <li>Trigonometria limitada a triângulos estáticos isolados em folhas de papel.</li>
                <li>Matrizes como caixas de números para resolver equações por eliminação de Gauss.</li>
                <li>Memorização de "linha vezes coluna" sem entender o efeito no plano geométrico.</li>
                <li>Desconexão com a realidade tecnológica do aluno (games, física, inteligência artificial).</li>
              </ul>
            </div>
            <div style="border-left: 2px solid var(--pen-pass); padding-left: 1rem;">
              <div style="font-weight: 700; color: var(--pen-pass); margin-bottom: 0.5rem; font-family: var(--font-tech); font-size: 0.85rem;">
                [✓] EDUCAÇÃO VISUAL ATIVA BASEADA EM MODELOS MENTAIS
              </div>
              <ul style="font-size: 0.85rem; color: var(--bp-ink-secondary); display: flex; flex-direction: column; gap: 0.5rem; padding-left: 0.85rem;">
                <li>O Círculo Unitário como gerador oscilatório de ondas periódicas em tempo real.</li>
                <li>Matrizes como manipuladores visuais contínuos dos vetores base fundamentais î e ĵ.</li>
                <li>Determinante demonstrado geometricamente como fator de área e inversão de orientação.</li>
                <li>Aplicação imediata em motores de física, simulações de espaçonaves e gráficos 3D.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA BOTTOM -->
      <section style="text-align: center; padding: 3rem 1.5rem; border: 1px solid var(--bp-border); background: var(--bp-bg-surface); margin-bottom: 2rem;">
        <h2 style="font-family: var(--font-display); font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 700; letter-spacing: -0.03em; margin-bottom: 0.75rem;">
          EXPERIMENTE A GEOMETRIA VIVA NA PRÁTICA
        </h2>
        <p style="color: var(--bp-ink-secondary); font-size: 0.95rem; max-width: 620px; margin: 0 auto 1.5rem auto;">
          Abra as bancadas interativas e sinta a matemática deformar o espaço e oscilar o tempo na ponta dos seus dedos.
        </p>
        <button class="btn-primary" id="btn-footer-cta" style="padding: 0.85rem 2rem; font-size: 0.95rem;" aria-label="Iniciar Laboratórios">
          INICIAR LABORATÓRIOS AGORA →
        </button>
      </section>

      <!-- ARCHITECTURAL DRAWING TITLE BLOCK (CARIMBO DE PRANCHA) -->
      <footer class="drawing-title-block" role="contentinfo">
        <div class="title-block-cell">
          <span class="title-block-label">Projeto // Titular</span>
          <span class="title-block-val">MATHSTUDIO • SISTEMA VISUAL MATRIZES E TRIGONOMETRIA</span>
        </div>
        <div class="title-block-cell">
          <span class="title-block-label">Metodologia</span>
          <span class="title-block-val">MATHMANA // MODELOS MENTAIS</span>
        </div>
        <div class="title-block-cell">
          <span class="title-block-label">Norma Pedagógica</span>
          <span class="title-block-val">BNCC EM13MAT301, 401, 501</span>
        </div>
        <div class="title-block-cell">
          <span class="title-block-label">Design & Acessibilidade</span>
          <span class="title-block-val">SWISS BLUEPRINT • W3C AAA</span>
        </div>
      </footer>
    `;

    // Event Listeners
    container.querySelector('#btn-hero-launch-workbench')?.addEventListener('click', () => {
      soundFx.playClick();
      onNavigate('learn');
    });

    container.querySelector('#btn-footer-cta')?.addEventListener('click', () => {
      soundFx.playClick();
      onNavigate('learn');
    });

    container.querySelector('#btn-hero-learn-bncc')?.addEventListener('click', () => {
      soundFx.playClick();
      const el = container.querySelector('#secao-bncc');
      el?.scrollIntoView({ behavior: 'smooth' });
    });

    container.querySelectorAll('[data-target-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        const tab = btn.getAttribute('data-target-tab');
        if (tab) onNavigate(tab);
      });
    });

    // Start Hero Canvas Animation with Theme Sync
    startHeroAnimation();
  }

  let heroAngle = 0;

  function startHeroAnimation() {
    const canvas = container.querySelector('#hero-blueprint-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const angleLabel = container.querySelector('#hero-angle-label');

    function animate() {
      // Responsive canvas size adjustment
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
      }

      heroAngle = (heroAngle + 0.5) % 360;
      if (angleLabel) angleLabel.textContent = `θ = ${Math.round(heroAngle)}°`;

      const colors = getThemeColors();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rad = (heroAngle * Math.PI) / 180;
      const cosVal = Math.cos(rad);
      const sinVal = Math.sin(rad);

      const R = Math.min(cx, cy) * 0.58;

      // Millimeter technical coordinate lines
      ctx.strokeStyle = colors.gridMajor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.8, cy);
      ctx.lineTo(cx + R * 1.8, cy);
      ctx.moveTo(cx, cy - R * 1.5);
      ctx.lineTo(cx, cy + R * 1.5);
      ctx.stroke();

      // Millimeter grid sub-ticks
      const tickStep = R / 4;
      ctx.strokeStyle = colors.gridMinor;
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;
        ctx.beginPath();
        ctx.moveTo(cx + i * tickStep, cy - 4);
        ctx.lineTo(cx + i * tickStep, cy + 4);
        ctx.moveTo(cx - 4, cy + i * tickStep);
        ctx.lineTo(cx + 4, cy + i * tickStep);
        ctx.stroke();
      }

      // Blueprint Unit Circle
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // Dimension Arc for Theta (Amber)
      ctx.strokeStyle = colors.penAngle;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.35, -rad, 0, false);
      ctx.stroke();

      // Transformed i-hat (Column 1: cos, sin)
      const ix = cx + cosVal * R;
      const iy = cy - sinVal * R;
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ix, iy);
      ctx.stroke();

      // Transformed j-hat (Column 2: -sin, cos)
      const jx = cx - sinVal * R;
      const jy = cy - cosVal * R;
      ctx.strokeStyle = colors.penY;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(jx, jy);
      ctx.stroke();

      // Transformed Parallelogram (det = 1, Area Violet)
      const px = cx + (cosVal - sinVal) * R;
      const py = cy - (sinVal + cosVal) * R;
      ctx.fillStyle = colors.isLight ? 'rgba(109, 40, 217, 0.12)' : 'rgba(192, 132, 252, 0.18)';
      ctx.strokeStyle = colors.penArea;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ix, iy);
      ctx.lineTo(px, py);
      ctx.lineTo(jx, jy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Arrowheads
      drawArrow(ctx, cx, cy, ix, iy, colors.penX);
      drawArrow(ctx, cx, cy, jx, jy, colors.penY);

      // Technical Annotations (Font JetBrains Mono)
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.penX;
      ctx.fillText(`î [${cosVal.toFixed(2)}, ${sinVal.toFixed(2)}]`, ix + 8, iy - 4);

      ctx.fillStyle = colors.penY;
      ctx.fillText(`ĵ [${(-sinVal).toFixed(2)}, ${cosVal.toFixed(2)}]`, jx + 8, jy - 4);

      // Dimension label for radius
      ctx.fillStyle = colors.inkMuted;
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText(`r = 1.00`, cx + R * 0.5, cy + 14);

      animFrameId = requestAnimationFrame(animate);
    }

    animate();
  }

  function drawArrow(ctx, fromX, fromY, toX, toY, color) {
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
      if (animFrameId) cancelAnimationFrame(animFrameId);
    }
  };
}
