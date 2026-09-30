import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const port=fs.readFileSync(path.join(os.tmpdir(),'x5-designagent-port.txt'),'utf8').trim();
export async function call(name,args={}) {
  const r=await fetch(`http://127.0.0.1:${port}/call`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,arguments:args})});
  const result=await r.json();
  if(!r.ok||result.isError)throw new Error(JSON.stringify(result));
  const content=result.content?.filter(c=>c.type==='text').map(c=>{try{return JSON.parse(c.text)}catch{return c.text}})??result;
  return Array.isArray(content)&&content.length===1?content[0]:content;
}
if(process.argv[1]?.endsWith('bridge.mjs')){
 const args=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):{};
 console.log(JSON.stringify(await call(process.argv[2],args),null,2));
}
