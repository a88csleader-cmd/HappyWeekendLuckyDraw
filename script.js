const API = "https://script.google.com/macros/s/AKfycbz15ab74pcyYTELi5iSE9C6rP4EDA6YRVOnLRI5kelHBW4eq7LUzJhJj-LzuW7zpN-r-Q/exec"; // เปลี่ยนเป็น URL ของคุณ
const LINE_LINK = "https://lin.ee/Nb2TD8R";

document.getElementById("pg-start-btn").addEventListener("click", playGame);

let spinInterval; // ตัวแปรเก็บ interval การหมุน

async function playGame() {
  const usernameInput = document.getElementById("pg-username");
  const username = usernameInput.value.trim().toLowerCase();
  if (!username) { alert("กรุณาใส่ username"); return; }

  const btn = document.getElementById("pg-start-btn");
  btn.disabled = true;

  // --- ซ่อนข้อความรางวัลเก่าก่อนหมุน ---
  const display = document.getElementById("pg-prize-display");
  display.textContent = "กำลังหมุน...";
  removeLineButton();

  // --- เริ่มหมุน slot ทันทีแบบ random ---
  startRolling();

  try {
    const res = await fetch(`${API}?recent=1`);
    const data = await res.json();

    if (!data) {
      setText("ไม่สามารถดึงข้อมูลผู้ชนะได้");
      btn.disabled = false;
      stopRolling();
      return;
    }

    // แสดงรายชื่อผู้โชคดีจาก Google Sheet + fake winner
    const winnersFeed = data.map(winner => `${maskUser(winner.username)} ได้ ${winner.prize} บาท`);
    console.log("ผู้โชคดีล่าสุด:", winnersFeed);

    // ...ทำการหมุนวงล้อหรือแสดงรางวัลต่อไป
    setText("ยินดีด้วย! คุณได้รับรางวัล 50 บาท"); // ตัวอย่างการแสดงรางวัล

    addLineButton(); // เพิ่มปุ่มให้ติดต่อผ่าน LINE

    btn.disabled = false;

  } catch (e) {
    setText("เกิดข้อผิดพลาด");
    console.error(e);
  }
}

// ฟังก์ชันแสดงข้อความ
function setText(text) {
  const display = document.getElementById("pg-prize-display");
  display.textContent = text;
  removeLineButton();
}

// ฟังก์ชันแสดงรางวัล
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

// ฟังก์ชันลบปุ่ม Line ถ้ามี
function removeLineButton() {
  const oldBtn = document.getElementById("line-btn");
  if (oldBtn) oldBtn.remove();
}

// ฟังก์ชันมาสก์ชื่อผู้ใช้ (แสดงแค่ 2 ตัวแรกและ 2 ตัวท้าย)
function maskUser(user) {
  if (user.length <= 4) return user;
  return user.slice(0, 2) + "***" + user.slice(-2);
}

// --- ฟังก์ชันหมุนวงล้อแบบ random ---
function startRolling() {
  const slots = document.querySelectorAll(".slot");
  stopRolling();
  spinInterval = setInterval(() => {
    slots.forEach(slot => {
      slot.textContent = Math.floor(Math.random() * 10);
    });
  }, 80);
}

// --- หยุดหมุน ---
function stopRolling() {
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }
}
