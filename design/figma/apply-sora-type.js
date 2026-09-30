const p=await figma.getNodeByIdAsync("0:1");await figma.setCurrentPageAsync(p);
const texts=p.findAllWithCriteria({types:["TEXT"]});const styles=await figma.getLocalTextStylesAsync();
const mapStyle=s=>({Regular:"Regular",Medium:"Regular","Semi Bold":"SemiBold",SemiBold:"SemiBold",Bold:"Bold","Extra Bold":"ExtraBold",ExtraBold:"ExtraBold",Light:"Light",Thin:"Thin"}[s]||"Regular");
const plans=texts.map(n=>({n,segments:n.getStyledTextSegments(["fontName"]).map(s=>({start:s.start,end:s.end,old:s.fontName,target:{family:"Sora",style:s.fontName.family==="Barlow Condensed"?"SemiBold":mapStyle(s.fontName.style)}}))}));
const fontMap=new Map();
for(const plan of plans)for(const s of plan.segments){fontMap.set(JSON.stringify(s.old),s.old);fontMap.set(JSON.stringify(s.target),s.target);}
for(const s of styles)fontMap.set(JSON.stringify(s.fontName),s.fontName);
for(const style of ["Regular","SemiBold","Bold","ExtraBold"])fontMap.set("Sora"+style,{family:"Sora",style});
for(const f of fontMap.values())await figma.loadFontAsync(f);
const ids=[];
for(const s of styles){const weight=s.name.startsWith("X5/Chip/Value/")||s.name==="X5/Chip/Title"||s.name==="X5/Control/Label"?"SemiBold":mapStyle(s.fontName.style);s.fontName={family:"Sora",style:weight};s.name=s.name.replace("/Semi Bold/","/SemiBold/").replace("/Extra Bold/","/ExtraBold/").replace("/Medium/","/Regular/");
 if(s.name==="X5/Chip/Value/Desktop"){s.fontSize=46;s.lineHeight={unit:"PIXELS",value:56};}
 if(s.name==="X5/Chip/Value/Mobile"){s.fontSize=32;s.lineHeight={unit:"PIXELS",value:44};}
 ids.push(s.id);
}
for(const {n,segments}of plans){
 if(segments.length===1)n.fontName=segments[0].target;
 else for(const seg of segments)n.setRangeFontName(seg.start,seg.end,seg.target);
 if(n.name==="Value"&&segments.some(s=>s.old.family==="Barlow Condensed")){
  let a=n.parent;while(a&&a.type!=="COMPONENT"&&a.type!=="INSTANCE"&&a.type!=="PAGE")a=a.parent;
  const small=a.width<200;n.fontSize=small?32:46;n.lineHeight={unit:"PIXELS",value:small?44:56};n.fontName={family:"Sora",style:"SemiBold"};
 }
 if(n.id==="6:402")n.characters="Sora";
 if(n.id==="60:484")n.characters="Recortes vetoriais, tipografia Sora e faixa de dados encaixada. Contagens e qualidade acompanham os valores exibidos.";
 if(n.id==="60:652")n.characters="Recorte no topo, tipografia Sora e faixas com a paleta X5.";
 ids.push(n.id);
}
const set=await figma.getNodeByIdAsync("60:482");
for(const c of set.children)for(const tag of c.findAllWithCriteria({types:["TEXT"]}).filter(t=>t.name==="Tag")){tag.x=tag.parent.width-tag.width-12;ids.push(tag.id);}
set.description=set.description+" Tipografia Sora em todos os textos; valores SemiBold em 46 px no desktop e 32 px no mobile.";ids.push(set.id);
return {mutatedNodeIds:[...new Set(ids)],textCount:texts.length,textStyles:styles.length,font:"Sora",weights:["Regular","SemiBold","Bold","ExtraBold"],chipValueSizes:{desktop:46,mobile:32}};
