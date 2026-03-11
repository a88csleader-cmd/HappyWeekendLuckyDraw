const API = "https://script.google.com/macros/s/AKfycbx9pwHSBW9KufFhfptXXGQ8c-OA-4qi4acH0dY03j3WhuOhVP2CG6RfgU5HjBsiLlombQ/exec";
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

async function playGame() {
  const username = document.getElementById("pg-username").value.trim().toLowerCase();
  if(!username) { alert("กรุณาใส่ username"); return; }

  const btn = document.getElementById("pg-start-btn");
  btn.disabled = true;

  spinSlots();

  try {
    const res = await fetch(API + "?username=" + username);
    const data = await res.json();

    setTimeout(() => {

      if(!data.success){
        setText(data.error);
        btn.disabled = false;
        return;
      }

      // --- เคยเล่นแล้ว ---
      if(data.played){
        showPrizeNumber(data.prize);
        setText("คุณเคยเล่นแล้ว ได้ " + formatPrize(data.prize));
        btn.disabled = false;
        return;
      }

      // --- ยังไม่เคยเล่น ---
      spinSlotsToPrize(data.prize).then(()=>{
        // แสดงรางวัล
        if(data.prize === "ไม่ได้ของรางวัล"){
          setText("เสียใจด้วยค่ะ คุณไม่ได้รางวัล");
        } else {
          setText("ยินดีด้วย! คุณได้ " + data.prize + " บาท\nแคปหน้าจอแล้วแจ้งแอดมินทาง LINE เพื่อรับของรางวัล");
          confetti();
          // เพิ่มปุ่มไป LINE
          addLineButton();
        }
        btn.disabled = false;
      });

    },2500);

  } catch(err){
    setText("เกิดข้อผิดพลาด");
    btn.disabled = false;
  }
}

function setText(text){
  const display = document.getElementById("pg-prize-display");
  display.textContent = text;
  // ลบปุ่ม LINE เก่าถ้ามี
  const oldBtn = document.getElementById("line-btn");
  if(oldBtn) oldBtn.remove();
}

function showPrizeNumber(prize){
  const slots = document.querySelectorAll(".slot");
  const numbers = prize === "ไม่ได้ของรางวัล" ? "000" : prize.toString().padStart(3,"0");
  slots[0].textContent = numbers[0];
  slots[1].textContent = numbers[1];
  slots[2].textContent = numbers[2];
}

function formatPrize(prize){
  return prize === "ไม่ได้ของรางวัล" ? "ไม่ได้รางวัล" : prize + " บาท";
}

function spinSlots(){
  const slots = document.querySelectorAll(".slot");
  let count = 0;
  const interval = setInterval(()=>{
    slots.forEach(slot=>{
      slot.textContent = Math.floor(Math.random()*10);
    });
    count++;
    if(count>20) clearInterval(interval);
  },100);
}

function spinSlotsToPrize(prize) {
  return new Promise(resolve => {
    const slots = document.querySelectorAll(".slot");
    const target = prize === "ไม่ได้ของรางวัล" ? "000" : prize.toString().padStart(3, "0");

    let finishedSlots = 0;

    slots.forEach((slot, index) => {
      let count = 0;
      const maxCount = 20 + index * 10; // แต่ละ slot หยุดไม่พร้อมกัน
      const interval = setInterval(() => {
        slot.textContent = Math.floor(Math.random() * 10);
        count++;
        if (count >= maxCount) {
          clearInterval(interval);
          slot.textContent = target[index]; // แสดงตัวเลขรางวัลจริง
          finishedSlots++;
          if (finishedSlots === slots.length) {
            resolve(); // ทุก slot หยุดแล้ว
          }
        }
      }, 80); // ความเร็ว slot สามารถปรับได้
    });
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
  let frame=0;
  const animation = setInterval(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      ctx.fillStyle = "hsl("+Math.random()*360+",100%,50%)";
      ctx.fillRect(p.x,p.y,p.size,p.size);
      p.y+=p.speed;
      if(p.y>canvas.height)p.y=0;
    });
    frame++;
    if(frame>200){ clearInterval(animation); ctx.clearRect(0,0,canvas.width,canvas.height);}
  },30);
}

function addLineButton(){
  const container = document.getElementById("prize-game-container");
  const btn = document.createElement("a");
  btn.id = "line-btn";
  btn.href = LINE_LINK;
  btn.target="_blank";
  btn.textContent = "แจ้งแอดมินทาง LINE";
  btn.style.display = "block";
  btn.style.marginTop = "10px";
  btn.style.padding = "10px";
  btn.style.background = "#00c300";
  btn.style.color = "white";
  btn.style.textDecoration = "none";
  btn.style.borderRadius = "6px";
  container.appendChild(btn);
}
