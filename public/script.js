"use strict";
// v0.5.0-alpha.3: server-authoritative actions; transient animation never changes game state.
const core = window.FarmCore;
const soundRules = window.FarmSoundCore,
  farmAudio = window.FarmAudio;
let suppressMatureSounds = true;
let state = null,
  selectedCropId = "carrot",
  serverOffset = 0,
  busy = false;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const lastPhase = new Map();
let hasRenderedFarm = false;
const effectLayer = document.createElement("div");
effectLayer.className = "farm-effects";
effectLayer.setAttribute("aria-hidden", "true");
document.body.append(effectLayer);
function effectAt(element, text, kind = "harvest") {
  if (!element || reduceMotion.matches) return;
  const rect = element.getBoundingClientRect();
  const fx = document.createElement("span");
  fx.className = `farm-fx farm-fx--${kind}`;
  fx.textContent = text;
  fx.style.left = `${rect.left + rect.width / 2}px`;
  fx.style.top = `${rect.top + rect.height / 2}px`;
  effectLayer.append(fx);
  fx.addEventListener("animationend", () => fx.remove(), { once: true });
}
function flashPlot(index, kind) {
  const plot = el.farmGrid.querySelector(`[data-plot-index="${index}"]`);
  if (!plot || reduceMotion.matches) return;
  plot.classList.remove("action-seed", "action-harvest");
  void plot.offsetWidth;
  plot.classList.add(`action-${kind}`);
  plot.addEventListener(
    "animationend",
    () => plot.classList.remove(`action-${kind}`),
    { once: true },
  );
}

const el = Object.fromEntries(
  [
    "farmGrid",
    "cropChoices",
    "plantedCount",
    "harvestedCount",
    "growingCount",
    "coinCount",
    "statusMessage",
    "resetButton",
    "spentValue",
    "earnedValue",
    "profitValue",
    "shopList",
    "inventoryList",
    "transactionList",
    "muteButton",
    "soundVolume",
    "volumeValue",
  ].map((id) => [id, document.getElementById(id)]),
);
function now() {
  return Date.now() + serverOffset;
}
function syncSoundControls() {
  const settings = farmAudio.getSettings();
  el.muteButton.textContent = settings.muted ? "🔇 音效關閉" : "🔊 音效開啟";
  el.muteButton.setAttribute("aria-pressed", String(settings.muted));
  el.soundVolume.value = String(Math.round(settings.volume * 100));
  el.volumeValue.textContent = `${Math.round(settings.volume * 100)}%`;
}
function playSound(event) {
  farmAudio.play(event);
}

