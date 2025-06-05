document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.snap-vote-card').forEach(container => {
    const videoId = container.dataset.videoid;
    const voteStorageKey = `snapvote-${videoId}`;
    const existingVote = localStorage.getItem(voteStorageKey);
    const buttons = container.querySelectorAll('.snap-vote-btn');

    if (existingVote) {
      highlight(buttons, existingVote);
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const voteType = btn.dataset.vote;

        // Prevent double voting
        if (localStorage.getItem(voteStorageKey)) {
          showMsg(container, 'You already voted.', '#ccc');
          return;
        }

        fetch('https://snapbackend-new.onrender.com/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, voteType })
        })
        .then(res => {
          if (!res.ok) throw new Error(`Vote failed: ${res.status}`);
          return res.json();
        })
        .then(() => {
          localStorage.setItem(voteStorageKey, voteType);
          highlight(buttons, voteType);
          fetchVotes(videoId, container);
          showMsg(container, '✅ Vote submitted!', '#ffd900');
        })
        .catch(err => {
          console.error('Vote error:', err);
          showMsg(container, '❌ Error submitting vote.', 'red');
        });
      });
    });

    fetchVotes(videoId, container);
  });
});

function highlight(buttons, selected) {
  buttons.forEach(btn => {
    btn.classList.toggle('voted', btn.dataset.vote === selected);
  });
}

function fetchVotes(videoId, container) {
  fetch(`https://snapbackend-new.onrender.com/api/votes/${videoId}`)
    .then(res => {
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const total = Object.values(data).reduce((a, b) => a + b, 0);
      Object.entries(data).forEach(([key, count]) => {
        const percent = total ? ((count / total) * 100).toFixed(1) : 0;
        container.querySelector(`.vote-label-${key}`).textContent = `${percent}%`;
        container.querySelector(`.vote-bar-${key}`).style.width = `${percent}%`;
      });
    })
    .catch(err => {
      console.error(`Fetch error for video ${videoId}:`, err);
    });
}

function showMsg(container, text, color = '#ffd900') {
  const msg = document.createElement('div');
  msg.textContent = text;
  msg.style.color = color;
  msg.style.marginTop = '0.4rem';
  msg.style.fontWeight = 'bold';
  msg.style.fontSize = '0.92rem';
  container.appendChild(msg);
  setTimeout(() => msg.remove(), 1800);
}
