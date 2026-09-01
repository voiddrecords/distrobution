// =========================================
// VOIDRECORDS LOGIN
// =========================================

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";

let supabaseClient = null;


// =========================================
// ELEMENTS
// =========================================

const loadingScreen =
    document.getElementById("loadingScreen");

const loadingProgress =
    document.getElementById("loadingProgress");

const slowMessage =
    document.getElementById("slowMessage");

const loginPage =
    document.querySelector(".login-page");

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginArrow =
    document.getElementById("loginArrow");

const loginMessage =
    document.getElementById("loginMessage");

const forgotPassword =
    document.getElementById("forgotPassword");


// =========================================
// START PAGE IMMEDIATELY
// =========================================

function showPage() {

    if (loadingProgress) {
        loadingProgress.style.width = "100%";
    }

    if (loginPage) {
        loginPage.classList.add("ready");
    }

    setTimeout(() => {

        if (loadingScreen) {
            loadingScreen.classList.add("fade-out");
        }

    }, 150);

}


// Never wait for Supabase.
setTimeout(showPage, 900);


// =========================================
// SLOW MESSAGE
// =========================================

setTimeout(() => {

    if (
        slowMessage &&
        loadingScreen &&
        !loadingScreen.classList.contains("fade-out")
    ) {

        slowMessage.classList.add("show");

    }

}, 3000);


// =========================================
// SUPABASE
// =========================================

function initializeSupabase() {

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "Supabase JavaScript library did not load."
        );

        return false;

    }

    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

        console.log(
            "VoidRecords: Supabase initialized."
        );

        return true;

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        return false;

    }

}


// Initialize separately.
// The page does NOT wait for this.

initializeSupabase();


// =========================================
// LOGIN MESSAGE
// =========================================

function showLoginMessage(message) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;

}


// =========================================
// LOGIN
// =========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!supabaseClient) {

                showLoginMessage(
                    "Login service is unavailable. Please refresh."
                );

                return;

            }


            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");


            const email =
                emailInput?.value.trim();

            const password =
                passwordInput?.value || "";


            if (!email || !password) {

                showLoginMessage(
                    "Please enter your email and password."
                );

                return;

            }


            // Button loading

            if (loginButton) {
                loginButton.disabled = true;
            }

            if (loginButtonText) {
                loginButtonText.textContent = "SIGNING IN";
            }

            if (loginArrow) {
                loginArrow.textContent = "…";
            }


            showLoginMessage("");


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({

                        email: email,

                        password: password

                    });


                if (error) {

                    console.error(
                        "VoidRecords login error:",
                        error
                    );

                    showLoginMessage(
                        error.message
                    );

                    resetLoginButton();

                    return;

                }


                if (
                    data &&
                    data.session
                ) {

                    if (loginButtonText) {
                        loginButtonText.textContent =
                            "SUCCESS";
                    }

                    if (loginArrow) {
                        loginArrow.textContent = "✓";
                    }


                    window.location.href =
                        "./dashboard.html";

                    return;

                }


                showLoginMessage(
                    "Login failed. Please try again."
                );

                resetLoginButton();


            } catch (error) {

                console.error(
                    "Unexpected login error:",
                    error
                );

                showLoginMessage(
                    "Unable to sign in. Please try again."
                );

                resetLoginButton();

            }

        }
    );

}


// =========================================
// RESET BUTTON
// =========================================

function resetLoginButton() {

    if (loginButton) {
        loginButton.disabled = false;
    }

    if (loginButtonText) {
        loginButtonText.textContent = "SIGN IN";
    }

    if (loginArrow) {
        loginArrow.textContent = "→";
    }

}


// =========================================
// FORGOT PASSWORD
// =========================================

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();


            if (!supabaseClient) {

                showLoginMessage(
                    "Password reset is currently unavailable."
                );

                return;

            }


            const emailInput =
                document.getElementById("email");

            const email =
                emailInput?.value.trim();


            if (!email) {

                showLoginMessage(
                    "Enter your email address first."
                );

                return;

            }


            try {

                const {
                    error
                } =
                    await supabaseClient.auth.resetPasswordForEmail(
                        email,
                        {
                            redirectTo:
                                window.location.origin +
                                window.location.pathname
                        }
                    );


                if (error) {

                    showLoginMessage(
                        error.message
                    );

                    return;

                }


                showLoginMessage(
                    "Password reset email sent."
                );


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                showLoginMessage(
                    "Unable to send password reset email."
                );

            }

        }
    );

}
