import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {call} from './bridge.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url));
const statePath=path.join(dir,'figma-state.json');
const state=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):{file:'Sem título',transport:'DesignAgent Claude bridge',screens:{}};
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
for(const s of manifest.filter(s=>process.argv.slice(2).includes(s.id))){
 const existing=state.screens[s.id]?.nodeId;
 if(existing&&!process.argv.includes('--replace')){console.log(JSON.stringify({skip:s.id,nodeId:existing}));continue;}
 const result=await call('html_to_design',{path:s.path,width:s.width,x:s.x,y:s.y,...(existing?{replaceId:existing}:{})});
 state.screens[s.id]={...s,result};
 const nodeId=result.nodeId||result.id||result.frameId;
 state.screens[s.id].nodeId=nodeId;
 fs.writeFileSync(statePath,JSON.stringify(state,null,2));
 console.log(JSON.stringify({screen:s.id,result}));
 if(!nodeId)throw new Error('Missing node ID');
 const screenshot=await call('take_screenshot',{nodeId,scale:.7});
 state.screens[s.id].screenshot=screenshot;
 fs.writeFileSync(statePath,JSON.stringify(state,null,2));
 console.log(JSON.stringify({screen:s.id,screenshot}));
}
