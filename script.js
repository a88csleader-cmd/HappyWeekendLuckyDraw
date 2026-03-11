const API =
"https://script.google.com/macros/s/AKfycbxvTFK0JOqepfohK2d-NGfHF8YwtjDtFAOnkAEgudkt0MCIpZ7NkcnBuItuMtXcg5EYGw/exec";

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

btn.disabled=true;

spinSlots();

const res =
await fetch(API+"?username="+username);

const data =
await res.json();

setTimeout(()=>{

showPrizeNumber(data.prize);

if(data.played){

setText(
"คุณเคยเล่นแล้ว ได้ "+data.prize
);

}else{

setText(
"ยินดีด้วย! คุณได้ "+data.prize
);

if(data.prize!=="ไม่ได้ของรางวัล"){

confetti();

}

}

},2500);

}

function setText(t){

document
.getElementById("pg-prize-display")
.textContent=t;

}
