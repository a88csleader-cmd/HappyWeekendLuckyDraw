const API = "https://script.google.com/macros/s/AKfycbwtOQMmrUPCP5KW7p8528rIEudqVj17nr8DLfvQqbYLufbtlDc2jbE7uIY0XALy64Vl6g/exec"; // เปลี่ยนเป็น URL ล่าสุดของคุณ
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

let spinIntervals = new Array(4).fill(null);
const slots = document.querySelectorAll(".slot");

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

    if (data.error) {
      stopAllRolling();
      setText(data.error, 'error');

      slots.forEach(slot => {
        slot.textContent = "0";
      });

      renderWinners(data.recentWinners || []);
      btn.disabled = false;
      return;
    }

    if (data.alreadyPlayed) {
      stopAllRolling();
      setText(`คุณเคยเล่นแล้ว ได้ ${data.prize} บาท`, 'info');

      let prizeStr = data.prize.toString().padStart(4, '0');
      slots.forEach((slot, i) => {
        slot.textContent = prizeStr[i];
      });

      renderWinners(data.recentWinners || []);
      btn.disabled = false;
      return;
    }

    setTimeout(() => {
      const delayUntilText = stopRollingGradual(data.prize || 0);

      setTimeout(() => {
        if (data.prize > 0) {
          setText(`ยินดีด้วย! คุณได้รับ ${data.prize} บาท`, 'success');
          launchConfetti();
          addLineButton();
        } else {
          setText("เสียใจด้วย คุณไม่ได้รางวัล ลองใหม่ครั้งหน้า!", 'error');
        }

        renderWinners(data.recentWinners || []);
      }, delayUntilText);

    }, 2000);

  } catch (err) {
    stopAllRolling();
    setText("เกิดข้อผิดพลาด ลองใหม่หรือเช็คการเชื่อมต่อ", 'error');
    console.error("Fetch error:", err);
  } finally {
    btn.disabled = false;
  }
}

function setText(text, type = 'normal') {
  const display = document.getElementById("pg-prize-display");
  display.textContent = text;

  display.style.color = "#fff";
  display.style.fontWeight = "normal";
  display.style.textShadow = "1px 1px 3px #000";

  if (type === 'error') {
    display.style.color = "#ff4d4d";
    display.style.fontWeight = "bold";
    display.style.textShadow = "1px 1px 5px rgba(255, 77, 77, 0.7)";
  } else if (type === 'success') {
    display.style.color = "#00ff99";
    display.style.fontWeight = "bold";
    display.style.textShadow = "1px 1px 5px rgba(0, 255, 153, 0.7)";
  } else if (type === 'info') {
    display.style.color = "#ffd700";
    display.style.fontWeight = "bold";
  }
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

function stopAllRolling() {
  spinIntervals.forEach((interval, i) => {
    if (interval) {
      clearInterval(interval);
      spinIntervals[i] = null;
    }
  });
}

function startRolling() {
  stopAllRolling();
  slots.forEach((slot, index) => {
    spinIntervals[index] = setInterval(() => {
      slot.textContent = Math.floor(Math.random() * 10);
    }, 80);
  });
}

function stopRollingGradual(prize) {
  let prizeStr = prize.toString().padStart(4, '0');
  if (prize === 0) prizeStr = "0000";

  const stopOrder = [3, 2, 1, 0];
  let currentDelay = 0;

  stopOrder.forEach((index, step) => {
    const stopDelay = currentDelay + (step * 1200);

    setTimeout(() => {
      if (spinIntervals[index]) {
        clearInterval(spinIntervals[index]);
        spinIntervals[index] = null;
      }

      slots[index].style.transition = "transform 0.3s";
      slots[index].style.transform = "scale(1.3)";

      let quickSpinCount = 0;
      const quickSpin = setInterval(() => {
        slots[index].textContent = Math.floor(Math.random() * 10);
        quickSpinCount++;
        if (quickSpinCount >= 7) {
          clearInterval(quickSpin);
          slots[index].textContent = prizeStr[index];
          slots[index].style.transform = "scale(1)";
        }
      }, 60);

    }, stopDelay);

    currentDelay = stopDelay + 1400;
  });

  return currentDelay + 1000;
}

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
