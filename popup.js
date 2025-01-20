const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const body = document.body;

themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    body.classList.add('light-mode');
    themeLabel.textContent = 'Light Mode';
  } else {
    body.classList.remove('light-mode');
    themeLabel.textContent = 'Dark Mode';
  }
});

function filterContests(contests) {
  const div1 = document.getElementById('div1').checked;
  const div2 = document.getElementById('div2').checked;
  const div3 = document.getElementById('div3').checked;
  const div4 = document.getElementById('div4').checked;
  const rated = document.getElementById('rated').checked;
  const unrated = document.getElementById('unrated').checked;
  const gym = document.getElementById('gym').checked;

  return contests.filter(contest => {
    const isDiv1 = contest.name.includes('Div. 1');
    const isDiv2 = contest.name.includes('Div. 2');
    const isDiv3 = contest.name.includes('Div. 3');
    const isDiv4 = contest.name.includes('Div. 4');
    const isRated = contest.name.includes('Rated');
    const isGym = contest.name.includes('Gym');

    return (
      (div1 && isDiv1) ||
      (div2 && isDiv2) ||
      (div3 && isDiv3) ||
      (div4 && isDiv4) 
    ) && (
      (rated && isRated) ||
      (unrated && !isRated) ||
      (gym && isGym)
    );
  });
}


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
      
      window.contests = upcomingContests;
      displayContests(upcomingContests);
    }
  } catch (error) {
    console.error('Error fetching contests:', error);
    const contestsList = document.getElementById('contestsList');
    contestsList.innerHTML = '<div class="no-contests">Error loading contests. Please try again later.</div>';
  }
}

// Display Contests
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
    const duration = formatDuration(contest.durationSeconds);
    const registrationStatus = contest.phase === 'BEFORE' ? 'Open' : 'Closed';
    const participants = contest.participants || 0; 

    const contestCard = document.createElement('div');
    contestCard.className = `contest-card${index === 0 ? ' next-contest' : ''}`;
    contestCard.innerHTML = `
      <div class="contest-name">${contest.name}</div>
      <div class="contest-time">
        <i class="ti ti-calendar-time icon"></i>
        ${formattedDate}
      </div>
      <div class="contest-duration">
        <i class="ti ti-clock icon"></i>
        Duration: ${duration}
      </div>
      <div class="contest-registration">
        <i class="ti ti-user-check icon"></i>
        Registration: ${registrationStatus}
      </div>
      <div class="contest-participants">
        <i class="ti ti-users icon"></i>
        Participants: ${participants}
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

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
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

document.querySelectorAll('.filters input').forEach(input => {
  input.addEventListener('change', () => {
    const filteredContests = filterContests(window.contests);
    displayContests(filteredContests);
  });
});

document.addEventListener('DOMContentLoaded', fetchContests);