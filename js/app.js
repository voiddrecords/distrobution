// =========================================
// VOIDRECORDS LOGIN
// =========================================

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";

let supabaseClient = null;


// =========================================
// PAGE ELEMENTS
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
// SHOW LOGIN PAGE
// =========================================

function showLoginPage() {

    if (loadingProgress) {
        loadingProgress.style.width = "100%";
    }

    if (loginPage) {
        loginPage.classList.add("ready");
    }

    if (loadingScreen) {
        loadingScreen.classList.add("fade-out");
    }

}


// =========================================
// DO NOT WAIT FOR SUPABASE
// =========================================

showLoginPage();


// =========================================
// SUPABASE INITIALIZATION
// =========================================

function initializeSupabase() {

    try {

        if (
            !window.supabase ||
            typeof window.supabase.createClient !== "function"
        ) {

            console.error(
                "Supabase library unavailable."
            );

            return;

        }

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

        console.log(
            "VoidRecords Supabase ready."
        );

    } catch (error) {

        console.error(
            "Supabase initialization failed:",
            error
        );

    }

}


// Initialize AFTER displaying the page.
// It cannot hold up the login screen.

setTimeout(
    initializeSupabase,
    0
);


// =========================================
// LOGIN MESSAGE
// =========================================

function showLoginMessage(message) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        message;

}


// =========================================
// RESET LOGIN BUTTON
// =========================================

function resetLoginButton() {

    if (loginButton) {
        loginButton.disabled = false;
    }

    if (loginButtonText) {
        loginButtonText.textContent =
            "SIGN IN";
    }

    if (loginArrow) {
        loginArrow.textContent =
            "→";
    }

}


// =========================================
// LOGIN
// =========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


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


            // Supabase isn't ready yet.

            if (!supabaseClient) {

                showLoginMessage(
                    "Login service is starting. Please try again."
                );

                return;

            }


            if (loginButton) {
                loginButton.disabled = true;
            }

            if (loginButtonText) {
                loginButtonText.textContent =
                    "SIGNING IN";
            }

            if (loginArrow) {
                loginArrow.textContent =
                    "…";
            }

            showLoginMessage("");


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email: email,

                            password: password

                        });


                if (error) {

                    console.error(
                        "Login error:",
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
                        loginArrow.textContent =
                            "✓";
                    }


                    window.location.href =
                        "./dashboard.html";

                    return;

                }


                showLoginMessage(
                    "Unable to sign in. Please try again."
                );

                resetLoginButton();


            } catch (error) {

                console.error(
                    "Unexpected login error:",
                    error
                );

                showLoginMessage(
                    "Unable to connect to the login service."
                );

                resetLoginButton();

            }

        }
    );

}


// =========================================
// FORGOT PASSWORD
// =========================================

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();


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


            if (!supabaseClient) {

                showLoginMessage(
                    "Password reset is still starting. Please try again."
                );

                return;

            }


            try {

                const {
                    error
                } =
                    await supabaseClient.auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    window.location.origin +
                                    "/distribution/"
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
