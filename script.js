const API = "https://script.google.com/macros/s/AKfycbxWpbCaoebTGkPjzJ5sa---6-U47WnuQzq7DeFl-SbA8D2hRN4AaZa3fsDICL-M-uscIA/exec";

document.getElementById("pg-start-btn")
  .addEventListener("click", playGame);

async function playGame() {
  const username = document.getElementById("pg-username").value.trim().toLowerCase();
  if (!username) { alert("กรุณาใส่ username"); return; }

  const btn = document.getElementById("pg-start-btn");
  btn.disabled = true;

  // เรียก API ก่อน
  try {
    const res = await fetch(API + "?username=" + username);
    const data = await res.json();

    if(data.played){
      showPrizeNumber(data.prize);
      setText("คุณเคยเล่นแล้ว ได้ " + formatPrize(data.prize));
      btn.disabled = false;
      return;
    }

    // ถ้ายังไม่เคยเล่น ให้หมุนสล็อตไปหยุดที่รางวัลจริง
    await spinSlotsToPrize(data.prize);
    setText(data.prize === "ไม่ได้ของรางวัล" ? "เสียใจด้วยค่ะ คุณไม่ได้รางวัล" : "ยินดีด้วย! คุณได้ " + data.prize + " บาท");
    
    if(data.prize !== "ไม่ได้ของรางวัล") confetti();
    btn.disabled = false;

  } catch(err) {
    setText("เกิดข้อผิดพลาด");
    btn.disabled = false;
  }
}

function setText(text){
  document.getElementById("pg-prize-display").textContent = text;
}

function showPrizeNumber(prize){
  const slots = document.querySelectorAll(".slot");
  let numbers = prize === "ไม่ได้ของรางวัล" ? "000" : prize.toString().padStart(3,"0");
  slots[0].textContent = numbers[0];
  slots[1].textContent = numbers[1];
  slots[2].textContent = numbers[2];
}

function formatPrize(prize){
  return prize === "ไม่ได้ของรางวัล" ? "ไม่ได้รางวัล" : prize + " บาท";
}

// หมุนสล็อตให้หยุดที่รางวัล
function spinSlotsToPrize(prize){
  return new Promise(resolve => {
    const slots = document.querySelectorAll(".slot");
    let count = 0;
    const target = prize === "ไม่ได้ของรางวัล" ? "000" : prize.toString().padStart(3,"0");

    const interval = setInterval(() => {
      slots.forEach(slot => {
        slot.textContent = Math.floor(Math.random()*10);
      });
      count++;

      // หยุดเมื่อครบรอบ
      if(count > 20){
        clearInterval(interval);
        // แสดงรางวัลจริง
        slots[0].textContent = target[0];
        slots[1].textContent = target[1];
        slots[2].textContent = target[2];
        resolve();
      }
    },100);
  });
}

function confetti(){
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  for(let i=0;i<120;i++){
    pieces.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,size:8,speed:2+Math.random()*3});
  }

  let frame = 0;
  const animation = setInterval(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      ctx.fillStyle = "hsl(" + Math.random()*360 + ",100%,50%)";
      ctx.fillRect(p.x,p.y,p.size,p.size);
      p.y += p.speed;
      if(p.y > canvas.height) p.y = 0;
    });
    frame++;
    if(frame>200){
      clearInterval(animation);
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  },30);
}
