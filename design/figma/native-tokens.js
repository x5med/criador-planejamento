
const page=figma.currentPage;
const changed=new Set(),created=[];
const texts=page.findAllWithCriteria({types:['TEXT']});
const fontMap=new Map();
for(const n of texts)for(const s of n.getStyledTextSegments(['fontName']))fontMap.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fontMap.values()].map(f=>figma.loadFontAsync(f)));
const test=await figma.getNodeByIdAsync('6:321');if(test)test.remove();
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const hex=c=>'#'+['r','g','b'].map(k=>Math.round(c[k]*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const dark=await figma.getNodeByIdAsync('6:2463');
for(const v of dark.findAllWithCriteria({types:['VECTOR']})){
 let p=v.parent,bg=null;
 while(p&&p.type!=='PAGE'){if('fills'in p&&Array.isArray(p.fills)){const s=p.fills.find(f=>f.type==='SOLID'&&f.visible!==false&&f.opacity!==0);if(s){bg=s.color;break;}}p=p.parent;}
 if(bg){const light=(bg.r*0.2126+bg.g*0.7152+bg.b*0.0722)>.45;v.strokes=v.strokes.map(s=>s.type==='SOLID'?{...s,color:rgb(light?'#141613':'#C8DED6')}:s);changed.add(v.id);}
}
const focus=await figma.getNodeByIdAsync('6:519');
focus.strokes=[{type:'SOLID',color:rgb('#6D4DB4')}];focus.strokeWeight=3;focus.strokeAlign='OUTSIDE';focus.cornerRadius=28;changed.add(focus.id);
const pc=figma.variables.createVariableCollection('X5 · Primitives');
const sc=figma.variables.createVariableCollection('X5 · Semantic');
sc.renameMode(sc.defaultModeId,'Light');
let darkMode=null,modeNote=null;try{darkMode=sc.addMode('Dark');}catch(e){modeNote=String(e);}
const gc=figma.variables.createVariableCollection('X5 · Geometry');
const primitives={},semantics={},nums={};
function primitive(name,h){const v=figma.variables.createVariable(name,pc,'COLOR');v.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];v.setValueForMode(pc.defaultModeId,{...rgb(h),a:1});v.setVariableCodeSyntax('WEB','var(--x5-'+name.replaceAll('/','-')+')');primitives[h]=v;return v;}
const palette={'neutral/ink':'#141613','neutral/canvas':'#F0F1EB','neutral/sidebar':'#E7E9E2','neutral/white':'#FFFFFF','neutral/muted':'#60685F','neutral/border':'#DDE1D6','brand/lime':'#C6EF4E','brand/purple':'#AA98E0','purple/surface':'#E5DFF7','purple/text':'#514371','coral/surface':'#F9DED8','coral/text':'#884D42','petrol/canvas':'#082D33','petrol/sidebar':'#05272D','petrol/surface':'#123B40','petrol/text':'#F4F8EE','petrol/muted':'#ABC0BF','petrol/border':'#2D5052','petrol/icon':'#C8DED6','state/focus':'#6D4DB4','state/neutral-bg':'#ECF1E3','state/neutral-text':'#485738','state/disabled-bg':'#E4E7DC','state/disabled-text':'#8C9384'};
for(const [n,h]of Object.entries(palette))primitive(n,h);
function semantic(name,light,darkHex,scopes){
const v=figma.variables.createVariable(name,sc,'COLOR');v.scopes=scopes;
v.setValueForMode(sc.defaultModeId,figma.variables.createVariableAlias(primitives[light]));
if(darkMode)v.setValueForMode(darkMode,figma.variables.createVariableAlias(primitives[darkHex||light]));
v.setVariableCodeSyntax('WEB','var(--'+name.replaceAll('/','-')+')');semantics[name]=v;return v;}
semantic('surface/canvas','#F0F1EB','#082D33',['FRAME_FILL','SHAPE_FILL']);
semantic('surface/sidebar','#E7E9E2','#05272D',['FRAME_FILL','SHAPE_FILL']);
semantic('surface/card','#FFFFFF','#123B40',['FRAME_FILL','SHAPE_FILL']);
semantic('text/primary','#141613','#F4F8EE',['TEXT_FILL']);
semantic('text/secondary','#60685F','#ABC0BF',['TEXT_FILL']);
semantic('text/on-dark','#FFFFFF','#FFFFFF',['TEXT_FILL','STROKE_COLOR']);
semantic('text/on-accent','#141613','#141613',['TEXT_FILL','STROKE_COLOR']);
semantic('border/default','#DDE1D6','#2D5052',['STROKE_COLOR']);
semantic('action/primary','#141613','#C6EF4E',['FRAME_FILL','SHAPE_FILL']);
semantic('action/accent','#C6EF4E','#C6EF4E',['FRAME_FILL','SHAPE_FILL']);
semantic('icon/default','#141613','#C8DED6',['STROKE_COLOR','SHAPE_FILL']);
semantic('state/focus','#6D4DB4','#AA98E0',['STROKE_COLOR']);
for(const [role,a,b]of [['hypothesis','#E5DFF7','#514371'],['gap','#F9DED8','#884D42'],['neutral','#ECF1E3','#485738'],['disabled','#E4E7DC','#8C9384']]){
semantic('status/'+role+'/surface',a,a,['FRAME_FILL','SHAPE_FILL']);
semantic('status/'+role+'/text',b,b,['TEXT_FILL','STROKE_COLOR']);}
for(const [prefix,values,scope]of [['space',[0,2,4,6,8,10,12,14,16,18,20,24,28,30,32,36,40,48,56,64],['GAP']],['radius',[0,4,6,8,10,12,14,16,18,20,22,24,28,30,32,40,48,50,99,999],['CORNER_RADIUS']]]){
for(const value of values){const name=prefix+'/'+value,v=figma.variables.createVariable(name,gc,'FLOAT');v.scopes=scope;v.setValueForMode(gc.defaultModeId,value);v.setVariableCodeSyntax('WEB','var(--'+prefix+'-'+value+')');nums[name]=v;}}
if(darkMode){dark.setExplicitVariableModeForCollection(sc,darkMode);changed.add(dark.id);}
const nodes=page.findAll();
const darkIds=new Set([dark.id,...dark.findAll().map(n=>n.id)]);
const exact={'#F0F1EB':'surface/canvas','#E7E9E2':'surface/sidebar','#E5DFF7':'status/hypothesis/surface','#514371':'status/hypothesis/text','#F9DED8':'status/gap/surface','#884D42':'status/gap/text','#ECF1E3':'status/neutral/surface','#485738':'status/neutral/text','#E4E7DC':'status/disabled/surface','#8C9384':'status/disabled/text','#6D4DB4':'state/focus'};
const darkExact={'#082D33':'surface/canvas','#05272D':'surface/sidebar','#123B40':'surface/card','#F4F8EE':'text/primary','#ABC0BF':'text/secondary','#2D5052':'border/default','#C8DED6':'icon/default'};
let paintBindings=0,numericBindings=0;
for(const n of nodes){
 const isDark=darkIds.has(n.id);
 for(const prop of ['fills','strokes'])if(prop in n&&Array.isArray(n[prop])){
 let mod=false;const paints=n[prop].map(p=>{
 if(p.type!=='SOLID')return p;
 const h=hex(p.color);let role=isDark?darkExact[h]:exact[h];
 if(h==='#C6EF4E')role='action/accent';
 if(h==='#141613'||h==='#000000')role=isDark?'text/on-accent':n.type==='TEXT'?'text/primary':prop==='strokes'?'icon/default':'action/primary';
 if(h==='#FFFFFF')role=n.type==='TEXT'||prop==='strokes'?'text/on-dark':isDark?null:'surface/card';
 if(h==='#60685F')role=isDark?null:'text/secondary';
 if(h==='#DDE1D6')role=isDark?null:'border/default';
 const v=role?semantics[role]:primitives[h];
 if(!v)return p;mod=true;paintBindings++;return figma.variables.setBoundVariableForPaint(p,'color',v);
 });if(mod){n[prop]=paints;changed.add(n.id);}
 }
 if('layoutMode'in n&&n.layoutMode!=='NONE')for(const field of ['paddingLeft','paddingRight','paddingTop','paddingBottom','itemSpacing']){const v=nums['space/'+n[field]];if(v){n.setBoundVariable(field,v);numericBindings++;changed.add(n.id);}}
 if('cornerRadius'in n&&typeof n.cornerRadius==='number'){const v=nums['radius/'+n.cornerRadius];if(v){n.setBoundVariable('topLeftRadius',v);n.setBoundVariable('topRightRadius',v);n.setBoundVariable('bottomLeftRadius',v);n.setBoundVariable('bottomRightRadius',v);numericBindings+=4;changed.add(n.id);}}
}
const styles=new Map();let styledTexts=0;
for(const t of texts){if(t.removed||typeof t.fontSize!=='number'||typeof t.fontName!=='object')continue;
const key=JSON.stringify([t.fontName,t.fontSize,t.lineHeight,t.letterSpacing]);
let s=styles.get(key);if(!s){s=figma.createTextStyle();s.name='X5/Type/'+t.fontSize+'/'+t.fontName.style+'/'+(t.lineHeight.unit==='AUTO'?'Auto':Math.round(t.lineHeight.value));s.fontName=t.fontName;s.fontSize=t.fontSize;s.lineHeight=t.lineHeight;s.letterSpacing=t.letterSpacing;styles.set(key,s);}
await t.setTextStyleIdAsync(s.id);styledTexts++;changed.add(t.id);}
return {deletedNodeIds:['6:321'],mutatedNodeIds:[...changed],collections:[pc,sc,gc].map(c=>({id:c.id,name:c.name,modes:c.modes})),variables:[...Object.values(primitives),...Object.values(semantics),...Object.values(nums)].map(v=>({id:v.id,name:v.name})),paintBindings,numericBindings,styledTexts,textStyleCount:styles.size,modeNote};
