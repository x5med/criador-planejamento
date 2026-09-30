
const page=figma.currentPage;
const fontMap=new Map();
for(const t of page.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fontMap.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fontMap.values()].map(f=>figma.loadFontAsync(f)));
const created=[],removed=[],mutated=[],replacements=[],familySets=[];
const vars=await figma.variables.getLocalVariablesAsync(),vm=Object.fromEntries(vars.map(v=>[v.name,v]));
const colls=await figma.variables.getLocalVariableCollectionsAsync(),sem=colls.find(c=>c.name==='X5 · Semantic');
const darkRoot=await figma.getNodeByIdAsync('6:2463'),darkIds=new Set(darkRoot.findAll().map(n=>n.id));
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const library=figma.createFrame();library.name='13 · Biblioteca nativa — X5';library.x=4800;library.y=0;library.layoutMode='VERTICAL';library.primaryAxisSizingMode='AUTO';library.counterAxisSizingMode='FIXED';library.resize(1440,100);library.paddingTop=48;library.paddingBottom=48;library.paddingLeft=48;library.paddingRight=48;library.itemSpacing=32;library.fills=[{type:'SOLID',color:rgb('#F0F1EB')}];created.push(library.id);
function text(str,size=16){const t=figma.createText();t.fontName={family:'Inter',style:size>=24?'Semi Bold':'Regular'};t.characters=str;t.fontSize=size;t.fills=[{type:'SOLID',color:rgb('#141613')}];library.appendChild(t);t.textAutoResize='HEIGHT';t.resize(1344,t.height);created.push(t.id);return t;}
text('X5 / Biblioteca nativa',36);text('Componentes editáveis • propriedades de texto e ícone • tokens semânticos Light / Dark');
const sources=page.findAll(n=>n.type==='FRAME'&&(/DS\/Button\//.test(n.name)||/DS\/Badge\//.test(n.name)||n.name==='DS/Brand/X5'));
const buttonSources=sources.filter(n=>n.name.startsWith('DS/Button/'));
const iconMap=new Map(),iconRecords=[];
const sigIcon=n=>JSON.stringify(n.findAllWithCriteria({types:['VECTOR']}).map(v=>[v.vectorPaths,v.strokes,v.x,v.y,v.width,v.height]));
const iconNames={'Novo plano':'Plus','Exportar plano':'Download','Revisar diagnóstico':'Arrow up right','Gerar plano':'Sparkles','Gerar plano agora':'Sparkles','Me ajude a responder':'Sparkles','Voltar':'Arrow left','Voltar à entrevista':'Arrow left','Preparando…':'Clock','Markdown':'File','JSON':'Brackets'};
for(const src of buttonSources){
 const icon=src.children.find(n=>n.type==='FRAME'&&n.name==='Frame');if(!icon)continue;const key=sigIcon(icon);
 if(!iconMap.has(key)){const clone=icon.clone();page.appendChild(clone);const comp=figma.createComponentFromNode(clone);const label=src.findAllWithCriteria({types:['TEXT']})[0].characters;comp.name='Icon='+(iconNames[label]||'Arrow right')+', Ink='+(darkIds.has(src.id)?'Petrol':src.name.includes('/black/')?'Inverse':'Default');comp.description='Ícone vetorial Lucide; tamanho 18 px. Troque pela propriedade Icon dos botões.';iconMap.set(key,comp);iconRecords.push(comp);created.push(comp.id,...comp.findAll().map(n=>n.id));}
}
function addSet(name,components,desc,columns=4,width=300,height=72){
 text(name,24);const set=figma.combineAsVariants(components,library);set.name='X5/'+name;set.description=desc;set.fills=[];set.strokes=[];set.layoutMode='NONE';set.resize(1344,Math.ceil(components.length/columns)*height+24);components.forEach((c,i)=>{c.x=(i%columns)*(1344/columns);c.y=Math.floor(i/columns)*height+12;});created.push(set.id);familySets.push({id:set.id,name:set.name,variants:components.length});return set;
}
addSet('Icon',iconRecords,'Ícones vetoriais em tinta padrão, inversa e petróleo.',8,150,48);
const buttonMap=new Map(),buttonRecords=[],badgeMap=new Map(),badgeRecords=[],brandMap=new Map(),brandRecords=[];
function replace(src,master,properties){
 const parent=src.parent,index=parent.children.indexOf(src),w=src.width,h=src.height,x=src.x,y=src.y,hs=src.layoutSizingHorizontal,vs=src.layoutSizingVertical,position=src.layoutPositioning,grow=src.layoutGrow,align=src.layoutAlign;
 const inst=master.createInstance();parent.insertChild(index,inst);inst.name=src.name;if(properties)inst.setProperties(properties);
 inst.resize(w,h);inst.layoutPositioning=position;inst.layoutGrow=grow;inst.layoutAlign=align;
 inst.layoutSizingHorizontal=hs;inst.layoutSizingVertical=vs;
 if(parent.type==='PAGE'||!('layoutMode'in parent)||parent.layoutMode==='NONE'||position==='ABSOLUTE'){inst.x=x;inst.y=y;}
 replacements.push({old:src.id,id:inst.id,name:inst.name});removed.push(src.id);src.remove();created.push(inst.id);mutated.push(parent.id);return inst;
}
for(const src of buttonSources){
 const label=src.findAllWithCriteria({types:['TEXT']})[0],icon=src.children.find(n=>n.type==='FRAME'&&n.name==='Frame'),iconComp=icon?iconMap.get(sigIcon(icon)):iconRecords[0];
 let tone=src.name.split('/')[2];const isDark=darkIds.has(src.id);if(isDark)tone=src.fills.length?'Petrol accent':'Petrol outline';
 const state=src.name.endsWith('/Preparando…')?'Loading':src.name.endsWith('/Indisponível')?'Disabled':'Default';
 const key=tone+'|'+state;
 let entry=buttonMap.get(key);
 if(!entry){
 const copy=src.clone();page.appendChild(copy);const master=figma.createComponentFromNode(copy);
 master.name='Tone='+tone+', State='+state;master.description='Botão de 44 px. Label edita o texto; Icon troca o símbolo; Show icon controla a visibilidade. Use Fill container no mobile.';
 if(isDark)master.setExplicitVariableModeForCollection(sem,sem.modes.find(m=>m.name==='Dark').modeId);
 const tx=master.findAllWithCriteria({types:['TEXT']})[0];const lp=master.addComponentProperty('Label','TEXT',tx.characters);tx.componentPropertyReferences={characters:lp};tx.textAutoResize='WIDTH_AND_HEIGHT';
 if(tx.parent!==master&&'layoutMode'in tx.parent){tx.parent.primaryAxisSizingMode='AUTO';tx.parent.counterAxisSizingMode='AUTO';}
 let oldIcon=master.children.find(n=>n.type==='FRAME'&&n.name==='Frame');
 const ii=iconComp.createInstance();master.appendChild(ii);ii.name='Icon';ii.resize(18,18);ii.visible=!!icon;
 if(oldIcon)oldIcon.remove();
 const ip=master.addComponentProperty('Icon','INSTANCE_SWAP',iconComp.id),vp=master.addComponentProperty('Show icon','BOOLEAN',!!icon);ii.componentPropertyReferences={mainComponent:ip,visible:vp};
 master.resize(Math.max(220,src.width),44);entry={master,lp,ip,vp};buttonMap.set(key,entry);buttonRecords.push(master);created.push(master.id,...master.findAll().map(n=>n.id));
 }
 replace(src,entry.master,{[entry.lp]:label.characters,[entry.ip]:iconComp.id,[entry.vp]:!!icon});
}
addSet('Button',buttonRecords,'Ações com Label, Icon e Show icon. Variantes de tom e estado. Todas com altura mínima de 44 px.',4,300,80);
for(const src of sources.filter(n=>!n.removed&&n.name.startsWith('DS/Badge/'))){
 const t=src.findAllWithCriteria({types:['TEXT']})[0];const key=JSON.stringify([src.fills,t.fills,t.fontSize]);
 let entry=badgeMap.get(key);if(!entry){const copy=src.clone();page.appendChild(copy);const m=figma.createComponentFromNode(copy);const fill=src.fills[0]?.color;const hx=fill?Object.values(fill).map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join(''):'none';
 const tones={c6ef4e:'Lime','141613':'Ink',e5dff7:'Hypothesis',f9ded8:'Gap',ecf1e3:'Neutral','234440':'Petrol'};
 m.name='Tone='+(tones[hx]||'Tone '+(badgeRecords.length+1));m.description='Indicador compacto. Mantenha um rótulo explícito; a cor nunca comunica o estado sozinha.';
 if(darkIds.has(src.id))m.setExplicitVariableModeForCollection(sem,sem.modes.find(v=>v.name==='Dark').modeId);
 const tx=m.findAllWithCriteria({types:['TEXT']})[0],lp=m.addComponentProperty('Label','TEXT',tx.characters);tx.componentPropertyReferences={characters:lp};tx.textAutoResize='WIDTH_AND_HEIGHT';m.primaryAxisSizingMode='AUTO';m.counterAxisSizingMode='AUTO';
 entry={master:m,lp};badgeMap.set(key,entry);badgeRecords.push(m);created.push(m.id,...m.findAll().map(n=>n.id));}
 replace(src,entry.master,{[entry.lp]:t.characters});
}
addSet('Badge',badgeRecords,'Status com rótulo editável. Lima para evidência/ação; lilás para hipótese; coral para lacuna.',4,300,56);
for(const src of sources.filter(n=>!n.removed&&n.name==='DS/Brand/X5')){
 const key=darkIds.has(src.id)?'Dark':'Light';let m=brandMap.get(key);if(!m){const cp=src.clone();page.appendChild(cp);m=figma.createComponentFromNode(cp);m.name='Theme='+key;m.description='Assinatura X5 Planejamento em texto e vetor.';if(key==='Dark')m.setExplicitVariableModeForCollection(sem,sem.modes.find(v=>v.name==='Dark').modeId);brandMap.set(key,m);brandRecords.push(m);created.push(m.id,...m.findAll().map(n=>n.id));}
 replace(src,m);
}
addSet('Brand',brandRecords,'Assinatura do produto; temas Light e Dark.',4,300,64);
text('Uso',24);text('Arraste os componentes do painel Assets. As telas usam instâncias vinculadas à biblioteca.\nA coleção X5 · Semantic permite alternar Light / Dark; Geometry contém espaçamentos e raios.');
return {libraryId:library.id,sets:familySets,replacements,createdCount:created.length,deletedNodeIds:removed,mutatedNodeIds:[...new Set(mutated)],createdNodeIds:created};
