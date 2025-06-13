const productiveSites = ['github.com', 'stackoverflow.com', 'leetcode.com'];
const unproductiveSites = ['facebook.com', 'twitter.com', 'youtube.com', 'instagram.com'];

let currentTab = null;
let startTime = null;
let currentDomain = null;
let isIdle = false;

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      updateCurrentTab(tab);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateCurrentTab(tab);
  }
});

chrome.idle.onStateChanged.addListener((newState) => {
  isIdle = newState === 'idle';
  if (isIdle && currentDomain) {
    recordActivity(false);
  }
});

function updateCurrentTab(tab) {
  if (currentDomain) {
    recordActivity(false);
  }

  try {
    const url = new URL(tab.url);
    currentDomain = url.hostname.replace('www.', '');
    currentTab = tab;
    startTime = new Date().getTime();
    
    const isProductive = classifyWebsite(currentDomain);
    chrome.action.setBadgeText({
      text: isProductive ? 'P' : 'U'
    });
    chrome.action.setBadgeBackgroundColor({
      color: isProductive ? '#2ecc71' : '#e74c3c'
    });
  } catch (e) {
    currentDomain = null;
  }
}

function recordActivity(active = true) {
  if (!currentDomain || !startTime) return;

  const endTime = new Date().getTime();
  const duration = (endTime - startTime) / 1000;
  const isProductive = classifyWebsite(currentDomain);

  chrome.storage.local.get(['activities'], (result) => {
    const activities = result.activities || [];
    activities.push({
      domain: currentDomain,
      productive: isProductive,
      duration,
      timestamp: new Date().toISOString(),
      active
    });
    chrome.storage.local.set({ activities });

    chrome.storage.sync.get(['userId'], (result) => {
      if (result.userId) {
        fetch('http://localhost:3000/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: result.userId,
            domain: currentDomain,
            productive: isProductive,
            duration,
            timestamp: new Date().toISOString()
          })
        });
      }
    });
  });

  startTime = endTime;
}

function classifyWebsite(domain) {
  if (productiveSites.some(site => domain.includes(site))) return true;
  if (unproductiveSites.some(site => domain.includes(site))) return false;
  return true;
}

chrome.alarms.create('syncData', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncData') {
    syncWithBackend();
  }
});

function syncWithBackend() {
  chrome.storage.local.get(['activities'], (result) => {
    const unsyncedActivities = result.activities || [];
    chrome.storage.sync.get(['userId'], (userResult) => {
      if (userResult.userId && unsyncedActivities.length > 0) {
        fetch('http://localhost:3000/api/activities/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userResult.userId,
            activities: unsyncedActivities
          })
        }).then(() => {
          chrome.storage.local.set({ activities: [] });
        });
      }
    });
  });
}