function button(text, className, onClick, disabled = false) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.className = className;
  b.disabled = busy || disabled;
  b.addEventListener("click", onClick);
  return b;
}
function setMessage(message) {
  el.statusMessage.textContent = message;
  el.statusMessage.classList.remove("message-pulse");
  void el.statusMessage.offsetWidth;
  el.statusMessage.classList.add("message-pulse");
}
function sprite(name, alt = "") {
  const img = document.createElement("img");
  img.src = `./assets/crops/${name}.svg`;
  img.alt = alt;
  img.className = "pixel-sprite";
  img.width = 80;
  img.height = 80;
  img.decoding = "async";
  return img;
}
function adopt(data) {
  if (data.state) state = data.state;
  if (Number.isFinite(data.serverTime))
    serverOffset = data.serverTime - Date.now();
}
async function request(action, payload = {}) {
  if (busy) return;
  // Capture geometry before the authoritative API changes the plot.
  const target = Number.isInteger(payload.index)
    ? el.farmGrid.querySelector(`[data-plot-index="${payload.index}"]`)
    : null;
  busy = true;
  render();
  try {
    const response = await fetch(`/api/game/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      adopt(data);
      setMessage(data.message || data.error || "操作未成功。");
      playSound("error");
      return;
    }
    const oldCoins = state?.coins;
    adopt(data);
    setMessage(data.message || "操作完成。");
    render();
    playSound(soundRules.soundForAction(action, true));
    if (action === "plant") flashPlot(payload.index, "seed");
    if (action === "harvest") {
      effectAt(target, "✦ +1", "harvest");
      flashPlot(payload.index, "harvest");
    }
    if (
      (action === "buy" || action === "sell") &&
      oldCoins != null &&
      state?.coins !== oldCoins
    ) {
      effectAt(
        el.coinCount,
        `${state.coins - oldCoins > 0 ? "+" : ""}${state.coins - oldCoins} 🪙`,
        "coins",
      );
    }
  } catch (e) {
    setMessage("連線失敗：請確認伺服器正在執行，並重新整理頁面。");
    playSound("error");
  } finally {
    busy = false;
    render();
  }
}
function renderChoices() {
  el.cropChoices.replaceChildren();
  for (const id of core.IDS) {
    const crop = core.CROPS[id],
      b = button(
        "",
        `crop-choice${id === selectedCropId ? " selected" : ""}`,
        () => {
          selectedCropId = id;
          setMessage(`已選擇${crop.name}，剩餘種子 ${state.seeds[id]} 顆。`);
          renderChoices();
        },
      );
    b.setAttribute("aria-pressed", String(id === selectedCropId));
    const sym = document.createElement("span");
    sym.className = "crop-icon";
    sym.append(sprite(id, ""));
    const wrapper = document.createElement("span"),
      name = document.createElement("strong"),
      small = document.createElement("small");
    name.textContent = crop.name;
    small.textContent = `${crop.growMs / 1000} 秒 · 種子 ${state.seeds[id]} 顆`;
    wrapper.append(name, small);
    b.append(sym, wrapper);
    el.cropChoices.append(b);
  }
}
function renderFarm() {
  if (!state) return;
  let growing = 0;
  const plots = state.plots;
  for (let index = 0; index < plots.length; index++) {
    const plot = plots[index],
      phase = core.stage(plot, now()),
      crop = plot.cropId ? core.CROPS[plot.cropId] : null;
    const key = `${phase}:${plot.cropId || ""}`;
    let b = el.farmGrid.querySelector(`[data-plot-index="${index}"]`);
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.dataset.plotIndex = String(index);
      const sym = document.createElement("span"),
        label = document.createElement("small");
      sym.className = "plant";
      b.append(sym, label);
      el.farmGrid.append(b);
      b.addEventListener("click", () => {
        if (busy) return;
        const current = state.plots[index],
          currentPhase = core.stage(current, now());
        if (currentPhase === "empty")
          request("plant", { index, cropId: selectedCropId });
        else if (currentPhase === "mature") request("harvest", { index });
        else {
          setMessage("作物尚未成熟，請再等一下。");
          playSound("error");
        }
      });
    }
    const previous = lastPhase.get(index);
    const changed = previous !== key;
    b.className = `plot ${phase}`; // Stage class update; action FX uses separate overlay and re-added on next user action.
    b.disabled = busy;
    const sym = b.firstElementChild,
      label = b.lastElementChild;
    if (phase === "empty") {
      if (changed) {
        sym.replaceChildren();
        sym.textContent = "+";
      }
      label.textContent = "可播種";
      b.setAttribute(
        "aria-label",
        `第 ${index + 1} 格空地，播種${core.CROPS[selectedCropId].name}`,
      );
    } else if (phase === "mature") {
      if (changed) {
        sym.replaceChildren(sprite(plot.cropId, ""));
      }
      label.textContent = "收成！";
      b.setAttribute(
        "aria-label",
        `第 ${index + 1} 格${crop.name}已成熟，點擊收成`,
      );
    } else {
      growing++;
      if (changed)
        sym.replaceChildren(
          sprite(
            phase === "seed"
              ? "seed"
              : phase === "sprout"
                ? "sprout"
                : "growth",
            "",
          ),
        );
      const left = core.secondsLeft(plot, now());
      label.textContent = `${crop.name} ${left}秒`;
      b.setAttribute(
        "aria-label",
        `第 ${index + 1} 格${crop.name}成長中，剩 ${left} 秒`,
      );
    }
    if (
      soundRules.newlyMature(previous?.split(":")[0], phase) &&
      !suppressMatureSounds
    )
      playSound("mature");
    if (
      changed &&
      hasRenderedFarm &&
      previous !== undefined &&
      !reduceMotion.matches
    ) {
      b.classList.remove("stage-transition");
      void b.offsetWidth;
      b.classList.add("stage-transition");
    }
    lastPhase.set(index, key);
  }
  el.growingCount.textContent = String(growing);
  hasRenderedFarm = true;
}
function renderEconomy() {
  el.shopList.replaceChildren();
  el.inventoryList.replaceChildren();
  for (const id of core.IDS) {
    const crop = core.CROPS[id];
    const shop = document.createElement("article");
    shop.className = "item-card";
    const info = document.createElement("div");
    info.className = "item-info";
    const heading = document.createElement("strong");
    heading.textContent = `${crop.icon} ${crop.name}種子`;
    const small = document.createElement("small");
    small.textContent = `單價 🪙${crop.seedPrice} · 成熟 ${crop.growMs / 1000} 秒`;
    info.append(heading, small);
    const actions = document.createElement("div");
    actions.className = "item-actions";
    for (const quantity of [1, 5])
      actions.append(
        button(
          `買 ${quantity} 顆`,
          "action-button",
          () => request("buy", { cropId: id, quantity }),
          state.coins < crop.seedPrice * quantity,
        ),
      );
    shop.append(info, actions);
    el.shopList.append(shop);
    const inv = document.createElement("article");
    inv.className = "item-card";
    const stock = document.createElement("div");
    stock.className = "item-info";
    const title = document.createElement("strong");
    title.textContent = `${crop.icon} ${crop.name}`;
    const counts = document.createElement("small");
    counts.textContent = `種子 ${state.seeds[id]} 顆 · 收成品 ${state.produce[id]} 個 · 售價 🪙${crop.sellPrice}`;
    stock.append(title, counts);
    const sellActions = document.createElement("div");
    sellActions.className = "item-actions";
    sellActions.append(
      button(
        "賣 1 個",
        "action-button",
        () => request("sell", { cropId: id, quantity: 1 }),
        state.produce[id] < 1,
      ),
    );
    sellActions.append(
      button(
        "全部販售",
        "action-button",
        () => request("sell", { cropId: id, quantity: state.produce[id] }),
        state.produce[id] < 1,
      ),
    );
    inv.append(stock, sellActions);
    el.inventoryList.append(inv);
  }
  el.transactionList.replaceChildren();
  if (!state.transactions.length) {
    const p = document.createElement("p");
    p.className = "fineprint";
    p.textContent = "尚無交易，購買種子或販售作物後會顯示。";
    el.transactionList.append(p);
  }
  for (const tx of state.transactions) {
    const line = document.createElement("div");
    line.className = "transaction";
    const name = document.createElement("span");
    name.textContent = `${tx.detail} · ${new Date(tx.at).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    const val = document.createElement("strong");
    val.className = tx.delta > 0 ? "positive" : "negative";
    val.textContent = `${tx.delta > 0 ? "+" : ""}${tx.delta} 🪙`;
    line.append(name, val);
    el.transactionList.append(line);
  }
}
function render() {
  if (!state) return;
  el.coinCount.textContent = state.coins;
  el.plantedCount.textContent = state.plantedCount;
  el.harvestedCount.textContent = state.harvestedCount;
  el.spentValue.textContent = `🪙 ${state.spent}`;
  el.earnedValue.textContent = `🪙 ${state.earned}`;
  el.profitValue.textContent = `🪙 ${state.earned - state.spent}`;
  el.resetButton.disabled = busy;
  renderChoices();
  renderFarm();
  renderEconomy();
}
el.muteButton.addEventListener("click", () => {
  farmAudio.activate();
  farmAudio.setMuted(!farmAudio.getSettings().muted);
  syncSoundControls();
  if (!farmAudio.getSettings().muted) playSound("buy");
});
el.soundVolume.addEventListener("input", () => {
  farmAudio.activate();
  farmAudio.setVolume(Number(el.soundVolume.value) / 100);
  syncSoundControls();
});
// Resume audio context only after an explicit pointer/keyboard action (browser autoplay policy).
document.addEventListener("pointerdown", () => farmAudio.activate(), {
  capture: true,
});
document.addEventListener("keydown", () => farmAudio.activate(), {
  capture: true,
});
syncSoundControls();
el.resetButton.addEventListener("click", () => {
  if (
    window.confirm(
      "要重設農場嗎？資料庫中的金幣、作物、庫存與交易紀錄都會被清空！",
    )
  )
    request("reset");
});
async function refresh() {
  if (busy) return;
  try {
    const response = await fetch("/api/game", { cache: "no-store" });
    if (!response.ok) throw Error("HTTP " + response.status);
    adopt(await response.json());
    render();
    if (el.statusMessage.textContent.includes("正在載入 SQLite 存檔")) {
      setMessage("農場資料載入完成，可以開始種植！");
    }
    suppressMatureSounds = false;
  } catch (e) {
    setMessage("目前無法連線至伺服器。請在 Pixel-farm 根目錄執行 npm start。");
  }
}
setMessage("正在載入 SQLite 存檔…");
refresh();
setInterval(() => {
  if (!busy) renderFarm();
}, 500);
setInterval(refresh, 15000);
