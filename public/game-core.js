'use strict';
// Pure game rules shared by browser UI and Node.js tests. v0.3.0: local in-memory only.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FarmCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const GRID_SIZE = 16;
  const STARTING_COINS = 120;
  const CROPS = Object.freeze({
    carrot: Object.freeze({ name: '胡蘿蔔', icon: '🥕', growMs: 10000, seedPrice: 8, sellPrice: 14, description: '快速回本' }),
    potato: Object.freeze({ name: '馬鈴薯', icon: '🥔', growMs: 18000, seedPrice: 14, sellPrice: 25, description: '穩健收益' }),
    tomato: Object.freeze({ name: '番茄', icon: '🍅', growMs: 30000, seedPrice: 22, sellPrice: 40, description: '耐心等待' }),
  });
  const IDS = Object.keys(CROPS);
  function emptyCounts() { return Object.fromEntries(IDS.map(id => [id, 0])); }
  function initialState() {
    const seeds = emptyCounts(); seeds.carrot = 3;
    return { coins: STARTING_COINS, seeds, produce: emptyCounts(), plots: Array.from({length: GRID_SIZE}, () => ({cropId: null, plantedAt: null})), plantedCount: 0, harvestedCount: 0, harvestByCrop: emptyCounts(), spent: 0, earned: 0, transactions: [] };
  }
  function stage(plot, now) {
    if (!plot || plot.cropId === null || !CROPS[plot.cropId]) return 'empty';
    const elapsed = Math.max(0, now - plot.plantedAt);
    const duration = CROPS[plot.cropId].growMs;
    if (elapsed >= duration) return 'mature';
    if (elapsed < duration / 4) return 'seed';
    if (elapsed < duration / 2) return 'sprout';
    return 'growing';
  }
  function secondsLeft(plot, now) { return Math.ceil(Math.max(0, CROPS[plot.cropId].growMs - Math.max(0, now - plot.plantedAt)) / 1000); }
  function validQty(n) { return Number.isSafeInteger(n) && n > 0 && n <= 99; }
  function clone(s) { return { ...s, seeds: {...s.seeds}, produce: {...s.produce}, plots: s.plots.map(p=>({...p})), harvestByCrop: {...s.harvestByCrop}, transactions: s.transactions.slice() }; }
  function reject(s, message) { return {state:s, ok:false, message}; }
  function success(s, message) { return {state:s, ok:true, message}; }
  function log(s, type, detail, delta, now) { s.transactions.unshift({type, detail, delta, balance:s.coins, at:now}); s.transactions.length = Math.min(20,s.transactions.length); }
  function buy(state, id, qty, now=Date.now()) {
    if (!CROPS[id] || !validQty(qty)) return reject(state,'購買數量無效。');
    const price = CROPS[id].seedPrice * qty;
    if (state.coins < price) return reject(state,`金幣不足，購買需要 ${price} 金幣。`);
    const s=clone(state); s.coins-=price; s.spent+=price; s.seeds[id]+=qty;
    log(s,'buy',`購買${CROPS[id].name}種子 × ${qty}`,-price,now);
    return success(s,`已購買 ${qty} 顆${CROPS[id].name}種子，支付 ${price} 金幣。`);
  }
  function plant(state, index, id, now=Date.now()) {
    if (!Number.isInteger(index)||index<0||index>=GRID_SIZE||!CROPS[id]) return reject(state,'農地或作物選擇無效。');
    if (stage(state.plots[index],now)!=='empty') return reject(state,'這格農地已有作物，不能重複播種。');
    if (state.seeds[id]<1) return reject(state,`沒有${CROPS[id].name}種子，請先到商店購買。`);
    const s=clone(state);s.seeds[id]-=1;s.plots[index]={cropId:id,plantedAt:now};s.plantedCount++;
    return success(s,`第 ${index+1} 格已播種${CROPS[id].name}，${CROPS[id].growMs/1000} 秒後成熟。`);
  }
  function harvest(state,index,now=Date.now()) {
    if (!Number.isInteger(index)||index<0||index>=GRID_SIZE) return reject(state,'無效農地。');
    const plot=state.plots[index],status=stage(plot,now);
    if (status==='empty') return reject(state,'空地無法收成。');
    if (status!=='mature') return reject(state,`尚未成熟，還需要 ${secondsLeft(plot,now)} 秒。`);
    const id=plot.cropId,s=clone(state);s.plots[index]={cropId:null,plantedAt:null};s.produce[id]++;s.harvestedCount++;s.harvestByCrop[id]++;
    return success(s,`收成${CROPS[id].name} × 1，已放入背包。`);
  }
  function sell(state,id,qty,now=Date.now()) {
    if (!CROPS[id]||!validQty(qty)) return reject(state,'販售數量無效。');
    if (state.produce[id]<qty) return reject(state,`背包內${CROPS[id].name}數量不足。`);
    const amount=CROPS[id].sellPrice*qty,s=clone(state);
    s.produce[id]-=qty;s.coins+=amount;s.earned+=amount;
    log(s,'sell',`販售${CROPS[id].name} × ${qty}`,amount,now);
    return success(s,`已販售 ${qty} 個${CROPS[id].name}，獲得 ${amount} 金幣。`);
  }
  return Object.freeze({GRID_SIZE,STARTING_COINS,CROPS,IDS,initialState,stage,secondsLeft,buy,plant,harvest,sell});
});
