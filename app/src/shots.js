// Fixed scenes for screenshots: ?shot=<name> stages one cover or the editor.
// Each scene sets its own layout, grade, lettering, size, caption and per-panel
// crops, so the four screenshots show the app's range. window.__shotReady is
// set once the scene has painted.

export const SCENES = {
  'cover-hero': {
    layout: 'hero', grade: 'neon', lettering: 'block', size: 'square',
    title: 'NEON NIGHTS', subtitle: 'Vice City, after dark', photo: 'boulevard',
    crops: [
      { zoom: 115, panX: -10, panY: 5 },
      { zoom: 130, panX: 15, panY: -8 },
      { zoom: 105, panX: 0, panY: 10 },
      { zoom: 100, panX: 0, panY: 0 },
    ],
  },
  editor: {
    layout: 'stack', grade: 'vice', lettering: 'block', size: 'square',
    title: 'SUNSET HEIST', subtitle: 'One last job', photo: 'pier',
    crops: [
      { zoom: 120, panX: 8, panY: -6 },
      { zoom: 110, panX: -12, panY: 4 },
      { zoom: 100, panX: 0, panY: 0 },
      { zoom: 100, panX: 0, panY: 0 },
    ],
  },
  'cover-portrait': {
    layout: 'stack', grade: 'gold', lettering: 'outline', size: 'portrait',
    title: 'SUNSET HEIST', subtitle: 'One last job', photo: 'boulevard',
    crops: [
      { zoom: 125, panX: -15, panY: 8 },
      { zoom: 140, panX: 20, panY: -10 },
      { zoom: 110, panX: 5, panY: 12 },
      { zoom: 100, panX: 0, panY: 0 },
    ],
  },
  'cover-wide': {
    layout: 'split', grade: 'candy', lettering: 'slant', size: 'wide',
    title: 'BOULEVARD QUEEN', subtitle: 'Golden hour, every hour', photo: 'pier',
    crops: [
      { zoom: 118, panX: 10, panY: -5 },
      { zoom: 135, panX: -18, panY: 6 },
      { zoom: 100, panX: 0, panY: 0 },
      { zoom: 100, panX: 0, panY: 0 },
    ],
  },
};

export async function runShot(shot, params, load) {
  const scene = SCENES[shot] || SCENES['cover-hero'];
  if (shot.startsWith('cover')) document.body.classList.add('shot-cover');
  await load(scene);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
