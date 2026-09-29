const places=[
 {id:'ajloun',n:'Ajloun Forest & Castle',c:'nature',x:108,y:52,p:35,t:'Hike oak forests below a 12th-century castle.',a:'Hiking · Olive harvest'},
 {id:'jerash',n:'Jerash Roman City',c:'history',x:132,y:75,p:20,t:'Walk the colonnaded streets of a Roman provincial city.',a:'Guided tour'},
 {id:'amman',n:'Amman Old Town',c:'culture',x:140,y:125,p:25,t:'Street art, coffee houses and craft workshops.',a:'Walking tour · Crafts'},
 {id:'madaba',n:'Madaba Kitchens',c:'food',x:122,y:150,p:30,t:'Cook with a family in a Byzantine mosaic town.',a:'Cooking class'},
 {id:'dana',n:'Dana Village',c:'hidden',x:120,y:270,p:45,t:'Stone village on a biosphere reserve rim.',a:'Eco-lodge · Trekking'},
 {id:'petra',n:'Petra Back Trails',c:'history',x:126,y:305,p:55,t:'Approach the rose city by the Nabataean ridge trails.',a:'Guided trek'},
 {id:'rum',n:'Wadi Rum Camp',c:'adventure',x:172,y:372,p:60,t:'Jeep, camel and a night under the stars.',a:'Jeep · Camping'}
];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let journey=JSON.parse(JSON.stringify([])),days={},booked=false,pay='Apple Pay',filter='all';

/* Router */
function go(id){
  $$('section').forEach(s=>s.classList.toggle('on',s.id===id));
  $$('nav a').forEach(a=>a.classList.toggle('on',a.dataset.n===id));
  location.hash=id;window.scrollTo(0,0);render();
}
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if($('#'+h)&&!$('#'+h).classList.contains('on'))go(h)});

/* Map */
const cats=['all','nature','history','culture','food','adventure','hidden'];
$('#filters').innerHTML=cats.map(c=>`<button class="chip ${c==='all'?'on':''}" data-c="${c}">${c==='hidden'?'hidden places':c}</button>`).join('');
$('#filters').onclick=e=>{const c=e.target.dataset.c;if(!c)return;filter=c;$$('.chip').forEach(b=>b.classList.toggle('on',b.dataset.c===c));drawPins();$('#popup').hidden=true};
function drawPins0(){
  $('#pins').innerHTML=places.map(p=>`<g class="pin ${filter==='all'||p.c===filter?'':'hide'}" data-id="${p.id}" tabindex="0"><circle cx="${p.x}" cy="${p.y}" r="8"/><text x="${p.x+14}" y="${p.y+4}">${p.n.split(' ')[0]}</text></g>`).join('');
  $$('.pin').forEach(g=>{g.onclick=()=>showPop(g.dataset.id);g.onkeydown=e=>{if(e.key==='Enter')showPop(g.dataset.id)}});
}
function showPop0(id){
  const p=places.find(x=>x.id===id),el=$('#popup');
  $$('.pin').forEach(g=>g.classList.toggle('sel',g.dataset.id===id));
  el.hidden=false;
  el.innerHTML=`<div class="photo p${(places.indexOf(p)%3)+1}">${p.n}</div><span class="tag">${p.c.toUpperCase()}</span><h3 style="margin-top:6px">${p.n}</h3><p style="font-size:13px;color:var(--dim)">${p.t}</p><p style="font-size:12px;margin-top:6px">Activities: ${p.a}</p><div class="row"><button class="btn" onclick="go('destination')">EXPLORE</button><button class="btn ghost" onclick="add('${p.id}')">+ JOURNEY</button></div>`;
}

