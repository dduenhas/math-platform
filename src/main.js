import './styles/main.css';
import 'katex/dist/katex.min.css';
import { createNavbar } from './components/Navbar.js';
import { createLandingPage } from './components/LandingPage.js';
import { createLearnHub } from './components/LearnHub.js';
import { createTrigSandbox } from './components/TrigSandbox.js';
import { createMatrixSandbox2D } from './components/MatrixSandbox2D.js';
import { createMatrixSandbox3D } from './components/MatrixSandbox3D.js';
import { createChallenges } from './components/Challenges.js';
import { createRealWorldCases } from './components/RealWorldCases.js';
import { gameState } from './state/gameState.js';
import { soundFx } from './audio/soundFx.js';

class App {
  constructor() {
    this.root = document.getElementById('app');
    this.currentTab = 'landing';
    this.activeComponent = null;
    this.navbar = null;
    this.mainContent = null;

    this.init();
  }

  init() {
    // Clear root
    this.root.innerHTML = '';

    // Create Navbar
    this.navbar = createNavbar((tabId) => this.navigateTo(tabId), this.currentTab);
    this.root.appendChild(this.navbar.element);

    // Create Main Content Wrapper
    this.mainContent = document.createElement('main');
    this.mainContent.className = 'main-content';
    this.root.appendChild(this.mainContent);

    // Mount initial tab
    this.mountTab(this.currentTab);

    // Initial audio unlock on first user interaction
    const unlockAudio = () => {
      soundFx.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
  }

  navigateTo(tabId) {
    if (this.currentTab === tabId) return;

    this.currentTab = tabId;
    if (this.navbar && this.navbar.setActiveTab) {
      this.navbar.setActiveTab(tabId);
    }
    this.mountTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  mountTab(tabId) {
    // Clean up active component
    if (this.activeComponent && this.activeComponent.destroy) {
      this.activeComponent.destroy();
      this.activeComponent = null;
    }

    this.mainContent.innerHTML = '';

    switch (tabId) {
      case 'landing':
        this.activeComponent = createLandingPage((targetTab) => this.navigateTo(targetTab));
        break;
      case 'learn':
        this.activeComponent = createLearnHub((targetTab) => this.navigateTo(targetTab));
        break;
      case 'trig-sandbox':
        this.activeComponent = createTrigSandbox();
        break;
      case 'matrix-2d-sandbox':
        this.activeComponent = createMatrixSandbox2D();
        break;
      case 'matrix-3d-sandbox':
        this.activeComponent = createMatrixSandbox3D();
        break;
      case 'challenges':
        this.activeComponent = createChallenges((targetTab) => this.navigateTo(targetTab));
        break;
      case 'real-world':
        this.activeComponent = createRealWorldCases();
        break;
      default:
        this.activeComponent = createLandingPage((targetTab) => this.navigateTo(targetTab));
    }

    if (this.activeComponent && this.activeComponent.element) {
      this.mainContent.appendChild(this.activeComponent.element);
    }
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
