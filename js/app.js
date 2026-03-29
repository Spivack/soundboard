let currentAudio = null;

function getNextTagline() {
  let order = JSON.parse(localStorage.getItem('taglineOrder') || 'null');
  let index = parseInt(localStorage.getItem('taglineIndex') || '0', 10);

  if (!order || order.length !== TAGLINES.length) {
    order = [...TAGLINES.keys()].sort(() => Math.random() - 0.5);
    index = 0;
  }

  const tagline = TAGLINES[order[index]];
  index = (index + 1) % order.length;

  localStorage.setItem('taglineOrder', JSON.stringify(order));
  localStorage.setItem('taglineIndex', index);

  return tagline;
}
let queueMode = false;
let queue = [];
let queueIndex = 0;
let lastPlayedIndex = -1;

function playSound(characterId, file) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(`assets/audio/${characterId}/${file}`);
  currentAudio.play();
}

function renderQueue() {
  const list = document.getElementById('queue-list');
  const nextBtn = document.getElementById('queue-next');
  const prevBtn = document.getElementById('queue-prev');
  const clearBtn = document.getElementById('queue-clear');

  list.innerHTML = '';

  queue.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'queue-item' + (i === lastPlayedIndex ? ' queue-current' : '');

    const label = document.createElement('span');
    label.textContent = item.label;

    const remove = document.createElement('button');
    remove.className = 'queue-remove';
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      queue.splice(i, 1);
      if (queueIndex >= queue.length) queueIndex = 0;
      renderQueue();
    });

    li.appendChild(label);
    li.appendChild(remove);
    list.appendChild(li);
  });

  const hasItems = queue.length > 0;
  nextBtn.disabled = !hasItems;
  prevBtn.disabled = !hasItems;
  clearBtn.disabled = !hasItems;
}

function playNext() {
  if (!queue.length) return;
  lastPlayedIndex = queueIndex;
  playSound(queue[lastPlayedIndex].characterId, queue[lastPlayedIndex].file);
  queueIndex = (queueIndex + 1) % queue.length;
  renderQueue();
}

function playPrevious() {
  if (!queue.length) return;
  lastPlayedIndex = (queueIndex - 1 + queue.length) % queue.length;
  playSound(queue[lastPlayedIndex].characterId, queue[lastPlayedIndex].file);
  renderQueue();
}

function clearQueue() {
  queue = [];
  queueIndex = 0;
  lastPlayedIndex = -1;
  renderQueue();
}

function makeGroup(character, group) {
  const section = document.createElement('div');
  section.className = 'sound-group';

  const heading = document.createElement('h3');
  heading.className = 'group-label';
  heading.textContent = group.label;
  section.appendChild(heading);

  const btnRow = document.createElement('div');
  btnRow.className = 'sound-btn-row';

  for (const sound of group.sounds) {
    const btn = document.createElement('button');
    btn.className = 'sound-btn';
    btn.textContent = sound.label;
    btn.addEventListener('click', () => {
      if (queueMode) {
        queue.push({ characterId: character.id, file: sound.file, label: sound.label });
        renderQueue();
      } else {
        playSound(character.id, sound.file);
      }
    });
    btnRow.appendChild(btn);
  }

  section.appendChild(btnRow);
  return section;
}

function renderSoundBoard(character) {
  const title = document.getElementById('character-title');
  const left = document.getElementById('col-left');
  const right = document.getElementById('col-right');
  const full = document.getElementById('col-full');

  title.textContent = character.name;
  left.innerHTML = '';
  right.innerHTML = '';
  full.innerHTML = '';

  queue = [];
  queueIndex = 0;
  lastPlayedIndex = -1;
  renderQueue();

  for (const group of character.groups) {
    const target = group.column === 'right' ? right : group.column === 'full' ? full : left;
    target.appendChild(makeGroup(character, group));
  }
}

function renderCharacterSelector(characters, selected) {
  const selector = document.getElementById('character-selector');
  if (!selector) return;

  for (const character of characters) {
    const btn = document.createElement('button');
    btn.className = 'character-btn' + (character.id === selected.id ? ' active' : '');
    btn.textContent = character.name;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.character-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSoundBoard(character);
    });
    selector.appendChild(btn);
  }
}

function init() {
  document.querySelector('.site-header h1').textContent = getNextTagline();

  const first = CHARACTERS[0];
  renderCharacterSelector(CHARACTERS, first);
  renderSoundBoard(first);

  document.getElementById('queue-toggle').addEventListener('click', () => {
    queueMode = !queueMode;
    const btn = document.getElementById('queue-toggle');
    btn.textContent = queueMode ? 'Queue Mode: ON' : 'Queue Mode: OFF';
    btn.classList.toggle('queue-mode-active', queueMode);
  });

  document.getElementById('queue-next').addEventListener('click', playNext);
  document.getElementById('queue-prev').addEventListener('click', playPrevious);
  document.getElementById('queue-clear').addEventListener('click', clearQueue);
}

document.addEventListener('DOMContentLoaded', init);
