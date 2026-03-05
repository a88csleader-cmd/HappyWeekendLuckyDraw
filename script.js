const API="https://script.google.com/macros/s/AKfycbxDZubHlhv3TSxg_YEg9cgygtFiXf_deJnKr-zEMRxb4rBQIasec5EUvoWvN1UFrhkABQ/exec";

const prizes=[
"200 บาท",
"150 บาท",
"100 บาท",
"50 บาท",
"25 บาท",
"ไม่ได้ของรางวัล"
];

let angle=0;

const canvas=document.getElementById("wheel");
const ctx=canvas.getContext("2d");

function drawWheel(){

const radius=200;

const slice=2*Math.PI/prizes.length;

ctx.clearRect(0,0,400,400);

for(let i=0;i<prizes.length;i++){

ctx.beginPath();

ctx.moveTo(200,200);

ctx.arc(
200,
200,
radius,
i*slice + angle*Math.PI/180,
(i+1)*slice + angle*Math.PI/180
);

ctx.fillStyle=i%2?"#ff9800":"#ff5722";

ctx.fill();

ctx.fillStyle="white";
ctx.font="16px Arial";

ctx.fillText(prizes[i],160,80);

}

}

drawWheel();

async function spin(){

const username=document.getElementById("username").value;

if(!username){

alert("กรอก username");

return;

}

const res=await fetch(API+"?username="+username);

const data=await res.json();

if(!data.success){

alert(data.error);

return;

}

const prize=data.prize;

spinWheel(prize);

document.getElementById("result").innerText="คุณได้ "+prize;

}

function spinWheel(prize){

const index=prizes.indexOf(prize);

const slice=360/prizes.length;

const target=360*5 + (360 - index*slice);

let start=angle;

let end=start+target;

let startTime=null;

function animate(time){

if(!startTime) startTime=time;

let progress=time-startTime;

let duration=4000;

let percent=Math.min(progress/duration,1);

angle=start+(end-start)*easeOut(percent);

drawWheel();

if(percent<1){

requestAnimationFrame(animate);

}

}

requestAnimationFrame(animate);

}

function easeOut(t){

return 1-Math.pow(1-t,3);

}
