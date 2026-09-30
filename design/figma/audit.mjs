import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {call} from './bridge.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url));
const state=JSON.parse(fs.readFileSync(path.join(dir,'figma-state.json'),'utf8'));
const specs={};const summary=[];
function walk(n,f,anc=[]){f(n,anc);for(const c of n.children??[])walk(c,f,[...anc,n]);}
for(const [id,s] of Object.entries(state.screens)){
 const spec=await call('get_spec',{nodeId:s.nodeId});specs[id]=spec;
 const fonts=new Set();const types={};const images=[];
 walk(spec.uiSpec.root,n=>{types[n.type]=(types[n.type]||0)+1;if(n.text?.fontFamily)fonts.add(n.text.fontFamily);if(n.visual?.fills==='image')images.push(n.id);});
 summary.push({id,nodeId:s.nodeId,width:spec.selectedNode.width,height:spec.selectedNode.height,stats:spec.uiSpec.stats,fonts:[...fonts],types,images});
}
fs.writeFileSync(path.join(dir,'specs.json'),JSON.stringify(specs));
fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary.map(s=>({id:s.id,nodeId:s.nodeId,size:[s.width,s.height],fonts:s.fonts,nodes:s.stats.totalNodes,text:s.stats.textNodes,images:s.images.length}))));
if(process.argv.includes('--inspect-icons')){
 let i=0;walk(specs['09-dark'].uiSpec.root,(n,anc)=>{if(n.type==='VECTOR'&&i++<7)console.log(JSON.stringify({n,anc:anc.map(a=>({name:a.name,fill:a.visual?.fillColors}))}));});
}
