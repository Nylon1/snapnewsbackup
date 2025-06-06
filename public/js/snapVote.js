// ✅ snapVote.js - Working Voting Script

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.snap-vote-card').forEach(container => {
    const videoId = container.dataset.videoid;
    const voteStorageKey = `snapvote-${videoId}`;
    const existingVote = localStorage.getItem(voteStorageKey);
    const buttons = container.querySelectorAll('.vote-button');

    if (existingVote) highlight(buttons, existingVote);

    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const voteType = btn.getAttribute('data-type');

        if (!videoId || !voteType) {
          alert('Missing vote info.');
          return;
        }

        try {
          const res = await fetch('https://snapbackend-new.onrender.com/api/votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId, voteType })
          });

          const data = await res.json();

          if (res.ok) {
            localStorage.setItem(voteStorageKey, voteType);
            highlight(buttons, voteType);
            fetchVotes(videoId, container);
            showMsg(container, `✅ You voted: ${voteType}`, '#ffd900');
          } else {
            alert(data.message || 'Vote failed.');
          }
        } catch (err) {
          console.error(err);
          showMsg(container, '❌ Vote failed. Check connection.', 'red');
        }
      });
    });

    fetchVotes(videoId, container);
  });
});

function highlight(buttons, selected) {
  buttons.forEach(btn => {
    btn.classList.toggle('voted', btn.getAttribute('data-type') === selected);
  });
}

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

function showMsg(container, msgText, color) {
  const msg = document.createElement('div');
  msg.textContent = msgText;
  msg.style.color = color;
  msg.style.marginTop = '0.5rem';
  msg.style.fontWeight = 'bold';
  msg.style.fontSize = '0.95rem';
  container.appendChild(msg);
  setTimeout(() => msg.remove(), 1600);
}

