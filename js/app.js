// =========================================
// VOIDRECORDS LOGIN
// =========================================


// =========================================
// SUPABASE CONFIG
// =========================================

// IMPORTANT:
// Your project URL looks like:
//
// https://YOUR_PROJECT_ID.supabase.co
//
// NOT:
//
// https://YOUR_PROJECT_ID.supabase.co/rest/v1/

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";


const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


let supabaseClient = null;


// =========================================
// START APP
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "VoidRecords starting..."
        );


        // Set up the page immediately.
        // NONE of this waits for Supabase.

        setupLogin();

        setupForgotPassword();

        setupInviteButton();

        setupRememberMe();


        // Start loading animation.

        startLoadingScreen();


        // Start Supabase separately.

        initializeSupabase();

    }
);


// =========================================
// LOADING SCREEN
// =========================================

function startLoadingScreen() {

    const loadingScreen =
        document.getElementById(
            "loadingScreen"
        );


    const progress =
        document.getElementById(
            "loadingProgress"
        );


    const slowMessage =
        document.getElementById(
            "slowMessage"
        );


    const loginPage =
        document.getElementById(
            "loginPage"
        );


    if (!loadingScreen) {
        return;
    }


    let percentage = 0;


    const progressTimer =
        setInterval(
            () => {

                percentage += 5;


                // Stop at 100%.

                if (percentage >= 100) {

                    percentage = 100;

                    clearInterval(
                        progressTimer
                    );

                }


                if (progress) {

                    progress.style.width =
                        percentage + "%";

                }

            },
            45
        );


    // Show the slow message after 5 seconds.

    setTimeout(
        () => {

            if (
                !loadingScreen.classList.contains(
                    "fade-out"
                )
            ) {

                slowMessage?.classList.add(
                    "show"
                );

            }

        },
        5000
    );


    // IMPORTANT:
    // We NEVER wait for Supabase here.

    setTimeout(
        () => {

            loadingScreen.classList.add(
                "fade-out"
            );


            loginPage?.classList.add(
                "ready"
            );


        },
        1500
    );

}


// =========================================
// SUPABASE INITIALIZATION
// =========================================

function initializeSupabase() {

    try {

        if (!window.supabase) {

            console.error(
                "Supabase library did not load."
            );

            return;

        }


        if (
            SUPABASE_URL ===
            "YOUR_SUPABASE_PROJECT_URL"
        ) {

            console.warn(
                "Supabase URL has not been configured."
            );

            return;

        }


        if (
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


        // Check whether a user is already logged in.

        checkExistingSession();


    } catch (error) {

        console.error(
            "Supabase initialization failed:",
            error
        );

    }

}


// =========================================
// EXISTING SESSION
// =========================================

async function checkExistingSession() {

    if (!supabaseClient) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session check failed:",
                error
            );

            return;

        }


        if (
            data &&
            data.session &&
            data.session.user
        ) {

            console.log(
                "Existing session found."
            );


            // Send logged-in user to dashboard.

            window.location.href =
                "./dashboard.html";

        }

    } catch (error) {

        console.error(
            "Session error:",
            error
        );

    }

}


// =========================================
// LOGIN
// =========================================

function setupLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "email"
                );


            const passwordInput =
                document.getElementById(
                    "password"
                );


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const button =
                document.getElementById(
                    "loginButton"
                );


            const buttonText =
                document.getElementById(
                    "loginButtonText"
                );


            if (!email || !password) {

                showLoginMessage(
                    "Please enter your email and password.",
                    "error"
                );

                return;

            }


            if (!supabaseClient) {

                showLoginMessage(
                    "Login service is still starting. Please try again.",
                    "error"
                );

                return;

            }


            try {

                button.disabled = true;


                if (buttonText) {

                    buttonText.textContent =
                        "SIGNING IN...";

                }


                if (message) {

                    message.textContent =
                        "";

                }


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
                        "Login was unsuccessful."
                    );

                }


                // Remember email if requested.

                const remember =
                    document.getElementById(
                        "remember"
                    )?.checked;


                if (remember) {

                    localStorage.setItem(
                        "voidrecords_email",
                        email
                    );

                } else {

                    localStorage.removeItem(
                        "voidrecords_email"
                    );

                }


                console.log(
                    "Login successful."
                );


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

                button.disabled = false;


                if (buttonText) {

                    buttonText.textContent =
                        "SIGN IN";

                }

            }

        }
    );

}


// =========================================
// FORGOT PASSWORD
// =========================================

function setupForgotPassword() {

    const forgotButton =
        document.getElementById(
            "forgotPassword"
        );


    if (!forgotButton) {
        return;
    }


    forgotButton.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "email"
                );


            const email =
                emailInput?.value.trim();


            if (!email) {

                showLoginMessage(
                    "Enter your email address first.",
                    "error"
                );


                emailInput?.focus();

                return;

            }


            if (!supabaseClient) {

                showLoginMessage(
                    "Login service is still starting. Please try again.",
                    "error"
                );

                return;

            }


            try {

                forgotButton.textContent =
                    "SENDING...";


                forgotButton.style.pointerEvents =
                    "none";


                const resetUrl =
                    new URL(
                        "./reset-password.html",
                        window.location.href
                    ).href;


                const {
                    error
                } =
                    await supabaseClient.auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    resetUrl
                            }
                        );


                if (error) {

                    throw error;

                }


                showLoginMessage(
                    "Password reset email sent. Check your email.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                showLoginMessage(
                    error.message ||
                    "Unable to send password reset email.",
                    "error"
                );


            } finally {

                forgotButton.textContent =
                    "Forgot?";


                forgotButton.style.pointerEvents =
                    "";

            }

        }
    );

}


// =========================================
// REMEMBER ME
// =========================================

function setupRememberMe() {

    const emailInput =
        document.getElementById(
            "email"
        );


    const remember =
        document.getElementById(
            "remember"
        );


    if (!emailInput || !remember) {
        return;
    }


    const savedEmail =
        localStorage.getItem(
            "voidrecords_email"
        );


    if (savedEmail) {

        emailInput.value =
            savedEmail;

        remember.checked =
            true;

    }

}


// =========================================
// INVITE BUTTON
// =========================================

function setupInviteButton() {

    const button =
        document.getElementById(
            "requestInviteButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            // Change this to your actual
            // VoidRecords invite page later.

            window.location.href =
                "https://voiddrecords.github.io/";

        }
    );

}


// =========================================
// LOGIN MESSAGE
// =========================================

function showLoginMessage(
    text,
    type = "error"
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
// PASSWORD RESET SESSION
// =========================================

// Supabase handles the recovery session
// when the user arrives through the email.


// =========================================
// AUTH STATE LISTENER
// =========================================

function setupAuthListener() {

    if (!supabaseClient) {
        return;
    }


    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            console.log(
                "Auth event:",
                event
            );


            if (
                event === "SIGNED_IN" &&
                session
            ) {

                window.location.href =
                    "./dashboard.html";

            }

        }
    );

}
