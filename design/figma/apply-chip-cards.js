// Cards chip based on the supplied PNG reference. Native vectors and component instances.
const page=await figma.getNodeByIdAsync("0:1");await figma.setCurrentPageAsync(page);
const created=new Set(),changed=new Set(),varIds=[],styleIds=[];
const loaded=new Map();for(const t of page.findAllWithCriteria({types:["TEXT"]}))for(const s of t.getStyledTextSegments(["fontName"]))loaded.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...loaded.values()].map(f=>figma.loadFontAsync(f)));
for(const f of [{family:"Barlow Condensed",style:"Regular"},{family:"Inter",style:"Regular"},{family:"Inter",style:"Medium"},{family:"Inter",style:"Semi Bold"},{family:"Inter",style:"Extra Bold"}])await figma.loadFontAsync(f);
const vs=await figma.variables.getLocalVariablesAsync(),cs=await figma.variables.getLocalVariableCollectionsAsync();
const pc=cs.find(c=>c.name==="X5 · Primitives"),sc=cs.find(c=>c.name==="X5 · Semantic"),vm=new Map(vs.map(v=>[v.name,v]));
const dark=sc.modes.find(m=>m.name==="Dark").modeId;
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
function token(name,h){
 let p=vs.find(v=>v.variableCollectionId===pc.id&&v.name===name);
 if(!p){p=figma.variables.createVariable(name,pc,"COLOR");created.add(p.id);vs.push(p);}
 p.scopes=[];p.setValueForMode(pc.defaultModeId,{...rgb(h),a:1});p.setVariableCodeSyntax("WEB","var(--x5-"+name.replaceAll("/","-")+")");varIds.push(p.id);
 const semanticName=name==="chip/black"?"surface/chip":name.replace("chip/neon/","chip/accent/");
 let v=vs.find(v=>v.variableCollectionId===sc.id&&v.name===semanticName);
 if(!v){v=figma.variables.createVariable(semanticName,sc,"COLOR");created.add(v.id);vs.push(v);}
 v.scopes=["FRAME_FILL","SHAPE_FILL"];for(const m of sc.modes)v.setValueForMode(m.modeId,figma.variables.createVariableAlias(p));
 v.setVariableCodeSyntax("WEB","var(--x5-"+semanticName.replaceAll("/","-")+")");vm.set(semanticName,v);varIds.push(v.id);return v;
}
token("chip/black","#080A08");
const data=[
 {role:"Priorities",tone:"focus",hex:"#22FF45",title:"Prioridades",value:"03",detail:"escolhas que orientam o ciclo",tag:"FOCO",pips:3},
 {role:"Objectives",tone:"results",hex:"#05ED9A",title:"Objetivos",value:"02",detail:"resultados para acompanhar",tag:"RESULTADOS",pips:2},
 {role:"Quality",tone:"quality",hex:"#F8ED22",title:"Qualidade do plano",value:"78/100",detail:"Bom, com ressalvas",tag:"PLANO",progress:.78},
 {role:"Gaps",tone:"gaps",hex:"#FF6C23",title:"Lacunas",value:"04",detail:"validações antes de executar",tag:"VALIDAR",pips:4}
];
for(const d of data)token("chip/neon/"+d.tone,d.hex);
function fill(n,name,fallback){n.fills=[figma.variables.setBoundVariableForPaint({type:"SOLID",color:rgb(fallback)},"color",vm.get(name))];changed.add(n.id);}
function gap(n,field,value){n.setBoundVariable(field,vm.get("space/"+value));changed.add(n.id);}
const styles=await figma.getLocalTextStylesAsync();
async function textStyle(name,font,size,line){
 let s=styles.find(s=>s.name===name);if(!s){s=figma.createTextStyle();s.name=name;created.add(s.id);}
 s.fontName=font;s.fontSize=size;s.lineHeight={unit:"PIXELS",value:line};styleIds.push(s.id);return s;
}
const type={
 title:await textStyle("X5/Chip/Title",{family:"Inter",style:"Medium"},12,16),
 value:await textStyle("X5/Chip/Value/Desktop",{family:"Barlow Condensed",style:"Regular"},52,56),
 valueSmall:await textStyle("X5/Chip/Value/Mobile",{family:"Barlow Condensed",style:"Regular"},42,44),
 detail:await textStyle("X5/Chip/Detail",{family:"Inter",style:"Medium"},11,14),
 meta:await textStyle("X5/Chip/Meta",{family:"Inter",style:"Regular"},10,13),
 tag:await textStyle("X5/Chip/Tag",{family:"Inter",style:"Semi Bold"},8,10)
};
let shadow=(await figma.getLocalEffectStylesAsync()).find(s=>s.name==="X5/Effects/Chip card");
if(!shadow){shadow=figma.createEffectStyle();shadow.name="X5/Effects/Chip card";created.add(shadow.id);}
shadow.effects=[{type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:.16},offset:{x:0,y:6},radius:14,spread:0,visible:true,blendMode:"NORMAL"}];styleIds.push(shadow.id);
function bodyPath(w,h){const r=24,a=w*.56,b=w*.75;
 return "M "+r+" 0 L "+a+" 0 C "+(a+14)+" 0 "+(b-16)+" 18 "+b+" 18 L "+(w-r)+" 18 Q "+w+" 18 "+w+" 42 L "+w+" "+(h-r)+" Q "+w+" "+h+" "+(w-r)+" "+h+" L "+r+" "+h+" Q 0 "+h+" 0 "+(h-r)+" L 0 "+r+" Q 0 0 "+r+" 0 Z";}
