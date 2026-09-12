// BECOMING A MICROSCOPE TO CREATE NEW SECRETS — gallery sketch
// p5.js 2.x + p5.svgkit

const RUN4 = 'data/images/run4';

// Folder structure mirrored as the thumbnail tree (left column)
const FOLDERS = [
  { path: `${RUN4}/chance`, segments: ['run4', 'chance'], files: ['r4-chance-1.svg', 'r4-chance-2.svg', 'r4-chance-3.svg'] },
  { path: `${RUN4}/elimination/step-1`, segments: ['run4', 'elimination', 'step-1'], files: ['r4-elim-01.svg', 'r4-elim-02.svg', 'r4-elim-03.svg', 'r4-elim-04.svg', 'r4-elim-05.svg', 'r4-elim-06.svg', 'r4-elim-07.svg', 'r4-elim-08.svg', 'r4-elim-09.svg', 'r4-elim-10.svg'] },
  { path: `${RUN4}/elimination/step-2`, segments: ['run4', 'elimination', 'step-2'], files: ['r4-step2-1.svg', 'r4-step2-2.svg'] },
  { path: `${RUN4}/appropriate/sequence-A`, segments: ['run4', 'appropriate', 'sequence-A'], files: ['r4-refined-1.svg', 'r4-refined-2.svg', 'r4-refined-3.svg', 'r4-final-A.svg'] },
  { path: `${RUN4}/appropriate/sequence-B`, segments: ['run4', 'appropriate', 'sequence-B'], files: ['r4-new-1.svg', 'r4-new-2.svg', 'r4-new-3.svg', 'r4-final-B.svg'] },
];

let rec;
let holder;
let currentImg = null;
let currentKey = null;

async function setup() {
  holder = document.getElementById('canvas-holder');
  const c = createCanvas(1, 1);
  c.parent('canvas-holder');
  rec = svgkit.record();

  resizeToHolder();
  buildThumbTree();

  // open the first drawing (chance/1) by default
  const first = document.querySelector('.thumb');
  if (first) first.click();
}

function draw() {
  background(247, 246, 242);
  if (currentImg) {
    const pad = Math.min(width, height) * 0.07;
    const availW = width - pad * 2;
    const availH = height - pad * 2;
    const s = Math.min(availW / currentImg.width, availH / currentImg.height);
    const w = currentImg.width * s;
    const h = currentImg.height * s;
    push();
    translate((width - w) / 2, (height - h) / 2);
    image(currentImg, 0, 0, w, h);
    pop();
  } else {
    fill(111, 106, 99);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(Math.min(20, width * 0.02));
    text('LOADING…', width / 2, height / 2);
  }
}

function selectSvg(folder, file) {
  const key = folder + '/' + file;
  if (key === currentKey) return;
  currentKey = key;
  currentImg = null;

  document.querySelectorAll('.thumb').forEach((t) => t.classList.remove('selected'));
  const id = 'thumb-' + folder.replaceAll('/', '-') + '-' + file;
  const el = document.getElementById(id);
  if (el) el.classList.add('selected');

  document.getElementById('view-caption').textContent =
    key.replace('data/images/', '') + '  ·  ' + file;

  rec.load(folder + '/' + file)
    .then((img) => {
      if (currentKey !== key) return; // user moved on while loading
      currentImg = img;
    })
    .catch((err) => {
      console.error('[svgkit] load failed:', key, err);
    });
}

/* ---------- thumbnails ---------- */

function buildThumbTree() {
  const root = document.getElementById('thumbs');

  for (const folder of FOLDERS) {
    const group = document.createElement('section');
    group.className = 'folder';

    const pathEl = document.createElement('div');
    pathEl.className = 'folder-path';
    pathEl.innerHTML = folder.segments
      .map((seg, i) => `<span class="seg-${i}">${seg}</span>`)
      .join(' <span aria-hidden="true">›</span> ');
    group.appendChild(pathEl);

    const list = document.createElement('div');
    list.className = 'thumb-list';

    folder.files.forEach((file, i) => {
      const row = document.createElement('button');
      row.className = 'thumb';
      row.id = 'thumb-' + folder.path.replaceAll('/', '-') + '-' + file;
      row.title = file;
      row.setAttribute('aria-label', folder.segments.join(' / ') + ' — ' + file);

      const index = document.createElement('span');
      index.className = 'thumb-index';
      index.textContent = String(i + 1).padStart(2, '0');

      const img = document.createElement('img');
      img.src = folder.path + '/' + file;
      img.alt = file.replace('.svg', '');
      img.loading = 'lazy';

      const name = document.createElement('span');
      name.className = 'thumb-name';
      name.textContent = file;

      row.appendChild(index);
      row.appendChild(img);
      row.appendChild(name);

      row.addEventListener('click', () => selectSvg(folder.path, file));
      list.appendChild(row);
    });

    group.appendChild(list);
    root.appendChild(group);
  }
}

/* ---------- sizing ---------- */

function resizeToHolder() {
  const rect = holder.getBoundingClientRect();
  resizeCanvas(Math.max(1, floor(rect.width)), Math.max(1, floor(rect.height)));
}

function windowResized() {
  resizeToHolder();
}