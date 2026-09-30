const p=await figma.getNodeByIdAsync("0:1");await figma.setCurrentPageAsync(p);
const set=await figma.getNodeByIdAsync("60:482");
const profiles={
 Priorities:{Title:"Prioridades",Value:"03",Detail:"escolhas que orientam o ciclo",Tag:"FOCO"},
 Objectives:{Title:"Objetivos",Value:"02",Detail:"resultados para acompanhar",Tag:"KRs"},
 Quality:{Title:"Qualidade do plano",Value:"78/100",Detail:"Bom, com ressalvas",Tag:"78%"},
 Gaps:{Title:"Lacunas",Value:"04",Detail:"validações antes de executar",Tag:"4×"}
};
const changed=[];
for(const c of set.children)for(const t of c.findAllWithCriteria({types:["TEXT"]}))for(const seg of t.getStyledTextSegments(["fontName"]))await figma.loadFontAsync(seg.fontName);
const defs=set.componentPropertyDefinitions;
for(const c of set.children){
 const role=c.name.match(/Metric=([^,]+)/)[1],small=c.name.includes("Mobile"),values={...profiles[role]};
 if(small&&role==="Quality")values.Title="Qualidade";
 if(small&&role==="Gaps")values.Detail="validações pendentes";
 for(const t of c.findAllWithCriteria({types:["TEXT"]})){
  if(!(t.name in values))continue;
  t.componentPropertyReferences={};t.characters=values[t.name];changed.push(t.id);
  if(t.name==="Tag"){t.x=t.parent.width-t.width-12;changed.push(t.id);}
 }
}
for(const key of Object.keys(defs))if(["Title","Value","Detail","Tag"].includes(key.split("#")[0]))set.deleteComponentProperty(key);
set.description="Card chip com recortes vetoriais e faixa neon encaixada. Metric: Priorities, Objectives, Quality e Gaps; Size: Desktop ou Mobile. Conteúdo alterável por edição de texto nas instâncias; Meta é propriedade compartilhada. Contagens e barra de qualidade correspondem aos exemplos do plano. Ao alterar dados, atualizar o indicador visual.";
changed.push(set.id);
const instances=p.findAllWithCriteria({types:["INSTANCE"]}).filter(n=>n.mainComponent?.parent?.id===set.id);
for(const inst of instances){
 const role=inst.mainComponent.name.match(/Metric=([^,]+)/)[1],small=inst.mainComponent.name.includes("Mobile"),values={...profiles[role]};
 if(small&&role==="Quality")values.Title="Qualidade";
 if(small&&role==="Gaps")values.Detail="validações pendentes";
 for(const t of inst.findAllWithCriteria({types:["TEXT"]})){
  if(!(t.name in values))continue;
  for(const seg of t.getStyledTextSegments(["fontName"]))await figma.loadFontAsync(seg.fontName);
  t.characters=values[t.name];changed.push(t.id);
 }
 changed.push(inst.id);
}
const row=await figma.getNodeByIdAsync("6:2942");
const geom=(await figma.variables.getLocalVariablesAsync()).find(v=>v.name==="space/10");row.setBoundVariable("itemSpacing",geom);changed.push(row.id);
return {mutatedNodeIds:changed,componentSetId:set.id,properties:set.componentPropertyDefinitions,instances:instances.length,mobileCards:row.children.filter(n=>n.visible).map(n=>({id:n.id,x:n.x,w:n.width}))};
