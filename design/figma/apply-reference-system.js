// Apply the approved monochrome + lime reference to existing X5 screens.
const page = await figma.getNodeByIdAsync('0:1');
await figma.setCurrentPageAsync(page);
const changed = new Set(), created = [], changedVars = [], changedStyles = [];
const fonts = new Map();
for (const t of page.findAllWithCriteria({types:['TEXT']}))
  for (const s of t.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName), s.fontName);
await Promise.all([...fonts.values()].map(f => figma.loadFontAsync(f)));
await figma.loadFontAsync({family:'Inter',style:'Bold'});
await figma.loadFontAsync({family:'Inter',style:'Extra Bold'});
const rgb = h => ({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const hex = c => '#'+['r','g','b'].map(k=>Math.round(c[k]*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const vars = await figma.variables.getLocalVariablesAsync();
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const pc = cols.find(c=>c.name==='X5 · Primitives'), sc = cols.find(c=>c.name==='X5 · Semantic');
const vm = new Map(vars.map(v=>[v.name,v]));
const palette = {
'neutral/ink':'#111111','neutral/canvas':'#E7EBE4','neutral/sidebar':'#FFFFFF',
'neutral/white':'#FFFFFF','neutral/muted':'#555B52','neutral/border':'#D9DED3',
'brand/gold':'#D8F36A','brand/gold-light':'#EDF8C0','info/surface':'#DDF1ED',
'info/text':'#2B5A50','coral/surface':'#F9DED8','coral/text':'#884D42',
'dark/canvas':'#151714','dark/sidebar':'#10120F','dark/surface':'#232620',
'dark/text':'#F8FAF6','dark/muted':'#B8C0B3','dark/border':'#424A3D','dark/icon':'#D8F36A',
'state/focus':'#59710B','state/neutral-bg':'#EEF2E7','state/neutral-text':'#3E4931',
'state/disabled-bg':'#E3E7DE','state/disabled-text':'#7B8373'
};
for(const [name,color] of Object.entries(palette)){
 const alternate=name==='brand/gold'?'brand/lime':name==='brand/gold-light'?'brand/lime-soft':name;
 const v=vars.find(v=>v.variableCollectionId===pc.id&&(v.name===name||v.name===alternate)); if(!v)continue;
 for(const m of Object.keys(v.valuesByMode))v.setValueForMode(m,{...rgb(color),a:1});
 if(name==='brand/gold')v.name='brand/lime';
 if(name==='brand/gold-light')v.name='brand/lime-soft';
 v.setVariableCodeSyntax('WEB','var(--x5-'+v.name.replaceAll('/','-')+')');
 changedVars.push(v.id);if(!vm.has(v.name)||vm.get(v.name).variableCollectionId!==sc.id)vm.set(v.name,v);
}
function primitive(name,color,a){
 let v=vars.find(v=>v.name===name&&v.variableCollectionId===pc.id);
 if(!v){v=figma.variables.createVariable(name,pc,'COLOR');created.push(v.id);}
 v.scopes=['FRAME_FILL','SHAPE_FILL'];v.setValueForMode(pc.defaultModeId,{...rgb(color),a});
 v.setVariableCodeSyntax('WEB','var(--x5-'+name.replaceAll('/','-')+')');vm.set(name,v);changedVars.push(v.id);return v;
}
const glassLight=primitive('glass/light','#FFFFFF',0.4),glassDark=primitive('glass/dark','#171A16',0.76);
primitive('brand/mint','#A8E4DA',1);
let glass=vars.find(v=>v.name==='surface/glass'&&v.variableCollectionId===sc.id);
if(!glass){glass=figma.variables.createVariable('surface/glass',sc,'COLOR');created.push(glass.id);}
glass.scopes=['FRAME_FILL','SHAPE_FILL'];glass.setVariableCodeSyntax('WEB','var(--surface-glass)');
for(const m of sc.modes)glass.setValueForMode(m.modeId,figma.variables.createVariableAlias(m.name==='Dark'?glassDark:glassLight));
vm.set(glass.name,glass);changedVars.push(glass.id);
const map={
'#151611':'#111111','#F4F3ED':'#E7EBE4','#EBE9DF':'#F4F6F1','#FFFEFA':'#FFFFFF',
'#C8A253':'#D8F36A','#E8CD8D':'#EDF8C0','#8F6B28':'#59710B','#626258':'#555B52',
'#54544B':'#4C5347','#5F4A22':'#43530F','#45351B':'#3E4931','#594A2B':'#465323',
'#DED9C8':'#E8EDDD','#CEC9B9':'#D4DCCE','#DEDDD4':'#D9DED3','#E1DCCF':'#DDE4D6',
'#F0ECE1':'#E8ECE5','#F6F4EC':'#F0F3EC','#E4DDC9':'#DDE6CA','#EEE4CC':'#EAF2D0',
'#DED9CA':'#DCE2D5','#1D1E18':'#232620','#F9F7F0':'#F4F6F0','#D9D3C2':'#D5DDCA',
'#E7E2D3':'#E2E9D8','#5B594D':'#4B5541','#D6CEBA':'#D1DBC5','#5A5749':'#45503B',
'#E1DBCC':'#DAE3CF','#FBF9F1':'#F8FAF4','#AE9662':'#91A969','#F0E7D2':'#EDF8C0',
'#DFCEAA':'#D8E8AE','#6B542A':'#465925','#EEF2F6':'#EAF5F2','#EBE7DA':'#E7EDD9',
'#B78D3D':'#8DAE26','#F0EADB':'#F1F5E9','#EFDFB5':'#EAF7B7','#F7F5EE':'#F7FAF2',
'#F0ECE2':'#EEF4E6','#EEE8D9':'#EEF2E7','#454337':'#424A3D','#E8E3D3':'#E1EBD5',
'#171812':'#1D211A','#D4CBB5':'#CAD7BC','#272820':'#2A3025','#DAD5C7':'#D7E0CF',
'#777363':'#A9B39F','#F0E5CE':'#ECF5D9','#3A3B31':'#3C4733','#DAD2BF':'#D6E1C9',
'#464435':'#4A563E','#E8D9B6':'#E8F3D4','#414237':'#424A3D','#D4CEBD':'#CDDCC0',
'#393729':'#37442C','#E4D6B4':'#DFF0BD'
};
for(const n of page.findAll()){
 for(const field of ['fills','strokes'])if(field in n&&Array.isArray(n[field])){
  let mod=false;const paints=n[field].map(p=>{if(p.type!=='SOLID'||p.boundVariables?.color)return p;
   const target=map[hex(p.color)];if(!target)return p;mod=true;return {...p,color:rgb(target)};});
  if(mod){n[field]=paints;changed.add(n.id);}
 }
 if((n.type==='COMPONENT'||n.type==='COMPONENT_SET')&&n.name.includes('Gold')){n.name=n.name.replaceAll('Gold','Lime');changed.add(n.id);}
}
const effectStyles=await figma.getLocalEffectStylesAsync();
async function effect(name,effects){
 let s=effectStyles.find(s=>s.name===name);if(!s){s=figma.createEffectStyle();s.name=name;created.push(s.id);}
 s.effects=effects;changedStyles.push(s.id);return s;
}
const cardEffect=await effect('X5/Effects/Soft card',[{type:'DROP_SHADOW',color:{r:0.12,g:0.16,b:0.09,a:0.055},offset:{x:0,y:5},radius:18,spread:0,visible:true,blendMode:'NORMAL'}]);
const glassEffect=await effect('X5/Effects/Frosted panel',[{type:'BACKGROUND_BLUR',radius:28,blurType:'NORMAL',visible:true},{type:'DROP_SHADOW',color:{r:0,g:0,b:0,a:0.09},offset:{x:0,y:16},radius:44,spread:0,visible:true,blendMode:'NORMAL'}]);
const sidebarEffect=await effect('X5/Effects/Floating sidebar',[{type:'DROP_SHADOW',color:{r:0,g:0,b:0,a:0.04},offset:{x:6,y:0},radius:24,spread:0,visible:true,blendMode:'NORMAL'}]);
function bindPaint(n,field,name,opacity=1){
 const variable=vm.get(name);n[field]=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb('#FFFFFF'),opacity},'color',variable)];changed.add(n.id);
}
function radius(n,value){
 const v=vm.get('radius/'+value);
 for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])n.setBoundVariable(k,v);
 changed.add(n.id);
}
function withinInstance(n){let q=n.parent;while(q&&q.type!=='PAGE'){if(q.type==='INSTANCE')return true;q=q.parent;}return false;}
const allFrames=page.findAllWithCriteria({types:['FRAME']});
const roots=new Set(['X5 App','New planning','X5 Design foundations','X5 Components and states','Mobile New planning','Mobile Interview','Mobile Overview']);
const cardNames=new Set(['Strategic thesis','Strategic priorities','Decision readiness','Non goals','First 90 days','Typography','Geometry','Semantic color','Source references','Buttons','Badges','Input states','Choice control','state-box','Reset confirmation','Export options','Method illustration','card','Question','AI coach','Previous answers','Readiness','Missing evidence','Why it matters','Generate early','Declared facts','Assumptions','Critical gaps','SWOT','Strategic issue','Avenue 01','Avenue 02','Avenue 03','Chosen thesis','Priorities','Renunciations','Capabilities','Objective and KRs','Initiatives','Financial assumptions','Scenarios','Sponsor','Plan owner','Management cadence','Risk map','Start form','Mobile question','Mobile context','Mobile history','Mobile thesis','Mobile priorities']);
let cards=0,panels=0,sidebars=0;
for(const n of allFrames){
 if(withinInstance(n))continue;
 if(cardNames.has(n.name)||n.name.startsWith('DS/Stat/')){
  radius(n,n.width<390?24:32);n.strokes=[];await n.setEffectStyleIdAsync(cardEffect.id);changed.add(n.id);cards++;
 }
 if(n.name.startsWith('DS/Sidebar/')){
  radius(n,48);bindPaint(n,'fills','surface/sidebar',0.94);n.strokes=[];await n.setEffectStyleIdAsync(sidebarEffect.id);sidebars++;
 }
 if(n.name==='input'||n.name==='answer'){radius(n,18);bindPaint(n,'strokes','border/default');}
 if(n.name==='period'||n.name==='Local saving'||n.name==='Mobile context'){radius(n,24);}
 if(n.name==='small-icon'){radius(n,999);n.strokes=[];}
 if(n.name==='nav-item'||n.name==='phase'){radius(n,999);}
 if(n.name==='Frame'&&n.width<=26&&n.height<=26&&n.children.some(c=>c.type==='VECTOR')){n.fills=[];changed.add(n.id);}
 if(roots.has(n.name)){
  bindPaint(n,'fills','surface/glass');radius(n,n.width<500?32:48);
  n.strokes=[{type:'SOLID',color:rgb('#FFFFFF'),opacity:0.68}];n.strokeWeight=1;
  n.clipsContent=true;await n.setEffectStyleIdAsync(glassEffect.id);panels++;
 }
 if(n.name==='mobile-header'){n.resize(n.width,52);changed.add(n.id);}
}
const styles=await figma.getLocalTextStylesAsync();
for(const s of styles){
 if([36,42,45,70].includes(s.fontSize)){s.fontName={family:'Inter',style:'Extra Bold'};changedStyles.push(s.id);}
 else if(s.fontSize===19){s.fontName={family:'Inter',style:'Bold'};changedStyles.push(s.id);}
}
const darkMode=sc.modes.find(m=>m.name==='Dark').modeId,lightMode=sc.modes.find(m=>m.name==='Light').modeId;
for(const n of allFrames){
 if(['Strategic thesis','Mobile thesis'].includes(n.name)){
  n.setExplicitVariableModeForCollection(sc,darkMode);bindPaint(n,'fills','neutral/ink');n.strokes=[];
  for(const t of n.findAllWithCriteria({types:['TEXT']})){if(withinInstance(t))continue;bindPaint(t,'fills','text/on-dark',t.parent?.name==='muted'||t.parent?.name==='eyebrow'?0.76:1);}
 }
 if(['Decision readiness','Readiness','Plan owner','AI coach'].includes(n.name)){
  n.setExplicitVariableModeForCollection(sc,lightMode);bindPaint(n,'fills',n.name==='AI coach'?'brand/lime-soft':'action/accent');n.strokes=[];
 }
}
const rgba=(h,a=1)=>({...rgb(h),a});
function backdrop(dark){return [{type:'GRADIENT_LINEAR',gradientTransform:[[0.82,0.36,-0.1],[-0.36,0.82,0.25]],gradientStops:dark?[{position:0,color:rgba('#46513F')},{position:0.55,color:rgba('#242A21')},{position:1,color:rgba('#69725F')}]:[{position:0,color:rgba('#D6DAD3')},{position:0.48,color:rgba('#F3F5F0')},{position:1,color:rgba('#BFC6B9')}]}];}
const wrapped=[];
for(const outer of page.children){
 if(outer.type!=='FRAME'||outer.id==='10:2')continue;
 const root=outer.children.find(n=>n.type==='FRAME'&&roots.has(n.name));if(!root)continue;
 const mobile=root.width<500,mat=mobile?0:28;
 root.x=mat;root.y=mat;
 outer.fills=backdrop(outer.name.includes('Tema escuro'));outer.clipsContent=true;radius(outer,mobile?32:48);
 if(mobile&&root.layoutMode==='VERTICAL')root.primaryAxisSizingMode='AUTO';
 outer.resize(root.width+mat*2,root.height+mat*2);changed.add(outer.id);changed.add(root.id);
 wrapped.push({id:outer.id,rootId:root.id,w:outer.width,h:outer.height});
}
const lib=await figma.getNodeByIdAsync('10:2');bindPaint(lib,'fills','neutral/canvas');radius(lib,32);
const texts={
'6:348':'Painéis translúcidos, formas generosas e contraste. Branco para leitura, preto para foco e lima para destacar a próxima ação.',
'6:359':'Lima / destaque','6:361':'#D8F36A','6:368':'#111111','6:373':'Névoa / canvas','6:375':'#E7EBE4','6:382':'#FFFFFF','6:387':'Lima suave / apoio','6:389':'#EDF8C0','6:394':'Preto / foco','6:396':'#111111',
'6:474':'Texto e ícone acompanham a cor. Lima recebe texto escuro; estados continuam identificados por rótulos.',
'6:479':'TaskLab · Painéis translúcidos e navegação em pílulas.',
'6:480':'Cards brancos, preto de foco e lima de destaque.',
'6:481':'Grupo X5 · Conteúdo estratégico e logo em PNG.',
'10:3':'X5 / Biblioteca nativa · Lima e vidro'
};
for(const [id,value]of Object.entries(texts)){const n=await figma.getNodeByIdAsync(id);if(n?.type==='TEXT'){n.characters=value;changed.add(n.id);}}
const foundation=await figma.getNodeByIdAsync('6:328');foundation.name='00 · Fundações — X5 / Lima e vidro';changed.add(foundation.id);
const rows={'6:1357':3000,'6:1627':3000,'6:1900':3000,'6:2216':4750,'6:2463':4750,'6:2782':6300,'6:2844':6300,'6:2916':6300};
for(const [id,y]of Object.entries(rows)){const n=await figma.getNodeByIdAsync(id);n.y=y;changed.add(n.id);}
return {createdNodeIds:created,mutatedNodeIds:[...changed],mutatedVariableIds:changedVars,mutatedStyleIds:changedStyles,cards,panels,sidebars,wrapped};