/* Journey */
function add(id){
  if(journey.includes(id)){toast('Already in your journey');return}
  journey.push(id);days[id]=journey.length;toast('Added to your journey ✓');render();
}
function clearJ(){journey=[];days={};render()}
const byDay=()=>[...journey].sort((a,b)=>days[a]-days[b]);
function render0(){
  const list=byDay().map(id=>places.find(p=>p.id===id));
  // Build screen
  $('#buildList').innerHTML=list.length?list.map((p,i)=>`<li><span><b style="color:#fff">${i+1}. ${p.n}</b><br><small>${p.a}</small></span><select onchange="days['${p.id}']=+this.value;render()">${[1,2,3,4,5].map(d=>`<option value="${d}" ${days[p.id]===d?'selected':''}>Day ${d}</option>`).join('')}</select></li>`).join(''):'<li class="empty">Nothing yet — pick places on the map.</li>';
  const pts=list.map(p=>`${p.x},${p.y}`);$('#route').setAttribute('points',pts.join(' '));
  $('#routePins').innerHTML=list.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="11" fill="#d99a5b" stroke="#fff" stroke-width="2"/><text x="${p.x}" y="${p.y+4}" text-anchor="middle" fill="#1b1206" font-size="11" font-weight="800">${i+1}</text>`).join('');
  let km=0;for(let i=1;i<list.length;i++)km+=Math.hypot(list[i].x-list[i-1].x,list[i].y-list[i-1].y)*1.15;
  $('#km').textContent=Math.round(km)+' KM Total Route';
  // Invoice
  const stay=list.length?90*Math.max(1,new Set(list.map(p=>days[p.id])).size):0,
        trans=list.length?40+list.length*10:0,guide=list.length?50:0,
        exp=list.reduce((s,p)=>s+p.p,0),tot=stay+trans+guide+exp;
  $('#invoice').innerHTML=list.length?[['Accommodation · rural eco-lodge',stay],['Transportation',trans],['Certified local guide',guide],['Experiences ('+list.length+')',exp]].map(r=>`<li><span>${r[0]}</span><b>${r[1]} JOD</b></li>`).join(''):'<li class="empty">Your invoice is empty. Build a journey first.</li>';
  $('#tot').textContent=tot+' JOD';$('#usd').textContent='≈ '+Math.round(tot*1.41)+' USD (indicative rate)';
  // Chronicle
  $('#chron').innerHTML=list.length?list.map(p=>`<div class="glass day" style="margin-bottom:14px"><span class="tag">DAY ${days[p.id]}</span><h3 style="margin:6px 0">${p.n}</h3><p>${p.t}</p></div>`).join(''):'<p class="empty">No journey yet. Add places from the map.</p>';
  // QR
  const q=$('#qr');q.hidden=!booked;$('#qrNote').hidden=booked;
  if(booked){const x=q.getContext('2d');x.clearRect(0,0,21,21);let s=list.map(p=>p.id).join('')+'BJ';let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;
    for(let r=0;r<21;r++)for(let c=0;c<21;c++){const f=(r<7&&c<7)||(r<7&&c>13)||(r>13&&c<7);let on;if(f){const rr=r%14%7,cc=c%14%7;on=rr===0||rr===6||cc===0||cc===6||(rr>1&&rr<5&&cc>1&&cc<5)}else{h=(h*1103515245+12345)>>>0;on=(h>>>16)&1}
      if(on){x.fillStyle='#000';x.fillRect(c,r,1,1)}}}
  // Passport
  const all=[{i:'⛰️',n:'Ajloun Highlands',k:'ajloun'},{i:'🏛️',n:'Jerash Cinematic',k:'jerash'},{i:'🪨',n:'Petra Hidden Trails',k:'petra'}];
  $('#stamps').innerHTML=all.map(s=>{const on=booked&&journey.includes(s.k);return`<div class="stamp ${on?'on':''}"><span>${on?s.i:'🔒'}</span>${s.n}<br><small>${on?'Stamp collected':'Locked'}</small></div>`}).join('');
  const pc=booked?Math.min(100,Math.round(journey.filter(k=>all.some(s=>s.k===k)).length/all.length*100)):0;
  $('#pct').textContent=pc+'%';$('#fill').style.width=pc+'%';$('#lvl').textContent='Discovery level: '+(pc>60?'Trailblazer':pc>0?'Wanderer':'Explorer');
}

/* Payment */
$$('.pay').forEach(b=>b.onclick=()=>{pay=b.dataset.p;$$('.pay').forEach(x=>x.classList.toggle('on',x===b))});
function confirmPay(){
  if(!journey.length){toast('Add at least one place first');return}
  booked=true;toast('Payment confirmed with '+pay+' ✓');go('journey');
}

function toast0(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200)}



/* ---------- Language (EN / AR) ---------- */
const AR={
'Home':'الرئيسية','Explore':'استكشف','Map':'الخريطة','My Journey':'رحلتي','Passport':'جواز السفر','PLAN MY TRIP':'خطّط رحلتي',
'Beyond the beaten path':'خارج المسارات المعتادة','DISCOVER JORDAN DIFFERENTLY':'اكتشف الأردن بشكل مختلف',
'Discover verified local guides, rural eco-lodges and authentic community experiences — and book them all in one place.':'اكتشف مرشدين محليين موثوقين ونُزُلاً بيئية ريفية وتجارب مجتمعية أصيلة، واحجزها جميعًا في مكان واحد.',
'Verified providers':'مزوّدون موثّقون','Hidden places':'أماكن مخفية','Governorates':'محافظات','EXPLORE THE MAP':'استكشف الخريطة','MEET LOCAL GUIDES':'تعرّف على المرشدين',
'Wadi Rum · Valley of the Moon':'وادي رم · وادي القمر','Unearth the Pillars of Jordanian Hospitality':'اكتشف أعمدة الضيافة الأردنية',
'Dana Biosphere Escapes':'رحلات محمية ضانا','Stay in stone-built eco-lodges above the valley.':'أقم في نُزُل بيئية حجرية تطل على الوادي.',
'Heritage Table Sessions':'جلسات المائدة التراثية','Cook mansaf and maqluba with village families.':'اطبخ المنسف والمقلوبة مع عائلات القرية.',
'Nabataean Ridge Trails':'مسارات الحافة النبطية','Walk the trails behind Petra with a local guide.':'امشِ في المسارات خلف البتراء مع مرشد محلي.',
'Interactive map':'خريطة تفاعلية','Explore Jordan':'استكشف الأردن','all':'الكل','nature':'الطبيعة','history':'التاريخ','culture':'الثقافة','food':'الطعام','adventure':'المغامرة','hidden places':'أماكن مخفية',
'Map is a simplified placeholder — Phase 2 replaces it with accurate governorate boundaries.':'الخريطة مبسّطة مؤقتًا، وفي المرحلة الثانية تُستبدل بحدود دقيقة للمحافظات.',
'Destination profile':'ملف الوجهة','AJLOUN HIGHLANDS':'مرتفعات عجلون','Forests, villages, stories.':'غابات وقرى وحكايات.','ADD TO JOURNEY':'أضف إلى الرحلة','VIEW REGIONAL TRAIL MAP':'عرض خريطة المسارات',
'Ancestral story':'حكاية الأجداد','Where Roman olive roots anchor medieval hilltop citadels':'حيث تتجذّر أشجار الزيتون الرومانية عند قلاع القمم القروسطية',
"In villages that ring Ajloun's forest reserve, olive harvests are still a shared family event. Stay with a host family, pick olives at dawn, and press oil the way their grandparents did.":'في القرى المحيطة بمحمية عجلون الحرجية ما زال قطف الزيتون مناسبة عائلية مشتركة. أقم عند أسرة مضيفة، واقطف الزيتون فجرًا، واعصر الزيت كما فعل الأجداد.',
'Categories & experiences':'الفئات والتجارب','Ajloun Castle & Forest Trail':'قلعة عجلون ومسار الغابة','HISTORY':'التاريخ','Olive Harvest Feast':'وليمة قطاف الزيتون','VIEW':'عرض','Community Cooking Class':'درس طبخ مجتمعي','FOOD':'الطعام',
'Al-Ayoun Trail':'مسار العيون','Al-Ayoun Trail & Olive Harvest Feast':'مسار العيون ووليمة قطاف الزيتون',
"Hike through olive terraces with a local guide, then share a harvest lunch cooked by the village women's cooperative. Includes tasting of freshly pressed oil.":'تجوّل بين مدرجات الزيتون مع مرشد محلي، ثم شارك في غداء الحصاد الذي تعدّه جمعية نساء القرية، مع تذوّق الزيت الطازج.',
'LOCAL COMMUNITY PARTNER':'شريك مجتمعي محلي','From':'ابتداءً من','JOD / guest':'دينار / للضيف','Select itinerary':'اختر البرنامج','Standard hiking & feast':'مشي ووليمة (عادي)','Private guide upgrade':'ترقية إلى مرشد خاص','BOOK EXPERIENCE':'احجز التجربة','ENQUIRE FOR GROUP':'استفسار للمجموعات',
'Journey planner':'مخطط الرحلة','BUILD YOUR JOURNEY':'ابنِ رحلتك','Choose a day for each stop. Add more places from the map.':'اختر يومًا لكل محطة، وأضف أماكن أخرى من الخريطة.','CONTINUE JOURNEY':'متابعة الرحلة','Reset':'إعادة ضبط','Estimated route':'المسار التقديري','Nothing yet — pick places on the map.':'لا شيء بعد، اختر أماكن من الخريطة.',
'Consolidated invoice':'فاتورة موحّدة','EXPEDITION RECEIPTS':'إيصالات الرحلة','Accommodation · rural eco-lodge':'الإقامة · نُزل بيئي ريفي','Transportation':'النقل','Certified local guide':'مرشد محلي معتمد','Expedition Total':'إجمالي الرحلة','Your invoice is empty. Build a journey first.':'فاتورتك فارغة. ابنِ رحلة أولًا.',
'Secure payment':'دفع آمن','PAYMENT METHOD':'طريقة الدفع','💳 Credit Card':'💳 بطاقة ائتمان','Apple Pay':'Apple Pay','Local E-Wallet':'محفظة إلكترونية محلية','CONFIRM PAY SECURELY':'تأكيد الدفع الآمن',
'Upcoming expedition':'رحلتك القادمة','MY JORDAN CHRONICLE':'سجلّ رحلتي في الأردن','Access pass':'تصريح الدخول','Wanderer Passport':'جواز المسافر','Book a journey to unlock your QR code.':'احجز رحلة لتفعيل رمز QR الخاص بك.','CONTACT LOCAL HOST':'تواصل مع المضيف','No journey yet. Add places from the map.':'لا توجد رحلة بعد. أضف أماكن من الخريطة.',
'Heritage passport':'جواز التراث','MY JORDAN PASSPORT':'جواز سفري إلى الأردن','Every stamp supports the communities that host you.':'كل ختم يدعم المجتمعات التي تستضيفك.',
'Ajloun Highlands':'مرتفعات عجلون','Jerash Cinematic':'جرش السينمائية','Petra Hidden Trails':'مسارات البتراء المخفية','Stamp collected':'تم جمع الختم','Locked':'مقفل','Explorer':'مستكشف','Wanderer':'رحّالة','Trailblazer':'رائد مسارات',
"A premium eco-conscious platform connecting travelers to Jordan's communities.":'منصة راقية واعية بيئيًا تربط المسافرين بمجتمعات الأردن.','Eco-Lodges · Local Guides · Carbon Neutrality · Community Direct Pay':'نُزُل بيئية · مرشدون محليون · حياد كربوني · دفع مباشر للمجتمع',
'Ajloun Forest & Castle':'غابة وقلعة عجلون','Jerash Roman City':'مدينة جرش الرومانية','Amman Old Town':'وسط البلد في عمّان','Madaba Kitchens':'مطابخ مادبا','Dana Village':'قرية ضانا','Petra Back Trails':'مسارات البتراء الخلفية','Wadi Rum Camp':'مخيم وادي رم',
'Ajloun':'عجلون','Jerash':'جرش','Amman':'عمّان','Madaba':'مادبا','Dana':'ضانا','Petra':'البتراء','Wadi':'وادي رم',
'Hike oak forests below a 12th-century castle.':'تجوّل في غابات السنديان أسفل قلعة من القرن الثاني عشر.','Walk the colonnaded streets of a Roman provincial city.':'امشِ في شوارع الأعمدة بمدينة رومانية.','Street art, coffee houses and craft workshops.':'فن الشارع والمقاهي وورش الحِرف.','Cook with a family in a Byzantine mosaic town.':'اطبخ مع عائلة في بلدة الفسيفساء البيزنطية.','Stone village on a biosphere reserve rim.':'قرية حجرية على حافة محمية المحيط الحيوي.','Approach the rose city by the Nabataean ridge trails.':'اقترب من المدينة الوردية عبر مسارات الحافة النبطية.','Jeep, camel and a night under the stars.':'جيب وجمال وليلة تحت النجوم.',
'Hiking':'مشي','Olive harvest':'قطف الزيتون','Guided tour':'جولة مرشدة','Walking tour':'جولة مشيًا','Crafts':'حِرف','Cooking class':'درس طبخ','Eco-lodge':'نُزل بيئي','Trekking':'ترحال جبلي','Guided trek':'رحلة مشي مرشدة','Jeep':'جيب','Camping':'تخييم',
'EXPLORE':'استكشف','+ JOURNEY':'+ الرحلة',
'Added to your journey ✓':'تمت الإضافة إلى رحلتك ✓','Already in your journey':'موجود مسبقًا في رحلتك','Message sent to your local host':'أُرسلت الرسالة إلى مضيفك المحلي','Add at least one place first':'أضف مكانًا واحدًا على الأقل أولًا'
};
const PAT=[[/^Day (\d)$/,'اليوم $1'],[/^DAY (\d)$/,'اليوم $1'],[/^(\d+) KM Total Route$/,'إجمالي المسار $1 كم'],[/^(\d+) JOD$/,'$1 دينار'],[/^Experiences \((\d+)\)$/,'التجارب ($1)'],[/^≈ (\d+) USD.*$/,'≈ $1 دولار (سعر تقريبي)'],[/^Payment confirmed with (.+) ✓$/,'تم تأكيد الدفع عبر $1 ✓'],[/^Activities: (.+)$/,(m,a)=>'الأنشطة: '+a.split(' · ').map(x=>AR[x]||x).join(' · ')],[/^Discovery level: (.+)$/,(m,l)=>'مستوى الاكتشاف: '+(AR[l]||l)],[/^(\d+)\. (.+)$/,(m,n,s)=>n+'. '+(AR[s]||s)],[/^[^·]+( · [^·]+)+$/,m=>m.split(' · ').map(x=>AR[x]||x).join(' · ')]];
function arOf(s){const k=s.trim();if(!k)return null;const v=AR[k]||AR[k.toLowerCase()];if(v)return v;for(const[p,r]of PAT)if(p.test(k))return k.replace(p,r);return null}
let lang='en';try{lang=localStorage.getItem('bj-lang')||'en'}catch(e){}
function tr(root){
  const w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){
    const p=n.parentNode;if(p.closest&&p.closest('[data-skip],script,style'))continue;
    if(n._en===undefined)n._en=n.nodeValue;
    const t=lang==='ar'?arOf(n._en):null;
    n.nodeValue=t?n._en.replace(n._en.trim(),t):n._en;
  }
}
function setLang(l){
  lang=l;document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';
  $('#lang').textContent=l==='ar'?'EN':'عربي';document.title=l==='ar'?'ما وراء الأردن':'Beyond Jordan';
  try{localStorage.setItem('bj-lang',l)}catch(e){}tr();
}
$('#lang').onclick=()=>setLang(lang==='ar'?'en':'ar');

/* wrappers: translate whatever was just rendered */
function render(){render0();tr()}
function showPop(id){showPop0(id);tr($('#popup'))}
function toast(m){toast0(m);tr($('#toast'))}
function drawPins(){drawPins0();tr($('#pins'))}

drawPins();go(location.hash.slice(1)&&$('#'+location.hash.slice(1))?location.hash.slice(1):'home');
setLang(lang);
