const API =
"https://script.google.com/macros/s/AKfycbxvTFK0JOqepfohK2d-NGfHF8YwtjDtFAOnkAEgudkt0MCIpZ7NkcnBuItuMtXcg5EYGw/exec";

document
.getElementById("pg-start-btn")
.addEventListener("click", playGame);

async function playGame(){

const username =
document
.getElementById("pg-username")
.value
.trim()
.toLowerCase();

if(!username){

alert("กรุณาใส่ username");
return;

}

const btn =
document.getElementById("pg-start-btn");

btn.disabled = true;

spinSlots();

try{

const res =
await fetch(API + "?username=" + username);

const data =
await res.json();

setTimeout(()=>{

showPrizeNumber(data.prize);

if(data.played){

setText(
"คุณเคยเล่นแล้ว ได้ " + data.prize
);

}else{

setText(
"ยินดีด้วย! คุณได้ " + data.prize
);

if(data.prize !== "ไม่ได้ของรางวัล"){

confetti();

}

}

btn.disabled = false;

},2500);

}catch(err){

setText("เกิดข้อผิดพลาด");

btn.disabled=false;

}

}

function setText(t){

document
.getElementById("pg-prize-display")
.textContent = t;

}

function spinSlots(){

const slots =
document.querySelectorAll(".slot");

let count = 0;

const interval =
setInterval(()=>{

slots.forEach(slot=>{

slot.textContent =
Math.floor(Math.random()*10);

});

count++;

if(count > 20){

clearInterval(interval);

}

},100);

}

function showPrizeNumber(prize){

const slots =
document.querySelectorAll(".slot");

let numbers = "000";

if(prize !== "ไม่ได้ของรางวัล"){

numbers =
Math.floor(100 + Math.random()*900)
.toString();

}

slots[0].textContent = numbers[0];
slots[1].textContent = numbers[1];
slots[2].textContent = numbers[2];

}

function confetti(){

const canvas =
document.getElementById("confetti");

const ctx =
canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const pieces = [];

for(let i=0;i<120;i++){

pieces.push({

x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:8,
speed:2+Math.random()*3

});

}

let frame = 0;

const animation = setInterval(()=>{

ctx.clearRect(0,0,canvas.width,canvas.height);

pieces.forEach(p=>{

ctx.fillStyle =
"hsl(" + Math.random()*360 + ",100%,50%)";

ctx.fillRect(
p.x,
p.y,
p.size,
p.size
);

p.y += p.speed;

if(p.y > canvas.height){
p.y = 0;
}

});

frame++;

if(frame>200){

clearInterval(animation);
ctx.clearRect(0,0,canvas.width,canvas.height);

}

},30);

}
