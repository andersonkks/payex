document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector(".login-form");
    const registerForm = document.querySelector(".register-form");
    const loginLink = document.getElementById("login-links");
    const registerLink = document.getElementById("register-links");
    const popup = document.getElementById("popup");

    addToggleListener("togglePasswordLogin", "password");
    addToggleListener("togglePasswordRegister", "new-password");
    addToggleListener("toggleConfirmPassword", "confirm-password");

    function addToggleListener(toggleId, inputType) {
        const element = document.getElementById(toggleId);
        if (element) {
            element.addEventListener("click", function() {
                const passwordInput = document.getElementById(inputType);
                const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
                passwordInput.setAttribute("type", type);
            });
        }
    }

    function fade(element, action) {
        let opacity = action === "in" ? 0 : 1;
        const increment = action === "in" ? 0.1 : -0.1;
        const interval = setInterval(() => {
            if (opacity < 0 || opacity > 1) {
                clearInterval(interval);
                if (action === "out") {
                    element.style.display = "none";
                    element.style.pointerEvents = "none";
                }
            }
            element.style.opacity = opacity;
            element.style.filter = `alpha(opacity=${opacity * 100})`;
            opacity += increment;
            if (opacity === 1 && action === "in") {
                element.style.display = "block";
                element.style.pointerEvents = "auto";
            }
        }, 50);
    }

    function fadeIn(element) {
        element.style.opacity = 0;
        element.style.display = "block";
        element.style.pointerEvents = "auto";
        fade(element, "in");
    }

    function showPopup(message, duration = 3000) {
        popup.innerText = message;
        fadeIn(popup);
        setTimeout(() => fade(popup, "out"), duration);
    }

    function handleFormSubmit(event, formType) {
        event.preventDefault();
        const usernameField = document.getElementById(formType === "register" ? "new-username" : "username");
        const passwordField = document.getElementById(formType === "register" ? "new-password" : "password");
        const Username = usernameField.value;
        const Password = passwordField.value;

        if (formType === "register") {
            const emailField = document.getElementById("new-email");
            const confirmPasswordField = document.getElementById("confirm-password");
            const Email = emailField.value;
            const confirmPassword = confirmPasswordField.value;

            if (Password !== confirmPassword) {
                showPopup("As senhas não coincidem.");
                return;
            }

            userData = { Username, Email, Password, Salary: 0, Payments: [] };
            if (localStorage.getItem(Username)) {
                showPopup("Nome de usuário já está em uso.");
                return;
            }

            localStorage.setItem(Username, JSON.stringify(userData));
            showPopup("Usuário registrado com sucesso!");
            document.getElementById("registerForm").querySelector("form").reset();
            fadeIn(loginForm);
            fade(registerForm, "out");
        } else {
            const storedUserData = localStorage.getItem(Username);
            if (storedUserData) {
                userData = JSON.parse(storedUserData);
                if (userData.Password === Password) {
                    showPopup("Login bem-sucedido!");
                    localStorage.setItem("currentUser", Username);
                    window.location.href = "index.html";
                } else {
                    showPopup("Nome de usuário ou senha incorretos.");
                }
            } else {
                showPopup("Nome de usuário ou senha incorretos.");
            }
        }
    }

    registerForm.style.display = "none";
    registerLink.addEventListener("click", event => {
        event.preventDefault();
        fadeIn(registerForm);
        fade(loginForm, "out");
    });

    loginLink.addEventListener("click", event => {
        event.preventDefault();
        fadeIn(loginForm);
        fade(registerForm, "out");
    });

    loginForm.addEventListener("submit", event => handleFormSubmit(event, "login"));
    registerForm.addEventListener("submit", event => handleFormSubmit(event, "register"));
});