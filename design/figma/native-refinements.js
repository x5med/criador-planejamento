
const page=figma.currentPage,changed=[],created=[];
const orphan=page.children.find(n=>n.type==='RECTANGLE'&&n.name==='Preview background');if(orphan)orphan.remove();
const fm=new Map();for(const t of page.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fm.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fm.values()].map(f=>figma.loadFontAsync(f)));
const bs=await figma.getNodeByIdAsync('10:466');
for(const m of bs.children.filter(n=>n.type==='COMPONENT')){
 for(const s of m.children.filter(n=>n.type==='FRAME'&&n.name==='span')){s.layoutMode='HORIZONTAL';s.primaryAxisSizingMode='AUTO';s.counterAxisSizingMode='AUTO';s.layoutSizingHorizontal='HUG';s.layoutSizingVertical='HUG';changed.push(s.id);}
 const icon=m.children.find(n=>n.type==='INSTANCE'&&n.name==='Icon');
 const inverse=m.name.includes('Tone=black'),petrol=m.name.includes('Petrol outline');
 const c=inverse?{r:1,g:1,b:1}:petrol?{r:.784,g:.871,b:.839}:{r:.0784,g:.0863,b:.0745};
 for(const v of icon.findAllWithCriteria({types:['VECTOR']})){v.strokes=v.strokes.map(p=>p.type==='SOLID'?{...p,color:c,boundVariables:{}}:p);changed.push(v.id);}
 if(m.name.includes('Disabled')){icon.componentPropertyReferences={mainComponent:icon.componentPropertyReferences.mainComponent};icon.visible=false;changed.push(icon.id);}
}
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const backdrop=(set,x,y,w,h)=>{const r=figma.createRectangle();r.name='Preview background';const p=set.parent;p.insertChild(p.children.indexOf(set),r);r.layoutPositioning='ABSOLUTE';r.x=set.x+x;r.y=set.y+y;r.resize(w,h);r.fills=[{type:'SOLID',color:rgb('#082D33')}];r.cornerRadius=12;created.push(r.id);};
const is=await figma.getNodeByIdAsync('10:71');
for(const m of is.children.filter(n=>n.type==='COMPONENT'&&(/Inverse|Petrol/.test(n.name))))backdrop(is,m.x-6,m.y-6,40,32);
for(const m of bs.children.filter(n=>n.type==='COMPONENT'&&n.name.includes('Petrol')))backdrop(bs,m.x-10,m.y-10,250,64);
const brands=await figma.getNodeByIdAsync('10:733');const bm=brands.children.find(n=>n.type==='COMPONENT'&&n.name==='Theme=Dark');backdrop(brands,bm.x-10,bm.y-10,240,50);
const routes={'Visão geral':'6:1038','Diagnóstico':'6:1357','Escolhas':'6:1627','Execução':'6:1900','Governança':'6:2216'};
let connections=[];
async function link(n,to){await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:to,navigation:'NAVIGATE',transition:null}]}]);changed.push(n.id);connections.push({from:n.id,to,label:n.name});}
for(const root of page.children.filter(n=>n.type==='FRAME'&&n.id!=='10:2')){
const mobile=root.width<500;
for(const n of root.findAll(n=>(n.type==='FRAME'&&(n.name==='nav-item'||n.name==='nav-item selected'||n.name==='tab'||n.name==='tab active')))){
const words=n.findAllWithCriteria({types:['TEXT']}).map(t=>t.characters).join('');const dest=routes[words];if(dest&&!mobile&&dest!==root.id)await link(n,dest);}
for(const b of root.findAll(n=>n.type==='INSTANCE'&&n.name.startsWith('DS/Button/'))){
const label=b.findAllWithCriteria({types:['TEXT']})[0]?.characters;let to=null;
if(label==='Começar planejamento'||label==='Começar entrevista')to=mobile?'6:2844':'6:799';
if(label==='Gerar plano agora'||label==='Gerar plano')to=mobile?'6:2916':'6:1038';
if(label==='Novo plano')to=mobile?'6:2782':'6:682';
if(label==='Revisar diagnóstico')to='6:1357';
if(label==='Ver escolhas')to='6:1627';
if(label==='Voltar à entrevista')to='6:799';
if(to&&root.id!=='6:482')await link(b,to);
}
}
page.flowStartingPoints=[{nodeId:'6:682',name:'Desktop · Novo planejamento'},{nodeId:'6:2782',name:'Mobile · Novo planejamento'},{nodeId:'6:1038',name:'Desktop · Explorar plano'}];
changed.push(page.id);
return {connectionCount:connections.length,connections,createdNodeIds:created,mutatedNodeIds:changed};
