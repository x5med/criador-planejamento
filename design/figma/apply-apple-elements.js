// X5 refinements informed by Apple HIG; original local components.
const page=await figma.getNodeByIdAsync("0:1");await figma.setCurrentPageAsync(page);
const created=new Set(),changed=new Set(),variableIds=[],styleIds=[];
const fonts=new Map();
for(const t of page.findAllWithCriteria({types:["TEXT"]}))for(const s of t.getStyledTextSegments(["fontName"]))fonts.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
await figma.loadFontAsync({family:"Inter",style:"Medium"});
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const variables=await figma.variables.getLocalVariablesAsync(),collections=await figma.variables.getLocalVariableCollectionsAsync();
const pc=collections.find(c=>c.name==="X5 · Primitives"),sc=collections.find(c=>c.name==="X5 · Semantic"),gc=collections.find(c=>c.name==="X5 · Geometry");
const light=sc.modes.find(m=>m.name==="Light").modeId,dark=sc.modes.find(m=>m.name==="Dark").modeId;
const vm=new Map(variables.map(v=>[v.name,v]));
function primitive(name,color,alpha){
 let v=variables.find(v=>v.variableCollectionId===pc.id&&v.name===name);
 if(!v){v=figma.variables.createVariable(name,pc,"COLOR");created.add(v.id);variables.push(v);}
 v.scopes=[];v.setValueForMode(pc.defaultModeId,{...rgb(color),a:alpha});v.setVariableCodeSyntax("WEB","var(--x5-"+name.replaceAll("/","-")+")");
 vm.set(name,v);variableIds.push(v.id);return v;
}
function semantic(name,l,d,scopes){
 let v=variables.find(v=>v.variableCollectionId===sc.id&&v.name===name);
 if(!v){v=figma.variables.createVariable(name,sc,"COLOR");created.add(v.id);variables.push(v);}
 v.scopes=scopes;v.setValueForMode(light,figma.variables.createVariableAlias(l));v.setValueForMode(dark,figma.variables.createVariableAlias(d));
 v.setVariableCodeSyntax("WEB","var(--x5-"+name.replaceAll("/","-")+")");vm.set(name,v);variableIds.push(v.id);return v;
}
semantic("surface/navigation",primitive("material/navigation-light","#FFFFFF",0.76),primitive("material/navigation-dark","#242820",0.86),["FRAME_FILL","SHAPE_FILL"]);
semantic("border/glass",primitive("material/rim-light","#FFFFFF",0.9),primitive("material/rim-dark","#FFFFFF",0.16),["STROKE_COLOR"]);
semantic("control/track",primitive("material/track-light","#DBE1D6",0.88),primitive("material/track-dark","#11150F",0.92),["FRAME_FILL","SHAPE_FILL"]);
semantic("control/selected",vm.get("neutral/white"),primitive("material/selection-dark","#45503C",1),["FRAME_FILL","SHAPE_FILL"]);
const allEffects=await figma.getLocalEffectStylesAsync();
async function effect(name,effects){
 let s=allEffects.find(s=>s.name===name);if(!s){s=figma.createEffectStyle();s.name=name;created.add(s.id);}
 s.effects=effects;styleIds.push(s.id);return s;
}
const navEffects={};
for(const theme of ["Light","Dark"])navEffects[theme]=await effect("X5/Effects/Navigation glass/"+theme,[
 {type:"BACKGROUND_BLUR",radius:24,blurType:"NORMAL",visible:true},
 {type:"INNER_SHADOW",color:{r:1,g:1,b:1,a:theme==="Light"?0.6:0.12},offset:{x:0,y:1},radius:1,spread:0,visible:true,blendMode:"NORMAL"},
 {type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:theme==="Light"?0.075:0.18},offset:{x:0,y:6},radius:20,spread:0,visible:true,blendMode:"NORMAL"}
]);
const selection=await effect("X5/Effects/Selected control",[{type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:0.13},offset:{x:0,y:2},radius:4,spread:0,visible:true,blendMode:"NORMAL"}]);
const textStyles=await figma.getLocalTextStylesAsync();
let labelStyle=textStyles.find(s=>s.name==="X5/Control/Label");
if(!labelStyle){labelStyle=figma.createTextStyle();labelStyle.name="X5/Control/Label";created.add(labelStyle.id);}
labelStyle.fontName={family:"Inter",style:"Medium"};labelStyle.fontSize=13;labelStyle.lineHeight={unit:"PIXELS",value:18};styleIds.push(labelStyle.id);
function resolved(v,n){let mode=sc.defaultModeId,a=n;while(a&&a.type!=="PAGE"){const m=a.explicitVariableModes?.[sc.id];if(m){mode=m;break;}a=a.parent;}let value=v.valuesByMode[v.variableCollectionId===sc.id?mode:pc.defaultModeId];while(value?.type==="VARIABLE_ALIAS"){v=variables.find(x=>x.id===value.id);value=v.valuesByMode[v.variableCollectionId===sc.id?mode:pc.defaultModeId];}return value;}
function fill(n,name,fallback="#FFFFFF"){const v=vm.get(name),c=resolved(v,n)||{...rgb(fallback),a:1};n.fills=[figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},"color",v)];changed.add(n.id);}
function stroke(n,name){const v=vm.get(name),c=resolved(v,n);n.strokes=[figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},"color",v)];n.strokeWeight=1;changed.add(n.id);}
function radius(n,r){for(const k of ["topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius"])n.setBoundVariable(k,vm.get("radius/"+r));n.cornerSmoothing=0.6;changed.add(n.id);}
function spacing(n,field,value){n.setBoundVariable(field,vm.get("space/"+value));changed.add(n.id);}
function themeOf(n){let a=n;while(a&&a.type!=="PAGE"){if(a.name.includes("Tema escuro"))return "Dark";a=a.parent;}return "Light";}
async function glass(n,r=32){
 const theme=themeOf(n);n.setExplicitVariableModeForCollection(sc,theme==="Dark"?dark:light);
 fill(n,"surface/navigation",theme==="Dark"?"#242820":"#FFFFFF");stroke(n,"border/glass");radius(n,r);
 await n.setEffectStyleIdAsync(navEffects[theme].id);changed.add(n.id);
}
function instanceAncestor(n){let p=n.parent;while(p&&p.type!=="PAGE"){if(p.type==="INSTANCE")return true;p=p.parent;}return false;}
const frames=page.findAllWithCriteria({types:["FRAME"]});
const modifiedHeaders=[],sidebars=[];
for(const n of frames){
 if(instanceAncestor(n))continue;
 if(n.cornerRadius!==figma.mixed&&n.cornerRadius>=18){n.cornerSmoothing=0.6;changed.add(n.id);}
 if(n.name.startsWith("DS/Sidebar/")){await glass(n,48);sidebars.push(n.id);}
 if(n.name==="DS/Header/Workspace"){
  n.resize(n.width,72);for(const f of ["paddingLeft","paddingRight"])spacing(n,f,18);
  n.parent.paddingTop=20;changed.add(n.parent.id);
  await glass(n,32);modifiedHeaders.push(n.id);
  for(const row of n.children)if(row.type==="FRAME"&&row.children.some(c=>c.name==="small-icon")){
   row.resize(row.width+8,44);row.primaryAxisSizingMode="AUTO";changed.add(row.id);
  }
 }
 if(n.name==="mobile-header"){
  n.resize(n.width,68);spacing(n,"paddingLeft",12);spacing(n,"paddingRight",12);
  await glass(n,32);modifiedHeaders.push(n.id);
 }
 if(n.name==="small-icon"&&(n.parent?.name==="mobile-header"||n.parent?.parent?.name==="DS/Header/Workspace")){
  n.resize(44,44);n.layoutMode="HORIZONTAL";n.primaryAxisAlignItems="CENTER";n.counterAxisAlignItems="CENTER";
  spacing(n,"paddingLeft",0);spacing(n,"paddingRight",0);spacing(n,"paddingTop",0);spacing(n,"paddingBottom",0);
  radius(n,999);fill(n,"control/selected");n.strokes=[];changed.add(n.id);
 }
}
const openingHeader=await figma.getNodeByIdAsync("6:684");
openingHeader.resize(openingHeader.width,76);spacing(openingHeader,"paddingLeft",20);spacing(openingHeader,"paddingRight",20);await glass(openingHeader,32);
modifiedHeaders.push(openingHeader.id);
const mobileNav=await figma.getNodeByIdAsync("6:3010");
await glass(mobileNav,32);mobileNav.resize(mobileNav.width,68);
for(const f of ["paddingLeft","paddingRight","paddingTop","paddingBottom"])spacing(mobileNav,f,6);
spacing(mobileNav,"itemSpacing",2);mobileNav.primaryAxisAlignItems="MIN";mobileNav.counterAxisAlignItems="CENTER";
for(const item of mobileNav.children){
 if(item.type!=="FRAME")continue;
 item.resize(65.6,56);item.layoutSizingHorizontal="FILL";item.primaryAxisSizingMode="FIXED";item.counterAxisAlignItems="CENTER";item.primaryAxisAlignItems="CENTER";
 spacing(item,"paddingTop",6);spacing(item,"paddingBottom",6);radius(item,24);
 if(item.name==="active")fill(item,"action/accent");else item.fills=[];
 changed.add(item.id);
}
const lib=await figma.getNodeByIdAsync("10:2");
let set=page.findAllWithCriteria({types:["COMPONENT_SET"]}).find(n=>n.name==="X5/Segmented control");
let variants=[];
if(!set){
 // Adapted from the skill's createComponentWithVariants helper: create, combine, then explicitly arrange.
 for(const theme of ["Light","Dark"])for(const selected of ["12","24","36"]){
  const c=figma.createComponent();created.add(c.id);c.name="Theme="+theme+", Selected="+selected;
  c.layoutMode="HORIZONTAL";c.resize(348,48);c.primaryAxisSizingMode="FIXED";c.counterAxisSizingMode="FIXED";
  c.counterAxisAlignItems="CENTER";c.primaryAxisAlignItems="MIN";c.setExplicitVariableModeForCollection(sc,theme==="Dark"?dark:light);
  for(const f of ["paddingLeft","paddingRight","paddingTop","paddingBottom"])spacing(c,f,2);spacing(c,"itemSpacing",0);radius(c,999);fill(c,"control/track");
  for(const months of ["12","24","36"]){
   const item=figma.createAutoLayout("HORIZONTAL");created.add(item.id);item.name="Segment/"+months;c.appendChild(item);
   item.resize(112,44);item.layoutSizingHorizontal="FILL";item.primaryAxisSizingMode="FIXED";item.counterAxisSizingMode="FIXED";item.primaryAxisAlignItems="CENTER";item.counterAxisAlignItems="CENTER";
   radius(item,999);
   if(months===selected){fill(item,"control/selected");await item.setEffectStyleIdAsync(selection.id);}else item.fills=[];
   const t=figma.createText();created.add(t.id);item.appendChild(t);await t.setTextStyleIdAsync(labelStyle.id);t.characters=months+" meses";fill(t,"text/primary","#111111");t.textAutoResize="WIDTH_AND_HEIGHT";
   const prop=c.addComponentProperty("Label "+months,"TEXT",months+" meses");t.componentPropertyReferences={characters:prop};
  }
  variants.push(c);
 }
 set=figma.combineAsVariants(variants,lib);created.add(set.id);set.name="X5/Segmented control";
 set.description="Controle segmentado X5 inspirado nas Apple Human Interface Guidelines. Escolha única entre 12, 24 e 36 meses. Segmentos iguais, alvos de 44 px, indicador persistente. Componente local; não é um controle nativo Apple.";
 set.fills=[];set.strokes=[];
 variants.forEach((c,i)=>{c.x=(i%3)*432;c.y=Math.floor(i/3)*84;changed.add(c.id);});
 set.resize(1344,148);changed.add(set.id);
 const title=figma.createText();created.add(title.id);lib.insertChild(lib.children.indexOf(set),title);title.fontName={family:"Inter",style:"Semi Bold"};title.fontSize=24;title.characters="Segmented control · Horizonte";fill(title,"text/primary","#111111");
 const note=figma.createText();created.add(note.id);lib.appendChild(note);note.fontName={family:"Inter",style:"Regular"};note.fontSize=13;note.characters="Apple HIG: vidro na navegação · seleção persistente · segmentos iguais · toque mínimo 44 px.\nReduzir transparência: superfícies sólidas. Reduzir movimento: transição instantânea.";fill(note,"text/secondary","#555B52");
}else variants=[...set.children];
lib.primaryAxisSizingMode="AUTO";changed.add(lib.id);
const replacements=[];
for(const id of ["6:770","6:2824","6:581"]){
 const field=await figma.getNodeByIdAsync(id),w=field.width;
 if(!field.children.some(n=>n.type==="INSTANCE"&&n.name==="DS/Segmented/Horizonte")){
  for(const child of field.children){child.visible=false;changed.add(child.id);}
  field.name="DS/Segmented field/Horizonte";field.fills=[];field.strokes=[];field.effects=[];
  for(const f of ["paddingLeft","paddingRight","paddingTop","paddingBottom"])spacing(field,f,0);
  field.resize(w,48);
  const instance=variants.find(v=>v.name==="Theme=Light, Selected=12").createInstance();created.add(instance.id);field.appendChild(instance);instance.name="DS/Segmented/Horizonte";instance.resize(w,48);instance.layoutSizingHorizontal="FILL";replacements.push({field:field.id,instance:instance.id});
  changed.add(field.id);
 }
}
const textEdits={
 "6:348":"Contraste X5 e clareza de navegação. Vidro nos controles, conteúdo em superfícies estáveis e formas contínuas inspiradas nas diretrizes da Apple.",
 "6:479":"TaskLab · Preto, branco e lima para a hierarquia.",
 "6:480":"Apple HIG · Vidro na navegação e controles claros.",
 "6:481":"Grupo X5 · Logo PNG e conteúdo estratégico."
};
for(const [id,text] of Object.entries(textEdits)){const n=await figma.getNodeByIdAsync(id);n.characters=text;changed.add(id);}
for(const outer of page.children){
 if(outer.type!=="FRAME"||outer.id===lib.id)continue;
 const root=outer.children.find(n=>n.type==="FRAME");if(!root)continue;
 if(root.name.startsWith("Mobile ")){
  root.primaryAxisSizingMode="AUTO";outer.resize(root.width,root.height);changed.add(root.id);changed.add(outer.id);
 }else if(root.name==="New planning"){
  root.primaryAxisSizingMode="AUTO";outer.resize(root.width+56,root.height+56);changed.add(root.id);changed.add(outer.id);
 }
}
return {createdNodeIds:[...created],mutatedNodeIds:[...changed],variableIds,styleIds,componentSetId:set.id,variants:variants.map(v=>({id:v.id,name:v.name,w:v.width,h:v.height})),modifiedHeaders,sidebars,replacements,libraryBounds:{w:lib.width,h:lib.height},mobileNav:{id:mobileNav.id,w:mobileNav.width,h:mobileNav.height}};
