var webviews = require('webviews.js')
var settings = require('util/settings/settings.js')
var { ipcRenderer } = require('electron')

var aiAssistant = {
  button: document.getElementById('ai-assistant-button'),
  
  initialize: function () {
    aiAssistant.button.addEventListener('click', aiAssistant.onClick)
  },

  onClick: function () {
    console.log('AI Assistant onClick function called');
    var currentTab = tabs.get(tabs.getSelected());
    console.log('Current tab:', currentTab);
    if (currentTab && currentTab.url) {
      console.log('Attempting to get selected content for tab:', currentTab.id);
      webviews.getSelection(currentTab.id)
        .then(function (selection) {
          if (selection && selection.trim() !== '') {
            console.log('Selected content:', selection);
            console.log('Sending generate-summary request to main process');
            ipcRenderer.send('generate-summary', {
              url: currentTab.url,
              title: currentTab.title,
              content: selection,
              isSelection: true
            });
          } else {
            console.log('No text selected. Falling back to full page content.');
            return webviews.getPageContent(currentTab.id);
          }
        })
        .then(function (content) {
          if (content) {
            console.log('Page content:', content);
            console.log('Sending generate-summary request to main process');
            ipcRenderer.send('generate-summary', {
              url: currentTab.url,
              title: currentTab.title,
              content: content,
              isSelection: false
            });
          }
        })
        .catch(function (error) {
          console.error('Error getting content:', error);
          console.log('Showing error message to user');
          aiAssistant.showSummaryPopup('Unable to retrieve content. Please try again.');
        });
    } else {
      console.log('No active tab or valid URL found');
      aiAssistant.showSummaryPopup('No active tab or valid URL found.');
    }
  },

  showSummaryPopup: function (summary) {
    // This is a placeholder. In a real implementation, you'd create a proper UI component.
    alert(summary)
  },

  update: function () {
    // This method can be used to update the button state if needed
    // For example, you might want to disable the button for certain pages
    const currentTab = tabs.get(tabs.getSelected())
    if (currentTab && currentTab.url && currentTab.url.startsWith('http')) {
      aiAssistant.button.disabled = false
    } else {
      aiAssistant.button.disabled = true
    }
  }
}

ipcRenderer.on('summary-generated', (event, summary) => {
  console.log('Summary generated:', summary);
  aiAssistant.showSummaryPopup(summary)
})

module.exports = aiAssistant