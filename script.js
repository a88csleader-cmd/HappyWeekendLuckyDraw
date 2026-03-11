const PG_WEB_APP_URL = "YOUR_GOOGLE_SCRIPT_URL";

const slots = document.querySelectorAll(".slot");

function spinSlots(){

return new Promise(resolve=>{

let count = 0;

const spin = setInterval(()=>{

slots.forEach(s=>{
s.textContent = Math.floor(Math.random()*10);
});

count++;

if(count>30){
clearInterval(spin);
resolve();
}

},80);

});

}

function showPrizeNumber(prize){

const numbers = prize.replace(/\D/g,'');

if(numbers.length===0){
slots.forEach(s=>s.textContent='0');
return;
}

const digits = numbers.padStart(3,"0").split("");

slots.forEach((s,i)=>{
s.textContent = digits[i];
});

}

function confetti(){

const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pieces = [];

for(let i=0;i<100;i++){

pieces.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:Math.random()*8+4,
speed:Math.random()*3+2
});

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

pieces.forEach(p=>{
ctx.fillStyle=`hsl(${Math.random()*360},100%,50%)`;
ctx.fillRect(p.x,p.y,p.size,p.size);

p.y+=p.speed;

if(p.y>canvas.height)p.y=0;

});

requestAnimationFrame(draw);

}

draw();

}

document
.getElementById("pg-start-btn")
.addEventListener("click",async()=>{

const username =
document.getElementById("pg-username").value.trim();

if(!username){

alert("กรุณาใส่ username");

return;
}

document.getElementById("pg-start-btn").disabled=true;

await spinSlots();

const res = await fetch(
PG_WEB_APP_URL+"?username="+username
);

const data = await res.json();

if(data.success){

showPrizeNumber(data.prize);

if(data.played){

document.getElementById("pg-prize-display")
.textContent="คุณเคยเล่นแล้ว ได้ "+data.prize;

}else{

document.getElementById("pg-prize-display")
.textContent="ยินดีด้วย! คุณได้ "+data.prize;

if(data.prize!=="ไม่ได้ของรางวัล"){
confetti();
}

}

}

});
