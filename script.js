// HappyWeekendLuckyDraw/script.js - อัปเดตเวอร์ชันล่าสุด

const PG_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwu65EZunX8WEr919EzY-grK-ZUG4RrIkRkkE-MXg3PMuSnzZT1JYioTWE8pvbAnFxt8g/exec';  // เปลี่ยนเป็น URL Apps Script จริงของคุณ

const pg_prizes = ["200 บาท", "150 บาท", "100 บาท", "50 บาท", "25 บาท", "ไม่ได้ของรางวัล"];

let pg_intervalId = null;
let pg_selectedPrize = "ไม่ได้ของรางวัล";

const pg_startBtn      = document.getElementById('pg-start-btn');
const pg_prizeDisplay  = document.getElementById('pg-prize-display');
const pg_usernameInput = document.getElementById('pg-username');
const pg_statusDiv     = document.getElementById('pg-status');

async function pg_fetchPrize() {
  try {
    const response = await fetch(PG_WEB_APP_URL);
    if (!response.ok) throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    const data = await response.json();
    if (!data.success) {
      console.error("Server error:", data.error);
      return "ไม่ได้ของรางวัล (ระบบขัดข้อง)";
    }
    return data.prize;
  } catch (err) {
    console.error("Fetch error:", err);
    return "ไม่ได้ของรางวัล (เชื่อมต่อล้มเหลว)";
  }
}

function pg_hasPlayed(username) {
  const played = JSON.parse(localStorage.getItem('pg_playedUsers') || '{}');
  return played[username.toLowerCase()];
}

function pg_recordPlay(username, prize) {
  const played = JSON.parse(localStorage.getItem('pg_playedUsers') || '{}');
  played[username.toLowerCase()] = prize;
  localStorage.setItem('pg_playedUsers', JSON.stringify(played));
}

if (pg_startBtn) {
  pg_startBtn.addEventListener('click', async () => {
    const username = pg_usernameInput.value.trim();
    if (!username) {
      alert("กรุณาใส่ยูสเซอร์เนมก่อนนะคะ");
      return;
    }

    const lower = username.toLowerCase();

    if (pg_hasPlayed(lower)) {
      const prevPrize = pg_hasPlayed(lower);
      pg_prizeDisplay.innerHTML = `คุณเล่นแล้ว ได้ <span style="color:#ffeb3b; text-shadow:0 0 10px #ffcc00;">${prevPrize}</span>`;
      pg_startBtn.textContent = "เล่นได้เพียงครั้งเดียว";
      pg_startBtn.disabled = true;
      return;
    }

    pg_prizeDisplay.textContent = "กำลังสุ่มรางวัล...";
    pg_startBtn.textContent = "กำลังสุ่ม...";
    pg_startBtn.disabled = true;

    pg_intervalId = setInterval(() => {
      const randPrize = pg_prizes[Math.floor(Math.random() * pg_prizes.length)];
      pg_prizeDisplay.textContent = randPrize;
    }, 80);

    pg_selectedPrize = await pg_fetchPrize();

    setTimeout(() => {
      clearInterval(pg_intervalId);
      pg_prizeDisplay.innerHTML = `ยินดีด้วย! คุณได้ <span style="color:#ffeb3b; text-shadow:0 0 10px #ffcc00;">${pg_selectedPrize}</span> 🎉`;

      pg_recordPlay(lower, pg_selectedPrize);

      pg_startBtn.textContent = "เล่นได้เพียงครั้งเดียว";
      pg_startBtn.disabled = true;
    }, 3000);  // หมุน 3 วินาที
  });

  pg_statusDiv.textContent = "พร้อมลุ้นแล้ว! ใส่ยูสเซอร์เนมเพื่อเริ่ม";
}
