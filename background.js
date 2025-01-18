const CHECK_INTERVAL = 60; // minutes

async function checkUpcomingContests() {
  try {
    const response = await fetch('https://codeforces.com/api/contest.list?gym=false');
    const data = await response.json();
    
    if (data.status === 'OK') {
      const upcomingContests = data.result
        .filter(contest => contest.phase === 'BEFORE')
        .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
      
      upcomingContests.forEach(contest => {
        const startTime = new Date(contest.startTimeSeconds * 1000);
        const timeUntil = startTime - new Date();
        const hoursUntil = timeUntil / (1000 * 60 * 60);
        
        // Notify 24 hours before
        if (hoursUntil <= 24 && hoursUntil >= 23) {
          createNotification(contest, '24 hours');
        }
        
        // Notify 1 hour before
        if (hoursUntil <= 1 && hoursUntil >= 0) {
          createNotification(contest, '1 hour');
        }
      });
    }
  } catch (error) {
    console.error('Error checking contests:', error);
  }
}

function createNotification(contest, timeFrame) {
  const notificationId = `contest-${contest.id}-${timeFrame}`;
  
  chrome.storage.local.get([notificationId], (result) => {
    if (!result[notificationId]) {
      chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: 'public/logo-192x192.png',
        title: 'Upcoming Codeforces Contest',
        message: `${contest.name} will start in ${timeFrame}!`,
        priority: 2
      })
      chrome.storage.local.set({ [notificationId]: true });
    }
  });
}
chrome.alarms.create('checkContests', {
  periodInMinutes: CHECK_INTERVAL
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkContests') {
    checkUpcomingContests();
  }
});

checkUpcomingContests();