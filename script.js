const API = "https://script.google.com/macros/s/AKfycbxd-17g-kYv4yO_rFQ22J9-QB71GV8bZv0o-I3dWMovnBJLUFqQmpAP0NHOspXoi5zxxw/exec";
const LINE_LINK = "https://lin.ee/Nb2TD8R";

let spinInterval;
let lockedUsername = null;

document.getElementById("pg-start-btn").addEventListener("click", playGame);

async function playGame(){

const btn = document.getElementById("pg-start-btn");
if(btn.disabled) return;

let username = document.getElementById("pg-username").value.trim().toLowerCase();

if(!username){
alert("กรุณาใส่ username");
return;
}

btn.disabled = true;

lockedUsername = username;

document.getElementById("pg-username").disabled = true;

setText("กำลังหมุน...");

spinSlots();

try{

const res = await fetch(API+"?username="+username);

const data = await res.json();

clearInterval(spinInterval);

if(!data.success){

setText(data.error);

btn.disabled=false;

return;

}

if(data.played){

showPrizeNumber(data.prize);

setText("Username "+username+" เคยเล่นแล้ว\nได้รับ "+formatPrize(data.prize));

addLineButton();

return;

}

await spinSlotsToPrize(data.prize);

if(data.prize==="ไม่ได้ของรางวัล"){

setText("Username "+username+"\nเสียใจด้วย คุณไม่ได้รับรางวัล");

}else{

setText("🎉 ยินดีด้วย!\nUsername "+username+"\nได้รับรางวัล "+data.prize+" บาท\n\nกรุณาแคปหน้าจอแล้วแจ้งแอดมิน");

confetti();

addLineButton();

}

}catch(e){

setText("ระบบขัดข้อง กรุณาลองใหม่");

btn.disabled=false;

}

}

function setText(t){

document.getElementById("pg-prize-display").innerText=t;

}

function spinSlots(){

const slots=document.querySelectorAll(".slot span");

spinInterval=setInterval(()=>{

slots.forEach(s=>{

s.innerText=Math.floor(Math.random()*10);

});

},60);

}

function spinSlotsToPrize(prize){

return new Promise(resolve=>{

const slots=document.querySelectorAll(".slot span");

const numbers=prize==="ไม่ได้ของรางวัล"?"000":prize.toString().padStart(3,"0");

let done=0;

slots.forEach((slot,i)=>{

let count=0;

const max=30+(i*15);

const interval=setInterval(()=>{

slot.innerText=Math.floor(Math.random()*10);

count++;

if(count>=max){

clearInterval(interval);

slot.innerText=numbers[i];

done++;

if(done===3) resolve();

}

},70);

});

});

}

function showPrizeNumber(prize){

const slots=document.querySelectorAll(".slot span");

const numbers=prize==="ไม่ได้ของรางวัล"?"000":prize.toString().padStart(3,"0");

slots[0].innerText=numbers[0];
slots[1].innerText=numbers[1];
slots[2].innerText=numbers[2];

}

function formatPrize(prize){

return prize==="ไม่ได้ของรางวัล"?"ไม่ได้รางวัล":prize+" บาท";

}

function addLineButton(){

const btn=document.createElement("a");

btn.href=LINE_LINK;

btn.target="_blank";

btn.id="line-btn";

btn.innerText="แจ้งรับรางวัลทาง LINE";

btn.className="line-button";

document.getElementById("prize-game-container").appendChild(btn);

}

function confetti(){

const canvas=document.getElementById("confetti");

const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;

canvas.height=window.innerHeight;

const pieces=[];

for(let i=0;i<200;i++){

pieces.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

r:Math.random()*6+4,

d:Math.random()*200

});

}

let angle=0;

let tiltAngle=0;

const animation=setInterval(()=>{

ctx.clearRect(0,0,canvas.width,canvas.height);

angle+=0.01;

tiltAngle+=0.1;

pieces.forEach(p=>{

p.y+=Math.cos(angle+p.d)+2;

p.x+=Math.sin(angle);

ctx.beginPath();

ctx.fillStyle="hsl("+Math.random()*360+",100%,50%)";

ctx.arc(p.x,p.y,p.r,0,Math.PI*2);

ctx.fill();

});

},20);

setTimeout(()=>{

clearInterval(animation);

ctx.clearRect(0,0,canvas.width,canvas.height);

},5000);

}
