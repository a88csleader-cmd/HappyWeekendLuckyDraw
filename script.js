const API =
"https://script.google.com/macros/s/AKfycbwlexuqWk4ZYmujOozf6rvPq-rjLJLxpzx6bphW6tli7C4kTs4F3IE0qlEcRuAaJuGTUg/exec";

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
"คุณเคยเล่นแล้ว ได้ " + formatPrize(data.prize)
);

}else{

if(data.prize === "ไม่ได้ของรางวัล"){

setText(
"เสียใจด้วยค่ะ คุณไม่ได้รางวัล"
);

}else{

setText(
"ยินดีด้วย! คุณได้ " + data.prize + " บาท"
);

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

let numbers;

if(prize === "ไม่ได้ของรางวัล"){

numbers = "000";

}else{

numbers = prize.toString();

}

/* ให้ครบ 3 หลัก */
numbers = numbers.padStart(3,"0");

slots[0].textContent = numbers[0];
slots[1].textContent = numbers[1];
slots[2].textContent = numbers[2];

}



function formatPrize(prize){

if(prize === "ไม่ได้ของรางวัล"){
return "ไม่ได้รางวัล";
}

return prize + " บาท";

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
