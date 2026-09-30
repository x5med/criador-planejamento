
const p=figma.currentPage,mutated=new Set(),changedVars=[],changedText=[];
const fonts=new Map();for(const t of p.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
const map={"#F0F1EB":"#F4F3ED","#E7E9E2":"#EBE9DF","#FFFFFF":"#FFFEFA","#141613":"#151611","#D6DBC9":"#DED9C8","#60685F":"#626258","#485738":"#45351B","#C6EF4E":"#C8A253","#606660":"#626258","#4F574B":"#54544B","#F2F3EF":"#F4F3ED","#4D6A28":"#5F4A22","#C8CEC0":"#CEC9B9","#62695D":"#626258","#D7DBD0":"#DEDDD4","#DDE1D6":"#DEDDD4","#66705F":"#626258","#ECF1E3":"#EEE8D9","#EDF0E7":"#F0ECE1","#DADED3":"#E1DCCF","#95B532":"#8F6B28","#F4F5F0":"#F6F4EC","#DCE2D0":"#E4DDC9","#AFD33C":"#C8A253","#E7EBCD":"#EEE4CC","#505C33":"#594A2B","#D8DDD1":"#DED9CA","#637059":"#626258","#AA98E0":"#E8CD8D","#082D33":"#151611","#E7EAE1":"#EBE9DF","#E5DFF7":"#E4EAF0","#514371":"#39516B","#F9DED8":"#F9DED8","#884D42":"#884D42","#6D4DB4":"#8F6B28","#E4E7DC":"#E5E2D8","#8C9384":"#8A897F","#F8F9F5":"#F9F7F0","#D4DACB":"#D9D3C2","#FEF2EE":"#FEF2EE","#B34436":"#B34436","#A2342A":"#A2342A","#E4E8DC":"#E7E2D3","#FBEDE7":"#FBEDE7","#E9ECE2":"#F0ECE1","#5B6453":"#5B594D","#66715F":"#626258","#CFD6C2":"#D6CEBA","#D9E9AF":"#E8CD8D","#5D6553":"#5A5749","#DADFD0":"#E1DBCC","#FAFBF6":"#FBF9F1","#ABB989":"#AE9662","#E9E3F7":"#F0E7D2","#D8CEEE":"#DFCEAA","#5E527F":"#6B542A","#F0ECF8":"#F5EFE1","#F9EEE9":"#F9EEE9","#E8ECE0":"#EBE7DA","#A8C837":"#B78D3D","#A998D3":"#AE9565","#EAE6F4":"#F0EADB","#E7F3BD":"#EFDFB5","#F5F6F1":"#F7F5EE","#ECEFE6":"#F0ECE2","#E5F1BB":"#EFDFB5","#E8E2F5":"#E4EAF0","#05272D":"#11120E","#F4F8EE":"#F4F3ED","#31544C":"#454337","#E5EAD8":"#E8E3D3","#ABC0BF":"#C6C3B7","#07282D":"#171812","#C8DED6":"#E8CD8D","#BAD0CC":"#D4CBB5","#153B40":"#272820","#2D5052":"#414237","#C9D8CF":"#DAD5C7","#54706B":"#777363","#D9E8D7":"#F0E5CE","#2A4A4C":"#3A3B31","#102B27":"#151611","#123B40":"#1D1E18","#C4D8CE":"#DAD2BF","#34554E":"#464435","#D4E5CE":"#E8D9B6","#21474A":"#272820","#B8CCC5":"#D4CEBD","#234440":"#393729","#CADAB4":"#E4D6B4"};
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const hex=c=>'#'+['r','g','b'].map(k=>Math.round(c[k]*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const variables=await figma.variables.getLocalVariablesAsync();
for(const v of variables){if(v.resolvedType!=='COLOR')continue;let changed=false;for(const [mode,value]of Object.entries(v.valuesByMode)){if(!('r'in value))continue;const target=map[hex(value)];if(target&&target!==hex(value)){v.setValueForMode(mode,{...rgb(target),a:value.a});changed=true;}}
const newName=v.name==='brand/lime'?'brand/gold':v.name==='brand/purple'?'brand/gold-light':v.name.startsWith('petrol/')?v.name.replace('petrol/','dark/'):v.name.startsWith('purple/')?v.name.replace('purple/','info/'):v.name;
if(newName!==v.name){v.name=newName;v.setVariableCodeSyntax('WEB','var(--x5-'+newName.replaceAll('/','-')+')');changed=true;}if(changed)changedVars.push(v.id);}
let paintsChanged=0;
for(const n of p.findAll()){
 for(const field of ['fills','strokes'])if(field in n&&Array.isArray(n[field])){
 let change=false;const paints=n[field].map(f=>{if(f.type!=='SOLID'||f.boundVariables?.color)return f;const h=hex(f.color),target=map[h];if(!target||target===h)return f;change=true;paintsChanged++;return {...f,color:rgb(target)};});
 if(change){n[field]=paints;mutated.add(n.id);}
 }
 if(n.name.includes('X5 Lime')||n.name.includes('petróleo')||n.name.includes('Petrol')||n.name.includes('Tone=Lime')){n.name=n.name.replaceAll('X5 Lime','X5 Business').replaceAll('petróleo','escuro').replaceAll('Petrol','Dark').replaceAll('Tone=Lime','Tone=Gold');mutated.add(n.id);}
 if((n.type==='COMPONENT'||n.type==='COMPONENT_SET')&&n.description){const d=n.description.replaceAll('petróleo','escuro').replaceAll('Lima','Dourado').replaceAll('lima','dourado').replaceAll('lilás para hipótese','azul para hipótese');if(d!==n.description){n.description=d;mutated.add(n.id);}}
}
const texts={
'6:348':'Geometria simples, respiro generoso e contraste. Dourado para direção; off-white para leitura; preto para foco.',
'6:359':'Dourado / ação','6:361':'#C8A253','6:368':'#151611','6:373':'Off-white / canvas','6:375':'#F4F3ED','6:382':'#FFFEFA','6:387':'Champagne / apoio','6:389':'#E8CD8D','6:394':'Preto / escuro','6:396':'#151611',
'6:474':'Texto e ícone acompanham a cor. Dourado recebe texto escuro; estados combinam rótulos e cores de apoio.',
'6:479':'01–02 · Cards claros e contraste adaptados à X5.',
'6:480':'03–04 · Hierarquia e contraste no tema escuro.',
'6:481':'05 · Dados e navegação com preto e dourado.',
'10:3':'X5 Business / Biblioteca nativa'
};
for(const [id,text]of Object.entries(texts)){const n=await figma.getNodeByIdAsync(id);n.characters=text;mutated.add(n.id);changedText.push(id);}
return {variableCount:changedVars.length,unboundPaintChanges:paintsChanged,changedTextIds:changedText,mutatedVariableIds:changedVars,mutatedNodeIds:[...mutated]};
