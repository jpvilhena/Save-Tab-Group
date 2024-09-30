import './popup.css';

(function() {
  document.getElementById("save-btn").addEventListener("click", async () => {
    chrome.runtime.sendMessage({ action: "saveUrls" });
  });
  
  document.getElementById("open-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openUrls" });
  });

})();
