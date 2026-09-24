import confetti from 'canvas-confetti';
import { soundFx } from '../audio/soundFx.js';

const STORAGE_KEY = 'mathverse_gamestate_v1';

export const BADGES = [
  {
    id: 'first_step',
    name: 'Primeiro Passo',
    desc: 'Iniciou sua jornada pela geometria intuitiva.',
    icon: 'compass',
    color: '#00f0ff'
  },
  {
    id: 'circle_master',
    name: 'Mestre do Círculo',
    desc: 'Dominou a rotação completa no círculo trigonométrico.',
    icon: 'circle-dot',
    color: '#ff2a85'
  },
  {
    id: 'wave_tamer',
    name: 'Domador de Frequências',
    desc: 'Desvendou a conexão entre círculos girantes e ondas senoidais.',
    icon: 'activity',
    color: '#00f59b'
  },
  {
    id: 'basis_architect',
    name: 'Arquiteto de Bases',
    desc: 'Compreendeu os vetores i-chapéu e j-chapéu como colunas de matriz.',
    icon: 'grid',
    color: '#38bdf8'
  },
  {
    id: 'dimension_shifter',
    name: 'Distorcedor do Espaço',
    desc: 'Experimentou com sucesso uma transformação com cisalhamento e escala.',
    icon: 'move-3d',
    color: '#a855f7'
  },
  {
    id: 'matrix_pilot',
    name: 'Piloto Matricial',
    desc: 'Alinhou a rotação de uma espaçonave usando matrizes em tempo real.',
    icon: 'rocket',
    color: '#fbbf24'
  },
  {
    id: 'linear_grandmaster',
    name: 'Grão-Mestre Linear',
    desc: 'Completou todos os desafios com louvor na Arena de Puzzles!',
    icon: 'trophy',
    color: '#ec4899'
  }
];

export const RANKS = [
  { level: 1, title: 'Iniciado da Geometria', minXp: 0 },
  { level: 2, title: 'Explorador Trigonométrico', minXp: 100 },
  { level: 3, title: 'Navegador de Ondas', minXp: 250 },
  { level: 4, title: 'Alquimista Vetorial', minXp: 500 },
  { level: 5, title: 'Distorcedor do Espaço', minXp: 850 },
  { level: 6, title: 'Arquiteto 3D', minXp: 1300 },
  { level: 7, title: 'Mestre das Dimensões', minXp: 1900 },
  { level: 8, title: 'Grão-Mestre da Álgebra Linear', minXp: 2700 }
];

class GameStateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    const defaultState = {
      xp: 50,
      streak: 1,
      unlockedBadges: ['first_step'],
      completedChallenges: {},
      soundEnabled: true,
      lastActiveDate: new Date().toDateString()
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
    return defaultState;
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save localStorage:', e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.saveState();
    this.listeners.forEach(cb => cb(this.state));
  }

  getRank() {
    const currentXp = this.state.xp;
    let currentRank = RANKS[0];
    let nextRank = RANKS[1] || null;

    for (let i = 0; i < RANKS.length; i++) {
      if (currentXp >= RANKS[i].minXp) {
        currentRank = RANKS[i];
        nextRank = RANKS[i + 1] || null;
      } else {
        break;
      }
    }

    const currentLevelMin = currentRank.minXp;
    const nextLevelMin = nextRank ? nextRank.minXp : currentRank.minXp + 1000;
    const progress = Math.min(100, Math.max(0, ((currentXp - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100));

    return {
      currentRank,
      nextRank,
      progress,
      xpInCurrentLevel: currentXp - currentLevelMin,
      xpForNextLevel: nextLevelMin - currentLevelMin
    };
  }

  addXp(amount, reason = '', eventCoords = null) {
    const prevRank = this.getRank().currentRank.level;
    this.state.xp += amount;
    
    // Check level up
    const newRank = this.getRank().currentRank.level;
    if (newRank > prevRank) {
      soundFx.playLevelUp();
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      soundFx.playSuccess();
    }

    // Trigger visual floating text
    if (eventCoords && typeof document !== 'undefined') {
      this.showFloatingXp(amount, reason, eventCoords.x, eventCoords.y);
    }

    this.notify();
  }

  showFloatingXp(amount, reason, x, y) {
    const el = document.createElement('div');
    el.className = 'xp-float-popup';
    el.textContent = `+${amount} XP ${reason ? `(${reason})` : ''}`;
    el.style.left = `${x || window.innerWidth / 2}px`;
    el.style.top = `${(y || window.innerHeight / 2) - 20}px`;
    document.body.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1400);
  }

  unlockBadge(badgeId) {
    if (!this.state.unlockedBadges.includes(badgeId)) {
      this.state.unlockedBadges.push(badgeId);
      const badge = BADGES.find(b => b.id === badgeId);
      soundFx.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      this.notify();
    }
  }

  completeChallenge(challengeId, score = 100) {
    const isFirstTime = !this.state.completedChallenges[challengeId];
    this.state.completedChallenges[challengeId] = Math.max(
      this.state.completedChallenges[challengeId] || 0,
      score
    );

    if (isFirstTime) {
      this.addXp(150, 'Desafio Concluído!');
    } else {
      this.addXp(30, 'Treino Concluído!');
    }

    // Check all challenges
    const completedCount = Object.keys(this.state.completedChallenges).length;
    if (completedCount >= 5) {
      this.unlockBadge('linear_grandmaster');
    }

    this.notify();
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    soundFx.setEnabled(this.state.soundEnabled);
    if (this.state.soundEnabled) soundFx.playClick();
    this.notify();
    return this.state.soundEnabled;
  }
}

export const gameState = new GameStateManager();
