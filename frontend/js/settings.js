var API_BASE = "http://localhost:8000";
var originalSetting = false;
var originalEmail = "";
var originalFullName = "";


function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return { "Authorization": "Bearer " + getToken() };
}

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
//load the profile
function loadUserProfile(toggleEl, emailEl, nameEl, saveBtn) {
  var token = getToken();
  if (!token) {
    window.location.href = "./login_register.html";
    return;
  }
  fetch(API_BASE + "/profile/me", { headers: authHeaders() })
    .then(function (res) {
      //if the user is not authenticated, redirect to the login page
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "./login_register.html";
        return Promise.reject(); // stop chain
      }
      return res.json();
    })
    .then(function (profile) {
      //if the profile is not found, return
      if (!profile) return;
      originalEmail = profile.email || "";
      originalFullName = profile.full_name || "";
      emailEl.value = originalEmail;
      nameEl.value = originalFullName;
    })
    .finally(function () {
      //the settings to allow the self-care reminder
      var saved = localStorage.getItem("selfCareAISupport");
      if (saved !== null) {
        originalSetting = (saved === "true");
        toggleEl.checked = originalSetting;
      } else {
        originalSetting = toggleEl.checked;
      }
      updateSaveButton(saveBtn, toggleEl, emailEl, nameEl);
    });
}

function saveChanges(toggleEl, emailEl, nameEl, saveBtn) {
  var token = getToken();
  if (!token) {
    window.location.href = "./login_register.html";
    return;
  }

  // update profile only if changed
  var needsProfile = (emailEl.value !== originalEmail) || (nameEl.value !== originalFullName);
  var doProfile = Promise.resolve();
  if (needsProfile) {
    doProfile = fetch(API_BASE + "/profile/me", {
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

//put functions together
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("#selfCareToggle");
  var saveButton = document.querySelector('button[class*="bg-primary"]');
  var cancelButton = document.querySelector('button[class*="text-gray-600"]');
  var emailInput = document.querySelector("#emailInput");
  var fullNameInput = document.querySelector("#fullNameInput");

  //load profile + setting
  loadUserProfile(toggle, emailInput, fullNameInput, saveButton);
  //when users make changes, enale the save button
  toggle.addEventListener("change", function () {
    updateSaveButton(saveButton, toggle, emailInput, fullNameInput);
  });
  emailInput.addEventListener("input", function () {
    updateSaveButton(saveButton, toggle, emailInput, fullNameInput);
  });
  fullNameInput.addEventListener("input", function () {
    updateSaveButton(saveButton, toggle, emailInput, fullNameInput);
  });

  //save the change
  saveButton.addEventListener("click", function () {
    if (!hasChanges(toggle, emailInput, fullNameInput)) return;
    saveChanges(toggle, emailInput, fullNameInput, saveButton);
  });

  //cancel the change
  cancelButton.addEventListener("click", function () {
    toggle.checked = originalSetting;
    emailInput.value = originalEmail;
    fullNameInput.value = originalFullName;
    updateSaveButton(saveButton, toggle, emailInput, fullNameInput);
  });
});

