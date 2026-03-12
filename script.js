const API = "https://script.google.com/macros/s/AKfycbzaeLs9JvzY68djIN6VgBKismLyAkfvFB9SKvnLPl8fyNUx024sLNSHhLhj-Bx-Up0Nzw/exec"; // เปลี่ยนเป็น URL ล่าสุดของคุณ
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

let spinInterval;
let slots = document.querySelectorAll(".slot");

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

    // หยุดหมุนแบบ gradual แล้ว set เลขตรง prize (หลัง 2 วินาที)
    setTimeout(() => {
      stopRollingGradual(data.prize);

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

// แสดงข้อความ
function setText(text) {
  document.getElementById("pg-prize-display").textContent = text;
}

// เพิ่มปุ่ม LINE
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

// ลบปุ่ม LINE
function removeLineButton() {
  const oldBtn = document.getElementById("line-btn");
  if (oldBtn) oldBtn.remove();
}

// มาสก์ username
function maskUser(user) {
  if (user.length <= 4) return user;
  return user.slice(0, 2) + "***" + user.slice(-2);
}

// แสดงผู้ชนะ
function renderWinners(winners) {
  const list = document.getElementById("winner-list");
  list.innerHTML = "";
  winners.forEach(w => {
    const li = document.createElement("li");
    li.textContent = `${maskUser(w.username)} ได้ ${w.prize} บาท`;
    list.appendChild(li);
  });
}

// เริ่มหมุน random
function startRolling() {
  stopRolling();
  spinInterval = setInterval(() => {
    slots.forEach(slot => {
      slot.textContent = Math.floor(Math.random() * 10);
    });
  }, 80);
}

// หยุดหมุนแบบ gradual แล้ว set เลขตรง prize
function stopRollingGradual(prize) {
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }

  // แปลง prize เป็น string 4 หลัก pad ด้วย 0 (เช่น 50 → "0050")
  let prizeStr = prize.toString().padStart(4, '0');
  if (prize === 0) prizeStr = "0000"; // สำหรับ 0

  // หยุดทีละช่อง (delay เพิ่มขึ้น)
  slots.forEach((slot, index) => {
    setTimeout(() => {
      slot.textContent = prizeStr[index];
    }, index * 300); // ช่อง 1 หยุดก่อน, ช่อง 4 หยุดทีหลัง
  });
}

// Confetti (เดิม)
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
