import { gameState, RANKS, BADGES } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';

export function createNavbar(onTabChange, initialTab = 'landing') {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Navegação Principal do Sistema');

  let activeTabId = initialTab;

  // Read current theme (default: light)
  let currentTheme = localStorage.getItem('mathstudio_theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);

  function toggleTheme() {
    soundFx.playClick();
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('mathstudio_theme', currentTheme);
    render();
  }

  function render() {
    const { xp, soundEnabled, unlockedBadges } = gameState.state;
    const { currentRank } = gameState.getRank();

    nav.innerHTML = `
      <div class="navbar-container">
        <div class="brand" id="brand-logo" title="Voltar à Prancha Inicial" role="button" tabindex="0" aria-label="Ir para a página inicial MathStudio">
          <div class="brand-blueprint-badge">
            📐
          </div>
          <div class="brand-text">
            <span class="brand-title">MATHSTUDIO</span>
            <span class="brand-spec">ENGENHARIA DIDÁTICA // BNCC</span>
          </div>
        </div>

        <div class="nav-tabs" id="main-nav-tabs" role="tablist">
          <button class="nav-tab-btn ${activeTabId === 'landing' ? 'active' : ''}" data-tab="landing" role="tab" aria-selected="${activeTabId === 'landing'}" title="Página Inicial e Apresentação Pedagógica">
            00 // INÍCIO
          </button>
          <button class="nav-tab-btn ${activeTabId === 'learn' ? 'active' : ''}" data-tab="learn" role="tab" aria-selected="${activeTabId === 'learn'}" title="Pranchas Teóricas Passo a Passo">
            01 // AULAS
          </button>
          <button class="nav-tab-btn ${activeTabId === 'trig-sandbox' ? 'active' : ''}" data-tab="trig-sandbox" role="tab" aria-selected="${activeTabId === 'trig-sandbox'}" title="Laboratório de Trigonometria e Oscilações">
            02 // CÍRCULO & ONDAS
          </button>
          <button class="nav-tab-btn ${activeTabId === 'matrix-2d-sandbox' ? 'active' : ''}" data-tab="matrix-2d-sandbox" role="tab" aria-selected="${activeTabId === 'matrix-2d-sandbox'}" title="Laboratório Cartesiano de Matrizes 2D">
            03 // MATRIZES 2D
          </button>
          <button class="nav-tab-btn ${activeTabId === 'matrix-3d-sandbox' ? 'active' : ''}" data-tab="matrix-3d-sandbox" role="tab" aria-selected="${activeTabId === 'matrix-3d-sandbox'}" title="Laboratório Tridimensional WebGL">
            04 // ESPAÇO 3D
          </button>
          <button class="nav-tab-btn ${activeTabId === 'challenges' ? 'active' : ''}" data-tab="challenges" role="tab" aria-selected="${activeTabId === 'challenges'}" title="Missões e Puzzles Interativos">
            05 // DESAFIOS
          </button>
          <button class="nav-tab-btn ${activeTabId === 'real-world' ? 'active' : ''}" data-tab="real-world" role="tab" aria-selected="${activeTabId === 'real-world'}" title="Aplicações no Mundo Real">
            06 // CASOS REAIS
          </button>
        </div>

        <div class="header-actions">
          <!-- BNCC Badge Button -->
          <button class="tech-btn" id="btn-open-bncc" title="Consultar Competências da BNCC" aria-label="Abrir modal com normas da BNCC">
            <span style="color: var(--pen-pass);">✓</span> BNCC
          </button>

          <!-- Theme Toggle (Light/Dark Blueprint) -->
          <button class="tech-btn" id="btn-toggle-theme" title="Alternar entre Prancheta Clara e Cianótipo Escuro" aria-label="Alternar Tema Claro e Escuro">
            ${currentTheme === 'dark' ? '☀ MODO CLARO' : '☾ MODO ESCURO'}
          </button>

          <!-- Sound Toggle -->
          <button class="tech-btn ${soundEnabled ? 'active' : ''}" id="btn-toggle-sound" title="${soundEnabled ? 'Silenciar Áudio' : 'Ativar Efeitos Sonoros'}" aria-label="Efeitos Sonoros">
            ${soundEnabled ? '🔊 SOM: ON' : '🔇 SOM: OFF'}
          </button>

          <!-- Level Status -->
          <button class="tech-btn" id="btn-badges-modal" title="Ver Certificações de Maestria" aria-label="Ver Certificados Acadêmicos">
            <span style="color: var(--pen-x);">NV. ${currentRank.level}</span>
          </button>
        </div>
      </div>
    `;

    nav.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        const tab = btn.getAttribute('data-tab');
        setActiveTab(tab);
        onTabChange(tab);
      });
    });

    nav.querySelector('#btn-toggle-theme')?.addEventListener('click', toggleTheme);

    nav.querySelector('#btn-toggle-sound')?.addEventListener('click', () => {
      gameState.toggleSound();
    });

    const handleBrandClick = () => {
      soundFx.playClick();
      setActiveTab('landing');
      onTabChange('landing');
    };

    const brandEl = nav.querySelector('#brand-logo');
    brandEl?.addEventListener('click', handleBrandClick);
    brandEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBrandClick();
      }
    });

    nav.querySelector('#btn-open-bncc')?.addEventListener('click', () => {
      soundFx.playClick();
      openBnccModal();
    });

    nav.querySelector('#btn-badges-modal')?.addEventListener('click', () => {
      soundFx.playClick();
      openBadgesModal();
    });
  }

  function setActiveTab(tabId) {
    activeTabId = tabId;
    nav.querySelectorAll('.nav-tab-btn').forEach(b => {
      const match = b.getAttribute('data-tab') === tabId;
      if (match) {
        b.classList.add('active');
        b.setAttribute('aria-selected', 'true');
      } else {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      }
    });
  }

  gameState.subscribe(render);
  render();

  return { element: nav, setActiveTab };
}

