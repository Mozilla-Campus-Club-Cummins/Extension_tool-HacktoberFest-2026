// Cross-browser: Chrome/Edge only expose `chrome`
if (typeof browser === 'undefined') {
  globalThis.browser = chrome;
}

function getBadgeColor(count) {
  if (count === 0) return '#2e7d32';   // green
  if (count <= 3) return '#f9a825';    // yellow/orange
  return '#c62828';                    // red
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRACKERS_FOUND') {
    const tabId = sender.tab.id;
    // storage.session survives the service worker being shut down
    browser.storage.session.set({ [`tab_${tabId}`]: message.trackers });
    browser.action.setBadgeText({
      text: String(message.trackers.length),
      tabId,
    });
    browser.action.setBadgeBackgroundColor({
      color: getBadgeColor(message.trackers.length),
      tabId,
    });
  }

  if (message.type === 'GET_PINNED_TRACKERS') {
  browser.tabs.query({ pinned: true }).then((tabs) => {

    const keys = tabs.map(tab => `tab_${tab.id}`);

    return browser.storage.session.get(keys).then((data) => {
      const counts = {};

      tabs.forEach((tab) => {
        const trackers = data[`tab_${tab.id}`] || [];

        trackers.forEach((tracker) => {
          counts[tracker] = (counts[tracker] || 0) + 1;
        });
      });

      sendResponse(counts);
    });
  });

  return true;
}

  if (message.type === 'GET_TRACKERS') {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const key = `tab_${tabs[0].id}`;
      return browser.storage.session.get(key).then((data) => {
        sendResponse(data[key] || []);
      });
    });
    return true;
  }
});

// Drop stored data for closed tabs
browser.tabs.onRemoved.addListener((tabId) => {
  browser.storage.session.remove(`tab_${tabId}`);
});  