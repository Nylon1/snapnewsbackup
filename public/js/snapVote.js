// public/js/snapVote.js

// Whenever this file is parsed, log this:
console.log('🔵 snapVote.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔵 DOMContentLoaded in snapVote.js');

  // Helper: given a card element and a voteType ('verified', 'fake', etc.),
  // visually highlight the chosen button and disable all buttons.
  function highlightAndDisable(card, chosenVote) {
    // Find all buttons in this card:
    const buttons = card.querySelectorAll('.snap-vote-btn');
    buttons.forEach(btn => {
      const vt = btn.getAttribute('data-vote');
      // If this is the chosen vote, add a 'selected' class (for styling).
      if (vt === chosenVote) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
      // Disable every button once a vote is cast.
      btn.disabled = true;
    });
  }

  // Helper: update the bars & labels based on a percentages object
  function updateBars(card, percentages) {
    ['verified','fake','satire','context'].forEach(cat => {
      const barEl   = card.querySelector(`.vote-bar-${cat}`);
      const labelEl = card.querySelector(`.vote-label-${cat}`);
      if (!barEl || !labelEl) return;
      const pct = percentages[cat] ?? 0;
      labelEl.textContent = pct + '%';
      barEl.style.width = pct + '%';
    });
  }

  // 1) On initial load, find all vote cards and do two things:
  //    A) Fetch current percentages to populate the bars.
  //    B) Check localStorage to see if this user already voted; if so, highlight & disable.
  const cards = document.querySelectorAll('.snap-vote-card');
  console.log('🔵 Found vote cards:', cards.length);

  cards.forEach(card => {
    const videoId = card.getAttribute('data-videoid');
    console.log('  → card videoId=', videoId);

    // (1.A) Fetch current totals and update bars:
    fetch(`https://snapbackend-new.onrender.com/api/votes/${videoId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(json => {
        console.log(`    Initial GET for ${videoId}:`, json);
        updateBars(card, json);
      })
      .catch(err => {
        console.error(`    Error fetching initial percentages for ${videoId}:`, err);
      });

    // (1.B) Check localStorage to see if the user already voted on this video:
    const storageKey = `snapvote-${videoId}`;
    const existingVote = localStorage.getItem(storageKey);
    if (existingVote) {
      console.log(`    User already voted on ${videoId}:`, existingVote);
      highlightAndDisable(card, existingVote);
    }
  });

  // 2) Attach click handlers to each button, but first check localStorage to prevent re-vote
  cards.forEach(card => {
    const videoId = card.getAttribute('data-videoid');
    const storageKey = `snapvote-${videoId}`;

    const buttons = card.querySelectorAll('.snap-vote-btn');
    console.log('    buttons count for', videoId, ':', buttons.length);

    buttons.forEach(btn => {
      const voteType = btn.getAttribute('data-vote');
      console.log('      binding click to:', voteType);

      btn.addEventListener('click', () => {
        // If user already voted (in localStorage), do nothing:
        if (localStorage.getItem(storageKey)) {
          console.log(`      ❌ Vote attempt ignored, already voted on ${videoId}.`);
          return;
        }

        console.log(`      🔵 Clicked vote button: videoId=${videoId}, vote=${voteType}`);

        // Disable all buttons while the POST is in flight
        buttons.forEach(b => b.disabled = true);

        // POST the vote
        fetch('https://snapbackend-new.onrender.com/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, vote: voteType })
        })
        .then(res => {
          console.log('        ↓ POST /api/votes returned status', res.status);
          if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
          }
          return res.json();
        })
        .then(json => {
          console.log('        ↓ POST response JSON:', json);
          // Store user’s vote so they can’t re-vote on page refresh:
          localStorage.setItem(storageKey, voteType);

          // Visually highlight & disable buttons immediately:
          highlightAndDisable(card, voteType);

          // Now re-fetch updated percentages to update the bars:
          return fetch(`https://snapbackend-new.onrender.com/api/votes/${videoId}`);
        })
        .then(res2 => {
          console.log('        ↓ GET /api/votes/:videoId returned status', res2.status);
          if (!res2.ok) {
            throw new Error(`Server returned ${res2.status}`);
          }
          return res2.json();
        })
        .then(updatedJson => {
          console.log('        ↓ GET response JSON:', updatedJson);
          updateBars(card, updatedJson);
        })
        .catch(err => {
          console.error('        🔴 Vote request failed:', err);
          alert('Vote failed. Please try again.');
          // If it failed, re-enable buttons so user can retry:
          buttons.forEach(b => b.disabled = false);
        });
      });
    });
  });
});



