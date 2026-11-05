(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const W = canvas.width, H = canvas.height;
  const state = {
    running:false, over:false, lane:1, jump:0, slide:0, score:0, coins:0,
    objects:[], spawn:0, speed:1, nickname:'', sound:true,
    powers:{god:false,infinite:false,magnet:false,noObstacles:false}
  };
  const laneX = [W*.30,W*.50,W*.70];
  let last = 0, animation = 0;

  function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function drawScene(){
    const t = (state.score*2)%100;
    const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#7cc8d9');grad.addColorStop(.48,'#d2e9d9');grad.addColorStop(.49,'#526c68');grad.addColorStop(1,'#172c39');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    // Ville au loin
    for(let i=0;i<13;i++){let x=i*78;let bh=65+(i*37%90);ctx.fillStyle=i%2?'#567d82':'#456b78';ctx.fillRect(x,190-bh,55,bh);for(let y=205-bh;y<185;y+=22)for(let xx=x+10;xx<x+48;xx+=18){ctx.fillStyle='#c8e5cb';ctx.fillRect(xx,y,7,9)}}
    // Perspective des rails
    ctx.fillStyle='#34434a';ctx.beginPath();ctx.moveTo(W*.25,190);ctx.lineTo(W*.75,190);ctx.lineTo(W*.98,H);ctx.lineTo(W*.02,H);ctx.fill();
    for(let i=0;i<3;i++){const top=W*(.34+i*.16),bottom=W*(.08+i*.42);ctx.strokeStyle='#d2d9d4';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(top,190);ctx.lineTo(bottom,H);ctx.stroke()}
    for(let i=0;i<14;i++){let p=((i*54+t*2)%H)/H;let y=190+p*p*(H-190);let half= p*W*.48;ctx.strokeStyle='#9a8770';ctx.lineWidth=2+p*5;ctx.beginPath();ctx.moveTo(W/2-half,y);ctx.lineTo(W/2+half,y);ctx.stroke()}
    // Décor latéral
    ctx.fillStyle='#315c50';ctx.fillRect(0,300,70,H-300);ctx.fillRect(W-70,300,70,H-300);
  }
  function drawObject(o){
    const y=o.y, scale=.35+o.y/H*.9, x=laneX[o.lane], w=(o.type==='coin'?24:62)*scale, h=(o.type==='coin'?24:65)*scale;
    if(o.type==='coin'){ctx.fillStyle='#ffd34f';ctx.beginPath();ctx.arc(x,y,12*scale,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff0a0';ctx.lineWidth=3*scale;ctx.stroke();ctx.fillStyle='#a96b12';ctx.font=`bold ${15*scale}px sans-serif`;ctx.textAlign='center';ctx.fillText('$',x,y+5*scale)}
    else if(o.type==='barrier'){rounded(x-w/2,y-h/2,w,h,5*scale,'#ed694f');ctx.fillStyle='#ffe3a0';ctx.fillRect(x-w/2,y-h*.1,w,h*.2)}
    else {rounded(x-w/2,y-h/2,w,h,6*scale,'#536b82');ctx.fillStyle='#b5d8df';ctx.fillRect(x-w*.35,y-h*.28,w*.7,h*.2);ctx.fillStyle='#293d54';ctx.fillRect(x-w*.35,y+h*.05,w*.7,h*.35)}
  }
  function drawPlayer(){
    const x=laneX[state.lane], y=H-105-(state.jump>0?Math.sin((1-state.jump)*Math.PI)*125:0);
    ctx.save();ctx.translate(x,y);
    if(state.slide>0){rounded(-30,-22,60,35,15,'#f5a64a');rounded(-20,-18,38,24,10,'#233c66')}
    else {ctx.fillStyle='#f5a64a';ctx.beginPath();ctx.arc(0,-43,20,0,Math.PI*2);ctx.fill();rounded(-22,-26,44,52,13,'#25bda8');rounded(-18,18,14,30,7,'#263b65');rounded(4,18,14,30,7,'#263b65');ctx.fillStyle='#182b49';ctx.fillRect(-12,-47,24,5)}
    if(state.powers.god){ctx.strokeStyle='#ffe36b';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-15,49,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }
  function draw(){
    drawScene();state.objects.forEach(drawObject);drawPlayer();
    ctx.fillStyle='#fff';ctx.font='bold 22px Nunito, sans-serif';ctx.textAlign='left';ctx.fillText('METRO DASH',22,38);
  }
  function spawn(){
    const lane=Math.floor(Math.random()*3);
    if(Math.random()<.52)state.objects.push({type:'coin',lane,y:205});
    else if(!state.powers.noObstacles)state.objects.push({type:Math.random()<.5?'barrier':'train',lane,y:205});
  }
  function update(dt){
    if(!state.running)return;
    const step=dt*state.speed;
    state.score+=Math.round(step*.012);
    state.spawn-=step;
    if(state.spawn<=0){spawn();state.spawn=420+Math.random()*260}
    state.jump=Math.max(0,state.jump-dt/650);state.slide=Math.max(0,state.slide-dt/550);
    const fall=step*.28;
    for(const o of state.objects){o.y+=fall;
      if(o.type==='coin'&&state.powers.magnet&&o.y>H-250)o.lane=state.lane;
      if(o.y>H-135&&o.y<H-65&&o.lane===state.lane){
        if(o.type==='coin'){o.y=H+100;state.coins+=state.powers.infinite?0:1}
        else if(!state.powers.god&&state.jump<=0&&state.slide<=0){endGame();return}
      }
    }
    state.objects=state.objects.filter(o=>o.y<H+80);
    if(state.powers.infinite)state.coins=999999;
    $('coins').textContent=state.coins.toLocaleString('fr-FR');$('score').textContent=state.score.toLocaleString('fr-FR');
  }
  function loop(now){const dt=Math.min(40,now-last||16);last=now;update(dt);draw();if(state.running)animation=requestAnimationFrame(loop)}
  function start(){
    state.nickname=$('nickname').value.trim()||'Joueur';state.running=true;state.over=false;state.score=0;state.objects=[];state.spawn=0;state.lane=1;state.jump=0;state.slide=0;
    const isAdmin=state.nickname.toLowerCase()==='multiprime';
    $('adminTab').classList.toggle('hidden',!isAdmin);
    $('startScreen').classList.add('hidden');$('gameOver').classList.add('hidden');
    last=performance.now();cancelAnimationFrame(animation);animation=requestAnimationFrame(loop);
  }
  function endGame(){state.running=false;state.over=true;$('finalScore').textContent=state.score;$('gameOver').classList.remove('hidden')}
  function move(dir){if(state.running)state.lane=Math.max(0,Math.min(2,state.lane+dir))}
  function jump(){if(state.running&&state.jump<=0&&state.slide<=0)state.jump=1}
  function slide(){if(state.running)state.slide=1}
  document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key==='a')move(-1);if(e.key==='ArrowRight'||e.key==='d')move(1);if(e.key==='ArrowUp'||e.key===' ')jump();if(e.key==='ArrowDown')slide()});
  let touchX=0,touchY=0;canvas.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});
  canvas.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);else if(Math.abs(dy)>20)(dy<0?jump():slide())},{passive:true});
  $('startBtn').onclick=start;$('restartBtn').onclick=start;
  $('adminTab').onclick=()=>$('adminPanel').classList.remove('hidden');$('closeAdmin').onclick=()=>$('adminPanel').classList.add('hidden');
  $('godMode').onchange=e=>state.powers.god=e.target.checked;
  $('infiniteCoins').onchange=e=>state.powers.infinite=e.target.checked;
  $('magnet').onchange=e=>state.powers.magnet=e.target.checked;
  $('noObstacles').onchange=e=>state.powers.noObstacles=e.target.checked;
  $('speed').oninput=e=>{state.speed=Number(e.target.value);$('speedValue').textContent=state.speed+'×'};
  $('addCoins').onclick=()=>{state.coins+=10000;$('coins').textContent=state.coins.toLocaleString('fr-FR')};
  $('resetPowers').onclick=()=>{state.powers={god:false,infinite:false,magnet:false,noObstacles:false};['godMode','infiniteCoins','magnet','noObstacles'].forEach(id=>$(id).checked=false);state.speed=1;$('speed').value=1;$('speedValue').textContent='1×'};
  $('soundBtn').onclick=()=>{state.sound=!state.sound;$('soundBtn').textContent=state.sound?'🔊 Son : activé':'🔇 Son : désactivé'};
  draw();
})();