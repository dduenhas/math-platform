import * as THREE from 'three';
import katex from 'katex';
import { gameState } from '../state/gameState.js';
import { soundFx } from '../audio/soundFx.js';
import { getThemeColors } from '../utils/themeColors.js';

export function createMatrixSandbox3D() {
  const container = document.createElement('div');
  container.className = 'sandbox-page';

  let scene, camera, renderer;
  let cubeGroup, shipGroup, helixLine;
  let arrowI, arrowJ, arrowK;
  let gridHelper;
  let animId = null;
  let resizeObserver = null;
  let lastThemeIsLight = null;

  // Transform parameters
  let rotX = 0, rotY = 0, rotZ = 0;
  let scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0;
  let shearXY = 0.0;
  let autoRotate = true;
  let activeMode = 'cube'; // 'cube' | 'ship' | 'helix'

  function render() {
    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <div class="section-icon-badge">03</div>
          <div>
            <div class="section-meta-tag">PRANCHA TÉCNICA 03 // BNCC EM13MAT501</div>
            <h2 class="section-title">Laboratório Tridimensional WebGL: Matrizes & Orientação Espacial</h2>
            <p class="section-subtitle">Renderização 3D contínua: Transformação de volumes, rotações de Euler em naves espaciais e deformações no espaço $\\mathbb{R}^3$</p>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <div class="canvas-badge-group">
            <span style="color: var(--pen-area); font-weight: 700;">VOL. DETERMINANTE: <span id="telemetry-vol-det">1.00</span>x</span>
          </div>

          <button class="btn-primary" id="btn-toggle-autorotate" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" aria-label="Pausar ou Iniciar Órbita Automática">
            ${autoRotate ? '⏸ PAUSAR ÓRBITA' : '▶ ORBITAR'}
          </button>
          <button class="btn-secondary" id="btn-reset-3d" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" aria-label="Redefinir Transformações 3D">
            ↺ REDEFINIR
          </button>
        </div>
      </div>

      <div class="sandbox-container">
        <div class="sandbox-canvas-panel" style="position: relative; min-height: 520px;">
          <div class="sandbox-toolbar">
            <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
              <button class="preset-btn active" id="btn-3d-cube">[1] CUBO UNITÁRIO</button>
              <button class="preset-btn" id="btn-3d-ship">[2] ESPAÇONAVE 3D</button>
              <button class="preset-btn" id="btn-3d-helix">[3] ONDA HELICOIDAL</button>
            </div>
            <span style="font-size: 0.75rem; color: var(--bp-ink-secondary); background: var(--bp-bg); padding: 0.25rem 0.65rem; border: 1px solid var(--bp-border); font-family: var(--font-tech);">
              ARRASte PARA ORBITAR • RODA / PINÇA PARA ZOOM
            </span>
          </div>

          <div id="threejs-mount" style="width: 100%; height: 540px; position: relative;" role="region" aria-label="Visualização Tridimensional Interativa"></div>
        </div>

        <div class="sandbox-controls-panel">
          <div class="control-card">
            <h3 class="control-title">A Matriz 3x3 Resultante</h3>
            <div id="katex-3d-matrix" style="padding: 0.6rem; text-align: center; background: var(--bp-bg); margin-bottom: 0.75rem; border: 1px solid var(--bp-border);"></div>

            <div class="telemetry-row">
              <span style="color: var(--bp-ink-secondary);">Fator de Escala de Volume (det):</span>
              <span id="det-vol-display" class="telemetry-val" style="color: var(--pen-area);">1.00x</span>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-top: 0.5rem; font-family: var(--font-tech); flex-wrap: wrap; gap: 0.3rem;">
              <span style="color: var(--pen-x);">■ Col 1: î (Eixo X)</span>
              <span style="color: var(--pen-y);">■ Col 2: ĵ (Eixo Y)</span>
              <span style="color: var(--pen-angle);">■ Col 3: k̂ (Eixo Z)</span>
            </div>
          </div>

          <div class="control-card">
            <h3 class="control-title">Rotações nos Eixos Principais</h3>
            <div class="control-group">
              <div class="control-label-row">
                <span style="color: var(--pen-x);">Pitch (Giro em torno de X)</span>
                <span id="txt-rx" class="control-value">0°</span>
              </div>
              <input type="range" id="slider-rx" min="-180" max="180" value="0" class="slider-cyan" aria-label="Rotação em X">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span style="color: var(--pen-y);">Yaw (Giro em torno de Y)</span>
                <span id="txt-ry" class="control-value">0°</span>
              </div>
              <input type="range" id="slider-ry" min="-180" max="180" value="0" class="slider-magenta" aria-label="Rotação em Y">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span style="color: var(--pen-angle);">Roll (Giro em torno de Z)</span>
                <span id="txt-rz" class="control-value">0°</span>
              </div>
              <input type="range" id="slider-rz" min="-180" max="180" value="0" class="slider-gold" aria-label="Rotação em Z">
            </div>
          </div>

          <div class="control-card">
            <h3 class="control-title">Escala e Deformação no Espaço</h3>
            <div class="control-group">
              <div class="control-label-row">
                <span>Escala Global (Sx, Sy, Sz)</span>
                <span id="txt-scale" class="control-value">1.0x</span>
              </div>
              <input type="range" id="slider-scale-all" min="0.3" max="2.2" step="0.1" value="1.0" class="slider-gold" aria-label="Escala Global">
            </div>

            <div class="control-group">
              <div class="control-label-row">
                <span>Cisalhamento Espacial (Shear XY)</span>
                <span id="txt-shear" class="control-value">0.0</span>
              </div>
              <input type="range" id="slider-shear" min="-1.5" max="1.5" step="0.1" value="0.0" aria-label="Cisalhamento XY">
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize Three.js after DOM mount
    requestAnimationFrame(() => {
      initThree();
      setupControls();
    });
  }

  function initThree() {
    const mount = container.querySelector('#threejs-mount');
    if (!mount) return;

    const initialWidth = mount.clientWidth || 800;
    const initialHeight = mount.clientHeight || 540;

    const colors = getThemeColors();
    lastThemeIsLight = colors.isLight;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.threeBg);

    // Camera
    camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 100);
    camera.position.set(4.5, 3.8, 5.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, colors.isLight ? 1.4 : 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(6, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.2);
    fillLight.position.set(-6, -3, -5);
    scene.add(fillLight);

    // Grid Floor
    gridHelper = new THREE.GridHelper(10, 20, colors.threeGrid, colors.threeSubGrid);
    gridHelper.position.y = -1.8;
    scene.add(gridHelper);

    // Static Axis Guides (Origin)
    const axesOrigin = new THREE.AxesHelper(2.5);
    scene.add(axesOrigin);

    // 1. UNIT CUBE GROUP
    cubeGroup = new THREE.Group();
    
    const faceMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }), // +X (Cyan)
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }), // -X
      new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }), // +Y (Crimson)
      new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }), // -Y
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }), // +Z (Amber)
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 })  // -Z
    ];

    const cubeGeo = new THREE.BoxGeometry(2.0, 2.0, 2.0);
    const cubeMesh = new THREE.Mesh(cubeGeo, faceMaterials);
    cubeGroup.add(cubeMesh);

    // Wireframe Edges
    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: colors.isLight ? 0x09182b : 0xf0f6fc, linewidth: 2 });
    const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);
    cubeGroup.add(edgesMesh);

    scene.add(cubeGroup);

    // 2. 3D SCI-FI SPACESHIP MODEL
    shipGroup = new THREE.Group();
    shipGroup.visible = false;

    // Fuselage
    const fuselageGeo = new THREE.ConeGeometry(0.7, 3.0, 6);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselageMat = new THREE.MeshStandardMaterial({ color: 0x334e68, roughness: 0.3, metalness: 0.7 });
    const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
    shipGroup.add(fuselage);

    // Canopy Glass
    const canopyGeo = new THREE.SphereGeometry(0.45, 16, 16);
    canopyGeo.scale(0.8, 0.7, 1.6);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.4, roughness: 0.1 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.3, 0.2);
    shipGroup.add(canopy);

    // Delta Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(2.2, -1.0);
    wingShape.lineTo(2.0, -1.4);
    wingShape.lineTo(0, -0.6);
    wingShape.closePath();

    const wingExtrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
    wingGeo.rotateX(Math.PI / 2);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.5 });

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0, 0, 0);
    shipGroup.add(rightWing);

    const leftWing = rightWing.clone();
    leftWing.scale.set(-1, 1, 1);
    shipGroup.add(leftWing);

    // Thruster Jets
    const thrusterGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 12);
    thrusterGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, emissive: 0xbe123c, emissiveIntensity: 0.7 });
    const thruster1 = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster1.position.set(0.4, 0, -1.5);
    shipGroup.add(thruster1);
    const thruster2 = thruster1.clone();
    thruster2.position.set(-0.4, 0, -1.5);
    shipGroup.add(thruster2);

    scene.add(shipGroup);

    // 3. 3D HELICAL WAVE
    const helixPoints = [];
    const turns = 4;
    const count = 400;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * (Math.PI * 2 * turns);
      const x = Math.cos(t) * 1.4;
      const y = Math.sin(t) * 1.4;
      const z = (i / count) * 6.0 - 3.0;
      helixPoints.push(new THREE.Vector3(x, y, z));
    }
    const helixGeo = new THREE.BufferGeometry().setFromPoints(helixPoints);
    const helixMat = new THREE.LineBasicMaterial({ color: 0xb45309, linewidth: 3 });
    helixLine = new THREE.Line(helixGeo, helixMat);
    helixLine.visible = false;
    scene.add(helixLine);

    // 4. DYNAMIC 3D BASIS VECTORS ARROWS (î, ĵ, k̂)
    arrowI = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 2.5, 0x0284c7, 0.4, 0.25);
    arrowJ = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2.5, 0xbe123c, 0.4, 0.25);
    arrowK = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 2.5, 0xb45309, 0.4, 0.25);
    scene.add(arrowI);
    scene.add(arrowJ);
    scene.add(arrowK);

    // ORBIT CONTROLS VIA MOUSE & TOUCH
    let isMouseDown = false;
    let prevMouseX = 0, prevMouseY = 0;
    let cameraAngleTheta = Math.atan2(camera.position.x, camera.position.z);
    let cameraAnglePhi = Math.atan2(camera.position.y, Math.hypot(camera.position.x, camera.position.z));
    let cameraRadius = camera.position.length();

    const onStart = (clientX, clientY) => {
      isMouseDown = true;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onMove = (clientX, clientY) => {
      if (!isMouseDown) return;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      cameraAngleTheta -= deltaX * 0.008;
      cameraAnglePhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraAnglePhi + deltaY * 0.008));

      camera.position.x = cameraRadius * Math.cos(cameraAnglePhi) * Math.sin(cameraAngleTheta);
      camera.position.y = cameraRadius * Math.sin(cameraAnglePhi);
      camera.position.z = cameraRadius * Math.cos(cameraAnglePhi) * Math.cos(cameraAngleTheta);
      camera.lookAt(0, 0, 0);
    };

    const onEnd = () => { isMouseDown = false; };

    renderer.domElement.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    // Touch
    renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isMouseDown && e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', onEnd);

    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      cameraRadius = Math.max(2.5, Math.min(15, cameraRadius + e.deltaY * 0.005));
      camera.position.x = cameraRadius * Math.cos(cameraAnglePhi) * Math.sin(cameraAngleTheta);
      camera.position.y = cameraRadius * Math.sin(cameraAnglePhi);
      camera.position.z = cameraRadius * Math.cos(cameraAnglePhi) * Math.cos(cameraAngleTheta);
      camera.lookAt(0, 0, 0);
    }, { passive: false });

    // Handle Resize
    resizeObserver = new ResizeObserver(() => {
      if (!mount || !renderer || !camera) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(mount);

    // Render loop
    function animate() {
      // Dynamic Theme Check
      const curColors = getThemeColors();
      if (curColors.isLight !== lastThemeIsLight) {
        lastThemeIsLight = curColors.isLight;
        scene.background.set(curColors.threeBg);
        scene.remove(gridHelper);
        gridHelper = new THREE.GridHelper(10, 20, curColors.threeGrid, curColors.threeSubGrid);
        gridHelper.position.y = -1.8;
        scene.add(gridHelper);
      }

      // Auto Orbit
      if (autoRotate && !isMouseDown) {
        cameraAngleTheta += 0.004;
        camera.position.x = cameraRadius * Math.cos(cameraAnglePhi) * Math.sin(cameraAngleTheta);
        camera.position.z = cameraRadius * Math.cos(cameraAnglePhi) * Math.cos(cameraAngleTheta);
        camera.lookAt(0, 0, 0);
      }

      if (mount && renderer) {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        if (w > 0 && h > 0 && (renderer.domElement.width !== w || renderer.domElement.height !== h)) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }

      apply3DTransformation(curColors);
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    }

    animate();
  }

  function apply3DTransformation(colors) {
    if (!cubeGroup && !shipGroup) return;

    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const radZ = (rotZ * Math.PI) / 180;

    const rotEuler = new THREE.Euler(radX, radY, radZ, 'XYZ');
    const rotMat = new THREE.Matrix4().makeRotationFromEuler(rotEuler);
    const scaleMat = new THREE.Matrix4().makeScale(scaleX, scaleY, scaleZ);

    const shearMat = new THREE.Matrix4();
    shearMat.elements[4] = shearXY;

    const compositeMat = new THREE.Matrix4();
    compositeMat.multiplyMatrices(shearMat, rotMat);
    compositeMat.multiply(scaleMat);

    if (cubeGroup) {
      cubeGroup.matrix.copy(compositeMat);
      cubeGroup.matrixAutoUpdate = false;
    }
    if (shipGroup) {
      shipGroup.matrix.copy(compositeMat);
      shipGroup.matrixAutoUpdate = false;
    }
    if (helixLine) {
      helixLine.matrix.copy(compositeMat);
      helixLine.matrixAutoUpdate = false;
    }

    // Update dynamic basis vector arrows based on matrix columns
    const e = compositeMat.elements;
    const vI = new THREE.Vector3(e[0], e[1], e[2]);
    const lenI = Math.max(0.1, vI.length());
    arrowI.setDirection(vI.clone().normalize());
    arrowI.setLength(lenI * 1.5, lenI * 0.25, lenI * 0.15);

    const vJ = new THREE.Vector3(e[4], e[5], e[6]);
    const lenJ = Math.max(0.1, vJ.length());
    arrowJ.setDirection(vJ.clone().normalize());
    arrowJ.setLength(lenJ * 1.5, lenJ * 0.25, lenJ * 0.15);

    const vK = new THREE.Vector3(e[8], e[9], e[10]);
    const lenK = Math.max(0.1, vK.length());
    arrowK.setDirection(vK.clone().normalize());
    arrowK.setLength(lenK * 1.5, lenK * 0.25, lenK * 0.15);

    // Compute determinant
    const det = compositeMat.determinant();
    const detVal = container.querySelector('#telemetry-vol-det');
    const detDisplay = container.querySelector('#det-vol-display');
    if (detVal) detVal.textContent = det.toFixed(2);
    if (detDisplay) detDisplay.textContent = `${det.toFixed(2)}x`;

    // Render KaTeX 3x3 Matrix with current theme colors
    const elKatex = container.querySelector('#katex-3d-matrix');
    if (elKatex && colors) {
      const colX = colors.penX;
      const colY = colors.penY;
      const colZ = colors.penAngle;

      const latex = `M_{3\\times 3} = \\begin{pmatrix} 
        {\\color{${colX}}${e[0].toFixed(1)}} & {\\color{${colY}}${e[4].toFixed(1)}} & {\\color{${colZ}}${e[8].toFixed(1)}} \\\\
        {\\color{${colX}}${e[1].toFixed(1)}} & {\\color{${colY}}${e[5].toFixed(1)}} & {\\color{${colZ}}${e[9].toFixed(1)}} \\\\
        {\\color{${colX}}${e[2].toFixed(1)}} & {\\color{${colY}}${e[6].toFixed(1)}} & {\\color{${colZ}}${e[10].toFixed(1)}}
      \\end{pmatrix}`;
      try {
        katex.render(latex, elKatex, { displayMode: true });
      } catch (err) {}
    }
  }

  function setupControls() {
    const slRx = container.querySelector('#slider-rx');
    const slRy = container.querySelector('#slider-ry');
    const slRz = container.querySelector('#slider-rz');
    const txtRx = container.querySelector('#txt-rx');
    const txtRy = container.querySelector('#txt-ry');
    const txtRz = container.querySelector('#txt-rz');

    const slScale = container.querySelector('#slider-scale-all');
    const txtScale = container.querySelector('#txt-scale');

    const slShear = container.querySelector('#slider-shear');
    const txtShear = container.querySelector('#txt-shear');

    const btnAuto = container.querySelector('#btn-toggle-autorotate');
    const btnReset = container.querySelector('#btn-reset-3d');

    slRx?.addEventListener('input', (e) => {
      rotX = parseFloat(e.target.value);
      if (txtRx) txtRx.textContent = `${rotX}°`;
    });

    slRy?.addEventListener('input', (e) => {
      rotY = parseFloat(e.target.value);
      if (txtRy) txtRy.textContent = `${rotY}°`;
    });

    slRz?.addEventListener('input', (e) => {
      rotZ = parseFloat(e.target.value);
      if (txtRz) txtRz.textContent = `${rotZ}°`;
    });

    slScale?.addEventListener('input', (e) => {
      const s = parseFloat(e.target.value);
      scaleX = scaleY = scaleZ = s;
      if (txtScale) txtScale.textContent = `${s.toFixed(1)}x`;
    });

    slShear?.addEventListener('input', (e) => {
      shearXY = parseFloat(e.target.value);
      if (txtShear) txtShear.textContent = shearXY.toFixed(1);
    });

    btnAuto?.addEventListener('click', () => {
      soundFx.playClick();
      autoRotate = !autoRotate;
      btnAuto.textContent = autoRotate ? '⏸ PAUSAR ÓRBITA' : '▶ ORBITAR';
    });

    btnReset?.addEventListener('click', () => {
      soundFx.playClick();
      rotX = rotY = rotZ = 0;
      scaleX = scaleY = scaleZ = 1.0;
      shearXY = 0;

      if (slRx) slRx.value = 0;
      if (slRy) slRy.value = 0;
      if (slRz) slRz.value = 0;
      if (slScale) slScale.value = 1.0;
      if (slShear) slShear.value = 0.0;

      if (txtRx) txtRx.textContent = '0°';
      if (txtRy) txtRy.textContent = '0°';
      if (txtRz) txtRz.textContent = '0°';
      if (txtScale) txtScale.textContent = '1.0x';
      if (txtShear) txtShear.textContent = '0.0';
    });

    // Model toggles
    const set3DMode = (mode) => {
      soundFx.playClick();
      activeMode = mode;

      if (cubeGroup) cubeGroup.visible = (mode === 'cube');
      if (shipGroup) shipGroup.visible = (mode === 'ship');
      if (helixLine) helixLine.visible = (mode === 'helix');

      container.querySelector('#btn-3d-cube')?.classList.toggle('active', mode === 'cube');
      container.querySelector('#btn-3d-ship')?.classList.toggle('active', mode === 'ship');
      container.querySelector('#btn-3d-helix')?.classList.toggle('active', mode === 'helix');
    };

    container.querySelector('#btn-3d-cube')?.addEventListener('click', () => set3DMode('cube'));
    container.querySelector('#btn-3d-ship')?.addEventListener('click', () => set3DMode('ship'));
    container.querySelector('#btn-3d-helix')?.addEventListener('click', () => set3DMode('helix'));
  }

  render();

  return {
    element: container,
    destroy: () => {
      if (animId) cancelAnimationFrame(animId);
      if (resizeObserver) resizeObserver.disconnect();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    }
  };
}
