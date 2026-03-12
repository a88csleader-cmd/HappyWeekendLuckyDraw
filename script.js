const API = "https://script.google.com/macros/s/AKfycbzaeLs9JvzY68djIN6VgBKismLyAkfvFB9SKvnLPl8fyNUx024sLNSHhLhj-Bx-Up0Nzw/exec"; // เปลี่ยนเป็น URL ล่าสุดหลัง redeploy
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

let spinInterval;
const slots = document.querySelectorAll(".slot");

// ────────────────────────────────────────────────
// ฟังก์ชันหลัก: เริ่มเกม
// ────────────────────────────────────────────────
async function playGame() {
  const usernameInput = document.getElementById("pg-username");
  const username = usernameInput.value.trim().toLowerCase();
  if (!username) {
    alert("กรุณาใส่ username");
    return;
  }

  const btn = document.getElementById("pg-start-btn");
  btn.disabled = true;

  setText("กำลังตรวจสอบสิทธิ์และหมุน...");
  removeLineButton();
  startRolling();

  try {
    const response = await fetch(API, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: JSON.stringify({ username: username })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error:", text);
      throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง");
    }

    // หยุดหมุน gradual แล้วแสดงผล
    setTimeout(() => {
      stopRollingGradual(data.prize || 0);

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

      renderWinners(data.recentWinners || []);
    }, 2000);

  } catch (err) {
    stopRolling();
    setText("เกิดข้อผิดพลาด ลองใหม่หรือเช็คการเชื่อมต่อ");
    console.error("Fetch error:", err);
  } finally {
    btn.disabled = false;
  }
}

// ────────────────────────────────────────────────
// ฟังก์ชันช่วยเหลือ (เรียงตามที่ถูกเรียกบ่อย)
// ────────────────────────────────────────────────

function setText(text) {
  document.getElementById("pg-prize-display").textContent = text;
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

function renderWinners(winners) {
  const list = document.getElementById("winner-list");
  list.innerHTML = "";
  winners.forEach(w => {
    const li = document.createElement("li");
    li.textContent = `${maskUser(w.username)} ได้ ${w.prize} บาท`;
    list.appendChild(li);
  });
}

// หยุดการหมุนทันที (ใช้ตอน error)
function stopRolling() {
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }
}

// เริ่มหมุน random (เรียก stopRolling ก่อนเริ่มใหม่)
function startRolling() {
  stopRolling();  // เคลียร์ interval เก่าก่อน
  spinInterval = setInterval(() => {
    slots.forEach(slot => {
      slot.textContent = Math.floor(Math.random() * 10);
    });
  }, 80);
}

// หยุด gradual แล้ว set ค่า prize เป็น 4 หลัก
function stopRollingGradual(prize) {
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }

  let prizeStr = prize.toString().padStart(4, '0');
  if (prize === 0) prizeStr = "0000";

  // หยุดทีละช่อง (ช้า ๆ จากซ้ายไปขวา)
  slots.forEach((slot, index) => {
    setTimeout(() => {
      slot.textContent = prizeStr[index];
    }, index * 400); // 400ms ต่อช่อง ให้ดู dramatic
  });
}

// Confetti animation
function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confetti = [];
  const colors = ["#ff0", "#f00", "#0f0", "#00f", "#f0f", "#0ff"];

  for (let i = 0; i < 120; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      speed: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 10 - 5
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((c, i) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();

      c.y += c.speed;
      c.rotation += c.rotSpeed;
      if (c.y > canvas.height) confetti.splice(i, 1);
    });

    if (confetti.length > 0) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}
