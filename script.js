const API = "https://script.google.com/macros/s/AKfycbzJ5USHTekz0TRwKTMq8IE4G5-vAiTSp5c0tyZAZxMlKCnqDkp2FYutl-R5FVpO_zh1Ag/exec"; // เปลี่ยนเป็น URL ล่าสุดของคุณหลัง redeploy
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

let spinInterval; // ตัวแปรเก็บ interval การหมุน

async function playGame() {
  const usernameInput = document.getElementById("pg-username");
  const username = usernameInput.value.trim().toLowerCase();
  if (!username) {
    alert("กรุณาใส่ username");
    return;
  }

  const btn = document.getElementById("pg-start-btn");
  btn.disabled = true;

  // ซ่อนข้อความเก่า + เริ่มหมุน
  setText("กำลังตรวจสอบและหมุน...");
  removeLineButton();
  startRolling();

  try {
    const response = await fetch(API, {
      method: 'POST',
      mode: 'cors',                    // ลอง cors ก่อน (ถ้าไม่ได้ค่อยเปลี่ยนเป็น no-cors)
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'  // สำคัญ! ทำให้ข้าม preflight
      },
      body: JSON.stringify({ username: username })  // ส่งเป็น string JSON
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();       // ได้ text กลับมา
    let data;
    try {
      data = JSON.parse(text);                // parse เป็น object
    } catch (parseErr) {
      console.error("JSON parse error:", text);
      throw new Error("ตอบกลับจากเซิร์ฟเวอร์ไม่ใช่ JSON ที่ถูกต้อง");
    }

    // หยุดหมุนหลัง 2 วินาที (ให้ดูสนุก)
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

      // แสดงรายชื่อผู้โชคดีล่าสุด
      renderWinners(data.recentWinners || []);

    }, 2000);

  } catch (err) {
    stopRolling();
    setText("เกิดข้อผิดพลาด (อาจเป็นปัญหาเครือข่ายหรือ CORS) ลองใหม่นะคะ");
    console.error("Fetch error:", err);
  } finally {
    btn.disabled = false;
  }
}

// แสดงข้อความใน #pg-prize-display
function setText(text) {
  document.getElementById("pg-prize-display").textContent = text;
}

// เพิ่มปุ่มแจ้งรับรางวัล LINE
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

// ลบปุ่ม LINE ถ้ามี
function removeLineButton() {
  const oldBtn = document.getElementById("line-btn");
  if (oldBtn) oldBtn.remove();
}

// มาสก์ชื่อผู้ใช้ (privacy)
function maskUser(user) {
  if (user.length <= 4) return user;
  return user.slice(0, 2) + "***" + user.slice(-2);
}

// แสดงรายชื่อผู้ชนะใน #winner-list
function renderWinners(winners) {
  const list = document.getElementById("winner-list");
  list.innerHTML = "";
  winners.forEach(w => {
    const li = document.createElement("li");
    li.textContent = `${maskUser(w.username)} ได้ ${w.prize} บาท`;
    list.appendChild(li);
  });
}

// เริ่มหมุน slot machine
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

// Confetti animation ง่าย ๆ
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
