document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:8000";

  // switch the login and register forms
  function toggleForms() {
    var loginRadio = document.getElementById("login");
    var registerRadio = document.getElementById("register");
    var loginForm = document.getElementById("loginForm");
    var registerForm = document.getElementById("registerForm");
  
    var showLogin = (loginRadio && loginRadio.checked);
    if (loginForm) {
      if (showLogin) {
        loginForm.classList.remove("hidden");
      } else {
        loginForm.classList.add("hidden");
      }
    }
    if (registerForm) {
      if (showLogin) {
        registerForm.classList.add("hidden");
      } else {
        registerForm.classList.remove("hidden");
      }
    }
  }

  //post the json data to the backend
  function postJSON(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (result) {
      if (!result.ok) {
        throw new Error(result.data.detail || "Request failed");
      }
      return result.data;
    });
  }
//store the authenticated user information and go to the calendar page
  function storeAuthAndGo(data) {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("email", data.email);
    window.location.href = "calendar.html";
  }
//put the functions together
  document.addEventListener("DOMContentLoaded", function () {
    // toggle forms
    var loginRadio = document.getElementById("login");
    var registerRadio = document.getElementById("register");
    if (loginRadio) loginRadio.addEventListener("change", toggleForms);
    if (registerRadio) registerRadio.addEventListener("change", toggleForms);
    toggleForms();
    // password state change written by cursor
    var pwBtns = document.querySelectorAll(".toggle-password");
    for (var i = 0; i < pwBtns.length; i++) {
      pwBtns[i].addEventListener("click", function () {
        var input = this.parentNode.querySelector("input");
        var icon = this.querySelector("i");
        if (!input || !icon) return;
        if (input.type === "password") {
          input.type = "text";
          icon.classList.remove("ri-eye-line");
          icon.classList.add("ri-eye-off-line");
        } else {
          input.type = "password";
          icon.classList.remove("ri-eye-off-line");
          icon.classList.add("ri-eye-line");
        }
      });
    }
    // register form
    var registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var fullName = document.getElementById("regFullName") ? document.getElementById("regFullName").value.trim() : "";
        var email = document.getElementById("regEmail") ? document.getElementById("regEmail").value.trim() : "";
        var password = document.getElementById("regPassword") ? document.getElementById("regPassword").value : "";
        if (email === "" || password === "") {
          alert("Need email and password");
          return;
        }
        postJSON(API_BASE + "/auth/register", {
          email: email,
          password: password,
          full_name: fullName || null
        })
        .then(function (data) {
          storeAuthAndGo(data);
        })
        .catch(function () {
          alert("Register failed");
        });
      });
    }
    // login form
    var loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var emailEl = document.getElementById("loginEmail");
        var passEl = document.getElementById("loginPassword");
        var email = emailEl ? emailEl.value.trim() : "";
        var password = passEl ? passEl.value : "";
        if (email === "" || password === "") {
          alert("Need email and password");
          return;
        }
        postJSON(API_BASE + "/auth/login", {
          email: email,
          password: password
        })
        .then(function (res) {
          storeAuthAndGo(res);
        })
        .catch(function () {
          alert("Login failed");
        });
      });
    }
  });
});