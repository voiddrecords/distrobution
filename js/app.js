// =========================================
// VOIDRECORDS LOGIN
// =========================================
// Supabase is OPTIONAL during page startup.
//
// The loading screen NEVER waits for Supabase.
// The login page appears immediately.
//
// Supabase is initialized in the background.
// =========================================


// =========================================
// SUPABASE CONFIG
// =========================================

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


let supabaseClient = null;

let supabaseReady = false;


// =========================================
// SETTINGS
// =========================================

const LOADING_TIME = 1000;


// =========================================
// PAGE START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "VoidRecords starting..."
        );


        // Set up the login interface immediately.

        setupLogin();

        setupForgotPassword();

        setupInviteButton();

        setupRememberMe();


        // IMPORTANT:
        // Do NOT wait for Supabase here.

        startLoadingScreen();


        // Start Supabase separately.

        initializeSupabase();

    }
);


// =========================================
// LOADING SCREEN
// =========================================
// This function has NOTHING to do with
// Supabase.
// =========================================

function startLoadingScreen() {

    const loadingScreen =
        document.getElementById(
            "loadingScreen"
        );


    const loadingProgress =
        document.getElementById(
            "loadingProgress"
        );


    const loginPage =
        document.getElementById(
            "loginPage"
        );


    if (!loadingScreen) {
        return;
    }


    // Start progress.

    if (loadingProgress) {

        loadingProgress.style.width =
            "0%";


        setTimeout(
            () => {

                loadingProgress.style.width =
                    "45%";

            },
            100
        );


        setTimeout(
            () => {

                loadingProgress.style.width =
                    "80%";

            },
            350
        );


        setTimeout(
            () => {

                loadingProgress.style.width =
                    "100%";

            },
            650
        );

    }


    // ALWAYS finish loading after
    // approximately one second.

    setTimeout(
        () => {

            loadingScreen.classList.add(
                "fade-out"
            );


            if (loginPage) {

                loginPage.classList.add(
                    "ready"
                );

            }


            console.log(
                "VoidRecords interface ready."
            );


        },
        LOADING_TIME
    );


    // Show slow message only if something
    // genuinely takes longer than expected.

    setTimeout(
        () => {

            if (
                !loadingScreen.classList.contains(
                    "fade-out"
                )
            ) {

                const message =
                    document.getElementById(
                        "slowMessage"
                    );


                message?.classList.add(
                    "show"
                );

            }

        },
        3000
    );

}


// =========================================
// SUPABASE INITIALIZATION
// =========================================

async function initializeSupabase() {

    console.log(
        "Starting Supabase in background..."
    );


    // Give the CDN a short amount of time
    // to become available.

    let attempts = 0;

    const maxAttempts = 20;


    while (
        !window.supabase &&
        attempts < maxAttempts
    ) {

        await sleep(100);

        attempts++;

    }


    // Supabase CDN failed.

    if (!window.supabase) {

        console.error(
            "Supabase library failed to load."
        );


        showLoginMessage(
            "Login service is unavailable. Please refresh.",
            "error"
        );


        return;

    }


    // Create Supabase client.

    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        supabaseReady = true;


        console.log(
            "Supabase initialized successfully."
        );


    } catch (error) {

        console.error(
            "Supabase initialization failed:",
            error
        );


        showLoginMessage(
            "Login service could not start.",
            "error"
        );


        return;

    }


    // Check whether the user is already logged in.

    await checkExistingSession();

}


// =========================================
// CHECK EXISTING SESSION
// =========================================

async function checkExistingSession() {

    if (
        !supabaseClient ||
        !supabaseReady
    ) {

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


        const session =
            data?.session;


        if (session) {

            console.log(
                "Existing session found."
            );


            window.location.href =
                "./dashboard.html";

        }

    } catch (error) {

        console.error(
            "Existing session check failed:",
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


            await loginUser(
                form
            );

        }
    );

}


// =========================================
// LOGIN USER
// =========================================

