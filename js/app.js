// =========================================
// VOIDRECORDS LOGIN
// =========================================

// =========================================
// SUPABASE CONFIG
// =========================================

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";


// =========================================
// SUPABASE CLIENT
// =========================================

let supabaseClient = null;

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

const requestInviteButton =
    document.getElementById("requestInviteButton");


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
// LOADING SCREEN
// =========================================

let progress = 0;

const loadingInterval =
    setInterval(() => {

        progress += 8;

        if (progress >= 100) {

            progress = 100;

            clearInterval(
                loadingInterval
            );
        }

        if (loadingProgress) {

            loadingProgress.style.width =
                `${progress}%`;
        }

    }, 70);


// =========================================
// FINISH LOADING
// =========================================

function finishLoading() {

    clearInterval(
        loadingInterval
    );

    if (loadingProgress) {

        loadingProgress.style.width =
            "100%";
    }

    // Show login immediately.
    if (loginPage) {

        loginPage.classList.add(
            "ready"
        );
    }

    // Fade loading screen away.
    setTimeout(() => {

        if (loadingScreen) {

            loadingScreen.classList.add(
                "fade-out"
            );
        }

    }, 150);

}


// =========================================
// START IMMEDIATELY
// =========================================

// Do NOT wait for Supabase.
// Do NOT wait for window.load.

setTimeout(
    finishLoading,
    900
);


// =========================================
// SLOW MESSAGE
// =========================================

// Keep this only as a visual fallback.

setTimeout(() => {

    if (
        slowMessage &&
        loadingScreen &&
        !loadingScreen.classList.contains("fade-out")
    ) {

        slowMessage.classList.add(
            "show"
        );
    }

}, 3000);


// =========================================
// INITIALIZE SUPABASE
// =========================================

// This happens separately from loading.

initializeSupabase();


// =========================================
// LOGIN
// =========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // Make sure Supabase exists.

            if (!supabaseClient) {

                showLoginMessage(
                    "Login service is unavailable. Please refresh the page."
                );

                return;
            }


            const emailInput =
                document.getElementById(
                    "email"
                );

            const passwordInput =
                document.getElementById(
                    "password"
                );


            const email =
                emailInput
                    ?.value
                    .trim();

            const password =
                passwordInput
                    ?.value || "";


            // Validate.

            if (!email || !password) {

                showLoginMessage(
                    "Please enter your email and password."
                );

                return;
            }


            // Button loading state.

            if (loginButton) {

                loginButton.disabled =
                    true;
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

                            email:
                                email,

                            password:
                                password

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

                        loginArrow.textContent =
                            "✓";
                    }


                    // Go to dashboard.

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
// RESET LOGIN BUTTON
// =========================================

function resetLoginButton() {

    if (loginButton) {

        loginButton.disabled =
            false;
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
                document.getElementById(
                    "email"
                );


            const email =
                emailInput
                    ?.value
                    .trim();


            if (!email) {

                showLoginMessage(
                    "Enter your email first."
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
                                    window.location.pathname
                                    .replace(
                                        "index.html",
                                        "reset-password.html"
                                    )

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


// =========================================
// REQUEST INVITE
// =========================================

if (requestInviteButton) {

    requestInviteButton.addEventListener(
        "click",
        function() {

            alert(
                "VoidRecords distribution is invite-only. Please contact the label to request access."
            );

        }
    );
}


// =========================================
// DEBUG
// =========================================

console.log(
    "VoidRecords login loaded."
);

console.log(
    "Supabase available:",
    !!supabaseClient
);
