const API = "https://script.google.com/macros/s/AKfycbyKC4pfu_D2zmFqAu3uMNOSBltSeGSW2B_9OmltsAlst0nykbDuJO0klZAKdlrs3p9-0Q/exec"; // เปลี่ยนเป็น URL ของคุณ
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

let spinInterval; // ตัวแปรเก็บ interval การหมุน

async function playGame() {
  const usernameInput = document.getElementById("pg-username");
  const username = usernameInput.value.trim().toLowerCase();
  if(!username) { alert("กรุณาใส่ username"); return; }

  const btn = document.getElementById("pg-start-btn");
  btn.disabled = true;

  // --- ซ่อนข้อความรางวัลเก่าก่อนหมุน ---
  const display = document.getElementById("pg-prize-display");
  display.textContent = "กำลังหมุน...";
  removeLineButton();

  // --- เริ่มหมุน slot ทันทีแบบ random ---
  startRolling();

  try {
    const res = await fetch(API + "?username=" + encodeURIComponent(username));
    const data = await res.json();

    if(!data.success){
      setText(data.error);
      btn.disabled = false;
      stopRolling();
      return;
    }

    if(data.played){
      // แสดงรางวัลที่เคยได้ พร้อมข้อความแจ้งสิทธิ์แล้วเล่นไปแล้ว
      await spinToResult(data.prize);
      setText(`คุณได้เล่นไปแล้ว ได้รับ ${formatPrize(data.prize)}`);
      btn.disabled = false;
      stopRolling();
      return;
    }

    // หมุน slot ไปหยุดที่รางวัลจริง
    await spinToResult(data.prize);

    // แสดงข้อความหลังหมุนจบ
    if(data.prize === "ไม่ได้ของรางวัล"){
      setText("เสียใจค่ะ คุณไม่ได้รางวัล");
    } else {
      setText(`🎉 ยินดีด้วย!\nUsername ${username}\nได้รับ ${data.prize} บาท`);
      confettiExplosion();
      addLineButton();
    }

    btn.disabled = false;

  } catch(err){
    setText("เกิดข้อผิดพลาด");
    btn.disabled = false;
    stopRolling();
  }
}

// --- ฟังก์ชันแสดงข้อความ ---
function setText(text){
  const display = document.getElementById("pg-prize-display");
  display.textContent = text;
  removeLineButton();
}

// --- ฟังก์ชันโชว์ตัวเลขรางวัล ---
function showPrizeNumber(prize){
  const slots = document.querySelectorAll(".slot");
  const numbers = prize === "ไม่ได้ของรางวัล" ? "0000" : prize.toString().padStart(4,"0");
  for(let i=0; i<4; i++){
    slots[i].textContent = numbers[i];
  }
}

// --- ฟังก์ชันจัดรูปแบบข้อความรางวัล ---
function formatPrize(prize){
  return prize === "ไม่ได้ของรางวัล" ? "ไม่ได้รางวัล" : prize + " บาท";
}

// --- เริ่มหมุน slot แบบ random ---
function startRolling(){
  const slots = document.querySelectorAll(".slot");
  stopRolling();
  spinInterval = setInterval(() => {
    slots.forEach(slot => {
      slot.textContent = Math.floor(Math.random()*10);
    });
  }, 80);
}

// --- หยุดหมุน slot ---
function stopRolling(){
  if(spinInterval){
    clearInterval(spinInterval);
    spinInterval = null;
  }
}

// --- หมุน slot ไปหยุดที่รางวัลจริง แบบเรียงหลักหน่วย→สิบ→ร้อย→พัน ---
function spinToResult(prize) {
  return new Promise(resolve => {
    stopRolling();
    const slots = document.querySelectorAll(".slot");
    const target = prize === "ไม่ได้ของรางวัล" ? "0000" : prize.toString().padStart(4, "0");

    // ลำดับหยุด: หลักหน่วย → สิบ → ร้อย → พัน
    const order = [3, 2, 1, 0];

    let finishedSlots = 0;

    order.forEach((slotIndex, idx) => {
      let count = 0;
      const maxCount = 25 + idx * 15;
      const slot = slots[slotIndex];

      const interval = setInterval(() => {
        slot.textContent = Math.floor(Math.random() * 10);
        count++;
        if(count >= maxCount){
          clearInterval(interval);
          // Near miss effect สำหรับหลักหน่วย: บางที +1 ก่อนโชว์จริง
          if(idx === 0 && Math.random() < 0.5 && target[slotIndex] !== "0"){
            slot.textContent = (parseInt(target[slotIndex]) + 1) % 10;
            setTimeout(() => {
              slot.textContent = target[slotIndex];
              finishedSlots++;
              if(finishedSlots === 4) resolve();
            }, 300);
          } else {
            slot.textContent = target[slotIndex];
            finishedSlots++;
            if(finishedSlots === 4) resolve();
          }
        }
      }, 70);
    });
  });
}

// --- ฟังก์ชัน Confetti ระดับเกมจริง ---
function confettiExplosion() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  for (let i = 0; i < 300; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      size: 5 + Math.random() * 5,
      life: 100
    });
  }

  const animation = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;
      ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    particles = particles.filter(p => p.life > 0);
    if (particles.length === 0) {
      clearInterval(animation);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, 20);
}

// --- เพิ่มปุ่มแจ้ง LINE ---
function addLineButton() {
  removeLineButton();
  const container = document.getElementById("prize-game-container");
  const btn = document.createElement("a");
  btn.id = "line-btn";
  btn.href = LINE_LINK;
  btn.target = "_blank";
  btn.textContent = "แจ้งรับรางวัลผ่าน LINE";
  container.appendChild(btn);
}

// --- ลบปุ่มแจ้ง LINE ถ้ามี ---
function removeLineButton(){
  const oldBtn = document.getElementById("line-btn");
  if(oldBtn) oldBtn.remove();
}

// --- ฟังก์ชันแสดง feed ผู้โชคดี (fake + real winners) ---
const winnersFeed = (function(){
  const realWinners = [
    {user: "lan94774", prize: 25},
    {user: "so12345", prize: 500},
    {user: "he66666", prize: 100},
    {user: "us91111", prize: 25},
  ];
  const fakeWinners = [
    {user: "lu***at", prize: 5000},
    {user: "su***ro", prize: 100},
    {user: "ra***mo", prize: 100},
    {user: "da***ya", prize: 500},
    {user: "us***12", prize: 25},
  ];

  const winnerList = document.getElementById("winner-list");
  let allWinners = [];
  let idx = 0;

  // รวมแบบสุ่ม 30% real 70% fake
  function generateNext(){
    const useReal = Math.random() < 0.3;
    const winnerSet = useReal ? realWinners : fakeWinners;
    const winner = winnerSet[Math.floor(Math.random()*winnerSet.length)];
    return winner;
  }

  function maskUser(user){
    if(user.length <= 4) return user;
    return user.slice(0,2) + "***" + user.slice(-2);
  }

  function addWinner(){
    const next = generateNext();
    allWinners.unshift(next);
    if(allWinners.length > 30) allWinners.pop();

    // แสดงรายการ
    winnerList.innerHTML = allWinners.map(w => 
      `<li>🏆 <strong>${maskUser(w.user)}</strong> ได้ ${w.prize} บาท</li>`
    ).join("");
  }

  function startFeed(){
    addWinner();
    setInterval(() => {
      addWinner();
    }, 5000); // ทุก 5 วิ เพิ่มรายการใหม่
  }

  return {startFeed};
})();

window.onload = function(){
  winnersFeed.startFeed();
}