function bandPath(w,h){const r=12,a=w*.62,b=w*.77;
 return "M "+r+" 9 L "+a+" 9 C "+(a+10)+" 9 "+(b-10)+" 0 "+b+" 0 L "+(w-r)+" 0 Q "+w+" 0 "+w+" "+r+" L "+w+" "+(h-r)+" Q "+w+" "+h+" "+(w-r)+" "+h+" L "+r+" "+h+" Q 0 "+h+" 0 "+(h-r)+" L 0 21 Q 0 9 "+r+" 9 Z";}
function vector(parent,name,path,w,h,color){
 const v=figma.createVector();created.add(v.id);parent.appendChild(v);v.name=name;v.vectorPaths=[{windingRule:"NONZERO",data:path}];
 v.resize(w,h);v.layoutPositioning="ABSOLUTE";v.x=0;v.y=0;v.strokes=[];fill(v,color,color==="surface/chip"?"#080A08":data.find(d=>"chip/accent/"+d.tone===color).hex);return v;
}
async function text(parent,name,value,style,color,fallback,width){
 const t=figma.createText();created.add(t.id);parent.appendChild(t);t.name=name;await t.setTextStyleIdAsync(style.id);t.characters=value;fill(t,color,fallback);
 if(width){t.textAutoResize="HEIGHT";t.resize(width,t.height);t.layoutSizingHorizontal="FILL";}else t.textAutoResize="WIDTH_AND_HEIGHT";
 return t;
}
const lib=await figma.getNodeByIdAsync("10:2");
let set=page.findAllWithCriteria({types:["COMPONENT_SET"]}).find(n=>n.name==="X5/Card/Chip");
let variants=[];
if(!set){
 // Component creation and explicit grid placement follow createComponentWithVariants.
 for(const size of ["Desktop","Mobile"])for(const d of data){
  const small=size==="Mobile",w=small?169:275,h=small?178:210,pad=small?12:16,bh=small?66:74;
  const c=figma.createComponent();created.add(c.id);c.name="Metric="+d.role+", Size="+size;c.layoutMode="VERTICAL";c.resize(w,h);
  c.primaryAxisSizingMode="FIXED";c.counterAxisSizingMode="FIXED";c.fills=[];c.strokes=[];c.clipsContent=false;
  c.setExplicitVariableModeForCollection(sc,dark);for(const f of ["paddingLeft","paddingRight"])gap(c,f,pad);
  gap(c,"paddingTop",small?12:16);gap(c,"paddingBottom",small?10:12);gap(c,"itemSpacing",small?4:6);
  const body=vector(c,"Chip silhouette",bodyPath(w,h),w,h,"surface/chip");await body.setEffectStyleIdAsync(shadow.id);
  const dots=figma.createAutoLayout("HORIZONTAL");created.add(dots.id);c.appendChild(dots);dots.name="Decorative notch dots";dots.layoutPositioning="ABSOLUTE";dots.x=w-42;dots.y=5;dots.fills=[];gap(dots,"itemSpacing",4);
  for(let i=0;i<3;i++){const dot=figma.createEllipse();created.add(dot.id);dots.appendChild(dot);dot.resize(3,3);dot.fills=[{type:"SOLID",color:rgb("#6D7468")}];}
  const title=await text(c,"Title",small&&d.role==="Quality"?"Qualidade":d.title,type.title,"text/on-dark","#FFFFFF",w-2*pad);
  title.fontSize=small?11:12;title.lineHeight={unit:"PIXELS",value:small?14:16};
  const value=await text(c,"Value",d.value,small?type.valueSmall:type.value,"text/on-dark","#FFFFFF");
  const band=figma.createAutoLayout("VERTICAL");created.add(band.id);c.appendChild(band);band.name="Inset data chip";band.resize(w-2*pad,bh);band.primaryAxisSizingMode="FIXED";band.counterAxisSizingMode="FIXED";band.layoutSizingHorizontal="FILL";band.fills=[];band.strokes=[];band.clipsContent=false;
  gap(band,"paddingLeft",12);gap(band,"paddingRight",12);gap(band,"paddingTop",small?16:18);gap(band,"paddingBottom",10);gap(band,"itemSpacing",6);
  vector(band,"Inset chip silhouette",bandPath(w-2*pad,bh),w-2*pad,bh,"chip/accent/"+d.tone);
  const tag=await text(band,"Tag",d.tag,type.tag,"text/on-accent","#111111");tag.layoutPositioning="ABSOLUTE";tag.x=band.width-tag.width-12;tag.y=3;
  const detail=await text(band,"Detail",small&&d.role==="Gaps"?"validações pendentes":d.detail,type.detail,"text/on-accent","#111111",w-2*pad-24);
  if(small){detail.fontSize=10.5;detail.lineHeight={unit:"PIXELS",value:13};}
  const indicator=figma.createAutoLayout("HORIZONTAL");created.add(indicator.id);band.appendChild(indicator);indicator.name=d.progress?"Quality 78 percent":"Count "+d.pips;indicator.fills=[];indicator.resize(band.width-24,5);indicator.layoutSizingHorizontal="FILL";indicator.primaryAxisSizingMode="FIXED";indicator.counterAxisSizingMode="FIXED";gap(indicator,"itemSpacing",4);
  if(d.progress){
   indicator.fills=[{type:"SOLID",color:rgb("#111111"),opacity:.18}];indicator.cornerRadius=999;
   const meter=figma.createRectangle();created.add(meter.id);indicator.appendChild(meter);meter.name="78 of 100";meter.resize((band.width-24)*.78,5);meter.cornerRadius=999;fill(meter,"text/on-accent","#111111");
  }else{
   for(let i=0;i<d.pips;i++){const pip=figma.createEllipse();created.add(pip.id);indicator.appendChild(pip);pip.resize(5,5);fill(pip,"text/on-accent","#111111");}
  }
  const meta=await text(c,"Meta","Ciclo 2027",type.meta,"text/secondary","#B8C0B3");
  for(const [key,node]of [["Title",title],["Value",value],["Detail",detail],["Tag",tag],["Meta",meta]]){
   const prop=c.addComponentProperty(key,"TEXT",node.characters);node.componentPropertyReferences={characters:prop};
  }
  variants.push(c);
 }
 set=figma.combineAsVariants(variants,lib);created.add(set.id);set.name="X5/Card/Chip";set.fills=[];set.strokes=[];
 set.description="Card chip inspirado na referência enviada. Recorte vetorial no topo, superfície escura, número Barlow Condensed, faixa neon encaixada. Metric define contagem ou qualidade; Size define desktop ou mobile. Valores são exemplos demonstrativos do plano existente. Ao mudar números, atualizar os indicadores correspondentes.";
 variants.forEach((c,i)=>{c.x=(i%4)*336;c.y=Math.floor(i/4)*250;changed.add(c.id);});set.resize(1344,438);changed.add(set.id);
 const heading=figma.createText();created.add(heading.id);lib.insertChild(lib.children.indexOf(set),heading);heading.fontName={family:"Inter",style:"Semi Bold"};heading.fontSize=24;heading.characters="Cards chip · indicadores";
 const note=figma.createText();created.add(note.id);lib.appendChild(note);note.fontName={family:"Inter",style:"Regular"};note.fontSize=13;note.characters="Recortes vetoriais, tipografia condensada e faixa de dados encaixada. Contagens e qualidade acompanham os valores exibidos.";note.textAutoResize="HEIGHT";note.resize(1344,20);note.layoutSizingHorizontal="FILL";fill(note,"text/secondary","#555B52");
}else variants=[...set.children];
lib.primaryAxisSizingMode="AUTO";changed.add(lib.id);
const bindings=[["6:1161","Priorities"],["6:1172","Objectives"],["6:1183","Quality"],["6:1194","Gaps"],["6:2586","Priorities"],["6:2597","Objectives"],["6:2608","Quality"],["6:2619","Gaps"],["6:2943","Quality"],["6:2954","Gaps"]];
const rowOld=new Map();const linked=[];
for(const [id,metric]of bindings){
 const card=await figma.getNodeByIdAsync(id),small=card.width<200,row=card.parent;if(!rowOld.has(row.id))rowOld.set(row.id,{node:row,h:row.height});
 const oldTexts=card.findAllWithCriteria({types:["TEXT"]}).map(t=>t.characters);
 for(const child of card.children){child.visible=false;changed.add(child.id);}
 card.fills=[];card.strokes=[];card.effects=[];card.clipsContent=false;
 for(const f of ["paddingTop","paddingBottom","paddingLeft","paddingRight","itemSpacing"])gap(card,f,0);
 const main=variants.find(c=>c.name==="Metric="+metric+", Size="+(small?"Mobile":"Desktop"));
 card.resize(card.width,main.height);changed.add(card.id);
 const inst=main.createInstance();created.add(inst.id);card.appendChild(inst);inst.name="DS/Chip/"+metric;inst.resize(card.width,main.height);inst.layoutSizingHorizontal="FILL";
 const props=inst.componentProperties;const values={Title:oldTexts[0],Value:oldTexts[1],Detail:oldTexts[2]};
 const updates={};for(const [key,value]of Object.entries(values)){const actual=Object.keys(props).find(k=>k.split("#")[0]===key);if(actual)updates[actual]=value;}inst.setProperties(updates);
 linked.push({card:id,instance:inst.id,component:main.id});
}
for(const {node:row,h:oldHeight}of rowOld.values()){
 const h=Math.max(...row.children.filter(n=>n.visible).map(n=>n.height)),delta=h-oldHeight;
 row.resize(row.width,h);changed.add(row.id);
 let a=row.parent;
 while(a&&a.type!=="PAGE"){
  if(a.type==="FRAME"){
   if(a.name.startsWith("Mobile ")){a.primaryAxisSizingMode="AUTO";}
   else a.resize(a.width,a.height+delta);
   changed.add(a.id);
   if(a.name==="X5 App")for(const child of a.children)if(child.type==="FRAME"&&child.name.startsWith("DS/Sidebar/")){child.resize(child.width,a.height);changed.add(child.id);}
  }
  a=a.parent;
 }
 const outer=row.parent?.name?.startsWith("Mobile ")?row.parent.parent:null;if(outer){outer.resize(row.parent.width,row.parent.height);changed.add(outer.id);}
}
let gallery=page.children.find(n=>n.name==="14 · Cards chip — X5");
if(!gallery){
 gallery=figma.createAutoLayout("VERTICAL",{name:"14 · Cards chip — X5",itemSpacing:28});created.add(gallery.id);page.appendChild(gallery);gallery.x=4800;gallery.y=2600;gallery.resize(1440,740);gallery.primaryAxisSizingMode="AUTO";gallery.counterAxisSizingMode="FIXED";gallery.cornerRadius=48;gallery.fills=[{type:"SOLID",color:rgb("#CDD2C8")}];
 for(const f of ["paddingTop","paddingBottom","paddingLeft","paddingRight"])gap(gallery,f,48);
 const title=await text(gallery,"Heading","Cards que encaixam.",type.title,"text/on-accent","#111111");title.fontName={family:"Inter",style:"Extra Bold"};title.fontSize=40;title.lineHeight={unit:"PIXELS",value:48};
 const intro=await text(gallery,"Description","Recorte no topo, números condensados e dados em chips neon.",type.detail,"text/on-accent","#111111");
 for(const size of ["Desktop","Mobile"]){
  const label=await text(gallery,"Size label",size==="Desktop"?"DESKTOP · 275 × 210":"MOBILE · 169 × 178",type.meta,"text/on-accent","#111111");
  const row=figma.createAutoLayout("HORIZONTAL",{name:"Chip review / "+size,itemSpacing:24});created.add(row.id);gallery.appendChild(row);row.fills=[];
  for(const d of data){const inst=variants.find(c=>c.name==="Metric="+d.role+", Size="+size).createInstance();created.add(inst.id);row.appendChild(inst);}
 }
}
return {createdNodeIds:[...created],mutatedNodeIds:[...changed],variableIds:varIds,styleIds,componentSetId:set.id,variants:variants.map(c=>({id:c.id,name:c.name,w:c.width,h:c.height})),linked,gallery:{id:gallery.id,w:gallery.width,h:gallery.height,x:gallery.x,y:gallery.y},library:{w:lib.width,h:lib.height}};
