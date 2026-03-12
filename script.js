const API = "https://script.google.com/macros/s/AKfycbzyqCwcg4hUh2_nnWbKXxsFMuaH85FYunzqawSg5-Sad-yUcF-XyS1IkOrhnWBxCu9ihA/exec"; // เปลี่ยนเป็น URL ของคุณ
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

let spinInterval; // ตัวแปรเก็บ interval การหมุน

async function playGame() {
  const usernameInput = document.getElementById("pg-username");
  const username = usernameInput.value.trim().toLowerCase();
  if (!username) { alert("กรุณาใส่ username"); return; }

  const btn = document.getElementById("pg-start-btn");
  btn.disabled = true;

  const display = document.getElementById("pg-prize-display");
  display.textContent = "กำลังหมุน...";
  removeLineButton();
  startRolling();

  try {
    const res = await fetch(`${API}?username=${username}&token=${Math.random().toString(36).substring(2)}`);
    const data = await res.json();

    if (!data) {
      setText("ไม่สามารถดึงข้อมูลผู้ชนะได้");
      btn.disabled = false;
      stopRolling();
      return;
    }

    const winnersFeed = data.map(winner => `${maskUser(winner.username)} ได้ ${winner.prize} บาท`);
    document.getElementById("winner-list").innerHTML = winnersFeed.join('<br>'); // Render รายชื่อผู้โชคดีลงใน #winner-list

    if (data.played) {
      setText(`คุณเคยเล่นแล้ว ได้รับ ${data.prize}`);
    } else {
      setText("ยินดีด้วย! คุณได้รับรางวัล 50 บาท"); // ตัวอย่างการแสดงรางวัล
    }

    addLineButton();
    btn.disabled = false;

  } catch (e) {
    setText("เกิดข้อผิดพลาด");
    console.error(e);
  }
}

function setText(text) {
  const display = document.getElementById("pg-prize-display");
  display.textContent = text;
  removeLineButton();
}

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

function removeLineButton() {
  const oldBtn = document.getElementById("line-btn");
  if (oldBtn) oldBtn.remove();
}

function maskUser(user) {
  if (user.length <= 4) return user;
  return user.slice(0, 2) + "***" + user.slice(-2);
}

function startRolling() {
  const slots = document.querySelectorAll(".slot");
  stopRolling();
  spinInterval = setInterval(() => {
    slots.forEach(slot => {
      slot.textContent = Math.floor(Math.random() * 10);
    });
  }, 80);
}

function stopRolling() {
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }
}

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
