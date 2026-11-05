(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const W=canvas.width,H=canvas.height, lanes=[350,500,650];
  const skins=[
    {id:'starter',name:'Street Runner',emoji:'🧢',price:0,color:'#24c4a6'},
    {id:'neon',name:'Neon Rider',emoji:'🕶️',price:500,color:'#b85cff'},
    {id:'skater',name:'Skater Pro',emoji:'🛹',price:1200,color:'#ff9d45'},
    {id:'robot',name:'Cyber Bot',emoji:'🤖',price:2500,color:'#68baff'},
    {id:'crown',name:'Golden King',emoji:'👑',price:5000,color:'#ffd45a'}
  ];
  const saved=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  let wallet=saved('md_wallet',0),owned=saved('md_owned',['starter']),selected=saved('md_skin','starter'),friends=saved('md_friends',[]),best=saved('md_best',0);
  const p={running:false,lane:1,jump:0,slide:0,score:0,runCoins:0,objects:[],spawn:0,last:0,admin:false,
    powers:{god:false,infinite:false,magnet:false,noObstacles:false,slow:false,superJump:false,autoCollect:false,mult:1}};
  const skin=()=>skins.find(s=>s.id===selected)||skins[0];
  function persist(){localStorage.setItem('md_wallet',JSON.stringify(wallet));localStorage.setItem('md_owned',JSON.stringify(owned));localStorage.setItem('md_skin',JSON.stringify(selected));localStorage.setItem('md_friends',JSON.stringify(friends));localStorage.setItem('md_best',JSON.stringify(best));}
  function ui(){ $('wallet').textContent=wallet.toLocaleString('fr-FR');$('shopWallet').textContent=wallet.toLocaleString('fr-FR');$('bestScore').textContent=best.toLocaleString('fr-FR');$('profileName').textContent=p.nickname||'Joueur'; }
  function showPage(name){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.page===name));document.querySelectorAll('.page-view').forEach(v=>v.classList.remove('active'));$(name+'Page').classList.add('active')}
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
  function renderShop(){
    $('skinGrid').innerHTML='';
    skins.forEach(s=>{const has=owned.includes(s.id),chosen=selected===s.id;const card=document.createElement('article');card.className='skin-card';
      card.innerHTML=`<div class="skin-art">${s.emoji}</div><h3>${s.name}</h3><p>${s.price===0?'Gratuit':'🪙 '+s.price.toLocaleString('fr-FR')}</p>`;
      const btn=document.createElement('button');btn.textContent=chosen?'ÉQUIPÉ':has?'ÉQUIPER':wallet>=s.price?'ACHETER':'PAS ASSEZ DE PIÈCES';btn.disabled=chosen||(!has&&wallet<s.price);
      btn.onclick=()=>{if(!has){wallet-=s.price;owned.push(s.id)}selected=s.id;persist();renderShop();ui()};card.appendChild(btn);$('skinGrid').appendChild(card);
    });
  }
  function renderFriends(){
    $('friendCount').textContent=friends.length;$('friendList').innerHTML='';
    if(!friends.length){$('friendList').innerHTML='<p class="muted">Pas encore d’amis. Ajoute un pseudo ci-dessus !</p>';return}
    friends.forEach((name,i)=>{const row=document.createElement('div');row.className='friend';const label=document.createElement('b');label.textContent='👤 '+name;const remove=document.createElement('button');remove.textContent='Retirer';remove.onclick=()=>{friends.splice(i,1);persist();renderFriends()};row.append(label,remove);$('friendList').appendChild(row)});
  }
  $('friendForm').onsubmit=e=>{e.preventDefault();const n=$('friendName').value.trim();if(n&&!friends.some(f=>f.toLowerCase()===n.toLowerCase())&&n.toLowerCase()!==p.nickname.toLowerCase()){friends.push(n);persist();renderFriends();$('friendName').value=''}};
  function rounded(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
  function scene(){
    const horizon=195,scroll=(p.score*2)%100;
    let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#68b9d0');g.addColorStop(.48,'#d1e5ce');g.addColorStop(.49,'#344b51');g.addColorStop(1,'#142733');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // Buildings and skyline
    for(let i=0;i<17;i++){let x=i*65-15,bh=55+(i*43%105);ctx.fillStyle=i%2?'#527b83':'#416a78';ctx.fillRect(x,horizon-bh,52,bh);for(let y=horizon-bh+12;y<horizon-8;y+=20)for(let xx=x+9;xx<x+45;xx+=17){ctx.fillStyle='#c8e5ce';ctx.fillRect(xx,y,7,9)}}
    // Railway perspective
    ctx.fillStyle='#334047';ctx.beginPath();ctx.moveTo(275,horizon);ctx.lineTo(725,horizon);ctx.lineTo(1000,H);ctx.lineTo(0,H);ctx.fill();
    for(let i=0;i<4;i++){let top=310+i*127,bottom=90+i*273;ctx.strokeStyle='#d5d9d0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(top,horizon);ctx.lineTo(bottom,H);ctx.stroke()}
    for(let i=0;i<16;i++){let q=((i*50+scroll)%600)/600,y=horizon+q*q*(H-horizon),half=q*500;ctx.strokeStyle='#927e69';ctx.lineWidth=2+q*5;ctx.beginPath();ctx.moveTo(500-half,y);ctx.lineTo(500+half,y);ctx.stroke()}
    ctx.fillStyle='#2d6254';ctx.fillRect(0,310,55,310);ctx.fillRect(945,310,55,310);
  }
  function objectDraw(o){let q=.35+o.y/H*.9,x=lanes[o.lane],w=(o.type==='coin'?24:68)*q,h=(o.type==='coin'?24:75)*q;
    if(o.type==='coin'){ctx.fillStyle='#ffd34e';ctx.beginPath();ctx.arc(x,o.y,13*q,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff0a0';ctx.lineWidth=3*q;ctx.stroke();ctx.fillStyle='#a96b12';ctx.font=`bold ${15*q}px sans-serif`;ctx.textAlign='center';ctx.fillText('$',x,o.y+5*q)}
    else{rounded(x-w/2,o.y-h/2,w,h,6*q,o.type==='barrier'?'#ef704f':'#506b83');if(o.type==='barrier'){ctx.fillStyle='#ffe1a0';ctx.fillRect(x-w/2,o.y-h*.1,w,h*.2)}else{ctx.fillStyle='#c7e9ef';ctx.fillRect(x-w*.34,o.y-h*.3,w*.68,h*.2);ctx.fillStyle='#253b52';ctx.fillRect(x-w*.36,o.y+h*.08,w*.72,h*.25)}}
  }
  function drawChaser(){
    // Le policier reste derrière le coureur et se rapproche après une collision.
    const x=lanes[p.lane], y=H-42;
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle='#172e4c';ctx.beginPath();ctx.arc(0,-29,14,0,Math.PI*2);ctx.fill();
    rounded(-17,-19,34,32,9,'#263f68');rounded(-15,-37,30,9,4,'#17243a');
    ctx.fillStyle='#f2c64f';ctx.fillRect(-14,-42,28,5);
    ctx.fillStyle='#dcecff';ctx.fillRect(-8,-31,16,4);
    ctx.restore();
  }
  function drawPlayer(){
    const x=lanes[p.lane],y=H-120-(p.jump>0?Math.sin((1-p.jump)*Math.PI)*(p.powers.superJump?190:125):0),s=skin();
    ctx.save();ctx.translate(x,y);
    if(p.slide>0){rounded(-31,-22,62,36,14,s.color);rounded(-18,-18,36,24,8,'#233b60')}
    else{ctx.fillStyle='#efbd91';ctx.beginPath();ctx.arc(0,-44,19,0,Math.PI*2);ctx.fill();rounded(-22,-28,44,52,12,s.color);rounded(-19,19,14,28,6,'#25395e');rounded(5,19,14,28,6,'#25395e');ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText(s.emoji,0,-40)}
    if(p.powers.god){ctx.strokeStyle='#ffe36b';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-15,48,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }
  function draw(){scene();p.objects.forEach(objectDraw);drawChaser();drawPlayer();ctx.fillStyle='#fff';ctx.font='900 22px Nunito';ctx.fillText('METRO DASH',22,40)}
  function spawn(){let lane=Math.floor(Math.random()*3);if(Math.random()<.52)p.objects.push({type:'coin',lane,y:205});else if(!p.powers.noObstacles)p.objects.push({type:Math.random()<.5?'barrier':'train',lane,y:205})}
  function update(dt){
    if(!p.running)return;
    const speed=(p.powers.slow?.55:1)*(p.powers.slow?1:p.speed||1),step=dt*speed;
    p.score+=Math.round(step*.012*p.powers.mult);p.spawn-=step;
    if(p.spawn<=0){spawn();p.spawn=390+Math.random()*250}
    p.jump=Math.max(0,p.jump-dt/650);p.slide=Math.max(0,p.slide-dt/550);
    p.objects.forEach(o=>{o.y+=step*.28;if(o.type==='coin'&&(p.powers.magnet||p.powers.autoCollect)&&o.y>H-260)o.lane=p.lane;
      if(o.y>H-145&&o.y<H-65&&o.lane===p.lane){if(o.type==='coin'){o.y=H+100;p.runCoins++;wallet+=p.powers.infinite?0:1}else if(!p.powers.god&&p.jump<=0&&p.slide<=0){finish();return}}
    });
    p.objects=p.objects.filter(o=>o.y<H+80);if(p.powers.infinite)wallet=999999;
    $('score').textContent=p.score.toLocaleString('fr-FR');$('runCoins').textContent=p.runCoins;ui();
  }
  function loop(now){const dt=Math.min(40,now-p.last||16);p.last=now;update(dt);draw();if(p.running)p.frame=requestAnimationFrame(loop)}
  function finish(){if(!p.running)return;p.running=false;best=Math.max(best,p.score);wallet+=p.runCoins;persist();ui();$('finalScore').textContent=p.score;$('gameOver').classList.remove('hidden');$('pauseBtn').classList.add('hidden')}
  function start(){p.nickname=$('nickname').value.trim()||'Joueur';p.admin=p.nickname.toLowerCase()==='multiprime';p.running=true;p.score=0;p.runCoins=0;p.lane=1;p.jump=0;p.slide=0;p.objects=[];p.spawn=0;p.powers={god:false,infinite:false,magnet:false,noObstacles:false,slow:false,superJump:false,autoCollect:false,mult:1};resetAdminUI();$('adminTab').classList.toggle('hidden',!p.admin);$('startScreen').classList.add('hidden');$('gameOver').classList.add('hidden');$('pauseScreen').classList.add('hidden');$('pauseBtn').classList.remove('hidden');p.last=performance.now();cancelAnimationFrame(p.frame);p.frame=requestAnimationFrame(loop);ui()}
  function resetAdminUI(){['godMode','infiniteCoins','magnet','noObstacles','slowMode','superJump','autoCollect'].forEach(id=>$(id).checked=false);$('multiplier').value=1;$('multValue').textContent='1×'}
  function toggle(id,key){$(id).onchange=e=>p.powers[key]=e.target.checked}
  toggle('godMode','god');toggle('infiniteCoins','infinite');toggle('magnet','magnet');toggle('noObstacles','noObstacles');toggle('slowMode','slow');toggle('superJump','superJump');toggle('autoCollect','autoCollect');
  $('multiplier').oninput=e=>{p.powers.mult=Number(e.target.value);$('multValue').textContent=e.target.value+'×'};
  $('giveCoins').onclick=()=>{wallet+=10000;persist();ui()};$('unlockAll').onclick=()=>{owned=skins.map(s=>s.id);persist();renderShop();ui()};
  $('resetAdmin').onclick=()=>{p.powers={god:false,infinite:false,magnet:false,noObstacles:false,slow:false,superJump:false,autoCollect:false,mult:1};resetAdminUI();p.speed=1};
  $('adminTab').onclick=()=>$('adminPanel').classList.remove('hidden');$('closeAdmin').onclick=()=>$('adminPanel').classList.add('hidden');
  $('startBtn').onclick=start;$('restartBtn').onclick=start;
  $('pauseBtn').onclick=()=>{if(p.running){p.running=false;$('pauseScreen').classList.remove('hidden')}};
  $('resumeBtn').onclick=()=>{if(!p.over){p.running=true;$('pauseScreen').classList.add('hidden');p.last=performance.now();p.frame=requestAnimationFrame(loop)}};
  function move(d){if(p.running)p.lane=Math.max(0,Math.min(2,p.lane+d))}
  function jump(){if(p.running&&p.jump<=0&&p.slide<=0)p.jump=1}
  function slide(){if(p.running)p.slide=1}
  document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key==='a')move(-1);if(e.key==='ArrowRight'||e.key==='d')move(1);if(e.key==='ArrowUp'||e.key===' ')jump();if(e.key==='ArrowDown')slide();if(e.key==='Escape'&&p.running)$('pauseBtn').click()});
  let tx=0,ty=0;canvas.addEventListener('touchstart',e=>{tx=e.changedTouches[0].clientX;ty=e.changedTouches[0].clientY},{passive:true});
  canvas.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);else if(Math.abs(dy)>20)(dy<0?jump():slide())},{passive:true});
  $('nickname').addEventListener('change',()=>{if($('nickname').value.trim().toLowerCase()==='multiprime')$('adminTab').classList.remove('hidden')});
  ui();renderShop();renderFriends();draw();
})();