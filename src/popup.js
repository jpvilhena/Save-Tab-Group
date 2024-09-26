import './popup.css';

(function() {
  document.getElementById("save-btn").addEventListener("click", async () => {
    chrome.runtime.sendMessage({ action: "saveUrls" });
  });
  
  document.getElementById("open-btn").addEventListener("click", () => {
    document.getElementById("file-input").click();
  });

  document.getElementById("file-input").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const fileContent = e.target.result;
        const urls = fileContent.split("\n").filter(url => url.trim() !== "");
        chrome.runtime.sendMessage({ action: "openUrls", urls: urls });
      };
      reader.readAsText(file);  // Read the content of the file as plain text
    }
  })
})();
