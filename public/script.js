'use strict';
// UI adapter: all economy mutations are delegated to FarmCore pure operations.
const core = window.FarmCore;
let state = core.initialState();
let selectedCropId = 'carrot';
const el = Object.fromEntries(['farmGrid','cropChoices','plantedCount','harvestedCount','growingCount','coinCount','statusMessage','resetButton','spentValue','earnedValue','profitValue','shopList','inventoryList','transactionList'].map(id => [id, document.getElementById(id)]));

function button(text, className, onClick, disabled=false) {
  const node = document.createElement('button');node.type='button';node.textContent=text;node.className=className;node.disabled=disabled;node.addEventListener('click',onClick);return node;
}
function apply(result) { if (result.ok) state=result.state;el.statusMessage.textContent=result.message; render(); }
function handlePlot(index) {
  const stage=core.stage(state.plots[index], Date.now());
  if (stage==='empty') apply(core.plant(state,index,selectedCropId));
  else if (stage==='mature') apply(core.harvest(state,index));
  else apply(core.harvest(state,index)); // Explicitly reports the remaining time; never harvests early.
}
function renderChoices() {
  el.cropChoices.replaceChildren();
  for (const id of core.IDS) {
    const crop=core.CROPS[id],btn=button('',`crop-choice${selectedCropId===id?' selected':''}`,()=>{selectedCropId=id; el.statusMessage.textContent=`已選擇${crop.name}，剩餘種子 ${state.seeds[id]} 顆。`;renderChoices();});
    btn.setAttribute('aria-pressed',String(selectedCropId===id));
    const symbol=document.createElement('span');symbol.className='crop-icon';symbol.textContent=crop.icon;
    const label=document.createElement('span'),name=document.createElement('strong'),detail=document.createElement('small');name.textContent=crop.name;detail.textContent=`${crop.growMs/1000} 秒 · 種子 ${state.seeds[id]} 顆`;label.append(name,detail);btn.append(symbol,label);el.cropChoices.append(btn);
  }
}
function renderFarm() {
  const now=Date.now(),fragment=document.createDocumentFragment();let growing=0;
  state.plots.forEach((plot,index)=>{
    const stage=core.stage(plot,now),crop=plot.cropId===null?null:core.CROPS[plot.cropId];
    const plotButton=button('',`plot ${stage}`,()=>handlePlot(index));
    const symbol=document.createElement('span'),label=document.createElement('small');symbol.className='plant';
    if(stage==='empty'){symbol.textContent='·';label.textContent='可播種';plotButton.setAttribute('aria-label',`第 ${index+1} 格空地，播種${core.CROPS[selectedCropId].name}`);}
    else if(stage==='mature'){symbol.textContent=crop.icon;label.textContent='收成！';plotButton.setAttribute('aria-label',`第 ${index+1} 格${crop.name}已成熟，點擊收成`);}
    else {growing++;symbol.textContent=stage==='seed'?'🌰':stage==='sprout'?'🌱':'🌿';const remaining=core.secondsLeft(plot,now);label.textContent=`${crop.name} ${remaining}秒`;plotButton.setAttribute('aria-label',`第 ${index+1} 格${crop.name}成長中，剩 ${remaining} 秒`);}
    plotButton.append(symbol,label);fragment.append(plotButton);
  });
  el.farmGrid.replaceChildren(fragment);el.growingCount.textContent=String(growing);
}
function renderEconomy() {
  el.shopList.replaceChildren();el.inventoryList.replaceChildren();
  for(const id of core.IDS){
    const crop=core.CROPS[id];
    const shop=document.createElement('article');shop.className='item-card';
    const info=document.createElement('div');info.className='item-info';const head=document.createElement('strong');head.textContent=`${crop.icon} ${crop.name}種子`;
    const details=document.createElement('small');details.textContent=`單價 🪙${crop.seedPrice} · 成熟 ${crop.growMs/1000} 秒`;
    info.append(head,details);
    const actions=document.createElement('div');actions.className='item-actions';
    for(const qty of [1,5]) actions.append(button(`買 ${qty} 顆`, 'action-button',()=>apply(core.buy(state,id,qty)),state.coins<crop.seedPrice*qty));
    shop.append(info,actions);el.shopList.append(shop);

    const inv=document.createElement('article');inv.className='item-card';const stock=document.createElement('div');stock.className='item-info';
    const title=document.createElement('strong');title.textContent=`${crop.icon} ${crop.name}`;
    const counts=document.createElement('small');counts.textContent=`種子 ${state.seeds[id]} 顆 · 收成品 ${state.produce[id]} 個 · 售價 🪙${crop.sellPrice}`;
    stock.append(title,counts);
    const sellActions=document.createElement('div');sellActions.className='item-actions';
    sellActions.append(button('賣 1 個','action-button',()=>apply(core.sell(state,id,1)),state.produce[id]<1));
    sellActions.append(button('全部販售','action-button',()=>apply(core.sell(state,id,state.produce[id])),state.produce[id]<1));
    inv.append(stock,sellActions);el.inventoryList.append(inv);
  }
  el.transactionList.replaceChildren();
  if(state.transactions.length===0){const empty=document.createElement('p');empty.className='fineprint';empty.textContent='尚無交易，購買種子或販售作物後會顯示。';el.transactionList.append(empty);}
  for(const tx of state.transactions){const row=document.createElement('div');row.className='transaction';
    const detail=document.createElement('span');detail.textContent=`${tx.detail} · ${new Date(tx.at).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
    const value=document.createElement('strong');value.className=tx.delta>0?'positive':'negative';value.textContent=`${tx.delta>0?'+':''}${tx.delta} 🪙`;row.append(detail,value);el.transactionList.append(row);}
}
function render() {
  el.coinCount.textContent=String(state.coins);el.plantedCount.textContent=String(state.plantedCount);el.harvestedCount.textContent=String(state.harvestedCount);
  el.spentValue.textContent=`🪙 ${state.spent}`;el.earnedValue.textContent=`🪙 ${state.earned}`;el.profitValue.textContent=`🪙 ${state.earned-state.spent}`;
  renderChoices();renderFarm();renderEconomy();
}
el.resetButton.addEventListener('click',()=>{
  if(!window.confirm('要重設農場嗎？所有金幣、作物、庫存與交易紀錄會恢復初始狀態。'))return;
  state=core.initialState();selectedCropId='carrot';el.statusMessage.textContent='農場已重設，恢復 120 金幣與 3 顆胡蘿蔔種子。';render();
});
render();
// Only update the farm clock, not all buttons (prevents focus/keyboard disruption).
setInterval(renderFarm,250);
