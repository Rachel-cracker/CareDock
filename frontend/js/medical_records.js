// API setup
const API_BASE = "http://127.0.0.1:8000";

// download file from backend function written by cursor
window.downloadTemplate = function (templateType, ev) {
    //map template types to database IDs
    const templateFileIds = {
      'medical-history': 2,
      'medication-log': 3, 
      'doctor-visit': 4,
      'emergency-contact': 5,
      'insurance-info': 6,
      'immunization-record': 7
    };
    
    const fileId = templateFileIds[templateType];
    if (!fileId) {
      alert('File not found');
      return;
    }
  
    fetch(`${API_BASE}/resource/files/${fileId}/download`)
      .then(response => {
        if (!response.ok) throw new Error('Download failed');
        return response.blob();
      })
      .then(blob => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${templateType}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Download error:', error);
        alert('Download failed. Please try again.');
      });
  };
  
  //card click interactions
  document.addEventListener("DOMContentLoaded", function () {
    var templateCards = document.querySelectorAll(".template-card");
    for (var i = 0; i < templateCards.length; i++) {
      var card = templateCards[i];
      card.addEventListener("click", function () {
        var button = this.querySelector("button");
        if (button) {
          button.click();
        }
      });
      card.style.cursor = "pointer";
    }
  });
  