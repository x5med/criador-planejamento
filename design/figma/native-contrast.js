
const page=figma.currentPage,changed=[],created=[];
const ids=['6:1056','6:1193','6:699','6:715','6:725','6:732','6:739','6:746','6:817','6:831','6:836','6:841','6:1013','6:1375','6:1579','6:1580','6:1645','6:1836','6:1918','6:2161','6:2234','6:2379','6:2386','6:2953'];
const variables=await figma.variables.getLocalVariablesAsync(),vm=Object.fromEntries(variables.map(v=>[v.name,v]));
const colls=await figma.variables.getLocalVariableCollectionsAsync(),sem=colls.find(c=>c.name==='X5 · Semantic');
const texts=await Promise.all(ids.map(id=>figma.getNodeByIdAsync(id)));const fs=new Map();for(const t of texts)for(const s of t.getStyledTextSegments(['fontName']))fs.set(JSON.stringify(s.fontName),s.fontName);await Promise.all([...fs.values()].map(f=>figma.loadFontAsync(f)));
const v=figma.variables.createVariable('text/strong-secondary',sem,'COLOR');v.scopes=['TEXT_FILL'];v.setVariableCodeSyntax('WEB','var(--text-strong-secondary)');
v.setValueForMode(sem.defaultModeId,figma.variables.createVariableAlias(vm['state/neutral-text']));
v.setValueForMode(sem.modes.find(m=>m.name==='Dark').modeId,figma.variables.createVariableAlias(vm['petrol/muted']));
for(const t of texts){t.fills=t.fills.map(p=>p.type==='SOLID'?figma.variables.setBoundVariableForPaint(p,'color',v):p);changed.push(t.id);}
const disabled=await figma.getNodeByIdAsync('10:179');const icon=disabled.children.find(n=>n.type==='INSTANCE');icon.visible=false;changed.push(icon.id);
const library=await figma.getNodeByIdAsync('10:2'),icons=await figma.getNodeByIdAsync('10:71');
for(const b of library.children.filter(n=>n.name==='Preview background')){
const match=icons.children.find(c=>Math.abs(b.x-(icons.x+c.x-6))<.1&&Math.abs(b.y-(icons.y+c.y-6))<.1);
if(match){const vec=match.findAllWithCriteria({types:['VECTOR']})[0],paint=vec?.strokes?.find(p=>p.type==='SOLID');if(paint&&paint.color.r+paint.color.g+paint.color.b<1){b.fills=[{type:'SOLID',color:{r:.77647,g:.93725,b:.30588}}];changed.push(b.id);}}
}
return {variableId:v.id,contrastTextCount:ids.length,mutatedNodeIds:changed,createdNodeIds:created};
