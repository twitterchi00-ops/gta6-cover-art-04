// Vice Cover Lab — the editor: pick a photo, layout, grade, lettering and size,
// crop and position each panel, edit the caption, export a PNG. A `?shot=` query
// sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, LAYOUTS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const gallery = document.getElementById('gallery');

export const SIZES = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  wide: [1920, 1080],
};

const state = {
  layout: 'stack',
  grade: 'vice',
  lettering: 'block',
  size: 'square',
  title: 'NEON NIGHTS',
  subtitle: 'Vice City, after dark',
  panel: 0,
  crops: [0, 1, 2, 3].map(() => ({ zoom: 100, panX: 0, panY: 0 })),
  photos: [null, null, null, null],
  sample: null,
};

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function activePhotos() {
  const filled = state.photos.filter(Boolean);
  if (filled.length) return state.photos.map((p) => p ?? filled[0]);
  return state.sample ? [state.sample] : [];
}

function redraw() {
  const [w, h] = SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas, activePhotos(), {
    layout: state.layout,
    grade: state.grade,
    lettering: state.lettering,
    title: state.title,
    subtitle: state.subtitle,
    crops: state.crops,
  });
}

function syncCropControls() {
  const c = state.crops[state.panel];
  document.getElementById('zoom').value = c.zoom;
  document.getElementById('panX').value = c.panX;
  document.getElementById('panY').value = c.panY;
  document.getElementById('zoomVal').textContent = `${c.zoom}%`;
  document.getElementById('panXVal').textContent = c.panX;
  document.getElementById('panYVal').textContent = c.panY;
}

function bindPick(id, key) {
  document.getElementById(id).addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const value = btn.dataset[key];
    if (value == null) return;
    state[key === 'panel' ? 'panel' : key] = key === 'panel' ? Number(value) : value;
    [...document.getElementById(id).querySelectorAll('button')].forEach((b) => b.classList.toggle('on', b === btn));
    if (key === 'panel') syncCropControls();
    redraw();
  });
}

bindPick('layoutPick', 'layout');
bindPick('gradePick', 'grade');
bindPick('letterPick', 'lettering');
bindPick('sizePick', 'size');
bindPick('panelPick', 'panel');

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = await loadImage(URL.createObjectURL(file));
  state.photos = state.photos.map(() => img);
  state.sample = null;
  redraw();
  status.textContent = 'Photo loaded — drag the sliders to crop each panel.';
});

document.getElementById('sampleRow').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  state.sample = await loadImage(`samples/${btn.dataset.sample}.png`);
  state.photos = [null, null, null, null];
  redraw();
  status.textContent = `Sample photo loaded: ${btn.dataset.sample}.`;
});

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });

for (const [id, key, label] of [['zoom', 'zoom', 'zoomVal'], ['panX', 'panX', 'panXVal'], ['panY', 'panY', 'panYVal']]) {
  document.getElementById(id).addEventListener('input', (e) => {
    state.crops[state.panel][key] = Number(e.target.value);
    document.getElementById(label).textContent = key === 'zoom' ? `${e.target.value}%` : e.target.value;
    redraw();
  });
}

document.getElementById('export').addEventListener('click', () => {
  const [w, h] = SIZES[state.size];
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    const thumb = document.createElement('img');
    thumb.src = url;
    thumb.alt = `Exported cover ${w} by ${h}`;
    gallery.prepend(thumb);
    status.textContent = `Saved vice-cover-${w}x${h}.png`;
  }, 'image/png');
});

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async (scene) => {
    state.layout = scene.layout;
    state.grade = scene.grade;
    state.lettering = scene.lettering;
    state.size = scene.size;
    state.title = scene.title;
    state.subtitle = scene.subtitle;
    state.crops = scene.crops;
    state.sample = await loadImage(`samples/${scene.photo}.png`);
    state.photos = [null, null, null, null];
    document.getElementById('title').value = scene.title;
    document.getElementById('subtitle').value = scene.subtitle;
    // Mirror the scene into the pickers so the editor shot shows the right active states.
    for (const [id, key, value] of [
      ['layoutPick', 'layout', scene.layout], ['gradePick', 'grade', scene.grade],
      ['letterPick', 'lettering', scene.lettering], ['sizePick', 'size', scene.size],
    ]) {
      [...document.getElementById(id).querySelectorAll('button')].forEach((b) => b.classList.toggle('on', b.dataset[key] === value));
    }
    syncCropControls();
    redraw();
  });
} else {
  redraw();
}