async function loginUser(form) {

    const button =
        document.getElementById(
            "loginButton"
        );


    const buttonText =
        document.getElementById(
            "loginButtonText"
        );


    const arrow =
        document.getElementById(
            "loginArrow"
        );


    clearLoginMessage();


    // Make sure Supabase has had time
    // to initialize.

    if (!supabaseClient) {

        showLoginMessage(
            "Login service is still starting. Please try again in a moment.",
            "error"
        );

        return;

    }


    const formData =
        new FormData(form);


    const email =
        String(
            formData.get("email") || ""
        ).trim();


    const password =
        String(
            formData.get("password") || ""
        );


    const remember =
        document.getElementById(
            "remember"
        )?.checked;


    if (!email || !password) {

        showLoginMessage(
            "Please enter your email and password.",
            "error"
        );

        return;

    }


    // Disable button.

    if (button) {

        button.disabled = true;

    }


    if (buttonText) {

        buttonText.textContent =
            "SIGNING IN...";

    }


    if (arrow) {

        arrow.textContent =
            "•••";

    }


    try {

        console.log(
            "Attempting login..."
        );


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword(
                {
                    email:
                        email,

                    password:
                        password
                }
            );


        if (error) {

            console.error(
                "Login failed:",
                error
            );


            throw new Error(
                getFriendlyAuthError(
                    error
                )
            );

        }


        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "Login failed. No user account was returned."
            );

        }


        // Remember-me behavior.

        if (remember) {

            localStorage.setItem(
                "voidrecords_remember",
                "true"
            );

            localStorage.setItem(
                "voidrecords_email",
                email
            );

        } else {

            localStorage.removeItem(
                "voidrecords_remember"
            );

            localStorage.removeItem(
                "voidrecords_email"
            );

        }


        showLoginMessage(
            "Login successful. Opening dashboard...",
            "success"
        );


        // Small delay so the message is visible.

        setTimeout(
            () => {

                window.location.href =
                    "./dashboard.html";

            },
            400
        );


    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );


        showLoginMessage(
            error.message ||
            "Unable to sign in.",
            "error"
        );


    } finally {

        if (button) {

            button.disabled =
                false;

        }


        if (buttonText) {

            buttonText.textContent =
                "SIGN IN";

        }


        if (arrow) {

            arrow.textContent =
                "→";

        }

    }

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


            clearLoginMessage();


            if (!supabaseClient) {

                showLoginMessage(
                    "Login service is still starting. Please try again.",
                    "error"
                );

                return;

            }


            const emailInput =
                document.getElementById(
                    "email"
                );


            const email =
                emailInput?.value.trim();


            if (!email) {

                showLoginMessage(
                    "Enter your email first, then click Forgot.",
                    "error"
                );

                emailInput?.focus();

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

                    throw error;

                }


                showLoginMessage(
                    "Password reset instructions have been sent to your email.",
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

            }

        }
    );

}


// =========================================
// REMEMBER ME
// =========================================

function setupRememberMe() {

    const remember =
        document.getElementById(
            "remember"
        );


    const emailInput =
        document.getElementById(
            "email"
        );


    if (!remember || !emailInput) {
        return;
    }


    const remembered =
        localStorage.getItem(
            "voidrecords_remember"
        );


    const savedEmail =
        localStorage.getItem(
            "voidrecords_email"
        );


    if (
        remembered === "true" &&
        savedEmail
    ) {

        emailInput.value =
            savedEmail;


        remember.checked =
            true;

    }

}


// =========================================
// REQUEST INVITE
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

            // CHANGE THIS to your actual
            // VoidRecords invite/request page.

            const inviteUrl =
                "https://voiddrecords.github.io/";


            window.location.href =
                inviteUrl;

        }
    );

}


// =========================================
// LOGIN MESSAGE
// =========================================

function showLoginMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "loginMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.style.display =
        "block";


    element.className =
        "login-message " +
        type;

}


// =========================================
// CLEAR LOGIN MESSAGE
// =========================================

function clearLoginMessage() {

    const element =
        document.getElementById(
            "loginMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        "";


    element.style.display =
        "none";

}


// =========================================
// AUTH ERROR TRANSLATOR
// =========================================

function getFriendlyAuthError(
    error
) {

    const message =
        String(
            error?.message || ""
        ).toLowerCase();


    if (
        message.includes(
            "invalid login credentials"
        )
    ) {

        return "Incorrect email or password.";

    }


    if (
        message.includes(
            "email not confirmed"
        )
    ) {

        return "Please confirm your email before signing in.";

    }


    if (
        message.includes(
            "too many requests"
        )
    ) {

        return "Too many login attempts. Please wait a moment and try again.";

    }


    if (
        message.includes(
            "network"
        )
    ) {

        return "Network error. Check your internet connection.";

    }


    return (
        error?.message ||
        "Unable to sign in."
    );

}


// =========================================
// SLEEP
// =========================================

function sleep(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}
