chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "saveUrls") {
      saveTabGroupUrls();
    } else if (message.action === "openUrls") {
      openUrlsFromFile(message.urls);
    }
  });
  

  //WIP this saves a txt file with url separated by paragraphs. but not of the group, but of all tabs
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
  
  async function openUrlsFromFile(urls) {
 // Open all URLs in a new tab group
  console.log("We here");
  for (let i = 0; i < urls.length; i++) {
    const tab = await chrome.tabs.create({ url: urls[i], active: i === 0 });
    if (i === 0) {
      // Set the first tab as the group leader and get the groupId
      const groupId = await chrome.tabs.group({ tabIds: tab.id });
    } else {
      // Add subsequent tabs to the group
      chrome.tabs.group({ tabIds: tab.id });
    }
  }
}
});
