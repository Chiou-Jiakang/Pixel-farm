'use strict';
const {openDatabase}=require('./database.cjs');
const {makeApp}=require('./app.cjs');
const port=Number(process.env.PORT || 3000);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT 必須是 1–65535');
const db=openDatabase();
const server=makeApp(db).listen(port,'127.0.0.1',()=>{
  console.log(`Pixel Farm v${require('../package.json').version}: http://127.0.0.1:${port}`);
});
function shutdown(){server.close(()=>{db.close();process.exit(0);});}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