function openBnccModal() {
  const existing = document.getElementById('bncc-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'bncc-modal-backdrop';
  backdrop.className = 'blueprint-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'bncc-modal-title');

  const modal = document.createElement('div');
  modal.className = 'blueprint-modal';

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid var(--bp-border); padding-bottom: 1rem;">
      <div>
        <div style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--pen-pass); text-transform: uppercase; font-weight: 700;">
          DOCUMENTAÇÃO NORMATIVA OFICIAL // MEC
        </div>
        <h2 id="bncc-modal-title" style="font-family: var(--font-display); font-size: 1.6rem; color: var(--bp-ink); font-weight: 700;">
          Alinhamento à BNCC (Ensino Médio)
        </h2>
      </div>
      <button id="bncc-close-btn" class="tech-btn" style="width: 32px; height: 32px; padding: 0;" aria-label="Fechar Janela">✕</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <div class="bncc-card">
        <span class="bncc-code">EM13MAT301</span>
        <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.35rem; font-size: 0.95rem;">
          Funções Periódicas, Som e Movimento Harmônico
        </div>
        <p class="bncc-desc">
          "Investigar e analisar características de funções trigonométricas (seno, cosseno), modelando fenômenos periódicos (ondas sonoras, movimentos oscilatórios harmônicos, marés) com auxílio de tecnologias digitais de visualização contínua."
        </p>
      </div>

      <div class="bncc-card">
        <span class="bncc-code">EM13MAT401</span>
        <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.35rem; font-size: 0.95rem;">
          Operadores Lineares e Álgebra Matricial no Plano
        </div>
        <p class="bncc-desc">
          "Compreender matrizes como operadores lineares de transformações no plano cartesiano (rotações, reflexões, dilatações e cisalhamentos), associando o determinante ao fator de multiplicação de área de polígonos."
        </p>
      </div>

      <div class="bncc-card">
        <span class="bncc-code">EM13MAT501</span>
        <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.35rem; font-size: 0.95rem;">
          Aplicações Tecnológicas (Computação Gráfica, Física e Robótica)
        </div>
        <p class="bncc-desc">
          "Investigar e resolver problemas reais em computação gráfica, robótica e cinemática física, utilizando álgebra linear matricial e trigonometria como linguagem fundamental de programação visual e espacial."
        </p>
      </div>

      <div class="bncc-card">
        <span class="bncc-code">COMPETÊNCIAS GERAIS BNCC (CG02 & CG05)</span>
        <div style="font-weight: 700; color: var(--bp-ink); margin-bottom: 0.35rem; font-size: 0.95rem;">
          Pensamento Científico, Crítico e Cultura Digital
        </div>
        <p class="bncc-desc">
          Exercitar a curiosidade intelectual e utilizar tecnologias digitais de informação e comunicação de forma crítica, significativa e reflexiva para modelar o espaço e solucionar desafios do mundo real.
        </p>
      </div>
    </div>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  modal.querySelector('#bncc-close-btn')?.addEventListener('click', close);
}

function openBadgesModal() {
  const existing = document.getElementById('badges-modal-backdrop');
  if (existing) existing.remove();

  const { unlockedBadges } = gameState.state;

  const backdrop = document.createElement('div');
  backdrop.id = 'badges-modal-backdrop';
  backdrop.className = 'blueprint-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'badges-modal-title');

  const modal = document.createElement('div');
  modal.className = 'blueprint-modal';

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; border-bottom: 1px solid var(--bp-border); padding-bottom: 0.75rem;">
      <div>
        <div style="font-family: var(--font-tech); font-size: 0.72rem; color: var(--pen-x); text-transform: uppercase; font-weight: 700;">
          REGISTRO DE PROFICIÊNCIA TÉCNICA
        </div>
        <h2 id="badges-modal-title" style="font-family: var(--font-display); font-size: 1.5rem; color: var(--bp-ink); font-weight: 700;">
          Marcos de Conquista Acadêmica
        </h2>
        <p style="font-size: 0.8rem; color: var(--bp-ink-secondary); font-family: var(--font-tech);">
          ${unlockedBadges.length} de ${BADGES.length} certificados conquistados
        </p>
      </div>
      <button id="modal-close-btn" class="tech-btn" style="width: 32px; height: 32px; padding: 0;" aria-label="Fechar Janela">✕</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.65rem;">
      ${BADGES.map(badge => {
        const unlocked = unlockedBadges.includes(badge.id);
        return `
          <div style="
            background: ${unlocked ? 'var(--bp-bg-elevated)' : 'var(--bp-bg)'};
            border: 1px solid ${unlocked ? 'var(--bp-border-active)' : 'var(--bp-border)'};
            padding: 0.85rem 1rem; display: flex; gap: 0.85rem; align-items: center;
            opacity: ${unlocked ? '1' : '0.45'};
          ">
            <div style="
              width: 32px; height: 32px; border: 1px solid var(--bp-border);
              display: flex; align-items: center; justify-content: center;
              font-family: var(--font-tech); font-size: 0.85rem; color: var(--pen-x);
              background: var(--bp-bg-surface);
            ">
              ${unlocked ? '✓' : '🔒'}
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.88rem; color: ${unlocked ? 'var(--bp-ink)' : 'var(--bp-ink-muted)'}; font-family: var(--font-display);">
                ${badge.name}
              </div>
              <div style="font-size: 0.78rem; color: var(--bp-ink-secondary); line-height: 1.4;">
                ${badge.desc}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  modal.querySelector('#modal-close-btn')?.addEventListener('click', close);
}
