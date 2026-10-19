'use strict';

// Pixel Farm v0.2.0: frontend prototype; no persistence and no backend.
const GRID_SIZE = 16;
const UPDATE_INTERVAL_MS = 250;
const CROPS = Object.freeze({
  carrot: Object.freeze({ name: '胡蘿蔔', icon: '🥕', growMs: 10_000, description: '快速入門' }),
  potato: Object.freeze({ name: '馬鈴薯', icon: '🥔', growMs: 18_000, description: '耐心種植' }),
  tomato: Object.freeze({ name: '番茄', icon: '🍅', growMs: 30_000, description: '長期培育' }),
});

let plots = Array.from({ length: GRID_SIZE }, () => ({ cropId: null, plantedAt: null }));
let selectedCropId = 'carrot';
let plantedCount = 0;
let harvestedCount = 0;
let harvestByCrop = Object.fromEntries(Object.keys(CROPS).map((key) => [key, 0]));

const elements = {
  farmGrid: document.querySelector('#farmGrid'),
  cropChoices: document.querySelector('#cropChoices'),
  plantedCounter: document.querySelector('#plantedCount'),
  harvestedCounter: document.querySelector('#harvestedCount'),
  growingCounter: document.querySelector('#growingCount'),
  harvestSummary: document.querySelector('#harvestSummary'),
  statusMessage: document.querySelector('#statusMessage'),
  resetButton: document.querySelector('#resetButton'),
};

/** Pure state calculation, independent of the UI and timers. */
function getPlotStage(plot, now = Date.now()) {
  if (plot.cropId === null || plot.plantedAt === null) return 'empty';
  const crop = CROPS[plot.cropId];
  if (!crop) return 'empty';
  const elapsed = Math.max(0, now - plot.plantedAt);
  if (elapsed >= crop.growMs) return 'mature';
  if (elapsed < crop.growMs / 4) return 'seed';
  if (elapsed < crop.growMs / 2) return 'sprout';
  return 'growing';
}

function remainingSeconds(plot, now) {
  return Math.ceil(Math.max(0, CROPS[plot.cropId].growMs - (now - plot.plantedAt)) / 1000);
}

function renderCropChoices() {
  elements.cropChoices.replaceChildren();
  for (const [cropId, crop] of Object.entries(CROPS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `crop-choice${selectedCropId === cropId ? ' selected' : ''}`;
    button.setAttribute('aria-pressed', String(selectedCropId === cropId));
    button.setAttribute('aria-label', `選擇${crop.name}，成熟時間 ${crop.growMs / 1000} 秒`);
    const emoji = document.createElement('span');
    emoji.className = 'crop-icon';
    emoji.textContent = crop.icon;
    const content = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = crop.name;
    const detail = document.createElement('small');
    detail.textContent = `${crop.growMs / 1000} 秒 · ${crop.description}`;
    content.append(title, detail);
    button.append(emoji, content);
    button.addEventListener('click', () => {
      selectedCropId = cropId;
      elements.statusMessage.textContent = `已選擇${crop.name}，點擊空地就能播種。`;
      renderCropChoices();
    });
    elements.cropChoices.append(button);
  }
}

function render() {
  const now = Date.now();
  let growingCount = 0;
  const fragment = document.createDocumentFragment();

  plots.forEach((plot, index) => {
    const stage = getPlotStage(plot, now);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `plot ${stage}`;
    const icon = document.createElement('span');
    icon.className = 'plant';
    const label = document.createElement('small');
    const crop = plot.cropId === null ? null : CROPS[plot.cropId];

    if (stage === 'empty') {
      icon.textContent = '·';
      label.textContent = '可播種';
      button.setAttribute('aria-label', `第 ${index + 1} 格，空地，播種${CROPS[selectedCropId].name}`);
    } else if (stage === 'mature') {
      icon.textContent = crop.icon;
      label.textContent = '收成！';
      button.setAttribute('aria-label', `第 ${index + 1} 格，${crop.name}已成熟，點擊收成`);
    } else {
      growingCount += 1;
      icon.textContent = stage === 'seed' ? '🌰' : stage === 'sprout' ? '🌱' : '🌿';
      label.textContent = `${crop.name} ${remainingSeconds(plot, now)}秒`;
      button.setAttribute('aria-label', `第 ${index + 1} 格，${crop.name}${stage === 'seed' ? '種子' : stage === 'sprout' ? '幼苗' : '成長中'}，剩餘 ${remainingSeconds(plot, now)} 秒`);
    }

    button.append(icon, label);
    button.addEventListener('click', () => interactWithPlot(index));
    fragment.append(button);
  });

  elements.farmGrid.replaceChildren(fragment);
  elements.plantedCounter.textContent = String(plantedCount);
  elements.harvestedCounter.textContent = String(harvestedCount);
  elements.growingCounter.textContent = String(growingCount);
  elements.harvestSummary.replaceChildren();
  for (const [cropId, crop] of Object.entries(CROPS)) {
    const item = document.createElement('div');
    item.className = 'harvest-item';
    const name = document.createElement('span');
    name.textContent = `${crop.icon} ${crop.name}`;
    const count = document.createElement('strong');
    count.textContent = String(harvestByCrop[cropId]);
    item.append(name, count);
    elements.harvestSummary.append(item);
  }
}

function interactWithPlot(index) {
  const plot = plots[index];
  const stage = getPlotStage(plot);
  if (stage === 'empty') {
    plot.cropId = selectedCropId;
    plot.plantedAt = Date.now();
    plantedCount += 1;
    elements.statusMessage.textContent = `第 ${index + 1} 格種下${CROPS[selectedCropId].name}，預計 ${CROPS[selectedCropId].growMs / 1000} 秒後成熟。`;
  } else if (stage === 'mature') {
    const cropId = plot.cropId;
    plots[index] = { cropId: null, plantedAt: null };
    harvestedCount += 1;
    harvestByCrop[cropId] += 1;
    elements.statusMessage.textContent = `收成第 ${index + 1} 格的${CROPS[cropId].name}！可繼續播種。`;
  } else {
    elements.statusMessage.textContent = `第 ${index + 1} 格的${CROPS[plot.cropId].name}還沒成熟，剩餘 ${remainingSeconds(plot, Date.now())} 秒。`;
  }
  render();
}

function resetFarm() {
  plots = Array.from({ length: GRID_SIZE }, () => ({ cropId: null, plantedAt: null }));
  plantedCount = 0;
  harvestedCount = 0;
  harvestByCrop = Object.fromEntries(Object.keys(CROPS).map((key) => [key, 0]));
  selectedCropId = 'carrot';
  elements.statusMessage.textContent = '農場已重設，所有格子和統計都已歸零。';
  renderCropChoices();
  render();
}

elements.resetButton.addEventListener('click', resetFarm);
renderCropChoices();
render();
setInterval(render, UPDATE_INTERVAL_MS);
