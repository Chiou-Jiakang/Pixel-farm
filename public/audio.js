/* Pixel Farm alpha.3 — browser-only synthesized SFX. No assets or network requests. */
(function(root){
 'use strict';
 const rules=root.FarmSoundCore;
 const storage=(()=>{try{return root.localStorage;}catch{return null;}})();
 let settings=rules.readSettings(storage);
 let context=null;
 let userActivated=false;
 const patterns=Object.freeze({
  plant:[[330,0,.075,'triangle'],[440,.075,.09,'triangle']],
  harvest:[[523,0,.09,'sine'],[659,.10,.10,'sine'],[784,.21,.14,'sine']],
  buy:[[420,0,.07,'triangle'],[620,.08,.10,'triangle']],
  sell:[[600,0,.09,'sine'],[820,.10,.12,'sine']],
  mature:[[740,0,.07,'sine'],[920,.09,.11,'sine']],
  error:[[220,0,.1,'triangle'],[180,.11,.14,'triangle']],
  reset:[[460,0,.09,'sine'],[300,.10,.13,'sine']]
 });
 function save(){try{storage?.setItem('pixel-farm:audio:v1',rules.serializeSettings(settings));}catch{/* storage may be blocked */}}
 function activate(){userActivated=true;const AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;
  try{if(!context)context=new AC();if(context.state==='suspended')void context.resume().catch(()=>{});return true;}catch{return false;}}
 function play(event){
  if(!patterns[event]||settings.muted||settings.volume<=0||!userActivated||!context||context.state!=='running')return false;
  try{const t=context.currentTime+.015;
   for(const [frequency,offset,duration,wave] of patterns[event]){
    const osc=context.createOscillator(),gain=context.createGain();osc.type=wave;osc.frequency.setValueAtTime(frequency,t+offset);
    gain.gain.setValueAtTime(.0001,t+offset);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,settings.volume*.11),t+offset+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,t+offset+duration);
    osc.connect(gain);gain.connect(context.destination);osc.start(t+offset);osc.stop(t+offset+duration+.025);
   }return true;
  }catch{return false;}
 }
 function setMuted(muted){settings={...settings,muted:!!muted};save();return getSettings();}
 function setVolume(volume){settings={...settings,volume:rules.clampVolume(volume)};save();return getSettings();}
 function getSettings(){return {...settings};}
 root.FarmAudio=Object.freeze({activate,play,setMuted,setVolume,getSettings});
})(window);
