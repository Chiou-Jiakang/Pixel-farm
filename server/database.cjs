'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
const core=require('../public/game-core.js');
const DB_PATH=process.env.PIXEL_FARM_DB_PATH || path.join(__dirname,'..','data','pixel-farm.sqlite');
function openDatabase(filename=DB_PATH){
  if(filename!==':memory:')fs.mkdirSync(path.dirname(filename),{recursive:true});
  const db=new DatabaseSync(filename);
  db.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  db.exec(`CREATE TABLE IF NOT EXISTS game (
    id INTEGER PRIMARY KEY CHECK(id=1), coins INTEGER NOT NULL CHECK(coins>=0), planted_count INTEGER NOT NULL,
    harvested_count INTEGER NOT NULL, spent INTEGER NOT NULL, earned INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS plots (
    slot INTEGER PRIMARY KEY CHECK(slot BETWEEN 0 AND 15), crop_id TEXT, planted_at INTEGER,
    CHECK ((crop_id IS NULL AND planted_at IS NULL) OR (crop_id IN ('carrot','potato','tomato') AND planted_at IS NOT NULL))
  );
  CREATE TABLE IF NOT EXISTS inventory (
    crop_id TEXT PRIMARY KEY CHECK(crop_id IN ('carrot','potato','tomato')),
    seeds INTEGER NOT NULL CHECK(seeds>=0), produce INTEGER NOT NULL CHECK(produce>=0),
    harvested INTEGER NOT NULL CHECK(harvested>=0)
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL CHECK(type IN ('buy','sell')),
    detail TEXT NOT NULL, delta INTEGER NOT NULL, balance INTEGER NOT NULL CHECK(balance>=0), at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_tx_at ON transactions(id DESC);`);
  if(!db.prepare('SELECT id FROM game WHERE id=1').get())saveState(db,core.initialState(),true);
  return db;
}
function readState(db){
  const row=db.prepare('SELECT * FROM game WHERE id=1').get();
  if(!row) throw new Error('Missing game state');
  const s=core.initialState();
  s.coins=row.coins;s.plantedCount=row.planted_count;s.harvestedCount=row.harvested_count;s.spent=row.spent;s.earned=row.earned;
  for(const p of db.prepare('SELECT * FROM plots ORDER BY slot').all())s.plots[p.slot]={cropId:p.crop_id,plantedAt:p.planted_at};
  for(const i of db.prepare('SELECT * FROM inventory').all()){s.seeds[i.crop_id]=i.seeds;s.produce[i.crop_id]=i.produce;s.harvestByCrop[i.crop_id]=i.harvested;}
  s.transactions=db.prepare('SELECT type,detail,delta,balance,at FROM transactions ORDER BY id DESC LIMIT 20').all();
  return s;
}
function saveState(db,s,reset=false){
  db.prepare(`INSERT INTO game(id,coins,planted_count,harvested_count,spent,earned) VALUES(1,?,?,?,?,?)
  ON CONFLICT(id) DO UPDATE SET coins=excluded.coins,planted_count=excluded.planted_count,
  harvested_count=excluded.harvested_count,spent=excluded.spent,earned=excluded.earned`).run(s.coins,s.plantedCount,s.harvestedCount,s.spent,s.earned);
  const plotStmt=db.prepare('INSERT INTO plots(slot,crop_id,planted_at) VALUES(?,?,?) ON CONFLICT(slot) DO UPDATE SET crop_id=excluded.crop_id,planted_at=excluded.planted_at');
  s.plots.forEach((p,i)=>plotStmt.run(i,p.cropId,p.plantedAt));
  const invStmt=db.prepare('INSERT INTO inventory(crop_id,seeds,produce,harvested) VALUES(?,?,?,?) ON CONFLICT(crop_id) DO UPDATE SET seeds=excluded.seeds,produce=excluded.produce,harvested=excluded.harvested');
  for(const id of core.IDS)invStmt.run(id,s.seeds[id],s.produce[id],s.harvestByCrop[id]);
  if(reset)db.exec('DELETE FROM transactions');
}
function appendTransaction(db,tx){
  db.prepare('INSERT INTO transactions(type,detail,delta,balance,at) VALUES(?,?,?,?,?)').run(tx.type,tx.detail,tx.delta,tx.balance,tx.at);
}
function transact(db,operation,now=Date.now()){
  db.exec('BEGIN IMMEDIATE');
  try{
    const old=readState(db),result=operation(old,now);
    if(!result.ok){db.exec('ROLLBACK');return {...result,state:old};}
    saveState(db,result.state,false);
    if(result.state.transactions[0] !== old.transactions[0]){
      // Appending buy/sell only, so plant/harvest never adds a transaction.
      const entry=result.state.transactions[0];if(entry && (entry.type==='buy'||entry.type==='sell'))appendTransaction(db,entry);
    }
    db.exec('COMMIT');return {...result,state:readState(db)};
  }catch(e){db.exec('ROLLBACK');throw e;}
}
function reset(db){db.exec('BEGIN IMMEDIATE');try{saveState(db,core.initialState(),true);db.exec('COMMIT');return readState(db);}catch(e){db.exec('ROLLBACK');throw e;}}
module.exports={openDatabase,readState,transact,reset,DB_PATH};
