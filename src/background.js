// Flag to prevent multiple listeners
let listenerAdded = false;

if (!listenerAdded) {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "saveUrls") {
      saveTabGroupUrls();
    } else if (message.action === "openUrls") {
      openUrlsInNewTabGroup(message.urls);
    }
  });
  
  listenerAdded = true;  // Set the flag to true to prevent multiple listeners
}

async function saveTabGroupUrls() {
  let queryOptions = { groupId: -1 }; // get the current active tab's group
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (activeTab.groupId !== -1) {
    queryOptions.groupId = activeTab.groupId;

    // Get all tabs in the group
    const groupTabs = await chrome.tabs.query(queryOptions);
    const urls = groupTabs.map(tab => tab.url).join("\n");

    // Prepare data URL
    const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(urls);

    // Save URLs to a text file using a data URL
    chrome.downloads.download({
      url: dataUrl,
      filename: 'tab-group-urls.txt',
      saveAs: true
    });
  } else {
    alert("No active tab group found!");
  }
}

async function openUrlsInNewTabGroup(urls) {
  // Open all URLs in a new tab group
  let groupId = null;

  for (let i = 0; i < urls.length; i++) {
    const tab = await chrome.tabs.create({ url: urls[i], active: i === 0 });
    if (i === 0) {
      // Set the first tab as the group leader and get the groupId
      groupId = await chrome.tabs.group({ tabIds: tab.id });
    } else {
      // Add subsequent tabs to the group
      await chrome.tabs.group({ tabIds: tab.id, groupId: groupId });
    }
  }
}
