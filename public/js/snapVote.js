// -----------------
// Timer Countdown
// -----------------
function updateTimers() {
  document.querySelectorAll('.video-card').forEach(function(card, idx) {
    const dateStr = card.getAttribute('data-date');
    const created = new Date(dateStr);
    const now = new Date();
    const msElapsed = now - created;
    const msLeft = 24 * 60 * 60 * 1000 - msElapsed;
    const timer = document.getElementById('timer-' + idx);

    if (msLeft > 0) {
      const h = Math.floor(msLeft / (1000 * 60 * 60));
      const m = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((msLeft % (1000 * 60)) / 1000);
      timer.textContent = `Expires in: ${h.toString().padStart(2, '0')}:${m
        .toString()
        .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      timer.textContent = 'Expired';
    }
  });
}

setInterval(updateTimers, 1000);
updateTimers();

// -----------------
// Share Button
// -----------------
document.querySelectorAll('.share-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const url = window.location.origin + btn.getAttribute('data-path');
    navigator.clipboard.writeText(url).then(() => {
      const idx = btn.getAttribute('data-idx');
      const msg = document.getElementById('copied-' + idx);
      msg.style.opacity = 1;
      setTimeout(() => {
        msg.style.opacity = 0;
      }, 1800);
    });
  });
});

// -----------------
// Voting Logic
// -----------------
document.querySelectorAll('.vote-button').forEach(btn => {
  btn.addEventListener('click', async () => {
    const videoId = btn.getAttribute('data-id');
    const voteType = btn.getAttribute('data-type');

    if (!videoId || !voteType) {
      alert('Missing vote info.');
      return;
    }

    try {
      const res = await fetch('https://snapbackend-new.onrender.com/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoId, voteType })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`You voted: ${voteType}`);
        // Optionally: Update UI here with the vote result
      } else {
        alert(data.message || 'Vote failed.');
      }
    } catch (err) {
      alert('Vote failed. Check connection.');
      console.error(err);
    }
  });
});
