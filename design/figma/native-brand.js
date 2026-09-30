
const page=figma.currentPage;
const fonts=new Map();
for(const t of page.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
const svg="<svg width=\"956.94\" height=\"676.67\" viewBox=\"227 138 956.94 676.67\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M1183.94 309.439C1150.96 343.839 1117.98 378.239 1084.99 412.639L881.675 413.589C865.765 431.189 849.855 448.799 833.945 466.409C893.465 464.149 943.435 465.859 980.545 468.219C1102.5 475.939 1125.32 493.049 1136.39 510.279C1150.5 532.259 1148.58 557.839 1145.55 575.209C1138.36 616.399 1115.9 652.189 1083.28 675.759C1073.19 683.049 1061.38 689.699 1042.51 696.769C1013.71 707.569 960.185 722.459 883.095 715.069C851.955 679.189 820.805 643.299 789.665 607.409C799.445 607.639 951.845 611.089 995.495 602.839C1011.62 599.789 1017.57 592.789 1019.87 589.399C1025.21 581.509 1025.41 571.399 1023.63 565.749C1018.06 548.099 982.155 539.219 935.065 543.689C868.375 545.069 801.685 546.449 734.995 547.829L672.195 479.879C729.755 423.069 787.305 366.249 844.865 309.439H1183.94Z\" fill=\"white\"/>\n<path d=\"M966.4 138L625.64 480.21C720.18 591.7 814.71 703.18 909.24 814.67C855.48 814.62 801.71 814.57 747.95 814.53C714.78 773.62 680.36 732.19 644.65 690.34C608.94 648.5 573.45 608 538.28 568.82C488.81 615.2 439.34 661.59 389.87 707.97L227 711.54L966.4 138Z\" fill=\"white\"/>\n<path d=\"M464.948 309.439C495.268 343.119 525.598 376.799 555.918 410.479C524.908 434.349 493.908 458.209 462.908 482.079L308.688 309.439H464.948Z\" fill=\"white\"/>\n<path d=\"M944.522 814.574C939.032 814.604 933.552 814.634 928.062 814.664C928.402 788.054 928.732 761.444 929.072 734.834C938.662 734.874 948.242 734.904 957.832 734.934C963.082 755.314 968.342 775.684 973.592 796.054C978.502 775.654 983.412 755.244 988.312 734.844L1016.8 732.804C1017.24 740.554 1017.63 748.394 1017.96 756.314C1018.78 776.254 1019.14 795.684 1019.12 814.574H1003.69C1002.9 791.424 1002.11 768.264 1001.32 745.114C1000.67 747.414 991.262 793.584 987.212 814.364L962.202 814.664L944.522 743.134V814.574Z\" fill=\"white\"/>\n<path d=\"M1119.88 800.299C1120.57 800.439 1135.79 803.169 1145.2 792.319C1152.94 783.389 1150.85 772.059 1150.26 768.849C1149.78 766.239 1147.57 755.269 1137.23 748.749C1129.99 744.179 1122.69 744.259 1119.88 744.439V800.299ZM1097.72 814.569V801.159C1100.47 801.249 1103.22 801.339 1105.98 801.429C1106.45 782.809 1106.93 764.189 1107.4 745.569C1104.58 745.529 1101.76 745.479 1098.95 745.429C1098.88 741.259 1098.81 737.089 1098.74 732.929H1123.86C1140.43 732.929 1155.21 743.779 1159.59 759.759C1160.67 763.709 1161.4 768.069 1161.56 772.789C1161.77 778.989 1160.97 784.619 1159.61 789.599C1155.5 804.739 1140.83 814.569 1125.15 814.569H1097.72Z\" fill=\"white\"/>\n<path d=\"M1087.5 747.215H1050.73C1050.49 754.035 1050.25 760.855 1050.01 767.665C1060.24 767.725 1070.47 767.775 1080.7 767.835C1080.55 772.085 1080.41 776.345 1080.26 780.605C1070.42 781.035 1060.57 781.475 1050.72 781.905L1050.73 802.325C1062.56 801.935 1074.39 801.555 1086.22 801.165C1086.29 805.635 1086.36 810.105 1086.43 814.575H1032.2C1032.39 801.065 1032.67 787.405 1033.04 773.605C1033.41 759.895 1033.86 746.335 1034.39 732.925H1087.45C1087.47 737.685 1087.48 742.455 1087.5 747.215Z\" fill=\"white\"/>\n</svg>";
const variables=await figma.variables.getLocalVariablesAsync();
const white=variables.find(v=>v.name==='neutral/white'),ink=variables.find(v=>v.name==='neutral/ink');
const created=[],mutated=[],deleted=[];
function makeLogo(dark,width){
 const logo=figma.createNodeFromSvg(svg);logo.name='X5 Med / Logo oficial';
 logo.rescale(width/logo.width);logo.clipsContent=false;
 for(const v of logo.findAllWithCriteria({types:['VECTOR']})){v.fills=v.fills.map(p=>p.type==='SOLID'?figma.variables.setBoundVariableForPaint({...p,color:dark?{r:1,g:1,b:1}:{r:20/255,g:22/255,b:19/255}},'color',dark?white:ink):p);}
 created.push(logo.id,...logo.findAll().map(n=>n.id));return logo;
}
const brands=[];
for(const [id,oldId,dark] of [['10:652','10:647',false],['10:707','10:702',true]]){
 const main=await figma.getNodeByIdAsync(id),old=await figma.getNodeByIdAsync(oldId);
 const logo=makeLogo(dark,72);main.insertChild(0,logo);deleted.push(old.id);old.remove();
 main.itemSpacing=14;main.counterAxisAlignItems='CENTER';main.resize(192,52);
 main.description='Logo oficial X5 Med fornecida pelo usuário em SVG. Vetores originais preservados; margens externas aparadas. Branco no tema Dark e tinta no tema Light. Descritor Planejamento identifica o produto.';
 mutated.push(main.id);brands.push({id:main.id,logoId:logo.id,width:logo.width,height:logo.height});
}
const instances=page.findAll(n=>n.type==='INSTANCE'&&n.name==='DS/Brand/X5');
for(const i of instances){const hs=i.layoutSizingHorizontal;i.resize(hs==='FILL'?192:170,52);i.layoutSizingHorizontal=hs;i.layoutSizingVertical='FIXED';mutated.push(i.id);}
const avatars=['6:1142','6:885','6:1461','6:1731','6:2004','6:2320','6:2567'];
for(const id of avatars){const p=await figma.getNodeByIdAsync(id);const bg=p.fills.find(f=>f.type==='SOLID');const dark=bg?bg.color.r+bg.color.g+bg.color.b<1.5:true;const mark=makeLogo(dark,27);const old=p.children.filter(n=>n.type==='TEXT'&&n.characters==='X5');p.appendChild(mark);for(const n of old){deleted.push(n.id);n.remove();}mutated.push(p.id);}
const brandSet=await figma.getNodeByIdAsync('10:733');brandSet.resize(1344,104);mutated.push(brandSet.id);
const library=await figma.getNodeByIdAsync('10:2');const darkMaster=await figma.getNodeByIdAsync('10:707');
const backdrop=library.children.find(n=>n.name==='Preview background'&&Math.abs(n.x-(brandSet.x+darkMaster.x-10))<1&&Math.abs(n.y-(brandSet.y+darkMaster.y-10))<1);
if(backdrop){backdrop.resize(240,72);mutated.push(backdrop.id);}
return {brands,updatedBrandInstances:instances.length,updatedHeaderMarks:avatars.length,createdNodeIds:created,mutatedNodeIds:mutated,deletedNodeIds:deleted};
