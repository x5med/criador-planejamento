import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {call} from './bridge.mjs';
const out=new URL('./previews/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const targets=[['overview','6:1038'],['dark','6:2463'],['components','6:482'],['mobile','6:2916'],['library','10:2']];
const outputs=[];
for(const [name,nodeId] of targets){const result=await call('take_screenshot',{nodeId,scale:name==='mobile'?1:0.75});const parts=Array.isArray(result)?result:[result];const pic=parts.find(p=>p?.imagePath);if(pic){const dest=new URL(name+'.png',out);fs.copyFileSync(pic.imagePath,dest);outputs.push({name,nodeId,path:fileURLToPath(dest)});}else outputs.push({name,result});}
fs.writeFileSync(new URL('./final-previews.json',import.meta.url),JSON.stringify(outputs,null,2));console.log(JSON.stringify(outputs));
