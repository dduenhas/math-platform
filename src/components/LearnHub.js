import { createTrigExplainer } from './TrigExplainer.js';
import { createMatrixExplainer } from './MatrixExplainer.js';
import { createFusionExplainer } from './FusionExplainer.js';
import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';

export function createLearnHub(onNavigate) {
  const container = document.createElement('div');
  container.className = 'learn-hub';

  let currentSubtab = 'mod1';
  let activeModuleInstance = null;

  function render() {
    container.innerHTML = `
      <div class="section-header">
        <div>
          <div class="section-meta-tag">
            <span>CURRÍCULO FORMATIVO // BNCC EM13MAT301, 401, 501</span>
            <span>•</span>
            <span>METODOLOGIA MATHMANA</span>
          </div>
          <h1 class="section-title">
            Pranchas Teóricas: A Geometria Intuitiva do Espaço
          </h1>
          <p class="section-subtitle">
            Cada matriz é uma transformação contínua do plano, cada ângulo polar desdobra oscilações no tempo e a rotação é o vértice onde trigonometria e álgebra linear convergem.
          </p>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn-primary" id="btn-quick-trig" style="font-size: 0.8rem; padding: 0.5rem 1rem;" aria-label="Abrir Laboratório de Círculo e Ondas">
            BANCADA CÍRCULO & ONDAS →
          </button>
          <button class="btn-secondary" id="btn-quick-matrix" style="font-size: 0.8rem; padding: 0.5rem 1rem;" aria-label="Abrir Laboratório de Matrizes 2D">
            BANCADA MATRIZES 2D →
          </button>
        </div>
      </div>

      <div class="subtabs" role="tablist">
        <button class="subtab-btn ${currentSubtab === 'mod1' ? 'active' : ''}" data-sub="mod1" role="tab">
          [01] CÍRCULO UNITÁRIO & ONDAS
        </button>
        <button class="subtab-btn ${currentSubtab === 'mod2' ? 'active' : ''}" data-sub="mod2" role="tab">
          [02] MATRIZES COMO DEFORMAÇÃO
        </button>
        <button class="subtab-btn ${currentSubtab === 'mod3' ? 'active' : ''}" data-sub="mod3" role="tab">
          [03] MATRIZ DE ROTAÇÃO (A SÍNTESE)
        </button>
        <button class="subtab-btn ${currentSubtab === 'pedagogy' ? 'active' : ''}" data-sub="pedagogy" role="tab">
          [04] FUNDAMENTAÇÃO BNCC & ENSAIO
        </button>
      </div>

      <div id="subtab-content-mount"></div>
    `;

    // Bind subtab buttons
    container.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        currentSubtab = btn.getAttribute('data-sub');
        container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mountSubtabContent();
      });
    });

    container.querySelector('#btn-quick-trig')?.addEventListener('click', () => {
      soundFx.playClick();
      onNavigate('trig-sandbox');
    });

    container.querySelector('#btn-quick-matrix')?.addEventListener('click', () => {
      soundFx.playClick();
      onNavigate('matrix-2d-sandbox');
    });

    mountSubtabContent();
  }

  function mountSubtabContent() {
    const mount = container.querySelector('#subtab-content-mount');
    if (!mount) return;

    if (activeModuleInstance && activeModuleInstance.destroy) {
      activeModuleInstance.destroy();
      activeModuleInstance = null;
    }

    mount.innerHTML = '';

    if (currentSubtab === 'mod1') {
      activeModuleInstance = createTrigExplainer(onNavigate);
      mount.appendChild(activeModuleInstance.element);
    } else if (currentSubtab === 'mod2') {
      activeModuleInstance = createMatrixExplainer(onNavigate);
      mount.appendChild(activeModuleInstance.element);
    } else if (currentSubtab === 'mod3') {
      activeModuleInstance = createFusionExplainer(onNavigate);
      mount.appendChild(activeModuleInstance.element);
    } else if (currentSubtab === 'pedagogy') {
      mount.innerHTML = renderPedagogyEssay();
    }
  }

  function renderPedagogyEssay() {
    return `
      <article class="control-card" style="padding: 2rem; line-height: 1.8;">
        <div style="border-bottom: 1px solid var(--bp-border); padding-bottom: 1.2rem; margin-bottom: 1.8rem;">
          <div class="section-meta-tag">
            DIRETRIZES DA ÁREA DE MATEMÁTICA E SUAS TECNOLOGIAS // BNCC
          </div>
          <h2 style="font-family: var(--font-display); font-size: 1.8rem; color: var(--bp-ink); font-weight: 700;">
            A Revolução Didática de MATHmana: Por que a Visualização Geométrica Supera o Instrucionismo
          </h2>
          <p style="color: var(--bp-ink-secondary); font-size: 0.92rem;">
            Uma análise comparativa entre a memorização mecânica descontextualizada e a aprendizagem por modelos mentais espaciais.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: var(--bp-bg); border: 1px solid var(--bp-border); border-left: 3px solid var(--pen-alert); padding: 1.4rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--pen-alert); margin-bottom: 0.75rem; font-family: var(--font-tech);">
              [!] O BLOQUEIO COGNITIVO DO ENSINO TRADICIONAL
            </div>
            <ul style="color: var(--bp-ink-muted); font-size: 0.88rem; display: flex; flex-direction: column; gap: 0.65rem; padding-left: 1.2rem;">
              <li><strong>Trigonometria aprisionada:</strong> Limitar seno e cosseno a triângulos estáticos isolados gera bloqueio mental quando o ângulo passa de 90° ou modela oscilações no tempo.</li>
              <li><strong>Matrizes como contabilidade estática:</strong> Tratar matrizes como meras tabelas de números para resolver sistemas por eliminação oculta seu papel real como manipulador do espaço.</li>
              <li><strong>Foco em cálculo braçal:</strong> O tempo do estudante é gasto multiplicando matrizes $3 \times 3$ à mão em vez de desenvolver intuição e raciocínio espacial.</li>
            </ul>
          </div>

          <div style="background: var(--bp-bg); border: 1px solid var(--bp-border); border-left: 3px solid var(--pen-pass); padding: 1.4rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--pen-pass); margin-bottom: 0.75rem; font-family: var(--font-tech);">
              [✓] A PEDAGOGIA GEOMÉTRICA DE MATHMANA
            </div>
            <ul style="color: var(--bp-ink-secondary); font-size: 0.88rem; display: flex; flex-direction: column; gap: 0.65rem; padding-left: 1.2rem;">
              <li><strong>O Círculo como Farol de Coordenadas:</strong> Seno e cosseno são as projeções $(x, y)$ de um ponto girando em raio 1. O desenrolar temporal gera a onda periódica naturalmente.</li>
              <li><strong>Matrizes como Deformação Contínua:</strong> As colunas de uma matriz são onde os vetores base $\hat{i}$ e $\hat{j}$ aterrissam. Todo o restante do plano segue por linearidade.</li>
              <li><strong>Determinante como Escala de Área:</strong> $\det(M)$ mede a ampliação da área do plano. O colapso $\det = 0$ significa perda irreversível de uma dimensão inteira.</li>
            </ul>
          </div>
        </div>

        <div style="background: var(--bp-bg); border: 1px solid var(--bp-border); padding: 1.5rem;">
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--bp-ink); margin-bottom: 0.5rem; font-family: var(--font-display);">
            A Ponte Unificadora: A Matriz de Rotação $R(\theta)$
          </div>
          <p style="color: var(--bp-ink-secondary); font-size: 0.9rem; line-height: 1.7;">
            A fusão dos dois vídeos se dá na pergunta natural: <em>"Para onde vão os vetores base quando giramos o espaço por um ângulo $\theta$?"</em>. O vetor $\hat{i} = (1, 0)$ vai para $(\cos\theta, \sin\theta)$, e o vetor $\hat{j} = (0, 1)$ vai para $(-\sin\theta, \cos\theta)$. A matriz resultante $R(\theta)$ possui determinante $\cos^2\theta + \sin^2\theta = 1$, demonstrando que a conservação da área numa rotação é a manifestação física do Teorema de Pitágoras.
          </p>
        </div>
      </article>
    `;
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (activeModuleInstance && activeModuleInstance.destroy) {
        activeModuleInstance.destroy();
      }
    }
  };
}
