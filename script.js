const API = "https://script.google.com/macros/s/AKfycbymyBZMy3gc9_Gv--6Ot_82v3BUcjCid6Fxnd_tnYRsUVsvgiugX_xj1favtMaKGAGtlA/exec"; // เปลี่ยนเป็น URL ของ GAS คุณ
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

let spinInterval; // ตัวแปรเก็บ interval การหมุน

async function playGame() {
  const usernameInput = document.getElementById("pg-username");
  const username = usernameInput.value.trim().toLowerCase();
  if (!username) { alert("กรุณาใส่ username"); return; }

  const btn = document.getElementById("pg-start-btn");
  btn.disabled = true;

  // ซ่อนข้อความรางวัลเก่าและเริ่มหมุน
  setText("กำลังหมุน...");
  removeLineButton();
  startRolling();

  try {
    const res = await fetch(`${API}?username=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    // หยุดหมุนหลังจาก 2 วินาทีเพื่อความสนุก
    setTimeout(() => {
      stopRolling();
      if (data.error) {
        setText(data.error);
      } else if (data.alreadyPlayed) {
        setText(`คุณเคยเล่นแล้ว ได้ ${data.prize} บาท`);
      } else {
        if (data.prize > 0) {
          setText(`ยินดีด้วย! คุณได้รับ ${data.prize} บาท`);
          launchConfetti();
          addLineButton();
        } else {
          setText("เสียใจด้วย รางวัลหมดแล้ว ลองใหม่ครั้งหน้า!");
        }
      }

      // แสดงผู้โชคดีล่าสุด
      renderWinners(data.recentWinners || []);
    }, 2000);

  } catch (e) {
    stopRolling();
    setText("เกิดข้อผิดพลาด กรุณาลองใหม่");
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}

// ฟังก์ชันแสดงข้อความ
function setText(text) {
  document.getElementById("pg-prize-display").textContent = text;
}

// ฟังก์ชันแสดงรางวัลผ่าน LINE
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

// ลบปุ่ม Line
function removeLineButton() {
  const oldBtn = document.getElementById("line-btn");
  if (oldBtn) oldBtn.remove();
}

// มาสก์ชื่อผู้ใช้
function maskUser(user) {
  if (user.length <= 4) return user;
  return user.slice(0, 2) + "***" + user.slice(-2);
}

// แสดงรายชื่อผู้ชนะ
function renderWinners(winners) {
  const list = document.getElementById("winner-list");
  list.innerHTML = "";
  winners.forEach(w => {
    const li = document.createElement("li");
    li.textContent = `${maskUser(w.username)} ได้ ${w.prize} บาท`;
    list.appendChild(li);
  });
}

// หมุน slot
function startRolling() {
  const slots = document.querySelectorAll(".slot");
  stopRolling();
  spinInterval = setInterval(() => {
    slots.forEach(slot => {
      slot.textContent = Math.floor(Math.random() * 10);
    });
  }, 80);
}

// หยุดหมุน
function stopRolling() {
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }
}

// Confetti animation (simple canvas)
function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confetti = [];
  const colors = ["#ff0", "#f00", "#0f0", "#00f", "#f0f"];

  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 5 + 5,
      speed: Math.random() * 3 + 2,
      angle: Math.random() * 360
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
      c.y += c.speed;
      c.x += Math.sin(c.angle) * 2;
      c.angle += 0.1;
    });

    if (confetti.some(c => c.y < canvas.height)) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  draw();
}
