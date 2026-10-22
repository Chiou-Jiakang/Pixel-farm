/* Pixel Farm alpha.3 — pure audio event rules, no game-state mutation. */
(function(root, factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.FarmSoundCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const EVENTS=Object.freeze(['plant','harvest','buy','sell','mature','error','reset']);
 const DEFAULT_VOLUME=0.35;
 function clampVolume(value){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):DEFAULT_VOLUME;}
 function readSettings(storage){
  try{const text=storage?.getItem('pixel-farm:audio:v1');if(!text)return {muted:false,volume:DEFAULT_VOLUME};
   const data=JSON.parse(text);return {muted:data.muted===true,volume:clampVolume(data.volume)};
  }catch{return {muted:false,volume:DEFAULT_VOLUME};}
 }
 function serializeSettings(settings){return JSON.stringify({muted:!!settings.muted,volume:clampVolume(settings.volume)});}
 function soundForAction(action,success){if(!success)return 'error';return ['plant','harvest','buy','sell','reset'].includes(action)?action:null;}
 function newlyMature(previous,next){return previous!==undefined && previous!==null && previous!==next && next==='mature';}
 return Object.freeze({EVENTS,DEFAULT_VOLUME,clampVolume,readSettings,serializeSettings,soundForAction,newlyMature});
});
