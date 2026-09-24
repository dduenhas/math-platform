/**
 * Theme colors helper for 2D/3D Canvas rendering and dynamic styling
 * Supports Dark Blueprint (Cyanotype) and Light Drafting Paper themes.
 */

export function getThemeColors() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  if (isLight) {
    return {
      isLight: true,
      bg: '#f4f7fb',
      bgSurface: '#ffffff',
      bgElevated: '#e8eff7',
      border: '#c0d4ec',
      borderSubtle: 'rgba(15, 23, 42, 0.08)',
      ink: '#09182b',
      inkSecondary: '#334e68',
      inkMuted: '#627d98',
      gridMajor: 'rgba(14, 116, 144, 0.14)',
      gridMinor: 'rgba(14, 116, 144, 0.04)',
      axis: '#0284c7',
      axisLabel: '#475569',
      penX: '#0284c7',        // Cyan / Blue (i-hat / Cosine)
      penY: '#be123c',        // Carmine / Crimson (j-hat / Sine)
      penAngle: '#b45309',    // Ochre / Amber (Theta)
      penArea: '#6d28d9',     // Violet (Determinant)
      penPass: '#047857',     // Emerald (Unit / Valid)
      penAlert: '#b91c1c',    // Alert Red
      threeBg: 0xf4f7fb,
      threeGrid: 0x0284c7,
      threeSubGrid: 0xc0d4ec
    };
  }

  // Dark Blueprint (Prussian Blue / Technical Cyanotype)
  return {
    isLight: false,
    bg: '#051022',
    bgSurface: '#091936',
    bgElevated: '#0f244b',
    border: '#1a3765',
    borderSubtle: 'rgba(56, 189, 248, 0.12)',
    ink: '#f0f6fc',
    inkSecondary: '#93b4d7',
    inkMuted: '#5d7fa8',
    gridMajor: 'rgba(56, 189, 248, 0.16)',
    gridMinor: 'rgba(56, 189, 248, 0.04)',
    axis: '#38bdf8',
    axisLabel: '#93b4d7',
    penX: '#38bdf8',        // Technical Cyan (i-hat / Cosine)
    penY: '#f43f5e',        // Technical Coral (j-hat / Sine)
    penAngle: '#f59e0b',    // Technical Amber (Theta)
    penArea: '#c084fc',     // Technical Violet (Determinant)
    penPass: '#10b981',     // Technical Emerald (Unit / Valid)
    penAlert: '#ef4444',    // Technical Red
    threeBg: 0x051022,
    threeGrid: 0x38bdf8,
    threeSubGrid: 0x1a3765
  };
}
