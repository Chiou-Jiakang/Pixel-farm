'use strict';

// Pixel Farm v0.1.0: front-end-only prototype. No persistence in this version.
const GRID_SIZE = 16;
const GROWTH_DURATION_MS = 10_000;
const UPDATE_INTERVAL_MS = 200;

const plots = Array.from({ length: GRID_SIZE }, () => ({ plantedAt: null }));
let plantedCount = 0;
let harvestedCount = 0;

const farmGrid = document.querySelector('#farmGrid');
const plantedCounter = document.querySelector('#plantedCount');
const harvestedCounter = document.querySelector('#harvestedCount');
const growingCounter = document.querySelector('#growingCount');
const statusMessage = document.querySelector('#statusMessage');
const resetButton = document.querySelector('#resetButton');

function getPlotState(plot, now = Date.now()) {
  if (plot.plantedAt === null) return 'empty';
  return now - plot.plantedAt >= GROWTH_DURATION_MS ? 'mature' : 'growing';
}

function formatRemaining(remainingMs) {
  return `${Math.ceil(Math.max(0, remainingMs) / 1000)} 秒`;
}

function render() {
  const now = Date.now();
  let growingCount = 0;
  farmGrid.replaceChildren();

  plots.forEach((plot, index) => {
    const state = getPlotState(plot, now);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `plot ${state}`;
    const icon = document.createElement('span');
    icon.className = 'plant';
    const label = document.createElement('small');

    if (state === 'empty') {
      icon.textContent = '·';
      label.textContent = '可播種';
      button.setAttribute('aria-label', `第 ${index + 1} 格，空地，點擊播種`);
    } else if (state === 'mature') {
      icon.textContent = '🥕';
      label.textContent = '收成！';
      button.setAttribute('aria-label', `第 ${index + 1} 格，胡蘿蔔已成熟，點擊收成`);
    } else {
      growingCount += 1;
      const elapsed = Math.max(0, now - plot.plantedAt);
      icon.textContent = elapsed < GROWTH_DURATION_MS / 2 ? '🌱' : '🌿';
      label.textContent = formatRemaining(GROWTH_DURATION_MS - elapsed);
      button.setAttribute('aria-label', `第 ${index + 1} 格，胡蘿蔔成長中，剩餘 ${label.textContent}`);
    }

    button.append(icon, label);
    button.addEventListener('click', () => interactWithPlot(index));
    farmGrid.append(button);
  });

  plantedCounter.textContent = String(plantedCount);
  harvestedCounter.textContent = String(harvestedCount);
  growingCounter.textContent = String(growingCount);
}

function interactWithPlot(index) {
  const plot = plots[index];
  const state = getPlotState(plot);
  if (state === 'empty') {
    plot.plantedAt = Date.now();
    plantedCount += 1;
    statusMessage.textContent = `第 ${index + 1} 格已播下胡蘿蔔，等待 10 秒成熟！`;
  } else if (state === 'mature') {
    plot.plantedAt = null;
    harvestedCount += 1;
    statusMessage.textContent = `🥕 第 ${index + 1} 格收成成功！再種一顆吧。`;
  } else {
    statusMessage.textContent = `第 ${index + 1} 格還在成長，請稍候。`;
  }
  render();
}

resetButton.addEventListener('click', () => {
  const accepted = window.confirm('確定要重設農場嗎？目前的播種與收成紀錄會清空。');
  if (!accepted) return;
  plots.forEach(plot => { plot.plantedAt = null; });
  plantedCount = 0;
  harvestedCount = 0;
  statusMessage.textContent = '農場已重設，可以重新開始種植！';
  render();
});

render();
window.setInterval(render, UPDATE_INTERVAL_MS);
