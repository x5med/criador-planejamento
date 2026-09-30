const p=await figma.getNodeByIdAsync("0:1");await figma.setCurrentPageAsync(p);
const nav=await figma.getNodeByIdAsync("6:3010");
const vs=await figma.variables.getLocalVariablesAsync();
const ink=vs.find(v=>v.name==="text/on-accent"&&v.variableCollectionId==="VariableCollectionId:9:3");
const muted=vs.find(v=>v.name==="text/secondary"&&v.variableCollectionId==="VariableCollectionId:9:3");
for(const t of nav.findAllWithCriteria({types:["TEXT"]}))for(const s of t.getStyledTextSegments(["fontName"]))await figma.loadFontAsync(s.fontName);
const changed=[];
for(const item of nav.children){
 const v=item.name==="active"?ink:muted;const c=item.name==="active"?{r:17/255,g:17/255,b:17/255}:{r:85/255,g:91/255,b:82/255};
 for(const n of item.findAll()){
  if(n.type==="TEXT"){
   n.fills=[figma.variables.setBoundVariableForPaint({type:"SOLID",color:c},"color",v)];changed.push(n.id);
  }else if(n.type==="VECTOR"){
   n.strokes=[figma.variables.setBoundVariableForPaint({type:"SOLID",color:c},"color",v)];changed.push(n.id);
  }
 }
}
await (await figma.getNodeByIdAsync("6:2916")).screenshot({scale:.75});
return {mutatedNodeIds:changed,navId:nav.id,labels:nav.findAllWithCriteria({types:["TEXT"]}).map(t=>({id:t.id,text:t.characters,color:t.fills[0].color}))};
