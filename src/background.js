// Flag to prevent multiple listeners
let listenerAdded = false;

if (!listenerAdded) {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "saveUrls") {
      saveTabGroupUrls();
    } else if (message.action === "openUrls") {
      openUrlsInNewTabGroup();
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
    const urls = groupTabs.map(tab => tab.url);


    // Save URLs to chrome.storage.sync under a preset key
    chrome.storage.sync.set({ 'PluginTabs.Preset1': urls }, function() {
      console.log('Tab group URLs saved to PluginTabs.Preset1');
    });
  } else {
    alert("No active tab group found!");
  }
}

async function openUrlsInNewTabGroup() {
  chrome.storage.sync.get('PluginTabs.Preset1', async function(result) {
    const urls = result['PluginTabs.Preset1'];
    
    console.log(urls)

    if (urls && urls.length > 0) {
      let groupId = null;

      // Open all URLs in a new tab group
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
    } else {
      alert('No URLs found in PluginTabs.Preset1');
    }
  });
}