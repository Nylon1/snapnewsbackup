// public/js/snapVote.js
console.log('🔵 snapVote.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔵 DOMContentLoaded in snapVote.js');

  // 1) Find all vote cards on the page
  const cards = document.querySelectorAll('.snap-vote-card');
  console.log('🔵 Found vote cards:', cards.length);

  cards.forEach(card => {
    const videoId = card.getAttribute('data-videoid');
    console.log('  → card videoId=', videoId);

    // 2) Find the four vote buttons inside this card
    const buttons = card.querySelectorAll('.snap-vote-btn');
    console.log('    buttons count:', buttons.length);

    buttons.forEach(btn => {
      const voteType = btn.getAttribute('data-vote');
      console.log('      binding click to:', voteType);

      btn.addEventListener('click', () => {
        console.log(`      🔵 Clicked vote button: videoId=${videoId}, vote=${voteType}`);

        // Disable buttons while the POST is in flight
        buttons.forEach(b => b.disabled = true);

        // 3) POST the vote
        fetch('https://snapbackend-new.onrender.com/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, vote: voteType })
        })
        .then(res => {
          console.log('        ↓ POST /api/votes returned status', res.status);
          if (!res.ok) throw new Error(`Server returned ${res.status}`);
          return res.json();
        })
        .then(json => {
          console.log('        ↓ POST response JSON:', json);
          // Now re-fetch the updated percentages to update the bars:
          return fetch(`https://snapbackend-new.onrender.com/api/votes/${videoId}`);
        })
        .then(res2 => {
          console.log('        ↓ GET /api/votes/:videoId returned status', res2.status);
          if (!res2.ok) throw new Error(`Server returned ${res2.status}`);
          return res2.json();
        })
        .then(updatedJson => {
          console.log('        ↓ GET response JSON:', updatedJson);
          // Update the bars & labels based on updatedJson
          ['verified','fake','satire','context'].forEach(cat => {
            const barEl   = card.querySelector(`.vote-bar-${cat}`);
            const labelEl = card.querySelector(`.vote-label-${cat}`);
            if (!barEl || !labelEl) return;
            const pct = updatedJson[cat] ?? 0;
            labelEl.textContent = pct + '%';
            barEl.style.width = pct + '%';
          });
        })
        .catch(err => {
          console.error('        🔴 Vote request failed:', err);
          alert('Vote failed. Please try again.');
        })
        .finally(() => {
          buttons.forEach(b => b.disabled = false);
        });
      }); // end btn.addEventListener('click', …)
    });   // end buttons.forEach
  });     // end cards.forEach
});       // end DOMContentLoaded

});

