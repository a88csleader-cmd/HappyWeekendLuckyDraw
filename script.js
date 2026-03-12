const API="https://script.google.com/macros/s/AKfycbwqZyqTdPvpc7GLlDyL9KJRcE1LQ47c4igfsucPJy-yzoG6ssIaiAOwJ1VGOjf0FVyabQ/exec";
const LINE_LINK="https://lin.ee/Nb2TD8R";

let spinInterval;

document.getElementById("pg-start-btn").addEventListener("click",playGame);

loadRecentWinners();
setInterval(loadRecentWinners,8000); // delay feed

async function playGame(){

const btn=document.getElementById("pg-start-btn");
if(btn.disabled) return;

let username=document.getElementById("pg-username").value.trim().toLowerCase();

if(!username){
alert("กรุณาใส่ username");
return;
}

btn.disabled=true;
document.getElementById("pg-username").disabled=true;

setText("กำลังหมุน...");

startRolling();

try{

const token=Math.random().toString(36).substring(2);

const res=await fetch(API+"?username="+username+"&token="+token);
const data=await res.json();

stopRolling();

if(!data.success){
setText(data.error);
btn.disabled=false;
return;
}

await spinToResult(data.prize);

if(data.prize==="ไม่ได้ของรางวัล"){
setText("Username "+username+"\nเสียใจด้วย คุณไม่ได้รับรางวัล");
}else{
setText("🎉 ยินดีด้วย!\nUsername "+username+"\nได้รับ "+data.prize+" บาท");
confettiExplosion();
addLineButton();
}

}catch(e){

setText("เกิดข้อผิดพลาด");

}

}

function setText(t){
document.getElementById("pg-prize-display").innerText=t;
}

function startRolling(){

const slots=document.querySelectorAll(".slot");

spinInterval=setInterval(()=>{
slots.forEach(s=>{
s.innerText=Math.floor(Math.random()*10);
});
},50);

}

function stopRolling(){
clearInterval(spinInterval);
}

async function spinToResult(prize){

return new Promise(resolve=>{

const slots=document.querySelectorAll(".slot");

let target=prize==="ไม่ได้ของรางวัล"?"000":prize.toString().padStart(3,"0");

nearMiss(slots,target);

let finished=0;

slots.forEach((slot,i)=>{

let count=0;
let max=25+i*15;

const interval=setInterval(()=>{

slot.innerText=Math.floor(Math.random()*10);
count++;

if(count>=max){

clearInterval(interval);
slot.innerText=target[i];
finished++;

if(finished===3){
resolve();
}

}

},70);

});

});

}

function nearMiss(slots,target){

if(Math.random()>0.5) return;

setTimeout(()=>{
slots[0].innerText=target[0];
slots[1].innerText=target[1];
slots[2].innerText=(target[2]==9?8:parseInt(target[2])+1);
},800);

}

function addLineButton(){

const btn=document.createElement("a");

btn.href=LINE_LINK;
btn.target="_blank";

btn.innerText="แจ้งรับรางวัลทาง LINE";
btn.className="line-button";

document.getElementById("prize-game-container").appendChild(btn);

}

function confettiExplosion(){

const canvas=document.getElementById("confetti");
const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let particles=[];

for(let i=0;i<300;i++){

particles.push({
x:canvas.width/2,
y:canvas.height/2,
vx:(Math.random()-0.5)*10,
vy:(Math.random()-0.5)*10,
size:5+Math.random()*5,
life:100
});

}

const animation=setInterval(()=>{

ctx.clearRect(0,0,canvas.width,canvas.height);

particles.forEach(p=>{
p.x+=p.vx;
p.y+=p.vy;
p.vy+=0.1;
p.life--;

ctx.fillStyle="hsl("+Math.random()*360+",100%,50%)";
ctx.fillRect(p.x,p.y,p.size,p.size);
});

particles=particles.filter(p=>p.life>0);

if(particles.length===0){
clearInterval(animation);
}

},20);

}

async function loadRecentWinners(){

try{

const res=await fetch(API+"?recent=1");
const data=await res.json();

const list=document.getElementById("winner-list");
list.innerHTML="";

data.forEach(w=>{

const li=document.createElement("li");
li.innerText=maskUser(w.username)+" ได้ "+w.prize+" บาท";
list.appendChild(li);

});

}catch(e){}

}

function maskUser(user){

if(user.length<=4) return user;

return user.slice(0,2)+"***"+user.slice(-2);

}
