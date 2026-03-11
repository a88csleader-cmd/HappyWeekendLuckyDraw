// HappyWeekendLuckyDraw/script.js - เวอร์ชันแก้ไข error pg_hasPlayed not defined

const PG_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwPap2Qru4wxrLdm46302RYBNPTGQ2A04II1IofAa_gmgFe2sNMR8yBDCxRMDygf64zFg/exec'; // เปลี่ยนเป็น URL จริงของคุณ

const pg_prizes = ["200 บาท", "150 บาท", "100 บาท", "50 บาท", "25 บาท", "ไม่ได้ของรางวัล"];

let pg_intervalId = null;
let pg_selectedPrize = "ไม่ได้ของรางวัล";

// ฟังก์ชันช่วยเหลือ - ต้องกำหนดก่อนใช้งาน
function pg_hasPlayed(username) {
  const played = JSON.parse(localStorage.getItem('pg_playedUsers') || '{}');
  return played[username.toLowerCase()];
}

function pg_recordPlay(username, prize) {
  const played = JSON.parse(localStorage.getItem('pg_playedUsers') || '{}');
  played[username.toLowerCase()] = prize;
  localStorage.setItem('pg_playedUsers', JSON.stringify(played));
}

// ดึง element หลังหน้าโหลดเสร็จ
let pg_startBtn, pg_prizeDisplay, pg_usernameInput, pg_statusDiv;

document.addEventListener("DOMContentLoaded", function() {
  pg_startBtn      = document.getElementById('pg-start-btn');
  pg_prizeDisplay  = document.getElementById('pg-prize-display');
  pg_usernameInput = document.getElementById('pg-username');
  pg_statusDiv     = document.getElementById('pg-status');

  if (!pg_startBtn) {
    console.error("ไม่พบปุ่ม pg-start-btn");
    return;
  }

  pg_startBtn.addEventListener('click', async () => {
    const username = pg_usernameInput.value.trim();
    if (!username) {
      alert("กรุณาใส่ยูสเซอร์เนมก่อนนะคะ");
      return;
    }

    const lower = username.toLowerCase();

    // เช็คเล่นซ้ำ (ใช้ฟังก์ชันที่กำหนดไว้ด้านบน)
    const previousPrize = pg_hasPlayed(lower);
    if (previousPrize) {
      pg_prizeDisplay.innerHTML = `คุณเล่นแล้ว ได้ <span style="color:#ffeb3b; text-shadow:0 0 10px #ffcc00;">${previousPrize}</span>`;
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

    // ดึงรางวัลจาก server
    try {
      const response = await fetch(`${PG_WEB_APP_URL}?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      pg_selectedPrize = data.success ? data.prize : "ไม่ได้ของรางวัล (ระบบขัดข้อง)";
    } catch (err) {
      console.error(err);
      pg_selectedPrize = "ไม่ได้ของรางวัล (เชื่อมต่อล้มเหลว)";
    }

    setTimeout(() => {
      clearInterval(pg_intervalId);
      pg_prizeDisplay.innerHTML = `ยินดีด้วย! คุณได้ <span style="color:#ffeb3b; text-shadow:0 0 10px #ffcc00;">${pg_selectedPrize}</span> 🎉`;

      pg_recordPlay(lower, pg_selectedPrize);

      pg_startBtn.textContent = "เล่นได้เพียงครั้งเดียว";
      pg_startBtn.disabled = true;
    }, 3000);
  });

  if (pg_statusDiv) {
    pg_statusDiv.textContent = "พร้อมลุ้นแล้ว! ใส่ยูสเซอร์เนมเพื่อเริ่ม";
  }
});
