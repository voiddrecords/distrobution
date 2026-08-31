// =========================================
// VOIDRECORDS LOGIN
// =========================================

// =========================================
// SUPABASE CONFIG
// =========================================

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";

let supabaseClient = null;


// =========================================
// PAGE START
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("VoidRecords starting...");

    // IMPORTANT:
    // Loading screen does NOT wait for Supabase.

    startLoadingScreen();

    setupLogin();

    setupForgotPassword();

    setupInviteButton();

    // Start Supabase separately in the background.
    initializeSupabase();

});


// =========================================
// LOADING SCREEN
// =========================================

function startLoadingScreen() {

    const loadingScreen =
        document.getElementById("loadingScreen");

    const progress =
        document.getElementById("loadingProgress");

    const slowMessage =
        document.getElementById("slowMessage");


    if (!loadingScreen) {
        return;
    }


    // Start immediately.

    loadingScreen.style.display = "flex";


    let value = 0;


    const interval =
        setInterval(() => {

            value += 5;


            if (progress) {

                progress.style.width =
                    `${value}%`;

            }


            // Finish after roughly 1 second.

            if (value >= 100) {

                clearInterval(interval);

                finishLoadingScreen();

            }

        }, 50);


    // We no longer display a "waiting for Supabase"
    // message because Supabase is not part of loading.


    if (slowMessage) {

        slowMessage.style.display =
            "none";

    }

}


// =========================================
// FINISH LOADING SCREEN
// =========================================

function finishLoadingScreen() {

    const loadingScreen =
        document.getElementById("loadingScreen");


    if (!loadingScreen) {
        return;
    }


    loadingScreen.classList.add(
        "loading-finished"
    );


    setTimeout(() => {

        loadingScreen.style.display =
            "none";

    }, 350);

}


// =========================================
// SUPABASE INITIALIZATION
// =========================================

function initializeSupabase() {

    try {

        if (!window.supabase) {

            console.warn(
                "Supabase library is not available."
            );

            return;

        }


        if (
            !SUPABASE_URL ||
            SUPABASE_URL ===
                "YOUR_SUPABASE_PROJECT_URL"
        ) {

            console.warn(
                "Supabase URL has not been configured."
            );

            return;

        }


        if (
            !SUPABASE_PUBLISHABLE_KEY ||
            SUPABASE_PUBLISHABLE_KEY ===
                "YOUR_SUPABASE_PUBLISHABLE_KEY"
        ) {

            console.warn(
                "Supabase publishable key has not been configured."
            );

            return;

        }


        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        console.log(
            "Supabase initialized."
        );


    } catch (error) {

        console.error(
            "Supabase initialization failed:",
            error
        );

    }

}


// =========================================
// LOGIN
// =========================================

function setupLogin() {

    const form =
        document.getElementById("loginForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    ?.value;


            const remember =
                document
                    .getElementById("remember")
                    ?.checked;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const button =
                document.getElementById(
                    "loginButton"
                );


            if (!email || !password) {

                showLoginMessage(
                    "Please enter your email and password.",
                    "error"
                );

                return;

            }


            // If Supabase hasn't finished initializing,
            // wait only briefly instead of freezing forever.

            if (!supabaseClient) {

                showLoginMessage(
                    "Login system is still starting. Please try again in a moment.",
                    "error"
                );

                return;

            }


            if (button) {

                button.disabled = true;

            }


            const buttonText =
                document.getElementById(
                    "loginButtonText"
                );


            if (buttonText) {

                buttonText.textContent =
                    "SIGNING IN...";

            }


            if (message) {

                message.textContent =
                    "";

            }


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


                if (error) {

                    throw error;

                }


                if (
                    !data ||
                    !data.user
                ) {

                    throw new Error(
                        "Unable to sign in."
                    );

                }


                // Remember-me functionality.

                if (remember) {

                    localStorage.setItem(
                        "voidrecords_remember_email",
                        email
                    );

                } else {

                    localStorage.removeItem(
                        "voidrecords_remember_email"
                    );

                }


                // Go to dashboard.

                window.location.href =
                    "./dashboard.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showLoginMessage(
                    error.message ||
                    "Unable to sign in.",
                    "error"
                );


            } finally {

                if (button) {

                    button.disabled = false;

                }


                if (buttonText) {

                    buttonText.textContent =
                        "SIGN IN";

                }

            }

        }
    );


    // Restore remembered email.

    const rememberedEmail =
        localStorage.getItem(
            "voidrecords_remember_email"
        );


    const emailInput =
        document.getElementById("email");


    if (
        rememberedEmail &&
        emailInput
    ) {

        emailInput.value =
            rememberedEmail;

    }


    const rememberCheckbox =
        document.getElementById(
            "remember"
        );


    if (
        rememberedEmail &&
        rememberCheckbox
    ) {

        rememberCheckbox.checked =
            true;

    }

}


// =========================================
// LOGIN MESSAGE
// =========================================

function showLoginMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        "login-message " +
        type;

}


// =========================================
// FORGOT PASSWORD
// =========================================

function setupForgotPassword() {

    const button =
        document.getElementById(
            "forgotPassword"
        );


    button?.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            if (!supabaseClient) {

                showLoginMessage(
                    "Login system is still starting. Please try again.",
                    "error"
                );

                return;

            }


            const email =
                document
                    .getElementById("email")
                    ?.value
                    .trim();


            if (!email) {

                showLoginMessage(
                    "Enter your email address first.",
                    "error"
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
                                    "/distribution/reset-password.html"
                            }
                        );


                if (error) {

                    throw error;

                }


                showLoginMessage(
                    "Password reset email sent.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                showLoginMessage(
                    error.message ||
                    "Unable to send reset email.",
                    "error"
                );

            }

        }
    );

}


// =========================================
// REQUEST INVITE
// =========================================

function setupInviteButton() {

    const button =
        document.getElementById(
            "requestInviteButton"
        );


    button?.addEventListener(
        "click",
        () => {

            // Change this to your actual
            // VoidRecords invite/request page.

            window.location.href =
                "https://voiddrecords.github.io/";

        }
    );

}
