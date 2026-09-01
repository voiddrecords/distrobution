// =========================================
// VOIDRECORDS LOGIN SYSTEM
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

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "VoidRecords login page started."
        );


        // Set up login immediately.

        setupLogin();

        setupForgotPassword();

        setupRememberMe();

        setupInviteButton();


        // Supabase starts separately.

        initializeSupabase();

    }
);


// =========================================
// SUPABASE INITIALIZATION
// =========================================

function initializeSupabase() {

    /*
     * IMPORTANT:
     *
     * This function does NOT control
     * the loading screen.
     */

    if (!window.supabase) {

        console.error(
            "Supabase library did not load."
        );

        return;

    }


    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        console.log(
            "Supabase initialized."
        );


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


        if (data?.session) {

            console.log(
                "Existing session detected."
            );


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
// LOGIN SETUP
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
        async function (event) {

            event.preventDefault();


            await loginUser(
                form
            );

        }
    );

}


// =========================================
// LOGIN
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


    // =========================================
    // CHECK SUPABASE
    // =========================================

    if (!supabaseClient) {

        showLoginMessage(
            "Login service is unavailable. Please refresh and try again.",
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


    // =========================================
    // VALIDATION
    // =========================================

    if (!email) {

        showLoginMessage(
            "Please enter your email.",
            "error"
        );

        return;

    }


    if (!password) {

        showLoginMessage(
            "Please enter your password.",
            "error"
        );

        return;

    }


    // =========================================
    // BUTTON LOADING
    // =========================================

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
            "Signing in..."
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

            throw error;

        }


        if (!data?.user) {

            throw new Error(
                "Login failed."
            );

        }


        // =========================================
        // REMEMBER ME
        // =========================================

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
            "Login successful.",
            "success"
        );


        // =========================================
        // GO TO DASHBOARD
        // =========================================

        setTimeout(
            function () {

                window.location.href =
                    "./dashboard.html";

            },
            300
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showLoginMessage(
            getFriendlyAuthError(
                error
            ),
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
        async function (event) {

            event.preventDefault();


            clearLoginMessage();


            if (!supabaseClient) {

                showLoginMessage(
                    "Login service is unavailable. Please try again.",
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
                    "Enter your email first.",
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
                    "Password reset instructions sent.",
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

    const emailInput =
        document.getElementById(
            "email"
        );


    const remember =
        document.getElementById(
            "remember"
        );


    if (
        !emailInput ||
        !remember
    ) {

        return;

    }


    const savedEmail =
        localStorage.getItem(
            "voidrecords_email"
        );


    const shouldRemember =
        localStorage.getItem(
            "voidrecords_remember"
        );


    if (
        savedEmail &&
        shouldRemember === "true"
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
        function () {

            /*
             * Change this URL to your
             * actual VoidRecords invite page.
             */

            window.location.href =
                "https://voiddrecords.github.io/";

        }
    );

}


// =========================================
// LOGIN MESSAGE
// =========================================

function showLoginMessage(
    message,
    type
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
        (type || "error");

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
// FRIENDLY AUTH ERRORS
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

        return "Too many attempts. Please wait and try again.";

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
