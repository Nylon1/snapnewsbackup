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
<script>
document.querySelectorAll('.vote-button').forEach(btn => {
  btn.addEventListener('click', async () => {
    const videoId = btn.getAttribute('data-id');
    const voteType = btn.getAttribute('data-type');
    const container = btn.closest('.snap-vote-card');

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
        fetchVotes(videoId, container); // ✅ Refresh bar
      } else {
        alert(data.message || 'Vote failed.');
      }
    } catch (err) {
      alert('Vote failed. Check connection.');
      console.error(err);
    }
  });
});

// Fetch and update bar %s
function fetchVotes(videoId, container) {
  fetch(`https://snapbackend-new.onrender.com/api/votes/${videoId}`)
    .then(res => res.json())
    .then(data => {
      const total = Object.values(data).reduce((a, b) => a + b, 0);
      Object.entries(data).forEach(([key, count]) => {
        const percent = total ? ((count / total) * 100).toFixed(1) : 0;
        container.querySelector(`.vote-label-${key}`).textContent = `${percent}%`;
        container.querySelector(`.vote-bar-${key}`).style.width = `${percent}%`;
      });
    });
}

// On page load: update all vote bars
document.querySelectorAll('.snap-vote-card').forEach(container => {
  const videoId = container.dataset.videoid;
  fetchVotes(videoId, container);
});
</script>
