document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.snap-vote-card').forEach(container => {
    const videoId = container.dataset.videoid;
    const voteStorageKey = `snapvote-${videoId}`;
    const existingVote = localStorage.getItem(voteStorageKey);
    const buttons = container.querySelectorAll('.snap-vote-btn');

    if (existingVote) highlight(buttons, existingVote);
    else {
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const voteType = btn.dataset.vote;
          fetch('https://snapbackend-new.onrender.com/api/votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId, voteType })
          }).then(res => {
            if (res.status === 201) {
              localStorage.setItem(voteStorageKey, voteType);
              highlight(buttons, voteType);
              fetchVotes(videoId, container);
            }
          });
        });
      });
    }

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
