async function fetchContests() {
  try {
    const contestsList = document.getElementById('contestsList');
    contestsList.innerHTML = '<div class="loading">Loading contests...</div>';
    
    const response = await fetch('https://codeforces.com/api/contest.list?gym=false');
    const data = await response.json();
    
    if (data.status === 'OK') {
      const upcomingContests = data.result
        .filter(contest => contest.phase === 'BEFORE')
        .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
      
      displayContests(upcomingContests);
    }
  } catch (error) {
    console.error('Error fetching contests:', error);
    const contestsList = document.getElementById('contestsList');
    contestsList.innerHTML = '<div class="no-contests">Error loading contests. Please try again later.</div>';
  }
}

function displayContests(contests) {
  const contestsList = document.getElementById('contestsList');
  contestsList.innerHTML = '';

  if (contests.length === 0) {
    contestsList.innerHTML = '<div class="no-contests"><i class="ti ti-mood-empty"></i> No upcoming contests found</div>';
    return;
  }

  contests.forEach((contest, index) => {
    const startTime = new Date(contest.startTimeSeconds * 1000);
    const timeUntil = getTimeUntil(startTime);
    const formattedDate = formatDate(startTime);
    
    const contestCard = document.createElement('div');
    contestCard.className = `contest-card${index === 0 ? ' next-contest' : ''}`;
    contestCard.innerHTML = `
      <div class="contest-name">${contest.name}</div>
      <div class="contest-time">
        <i class="ti ti-calendar-time icon"></i>
        ${formattedDate}
      </div>
      <div class="contest-countdown">
        <div class="countdown-text">
          <i class="ti ti-clock icon"></i>
          ${timeUntil} until start
        </div>
        <a href="https://codeforces.com/contests" target="_blank" class="contest-link" title="View on Codeforces">
          <i class="ti ti-external-link"></i>
        </a>
      </div>
    `;
    
    contestsList.appendChild(contestCard);
  });
}

function formatDate(date) {
  const options = { 
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

function getTimeUntil(date) {
  const now = new Date();
  const diff = date - now;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ');
}

// Fetch contests when popup opens
document.addEventListener('DOMContentLoaded', fetchContests);