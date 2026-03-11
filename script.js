// script.js - เวอร์ชันแก้การเล่นซ้ำ + เช็คสิทธิ์จาก backend

const PG_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzaInQybly14EPy0oJ-MbK_Bkr1Iiosqg0UiLKTN598jFdWReJRAwVwINUmhA6WyLmI_w/exec'; // เปลี่ยนเป็น URL จริง

const pg_prizes = ["200 บาท", "150 บาท", "100 บาท", "50 บาท", "25 บาท", "ไม่ได้ของรางวัล"];

let pg_intervalId = null;
let pg_selectedPrize = "ไม่ได้ของรางวัล";

function pg_hasPlayed(username) {
  const played = JSON.parse(localStorage.getItem('pg_playedUsers') || '{}');
  return played[username.toLowerCase()];
}

function pg_recordPlay(username, prize) {
  const played = JSON.parse(localStorage.getItem('pg_playedUsers') || '{}');
  played[username.toLowerCase()] = prize;
  localStorage.setItem('pg_playedUsers', JSON.stringify(played));
}

document.addEventListener("DOMContentLoaded", function() {
  const pg_startBtn      = document.getElementById('pg-start-btn');
  const pg_prizeDisplay  = document.getElementById('pg-prize-display');
  const pg_usernameInput = document.getElementById('pg-username');
  const pg_statusDiv     = document.getElementById('pg-status');

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

    // เช็ค localStorage ก่อนเลย ถ้าเคยเล่นแล้วให้หยุดทันที
    const previousPrize = pg_hasPlayed(lower);
    if (previousPrize) {
      pg_prizeDisplay.textContent = "คุณเล่นแล้ว ได้ " + previousPrize;
      pg_startBtn.textContent = "เล่นได้เพียงครั้งเดียว";
      pg_startBtn.disabled = true;
      return;
    }

    pg_prizeDisplay.textContent = "กำลังตรวจสอบสิทธิ์และสุ่มรางวัล...";
    pg_startBtn.textContent = "กำลังสุ่ม...";
    pg_startBtn.disabled = true;

    pg_intervalId = setInterval(() => {
      const randPrize = pg_prizes[Math.floor(Math.random() * pg_prizes.length)];
      pg_prizeDisplay.textContent = randPrize;
    }, 80);

    let prizeText = "ไม่ได้ของรางวัล (เชื่อมต่อล้มเหลว)";
    let isMemberOrAllowed = true;

    try {
      const fullUrl = PG_WEB_APP_URL + '?username=' + encodeURIComponent(username);
      const response = await fetch(fullUrl);
      const data = await response.json();

      if (data.success) {
        prizeText = data.prize;

        // ถ้า backend บอกว่าไม่มีสิทธิ์
        if (data.message && data.message.includes("คุณไม่ใช่สมาชิก")) {
          isMemberOrAllowed = false;
          prizeText = data.message; // แสดงข้อความจาก backend
        }
      } else {
        prizeText = data.error || prizeText;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      prizeText = "ไม่ได้ของรางวัล (เชื่อมต่อล้มเหลว)";
    }

    setTimeout(() => {
      clearInterval(pg_intervalId);

      if (!isMemberOrAllowed) {
        // ไม่มีสิทธิ์ → แสดงข้อความ ไม่บันทึก localStorage
        pg_prizeDisplay.textContent = prizeText;
      } else {
        // มีสิทธิ์ → แสดงรางวัลปกติ
        pg_prizeDisplay.textContent = "ยินดีด้วย! คุณได้ " + prizeText;

        // บันทึก localStorage เฉพาะเมื่อได้รางวัลจริง (ไม่ใช่ "ไม่ได้")
        if (prizeText !== "ไม่ได้ของรางวัล") {
          pg_recordPlay(lower, prizeText);
        }
      }

      pg_startBtn.textContent = "เล่นได้เพียงครั้งเดียว";
      pg_startBtn.disabled = true;
    }, 3000);
  });

  if (pg_statusDiv) {
    pg_statusDiv.textContent = "พร้อมลุ้นแล้ว! ใส่ยูสเซอร์เนมเพื่อเริ่ม";
  }
});
