import confetti from 'canvas-confetti';
import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createChallenges(onNavigate) {
  const container = document.createElement('div');
  container.className = 'challenges-page';

  let activeMissionId = 'mission1';

  // Mission States
  let m1Amp = 1.0, m1Freq = 1.0;
  const m1TargetAmp = 1.5, m1TargetFreq = 2.0;

  let m2Angle = 45;
  const m2TargetAngle = 150;

  let m3_i = [1, 0], m3_j = [0, 1];

  let m4Shear = 0;

  let m5Pitch = 0, m5Yaw = 0;

  let animId = null;

  function render() {
    const { completedChallenges } = gameState.state;

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <div class="section-icon-badge">05</div>
          <div>
            <div class="section-meta-tag">AVALIAÇÃO FORMATIVA // BNCC ENSINO MÉDIO</div>
            <h2 class="section-title">Arena de Desafios & Missões Gamificadas</h2>
            <p class="section-subtitle">Resolva problemas com raciocínio espacial, aplique transformações geométricas e acumule proficiência</p>
          </div>
        </div>

        <div class="canvas-badge-group">
          <span>MISSÕES CONCLUÍDAS: <strong style="color: var(--pen-pass);">${Object.keys(completedChallenges).length} / 5</strong></span>
        </div>
      </div>

      <div class="subtabs" id="mission-tabs" role="tablist">
        <button class="subtab-btn ${activeMissionId === 'mission1' ? 'active' : ''}" data-mission="mission1" role="tab">
          [01] SINTONIA DE ONDA
        </button>
        <button class="subtab-btn ${activeMissionId === 'mission2' ? 'active' : ''}" data-mission="mission2" role="tab">
          [02] CANHÃO POLAR
        </button>
        <button class="subtab-btn ${activeMissionId === 'mission3' ? 'active' : ''}" data-mission="mission3" role="tab">
          [03] ACOPLAMENTO ORBITAL
        </button>
        <button class="subtab-btn ${activeMissionId === 'mission4' ? 'active' : ''}" data-mission="mission4" role="tab">
          [04] CISALHAMENTO (ÁREA)
        </button>
        <button class="subtab-btn ${activeMissionId === 'mission5' ? 'active' : ''}" data-mission="mission5" role="tab">
          [05] ORIENTAÇÃO 3D
        </button>
      </div>

      <div id="mission-content-mount"></div>
    `;

    container.querySelectorAll('#mission-tabs .subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        activeMissionId = btn.getAttribute('data-mission');
        container.querySelectorAll('#mission-tabs .subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mountMission();
      });
    });

    mountMission();
  }

  function mountMission() {
    if (animId) cancelAnimationFrame(animId);

    const mount = container.querySelector('#mission-content-mount');
    if (!mount) return;

    if (activeMissionId === 'mission1') {
      renderMission1(mount);
    } else if (activeMissionId === 'mission2') {
      renderMission2(mount);
    } else if (activeMissionId === 'mission3') {
      renderMission3(mount);
    } else if (activeMissionId === 'mission4') {
      renderMission4(mount);
    } else if (activeMissionId === 'mission5') {
      renderMission5(mount);
    }
  }

  // ============================================================
  // MISSION 1: SINTONIA DE SINAL SENOIDAL
  // ============================================================
  function renderMission1(mount) {
    const isDone = !!gameState.state.completedChallenges['m1'];

    mount.innerHTML = `
      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <span class="section-meta-tag" style="margin: 0;">SINAL ONDULATÓRIO</span>
            <span id="m1-sync-badge" style="font-family: var(--font-tech); font-weight: 700; color: var(--bp-ink); background: var(--bp-bg); padding: 0.3rem 0.65rem; border: 1px solid var(--bp-border); font-size: 0.78rem;">
              SINCRONIA: 0%
            </span>
          </div>
          <canvas id="m1-canvas" width="840" height="480" style="width: 100%; height: 100%;" aria-label="Sonda emitindo onda e antena receptora"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">
              <span>Objetivo da Missão</span>
              <span style="font-size: 0.7rem; color: var(--pen-pass); font-family: var(--font-tech);">NÍVEL BÁSICO</span>
            </h3>
            <p style="font-size: 0.85rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 1rem;">
              Uma sonda espacial distante está emitindo um sinal de rádio codificado (linha verde pontilhada). Ajuste a <strong>Frequência (ω)</strong> e a <strong>Amplitude (A)</strong> da sua antena receptora para sobrepor perfeitamente a onda!
            </p>

            <div class="control-group">
              <div class="control-label-row">
                <span>Frequência da Antena (ω)</span>
                <span id="m1-txt-freq" class="control-value">${m1Freq.toFixed(1)}x</span>
              </div>
              <input type="range" id="m1-sl-freq" min="0.5" max="3.0" step="0.1" value="${m1Freq}" class="slider-cyan" aria-label="Frequência da antena">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span>Amplitude da Antena (A)</span>
                <span id="m1-txt-amp" class="control-value">${m1Amp.toFixed(1)}</span>
              </div>
              <input type="range" id="m1-sl-amp" min="0.5" max="2.5" step="0.1" value="${m1Amp}" class="slider-magenta" aria-label="Amplitude da antena">
            </div>

            <div style="margin-top: 1.25rem;">
              <button class="btn-primary" id="m1-btn-verify" style="width: 100%; justify-content: center;" aria-label="Travar Sinal">
                ${isDone ? '✓ MISSÃO JÁ CONCLUÍDA' : 'TRAVAR SINAL (+150 XP)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = mount.querySelector('#m1-canvas');
    const ctx = canvas.getContext('2d');
    const slFreq = mount.querySelector('#m1-sl-freq');
    const slAmp = mount.querySelector('#m1-sl-amp');
    const txtFreq = mount.querySelector('#m1-txt-freq');
    const txtAmp = mount.querySelector('#m1-txt-amp');
    const syncBadge = mount.querySelector('#m1-sync-badge');
    const btnVerify = mount.querySelector('#m1-btn-verify');

    slFreq.addEventListener('input', (e) => {
      m1Freq = parseFloat(e.target.value);
      txtFreq.textContent = `${m1Freq.toFixed(1)}x`;
    });

    slAmp.addEventListener('input', (e) => {
      m1Amp = parseFloat(e.target.value);
      txtAmp.textContent = m1Amp.toFixed(1);
    });

    let t = 0;
    function loop() {
      t += 0.03;
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cy = canvas.height / 2;
      const baseAmp = 60;

      // Draw Center Axis
      ctx.strokeStyle = colors.gridMajor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, cy);
      ctx.lineTo(canvas.width - 20, cy);
      ctx.stroke();

      // 1. Target Wave (Pen Pass, Dotted)
      ctx.strokeStyle = colors.penPass;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      for (let x = 20; x < canvas.width - 20; x++) {
        const rad = (x * 0.015 * m1TargetFreq) + t * 2.0;
        const y = cy - Math.sin(rad) * (baseAmp * m1TargetAmp);
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. User Wave (Pen Y, Solid)
      ctx.strokeStyle = colors.penY;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 20; x < canvas.width - 20; x++) {
        const rad = (x * 0.015 * m1Freq) + t * 2.0;
        const y = cy - Math.sin(rad) * (baseAmp * m1Amp);
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Match percentage
      const freqDiff = Math.abs(m1Freq - m1TargetFreq);
      const ampDiff = Math.abs(m1Amp - m1TargetAmp);
      const matchScore = Math.max(0, Math.min(100, Math.round(100 - (freqDiff * 35 + ampDiff * 30))));

      if (syncBadge) {
        syncBadge.textContent = `SINCRONIA: ${matchScore}%`;
        syncBadge.style.color = matchScore >= 90 ? colors.penPass : colors.penY;
      }

      animId = requestAnimationFrame(loop);
    }
    loop();

    btnVerify.addEventListener('click', () => {
      const freqDiff = Math.abs(m1Freq - m1TargetFreq);
      const ampDiff = Math.abs(m1Amp - m1TargetAmp);
      if (freqDiff < 0.15 && ampDiff < 0.15) {
        soundFx.playLevelUp();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        gameState.completeChallenge('m1', 100);
        gameState.unlockBadge('wave_tamer');
        btnVerify.textContent = '✓ SINAL TRAVADO COM SUCESSO!';
        btnVerify.style.background = 'var(--pen-pass)';
      } else {
        soundFx.playClick();
        alert(`Sincronia insuficiente (${Math.round(100 - (freqDiff*35 + ampDiff*30))}%)! Ajuste mais a frequência ou amplitude.`);
      }
    });
  }

  // ============================================================
  // MISSION 2: CANHÃO POLAR
  // ============================================================
  function renderMission2(mount) {
    mount.innerHTML = `
      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <span class="section-meta-tag" style="margin: 0;">COORDENADAS POLARES</span>
            <span id="m2-telemetry" style="font-family: var(--font-tech); font-weight: 700; color: var(--bp-ink); background: var(--bp-bg); padding: 0.3rem 0.65rem; border: 1px solid var(--bp-border); font-size: 0.78rem;">
              CANHÃO θ = 45°
            </span>
          </div>
          <canvas id="m2-canvas" width="840" height="480" style="width: 100%; height: 100%;" aria-label="Canhão polar com alvo"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">
              <span>Objetivo da Missão</span>
              <span style="font-size: 0.7rem; color: var(--pen-angle); font-family: var(--font-tech);">NÍVEL MÉDIO</span>
            </h3>
            <p style="font-size: 0.85rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 1rem;">
              O radar detectou uma sonda nas coordenadas cartesianas <strong>X = -0.87</strong> e <strong>Y = +0.50</strong> (raio = 1.0).<br><br>
              Como $X = \\cos(\\theta)$ e $Y = \\sin(\\theta)$, ajuste o ângulo polar $\\theta$ para atingir o alvo!
            </p>

            <div class="control-group">
              <div class="control-label-row">
                <span>Ângulo do Canhão (θ)</span>
                <span id="m2-txt-angle" class="control-value">${m2Angle}°</span>
              </div>
              <input type="range" id="m2-sl-angle" min="0" max="360" step="1" value="${m2Angle}" class="slider-cyan" aria-label="Ângulo do Canhão">
            </div>

            <div class="telemetry-row">
              <span style="color: var(--pen-x);">cos(θ) = <strong id="m2-cos-val">0.71</strong></span>
              <span style="color: var(--pen-y);">sin(θ) = <strong id="m2-sin-val">0.71</strong></span>
            </div>

            <div style="margin-top: 1.25rem;">
              <button class="btn-accent" id="m2-btn-fire" style="width: 100%; justify-content: center;" aria-label="Disparar Canhão">
                💥 DISPARAR CANHÃO (+150 XP)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = mount.querySelector('#m2-canvas');
    const ctx = canvas.getContext('2d');
    const slAngle = mount.querySelector('#m2-sl-angle');
    const txtAngle = mount.querySelector('#m2-txt-angle');
    const cosValEl = mount.querySelector('#m2-cos-val');
    const sinValEl = mount.querySelector('#m2-sin-val');
    const telemetry = mount.querySelector('#m2-telemetry');
    const btnFire = mount.querySelector('#m2-btn-fire');

    let laserFired = false;
    let laserTime = 0;

    slAngle.addEventListener('input', (e) => {
      m2Angle = parseFloat(e.target.value);
      txtAngle.textContent = `${m2Angle}°`;
      telemetry.textContent = `CANHÃO θ = ${m2Angle}°`;
      const rad = (m2Angle * Math.PI) / 180;
      cosValEl.textContent = Math.cos(rad).toFixed(2);
      sinValEl.textContent = Math.sin(rad).toFixed(2);
    });

    function loop() {
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const R = 170;

      // Coordinate axes
      ctx.strokeStyle = colors.gridMinor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - R - 30, cy);
      ctx.lineTo(cx + R + 30, cy);
      ctx.moveTo(cx, cy - R - 30);
      ctx.lineTo(cx + R + 30, cy);
      ctx.stroke();

      // Range ring
      ctx.strokeStyle = colors.gridMajor;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Target Satellite at 150 deg (cos = -0.87, sin = 0.5)
      const targetRad = (m2TargetAngle * Math.PI) / 180;
      const tx = cx + Math.cos(targetRad) * R;
      const ty = cy - Math.sin(targetRad) * R;

      // Draw Target
      ctx.fillStyle = colors.isLight ? 'rgba(185, 28, 28, 0.15)' : 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(tx, ty, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colors.penAlert;
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.penAlert;
      ctx.fillText('ALVO (-0.87, 0.50)', tx - 65, ty - 18);

      // Draw Cannon at origin
      const currentRad = (m2Angle * Math.PI) / 180;
      const barrelLen = 50;
      const bx = cx + Math.cos(currentRad) * barrelLen;
      const by = cy - Math.sin(currentRad) * barrelLen;

      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Cannon base
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();

      // If Laser Fired
      if (laserFired) {
        laserTime += 0.05;
        const lx = cx + Math.cos(currentRad) * (R + 40);
        const ly = cy - Math.sin(currentRad) * (R + 40);

        ctx.strokeStyle = colors.penX;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(lx, ly);
        ctx.stroke();

        if (laserTime > 1.0) laserFired = false;
      }

      animId = requestAnimationFrame(loop);
    }
    loop();

    btnFire.addEventListener('click', () => {
      soundFx.playLaser();
      laserFired = true;
      laserTime = 0;

      if (Math.abs(m2Angle - m2TargetAngle) <= 3) {
        setTimeout(() => {
          soundFx.playLevelUp();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          gameState.completeChallenge('m2', 100);
          btnFire.textContent = '✓ ALVO DESTRUÍDO COM SUCESSO!';
          btnFire.style.background = 'var(--pen-pass)';
        }, 300);
      } else {
        setTimeout(() => {
          alert(`Errou o alvo! O canhão disparou em ${m2Angle}°. Dica: no 2º quadrante (entre 90° e 180°), o cosseno é negativo e o seno é positivo!`);
        }, 400);
      }
    });
  }

  // ============================================================
  // MISSION 3: ACOPLAMENTO DA NAVE (ROTAÇÃO 90°)
  // ============================================================
  function renderMission3(mount) {
    mount.innerHTML = `
      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <span class="section-meta-tag" style="margin: 0;">ÁLGEBRA LINEAR</span>
            <span id="m3-dock-badge" style="font-family: var(--font-tech); font-weight: 700; color: var(--bp-ink); background: var(--bp-bg); padding: 0.3rem 0.65rem; border: 1px solid var(--bp-border); font-size: 0.78rem;">
              ACOPLAMENTO: DESALINHADO
            </span>
          </div>
          <canvas id="m3-canvas" width="840" height="480" style="width: 100%; height: 100%;" aria-label="Acoplamento matricial"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">
              <span>Objetivo da Missão</span>
              <span style="font-size: 0.7rem; color: var(--pen-angle); font-family: var(--font-tech);">NÍVEL MÉDIO</span>
            </h3>
            <p style="font-size: 0.85rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 1rem;">
              A estação orbital exige uma <strong>rotação de 90° no sentido anti-horário</strong> para alinhar a nave com o hangar.<br><br>
              Ajuste as colunas da matriz para os destinos de î e ĵ:
              <br>• Para onde vai $\\hat{i} = (1, 0)$ após girar 90°?
              <br>• Para onde vai $\\hat{j} = (0, 1)$ após girar 90°?
            </p>

            <div class="matrix-bracket-view">
              <span style="font-family: var(--font-tech); font-size: 1.2rem; color: var(--bp-ink); margin-right: 0.4rem; font-weight: 700;">M =</span>
              <div class="matrix-grid-input">
                <input type="number" step="1" id="m3-ix" value="1" class="matrix-cell-input col-i" title="î_x" aria-label="î_x">
                <input type="number" step="1" id="m3-jx" value="0" class="matrix-cell-input col-j" title="ĵ_x" aria-label="ĵ_x">
                <input type="number" step="1" id="m3-iy" value="0" class="matrix-cell-input col-i" title="î_y" aria-label="î_y">
                <input type="number" step="1" id="m3-jy" value="1" class="matrix-cell-input col-j" title="ĵ_y" aria-label="ĵ_y">
              </div>
            </div>

            <div style="margin-top: 1.25rem;">
              <button class="btn-primary" id="m3-btn-dock" style="width: 100%; justify-content: center;" aria-label="Confirmar Acoplamento">
                CONFIRMAR ACOPLAMENTO (+150 XP)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = mount.querySelector('#m3-canvas');
    const ctx = canvas.getContext('2d');
    const inpIx = mount.querySelector('#m3-ix');
    const inpIy = mount.querySelector('#m3-iy');
    const inpJx = mount.querySelector('#m3-jx');
    const inpJy = mount.querySelector('#m3-jy');
    const dockBadge = mount.querySelector('#m3-dock-badge');
    const btnDock = mount.querySelector('#m3-btn-dock');

    const updateMat = () => {
      m3_i = [parseFloat(inpIx.value) || 0, parseFloat(inpIy.value) || 0];
      m3_j = [parseFloat(inpJx.value) || 0, parseFloat(inpJy.value) || 0];
    };

    [inpIx, inpIy, inpJx, inpJy].forEach(inp => inp.addEventListener('input', updateMat));

    function loop() {
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = 80;

      // Target Hangar Silhouette
      ctx.strokeStyle = colors.penPass;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(cx - scale * 1.5, cy - scale * 0.7, scale * 2.0, scale * 1.4);
      ctx.setLineDash([]);

      ctx.fillStyle = colors.penPass;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText('PORTAL DE ACOPLAMENTO 90°', cx - scale * 1.4, cy - scale * 0.9);

      // Draw User Ship Transformed
      const [ix, iy] = m3_i;
      const [jx, jy] = m3_j;

      const shipLocal = [
        { x: 0, y: 1.4 },
        { x: 0.6, y: -0.6 },
        { x: 0, y: -0.3 },
        { x: -0.6, y: -0.6 }
      ];

      const userShip = shipLocal.map(p => {
        const tx = ix * p.x + jx * p.y;
        const ty = iy * p.x + jy * p.y;
        return {
          px: cx + tx * scale,
          py: cy - ty * scale
        };
      });

      const isMatched = (ix === 0 && iy === 1 && jx === -1 && jy === 0);

      ctx.fillStyle = isMatched 
        ? (colors.isLight ? 'rgba(4, 120, 87, 0.2)' : 'rgba(16, 185, 129, 0.25)') 
        : (colors.isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(56, 189, 248, 0.2)');
      ctx.strokeStyle = isMatched ? colors.penPass : colors.penX;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(userShip[0].px, userShip[0].py);
      for (let i = 1; i < userShip.length; i++) {
        ctx.lineTo(userShip[i].px, userShip[i].py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (dockBadge) {
        dockBadge.textContent = isMatched ? 'ACOPLAMENTO: ALINHADO COM SUCESSO' : 'ACOPLAMENTO: DESALINHADO';
        dockBadge.style.color = isMatched ? colors.penPass : colors.penAlert;
      }

      animId = requestAnimationFrame(loop);
    }
    loop();

    btnDock.addEventListener('click', () => {
      const [ix, iy] = m3_i;
      const [jx, jy] = m3_j;
      if (ix === 0 && iy === 1 && jx === -1 && jy === 0) {
        soundFx.playLevelUp();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        gameState.completeChallenge('m3', 100);
        gameState.unlockBadge('matrix_pilot');
        btnDock.textContent = '✓ ACOPLAMENTO BEM-SUCEDIDO!';
        btnDock.style.background = 'var(--pen-pass)';
      } else {
        soundFx.playClick();
        alert('Matriz incorreta! Dica: Ao girar 90°, o vetor î(1,0) sobe para (0,1), e o vetor ĵ(0,1) vira para a esquerda (-1,0)!');
      }
    });
  }

  // ============================================================
  // MISSION 4: CISALHAMENTO (ÁREA CONSTANTE)
  // ============================================================
  function renderMission4(mount) {
    mount.innerHTML = `
      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <span class="section-meta-tag" style="margin: 0;">DETERMINANTE & ÁREA</span>
            <span id="m4-det-badge" style="font-family: var(--font-tech); font-weight: 700; color: var(--bp-ink); background: var(--bp-bg); padding: 0.3rem 0.65rem; border: 1px solid var(--bp-border); font-size: 0.78rem;">
              det(M) = 1.00
            </span>
          </div>
          <canvas id="m4-canvas" width="840" height="480" style="width: 100%; height: 100%;" aria-label="Cisalhamento e conservação de área"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">
              <span>Objetivo da Missão</span>
              <span style="font-size: 0.7rem; color: var(--pen-angle); font-family: var(--font-tech);">NÍVEL MÉDIO</span>
            </h3>
            <p style="font-size: 0.85rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 1rem;">
              Ajuste o fator de <strong>Cisalhamento X</strong> para exatamente <strong>1.5</strong>. Observe o determinante:<br><br>
              A área do paralelogramo permanece <strong>igual a 1.00</strong> mesmo inclinado (Princípio de Cavalieri).
            </p>

            <div class="control-group">
              <div class="control-label-row">
                <span>Fator de Cisalhamento (Shear X)</span>
                <span id="m4-txt-shear" class="control-value">${m4Shear.toFixed(1)}</span>
              </div>
              <input type="range" id="m4-sl-shear" min="0" max="2.5" step="0.1" value="${m4Shear}" class="slider-gold" aria-label="Cisalhamento X">
            </div>

            <div style="margin-top: 1.25rem;">
              <button class="btn-primary" id="m4-btn-verify" style="width: 100%; justify-content: center;" aria-label="Validar Descoberta">
                VALIDAR DESCOBERTA (+150 XP)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = mount.querySelector('#m4-canvas');
    const ctx = canvas.getContext('2d');
    const slShear = mount.querySelector('#m4-sl-shear');
    const txtShear = mount.querySelector('#m4-txt-shear');
    const detBadge = mount.querySelector('#m4-det-badge');
    const btnVerify = mount.querySelector('#m4-btn-verify');

    slShear.addEventListener('input', (e) => {
      m4Shear = parseFloat(e.target.value);
      txtShear.textContent = m4Shear.toFixed(1);
    });

    function loop() {
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2 - 40;
      const cy = canvas.height / 2 + 50;
      const scale = 110;

      const a = 1, c = 0;
      const b = m4Shear, d = 1;

      const p00 = { x: cx, y: cy };
      const p10 = { x: cx + a * scale, y: cy - c * scale };
      const p11 = { x: cx + (a + b) * scale, y: cy - (c + d) * scale };
      const p01 = { x: cx + b * scale, y: cy - d * scale };

      // Parallelogram
      ctx.fillStyle = colors.isLight ? 'rgba(109, 40, 217, 0.15)' : 'rgba(192, 132, 252, 0.25)';
      ctx.strokeStyle = colors.penArea;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // î and ĵ
      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.stroke();

      ctx.strokeStyle = colors.penY;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.stroke();

      if (detBadge) {
        detBadge.textContent = `det(M) = ${(a * d - b * c).toFixed(2)} (ÁREA PRESERVADA!)`;
      }

      animId = requestAnimationFrame(loop);
    }
    loop();

    btnVerify.addEventListener('click', () => {
      if (Math.abs(m4Shear - 1.5) < 0.05) {
        soundFx.playLevelUp();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        gameState.completeChallenge('m4', 100);
        btnVerify.textContent = '✓ DESCOBERTA VALIDADA!';
        btnVerify.style.background = 'var(--pen-pass)';
      } else {
        alert('Ajuste o slider de cisalhamento para exatamente 1.5!');
      }
    });
  }

  // ============================================================
  // MISSION 5: DOBRA 3D
  // ============================================================
  function renderMission5(mount) {
    mount.innerHTML = `
      <div class="sandbox-container">
        <div class="sandbox-canvas-panel">
          <div class="sandbox-toolbar">
            <span class="section-meta-tag" style="margin: 0;">NAVEGAÇÃO 3D</span>
            <span id="m5-align-badge" style="font-family: var(--font-tech); font-weight: 700; color: var(--bp-ink); background: var(--bp-bg); padding: 0.3rem 0.65rem; border: 1px solid var(--bp-border); font-size: 0.78rem;">
              ALINHAMENTO: 0%
            </span>
          </div>
          <canvas id="m5-canvas" width="840" height="480" style="width: 100%; height: 100%;" aria-label="Alinhamento 3D"></canvas>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">
              <span>Objetivo da Missão</span>
              <span style="font-size: 0.7rem; color: var(--pen-alert); font-family: var(--font-tech);">NÍVEL AVANÇADO</span>
            </h3>
            <p style="font-size: 0.85rem; color: var(--bp-ink-secondary); line-height: 1.5; margin-bottom: 1rem;">
              Para atravessar a fenda espacial, a matriz de orientação da nave deve ter <strong>Pitch = 45°</strong> e <strong>Yaw = 90°</strong>. Alinhe o vetor de voo com o anel de teletransporte!
            </p>

            <div class="control-group">
              <div class="control-label-row">
                <span>Pitch (Inclinação Vertical)</span>
                <span id="m5-txt-pitch" class="control-value">${m5Pitch}°</span>
              </div>
              <input type="range" id="m5-sl-pitch" min="-90" max="90" value="${m5Pitch}" class="slider-cyan" aria-label="Pitch">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span>Yaw (Giro Horizontal)</span>
                <span id="m5-txt-yaw" class="control-value">${m5Yaw}°</span>
              </div>
              <input type="range" id="m5-sl-yaw" min="0" max="180" value="${m5Yaw}" class="slider-gold" aria-label="Yaw">
            </div>

            <div style="margin-top: 1.25rem;">
              <button class="btn-primary" id="m5-btn-jump" style="width: 100%; justify-content: center;" aria-label="Entrar na Dobra">
                ENTRAR NA DOBRA (+200 XP)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = mount.querySelector('#m5-canvas');
    const ctx = canvas.getContext('2d');
    const slPitch = mount.querySelector('#m5-sl-pitch');
    const slYaw = mount.querySelector('#m5-sl-yaw');
    const txtPitch = mount.querySelector('#m5-txt-pitch');
    const txtYaw = mount.querySelector('#m5-txt-yaw');
    const alignBadge = mount.querySelector('#m5-align-badge');
    const btnJump = mount.querySelector('#m5-btn-jump');

    slPitch.addEventListener('input', (e) => {
      m5Pitch = parseFloat(e.target.value);
      txtPitch.textContent = `${m5Pitch}°`;
    });

    slYaw.addEventListener('input', (e) => {
      m5Yaw = parseFloat(e.target.value);
      txtYaw.textContent = `${m5Yaw}°`;
    });

    let t = 0;
    function loop() {
      t += 0.03;
      const colors = getThemeColors();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Portal ring
      ctx.strokeStyle = colors.penArea;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(cx + 80, cy - 60, 60, 90, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      // Flight Direction Vector
      const radPitch = (m5Pitch * Math.PI) / 180;
      const radYaw = (m5Yaw * Math.PI) / 180;

      const vecLen = 140;
      const vx = cx + Math.sin(radYaw) * vecLen;
      const vy = cy - Math.sin(radPitch) * vecLen;

      ctx.strokeStyle = colors.penX;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(vx, vy);
      ctx.stroke();

      // Calculation of alignment
      const pitchErr = Math.abs(m5Pitch - 45);
      const yawErr = Math.abs(m5Yaw - 90);
      const score = Math.max(0, Math.min(100, Math.round(100 - (pitchErr * 1.5 + yawErr * 1.2))));

      if (alignBadge) {
        alignBadge.textContent = `ALINHAMENTO: ${score}%`;
        alignBadge.style.color = score >= 90 ? colors.penPass : colors.penAlert;
      }

      animId = requestAnimationFrame(loop);
    }
    loop();

    btnJump.addEventListener('click', () => {
      if (Math.abs(m5Pitch - 45) <= 5 && Math.abs(m5Yaw - 90) <= 5) {
        soundFx.playWarp();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        gameState.completeChallenge('m5', 100);
        gameState.unlockBadge('linear_grandmaster');
        btnJump.textContent = '✓ DOBRA BEM-SUCEDIDA!';
        btnJump.style.background = 'var(--pen-pass)';
      } else {
        alert('Alinhamento insuficiente! Ajuste o Pitch para 45° e o Yaw para 90°!');
      }
    });
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (animId) cancelAnimationFrame(animId);
    }
  };
}
