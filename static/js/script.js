// CANVAS BUBBLE WATER BG
(function(){
  const cv = document.getElementById('bg'), ctx = cv.getContext('2d');
  let W, H, B = [];
  function resize(){ W=cv.width=window.innerWidth; H=cv.height=window.innerHeight; }
  function mkB(ry){ const r=8+Math.random()*55; return {x:Math.random()*W,y:ry?Math.random()*H:H+r,r,sp:.22+Math.random()*.5,al:.04+Math.random()*.11,dr:(Math.random()-.5)*.3}; }
  function init(){ B=Array.from({length:32},()=>mkB(true)); }
  function draw(){
    ctx.clearRect(0,0,W,H);
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#0b1f33'); g.addColorStop(.55,'#081726'); g.addColorStop(1,'#050f1c');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    B.forEach(b=>{
      b.y-=b.sp; b.x+=b.dr;
      if(b.y+b.r<0) Object.assign(b,mkB(false));
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(100,190,255,${b.al})`; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x-b.r*.28,b.y-b.r*.28,b.r*.2,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,240,255,${b.al*.45})`; ctx.fill();
    });
    const t=Date.now()/5000;
    [[70,130,5000,.22],[42,100,4000,.18]].forEach(([h,amp,spd,op])=>{
      ctx.beginPath(); ctx.moveTo(0,H);
      for(let x=0;x<=W;x+=5){ ctx.lineTo(x,H-h+Math.sin(x/amp+Date.now()/spd)*22+Math.sin(x/(amp*.5)+Date.now()/(spd*.7))*12); }
      ctx.lineTo(W,H); ctx.closePath();
      ctx.fillStyle=`rgba(10,55,100,${op})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',()=>{resize();init()});
  resize();init();draw();
})();

function goHome(){ document.getElementById('landing').style.display='flex'; document.getElementById('app').style.display='none'; document.querySelector('.hdr').classList.remove('visible'); resetForm(true); }
function goApp(){ document.getElementById('landing').style.display='none'; document.getElementById('app').style.display='block'; document.querySelector('.hdr').classList.add('visible'); window.scrollTo({top:0}); }

document.getElementById('air').addEventListener('input',function(){document.getElementById('airVal').textContent=this.value;});
document.getElementById('suhu').addEventListener('input',function(){document.getElementById('suhuVal').textContent=this.value;});
document.getElementById('bak').addEventListener('input',function(){document.getElementById('bakVal').textContent=this.value;});

function setPill(n,el,v){ el.closest('.pills').querySelectorAll('.pill').forEach(p=>p.classList.remove('active')); el.classList.add('active'); document.getElementById(n).value=v; }

function trap(x,a,b,c,d){if(x<=a||x>=d)return 0;if(x>=b&&x<=c)return 1;if(x<b)return(x-a)/(b-a);return(d-x)/(d-c);}
function tri(x,a,b,c){if(x<=a||x>=c)return 0;if(x===b)return 1;if(x<b)return(x-a)/(b-a);return(c-x)/(c-b);}
function fuzzyInfer(air,akt,suhu,bak){
  const A={s:trap(air,0,0,500,1200),c:trap(air,600,1200,1600,2200),b:trap(air,1800,2400,3000,3000)};
  const K={r:trap(akt,1,1,3,5),sd:tri(akt,3,5,8),b:trap(akt,6,8,10,10)};
  const S={sj:trap(suhu,15,15,22,27),n:tri(suhu,22,27,33),p:trap(suhu,28,33,40,40)};
  const B={j:trap(bak,0,0,2,4),n:tri(bak,2,5,8),s:trap(bak,6,8,12,12)};
  const rules=[[Math.min(A.b,K.r,S.sj,B.n),10],[Math.min(A.b,K.r),15],[Math.min(A.c,K.r,S.sj),15],[Math.min(A.b,K.sd,S.n,B.n),20],[Math.min(A.c,K.sd,S.n),30],[Math.min(A.s,K.r,S.sj),35],[Math.min(A.c,K.b,S.n,B.j),40],[Math.min(A.c,K.sd,S.p),45],[Math.min(A.s,K.sd,S.n),55],[Math.min(A.c,K.b,S.p,B.j),60],[Math.min(A.s,K.r,S.p,B.j),60],[Math.min(A.s,K.sd,S.p),65],[Math.min(A.s,K.b,S.n,B.j),75],[Math.min(A.s,K.b,S.p),85],[Math.min(A.s,K.b,S.p,B.j),95]];
  const num=rules.reduce((s,[w,v])=>s+w*v,0),den=rules.reduce((s,[w])=>s+w,0);
  return den===0?15:+(num/den).toFixed(2);
}
function interpret(score,air,akt,suhu){
  const need=2000+(akt>6?600:akt>3?300:0)+(suhu>32?400:suhu>27?200:0),lack=Math.max(0,need-air);
  if(score<25) return{level:'Terhidrasi Baik',severity:'normal',score,desc:'Tubuhmu dalam kondisi hidrasi yang baik. Cairan dalam tubuh cukup untuk mendukung fungsi organ dan aktivitas harian. Pertahankan pola minum yang sudah baik ini.',rec_minum:'Cukup',rec_target:need,bar_pct:12};
  if(score<50) return{level:'Dehidrasi Ringan',severity:'ringan',score,desc:'Tubuhmu mulai kehilangan lebih banyak cairan dari yang masuk. Gejala awal seperti mulut sedikit kering atau urin agak gelap mungkin mulai terasa. Segera minum air secukupnya.',rec_minum:`+${Math.round(lack)} ml`,rec_target:need,bar_pct:40};
  if(score<72) return{level:'Dehidrasi Sedang',severity:'sedang',score,desc:'Dehidrasi sedang dapat menyebabkan sakit kepala, lemas, sulit konsentrasi, dan urin berwarna kuning gelap. Minum air segera secara bertahap, jangan langsung banyak sekaligus.',rec_minum:`+${Math.round(lack)} ml`,rec_target:need,bar_pct:66};
  return{level:'Dehidrasi Berat',severity:'berat',score,desc:'Kondisi ini serius. Dehidrasi berat dapat menyebabkan pusing parah, jantung berdebar, dan pingsan. Minum air atau minuman elektrolit segera dan pertimbangkan untuk berkonsultasi ke dokter.',rec_minum:`+${Math.round(lack)} ml`,rec_target:need,bar_pct:92};
}
async function checkHydration(){
  const btn=document.getElementById('btnCheck'); btn.disabled=true; btn.textContent='Menganalisis...';
  const air=+document.getElementById('air').value,akt=+document.getElementById('aktivitas').value,suhu=+document.getElementById('suhu').value,bak=+document.getElementById('bak').value;
  await new Promise(r=>setTimeout(r,700));
  let d;
  try{ const res=await fetch('/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({air,aktivitas:akt,suhu,bak})}); d=await res.json(); }
  catch{ const score=fuzzyInfer(air,akt,suhu,bak); d=interpret(score,air,akt,suhu); }
  document.getElementById('rCard').className=`r-main fade-up sv-${d.severity}`;
  document.getElementById('rTitle').textContent=d.level;
  document.getElementById('rScore').textContent=`Skor fuzzy: ${d.score} / 100`;
  document.getElementById('rDesc').textContent=d.desc;
  document.getElementById('rMinum').textContent=d.rec_minum;
  document.getElementById('rTarget').textContent=`${d.rec_target} ml`;
  document.getElementById('formSection').style.display='none';
  document.getElementById('result').style.display='block';
  setTimeout(()=>{document.getElementById('rBar').style.width=d.bar_pct+'%';},200);
  window.scrollTo({top:0,behavior:'smooth'});
}
function resetForm(silent){
  document.getElementById('formSection').style.display='block';
  document.getElementById('result').style.display='none';
  document.getElementById('rBar').style.width='0%';
  document.getElementById('btnCheck').disabled=false;
  document.getElementById('btnCheck').textContent='Analisis Sekarang';
  if(!silent) window.scrollTo({top:0,behavior:'smooth'});
}
