document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  document.getElementById('view-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  });
  document.getElementById('settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

function updateStats() {
  chrome.storage.local.get(['activities'], (result) => {
    const activities = result.activities || [];
    const today = new Date().toISOString().split('T')[0];
    
    const todayActivities = activities.filter(activity => 
      activity.timestamp.includes(today)
    );

    const productiveTime = todayActivities
      .filter(activity => activity.productive)
      .reduce((sum, activity) => sum + activity.duration, 0);
    
    const unproductiveTime = todayActivities
      .filter(activity => !activity.productive)
      .reduce((sum, activity) => sum + activity.duration, 0);

    document.getElementById('productive-time').textContent = 
      formatTime(productiveTime);
    document.getElementById('unproductive-time').textContent = 
      formatTime(unproductiveTime);

    const totalTime = productiveTime + unproductiveTime;
    const productivityScore = totalTime > 0 
      ? Math.round((productiveTime / totalTime) * 100) 
      : 100;
    
    document.getElementById('productivity-score').textContent = 
      `Productivity Score: ${productivityScore}%`;
    
    document.getElementById('productivity-bar').style.width = 
      `${productivityScore}%`;
  });
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

setInterval(updateStats, 60000);
