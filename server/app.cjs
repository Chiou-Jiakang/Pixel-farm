'use strict';
const express=require('express');
const path=require('node:path');
const core=require('../public/game-core.js');
const {readState,transact,reset}=require('./database.cjs');
function makeApp(db,{now=()=>Date.now()}={}){
  const app=express();
  app.disable('x-powered-by');
  app.use(express.json({limit:'16kb'}));
  app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');next();});
  app.get('/api/health',(_req,res)=>res.json({ok:true,version:'v0.4.0'}));
  app.get('/api/game',(_req,res)=>res.json({state:readState(db),serverTime:now(),crops:core.CROPS}));
  const commands={
    buy:(s,b,t)=>core.buy(s,b.cropId,b.quantity,t),
    plant:(s,b,t)=>core.plant(s,b.index,b.cropId,t),
    harvest:(s,b,t)=>core.harvest(s,b.index,t),
    sell:(s,b,t)=>core.sell(s,b.cropId,b.quantity,t)
  };
  app.post('/api/game/:action',(req,res,next)=>{
    try{
      const action=req.params.action;
      if(req.body && (req.body.cropId!==undefined) && !core.IDS.includes(req.body.cropId))return res.status(400).json({ok:false,message:'無效的作物代碼。'});
      if(action==='reset'){const state=reset(db);return res.json({ok:true,message:'農場已重設。',state,serverTime:now()});}
      if(!Object.hasOwn(commands,action))return res.status(404).json({ok:false,message:'未知操作。'});
      const t=now(),result=transact(db,(s)=>commands[action](s,req.body||{},t),t);
      return res.status(result.ok?200:400).json({ok:result.ok,message:result.message,state:result.state,serverTime:t});
    }catch(e){next(e);}
  });
  app.use('/api',(req,res)=>res.status(404).json({ok:false,message:'找不到 API。'}));
  app.use(express.static(path.join(__dirname,'..','public'),{index:'index.html'}));
  app.use((err,req,res,next)=>{
    if(err.type==='entity.parse.failed')return res.status(400).json({ok:false,message:'JSON 格式錯誤。'});
    console.error('Request failed',err);
    res.status(500).json({ok:false,message:'伺服器發生錯誤。'});
  });
  return app;
}
module.exports={makeApp};
