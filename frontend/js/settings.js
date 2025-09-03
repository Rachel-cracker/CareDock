//written by cursor to fix a bug of redirecting to login page
window.API_BASE = window.API_BASE || "http://localhost:8000";
// Optional: local alias if you want to use API_BASE too
const API_BASE = window.API_BASE;

var originalSetting = false;
var originalEmail = "";
var originalFullName = "";


function getToken() {
  return localStorage.getItem("token");
}

// Test function for debugging - you can call this in browser console
window.testToken = function() {
  var token = getToken();
  console.log('Token test - Token exists:', !!token);
  console.log('Token test - Token:', token);
  
  if (!token) {
    console.log('Token test - No token found');
    return;
  }
  
  fetch(window.API_BASE + "/profile/me", {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => {
    console.log('Token test - Response status:', res.status);
    return res.text();
  })
  .then(text => {
    console.log('Token test - Response body:', text);
  })
  .catch(err => {
    console.log('Token test - Error:', err);
  });
};

function authHeaders() {
  return { 
    "Content-Type": "application/json",
    "Authorization": "Bearer " + getToken() 
  };
}
//check if the profile information has changed
function hasChanges(toggleEl, emailEl, nameEl) {
  return (toggleEl.checked !== originalSetting) ||
         (emailEl.value !== originalEmail) ||
         (nameEl.value !== originalFullName);
}

//update the save button written by cursor
function updateSaveButton(saveBtn, toggleEl, emailEl, nameEl) {
  if (hasChanges(toggleEl, emailEl, nameEl)) {
    saveBtn.classList.remove("opacity-50", "cursor-not-allowed");
    saveBtn.disabled = false;
  } else {
    saveBtn.classList.add("opacity-50", "cursor-not-allowed");
    saveBtn.disabled = true;
  }
}
//show the notification written by cursor
function showNotification(message, isError) {
  var note = document.createElement("div");
  note.className = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white " +
                   (isError ? "bg-red-500" : "bg-green-500");
  note.textContent = message;
  document.body.appendChild(note);
  setTimeout(function () { if (note && note.parentNode) note.parentNode.removeChild(note); }, 3000);
}
//load the user profile
function loadUserProfile(toggleEl, emailEl, nameEl, saveBtn) {
  var token = getToken();
  if (!token) {
    window.location.href = "login_register.html";
    return;
  }

  // profile
  
  fetch(window.API_BASE + "/profile/me", { headers: authHeaders() })
    .then(function (res) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "login_register.html";
        return Promise.reject(); 
      }
      return res.json();
    })
    .then(function (profile) {
      // Check if the response indicates an invalid token
      if (profile && profile.detail && (profile.detail === "Invalid token" || profile.detail.includes("Invalid"))) {
        localStorage.removeItem("token");
        window.location.href = "login_register.html";
        return;
      }
      //if the profile is not found, return
      if (!profile) return;
      originalEmail = profile.email || "";
      originalFullName = profile.full_name || "";
      emailEl.value = originalEmail;
      nameEl.value = originalFullName;
    })
    .finally(function () {
      //self care support setting
      var saved = localStorage.getItem("selfCareAISupport");
      if (saved !== null) {
        originalSetting = (saved === "true");
        toggleEl.checked = originalSetting;
      } else {
        originalSetting = toggleEl.checked;
      }
      updateSaveButton(saveBtn, toggleEl, emailEl, nameEl);
    })
    .catch(function(error) {
      console.error('Settings: Error loading profile:', error);
      localStorage.removeItem("token");
      window.location.href = "login_register.html";
    });
}

function saveChanges(toggleEl, emailEl, nameEl, saveBtn) {
  var token = getToken();
  if (!token) {
    window.location.href = "login_register.html";
    return;
  }

  // update profile only if changed
  var needsProfile = (emailEl.value !== originalEmail) || (nameEl.value !== originalFullName);
  var doProfile = Promise.resolve();

  if (needsProfile) {
    doProfile = fetch(window.API_BASE + "/profile/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        email: emailEl.value,
        full_name: nameEl.value
      })
    }).then(function () {
      originalEmail = emailEl.value;
      originalFullName = nameEl.value;
    });
  }

  doProfile.then(function () {
    // save setting
    originalSetting = toggleEl.checked;
    localStorage.setItem("selfCareAISupport", String(originalSetting));
    showNotification("Settings saved successfully!", false);
    updateSaveButton(saveBtn, toggleEl, emailEl, nameEl);
  });
}

// put the functions together
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("#selfCareToggle");
  var saveButton = document.querySelector('button[class*="bg-primary"]');
  var cancelButton = document.querySelector('button[class*="text-gray-600"]');
  var emailInput = document.querySelector("#emailInput");
  var fullNameInput = document.querySelector("#fullNameInput");

  // load profile + setting
  loadUserProfile(toggle, emailInput, fullNameInput, saveButton);

  // change watchers
  toggle.addEventListener("change", function () {
    updateSaveButton(saveButton, toggle, emailInput, fullNameInput);
  });
  emailInput.addEventListener("input", function () {
    updateSaveButton(saveButton, toggle, emailInput, fullNameInput);
  });
  fullNameInput.addEventListener("input", function () {
    updateSaveButton(saveButton, toggle, emailInput, fullNameInput);
  });

  // save
  saveButton.addEventListener("click", function () {
    if (!hasChanges(toggle, emailInput, fullNameInput)) return;
    saveChanges(toggle, emailInput, fullNameInput, saveButton);
  });

  // cancel (revert UI)
  cancelButton.addEventListener("click", function () {
    toggle.checked = originalSetting;
    emailInput.value = originalEmail;
    fullNameInput.value = originalFullName;
    updateSaveButton(saveButton, toggle, emailInput, fullNameInput);
  });
});

