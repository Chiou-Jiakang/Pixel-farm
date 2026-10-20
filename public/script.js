'use strict';
// v0.5.0-alpha.1: the server is authoritative. This file renders snapshots and sends actions only.
const core=window.FarmCore;
let state=null, selectedCropId='carrot', serverOffset=0, busy=false;
const el=Object.fromEntries(['farmGrid','cropChoices','plantedCount','harvestedCount','growingCount','coinCount','statusMessage','resetButton','spentValue','earnedValue','profitValue','shopList','inventoryList','transactionList'].map(id=>[id,document.getElementById(id)]));
function now(){return Date.now()+serverOffset;}
function button(text,className,onClick,disabled=false){
 const b=document.createElement('button');b.type='button';b.textContent=text;b.className=className;b.disabled=busy||disabled;b.addEventListener('click',onClick);return b;
}
function setMessage(message){el.statusMessage.textContent=message;el.statusMessage.classList.remove("message-pulse");void el.statusMessage.offsetWidth;el.statusMessage.classList.add("message-pulse");}
function sprite(name,alt=""){const img=document.createElement("img");img.src=`./assets/crops/${name}.svg`;img.alt=alt;img.className="pixel-sprite";img.width=80;img.height=80;img.decoding="async";return img;}
function adopt(data){if(data.state)state=data.state;if(Number.isFinite(data.serverTime))serverOffset=data.serverTime-Date.now();}
async function request(action,payload={}){
 if(busy)return;busy=true;render();
 try{
  const response=await fetch(`/api/game/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
  const data=await response.json();adopt(data);setMessage(data.message||'操作完成。');
 }catch(e){setMessage('連線失敗：請確認伺服器正在執行，並重新整理頁面。');}
 finally{busy=false;render();}
}
function renderChoices(){el.cropChoices.replaceChildren();for(const id of core.IDS){
 const crop=core.CROPS[id],b=button('',`crop-choice${id===selectedCropId?' selected':''}`,()=>{selectedCropId=id;setMessage(`已選擇${crop.name}，剩餘種子 ${state.seeds[id]} 顆。`);renderChoices();});
 b.setAttribute('aria-pressed',String(id===selectedCropId));const sym=document.createElement('span');sym.className='crop-icon';sym.append(sprite(id,''));
 const wrapper=document.createElement('span'),name=document.createElement('strong'),small=document.createElement('small');name.textContent=crop.name;small.textContent=`${crop.growMs/1000} 秒 · 種子 ${state.seeds[id]} 顆`;wrapper.append(name,small);b.append(sym,wrapper);el.cropChoices.append(b);
}}
function renderFarm(){if(!state)return;const fragment=document.createDocumentFragment();let growing=0;for(let index=0;index<state.plots.length;index++){
 const plot=state.plots[index],phase=core.stage(plot,now()),crop=plot.cropId?core.CROPS[plot.cropId]:null;
 const b=button('',`plot ${phase}`,()=>{
  if(phase==='empty')request('plant',{index,cropId:selectedCropId});else request('harvest',{index});
 });
 const sym=document.createElement('span'),label=document.createElement('small');sym.className='plant';
 if(phase==='empty'){sym.textContent='+';label.textContent='可播種';b.setAttribute('aria-label',`第 ${index+1} 格空地，播種${core.CROPS[selectedCropId].name}`);}
 else if(phase==='mature'){sym.append(sprite(plot.cropId,''));label.textContent='收成！';b.setAttribute('aria-label',`第 ${index+1} 格${crop.name}已成熟，點擊收成`);}
 else{growing++;sym.append(sprite(phase==='seed'?'seed':phase==='sprout'?'sprout':'growth',''));const left=core.secondsLeft(plot,now());label.textContent=`${crop.name} ${left}秒`;b.setAttribute('aria-label',`第 ${index+1} 格${crop.name}成長中，剩 ${left} 秒`);}
 b.dataset.plotIndex=String(index);b.append(sym,label);fragment.append(b);
 }el.farmGrid.replaceChildren(fragment);el.growingCount.textContent=String(growing);
}
function renderEconomy(){el.shopList.replaceChildren();el.inventoryList.replaceChildren();for(const id of core.IDS){
 const crop=core.CROPS[id];const shop=document.createElement('article');shop.className='item-card';const info=document.createElement('div');info.className='item-info';const heading=document.createElement('strong');heading.textContent=`${crop.icon} ${crop.name}種子`;const small=document.createElement('small');small.textContent=`單價 🪙${crop.seedPrice} · 成熟 ${crop.growMs/1000} 秒`;info.append(heading,small);
 const actions=document.createElement('div');actions.className='item-actions';for(const quantity of [1,5])actions.append(button(`買 ${quantity} 顆`,'action-button',()=>request('buy',{cropId:id,quantity}),state.coins<crop.seedPrice*quantity));shop.append(info,actions);el.shopList.append(shop);
 const inv=document.createElement('article');inv.className='item-card';const stock=document.createElement('div');stock.className='item-info';const title=document.createElement('strong');title.textContent=`${crop.icon} ${crop.name}`;const counts=document.createElement('small');counts.textContent=`種子 ${state.seeds[id]} 顆 · 收成品 ${state.produce[id]} 個 · 售價 🪙${crop.sellPrice}`;stock.append(title,counts);
 const sellActions=document.createElement('div');sellActions.className='item-actions';sellActions.append(button('賣 1 個','action-button',()=>request('sell',{cropId:id,quantity:1}),state.produce[id]<1));sellActions.append(button('全部販售','action-button',()=>request('sell',{cropId:id,quantity:state.produce[id]}),state.produce[id]<1));inv.append(stock,sellActions);el.inventoryList.append(inv);
 }
 el.transactionList.replaceChildren();if(!state.transactions.length){const p=document.createElement('p');p.className='fineprint';p.textContent='尚無交易，購買種子或販售作物後會顯示。';el.transactionList.append(p);}
 for(const tx of state.transactions){const line=document.createElement('div');line.className='transaction';const name=document.createElement('span');name.textContent=`${tx.detail} · ${new Date(tx.at).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;const val=document.createElement('strong');val.className=tx.delta>0?'positive':'negative';val.textContent=`${tx.delta>0?'+':''}${tx.delta} 🪙`;line.append(name,val);el.transactionList.append(line);}
}
function render(){if(!state)return;el.coinCount.textContent=state.coins;el.plantedCount.textContent=state.plantedCount;el.harvestedCount.textContent=state.harvestedCount;el.spentValue.textContent=`🪙 ${state.spent}`;el.earnedValue.textContent=`🪙 ${state.earned}`;el.profitValue.textContent=`🪙 ${state.earned-state.spent}`;el.resetButton.disabled=busy;renderChoices();renderFarm();renderEconomy();}
el.resetButton.addEventListener('click',()=>{if(window.confirm('要重設農場嗎？資料庫中的金幣、作物、庫存與交易紀錄都會被清空！'))request('reset');});
async function refresh(){if(busy)return;try{const response=await fetch('/api/game',{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);adopt(await response.json());render();}catch(e){setMessage('目前無法連線至伺服器。請在 Pixel-farm 根目錄執行 npm start。');}}
setMessage('正在載入 SQLite 存檔…');refresh();setInterval(()=>{if(!busy)renderFarm();},500);setInterval(refresh,15000);
