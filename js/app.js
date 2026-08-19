/* =========================================================
   VOIDRECORDS — SUPABASE LOGIN SYSTEM
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";


/* =========================================================
   CREATE SUPABASE CLIENT
========================================================= */

let supabaseClient = null;

if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

}


/* =========================================================
   ELEMENTS
========================================================= */

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

const requestInviteButton =
    document.getElementById("requestInviteButton");

const forgotPassword =
    document.getElementById("forgotPassword");


/* =========================================================
   LOADING SCREEN
========================================================= */

let progress = 0;

const loadingInterval = setInterval(() => {

    progress += Math.random() * 12;

    if (progress > 90) {
        progress = 90;
    }

    if (loadingProgress) {
        loadingProgress.style.width = `${progress}%`;
    }

}, 150);


/* =========================================================
   FINISH LOADING
========================================================= */

function finishLoading() {

    clearInterval(loadingInterval);

    if (loadingProgress) {
        loadingProgress.style.width = "100%";
    }

    setTimeout(() => {

        if (loadingScreen) {
            loadingScreen.classList.add("fade-out");
        }

        if (loginPage) {
            loginPage.classList.add("ready");
        }

    }, 300);

}


/* =========================================================
   SLOW MESSAGE
========================================================= */

setTimeout(() => {

    if (slowMessage) {
        slowMessage.classList.add("show");
    }

}, 5000);


/* =========================================================
   START WEBSITE
========================================================= */

window.addEventListener("load", () => {

    finishLoading();

});


/* =========================================================
   CHECK SUPABASE
========================================================= */

if (!supabaseClient) {

    console.error(
        "VoidRecords: Supabase failed to initialize."
    );

    if (loginMessage) {

        loginMessage.textContent =
            "Login system is not connected yet.";

    }

}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showLoginMessage(message) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* -----------------------------------------
               Check connection
            ----------------------------------------- */

            if (!supabaseClient) {

                showLoginMessage(
                    "Login system is not connected yet."
                );

                return;

            }


            /* -----------------------------------------
               Get form values
            ----------------------------------------- */

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;


            /* -----------------------------------------
               Validate
            ----------------------------------------- */

            if (!email || !password) {

                showLoginMessage(
                    "Please enter your email and password."
                );

                return;

            }


            /* -----------------------------------------
               Loading state
            ----------------------------------------- */

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


            /* -----------------------------------------
               Supabase authentication
            ----------------------------------------- */

            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            /* -----------------------------------------
               Login failed
            ----------------------------------------- */

            if (error) {

                console.error(
                    "VoidRecords login error:",
                    error
                );

                showLoginMessage(
                    error.message
                );

                if (loginButton) {
                    loginButton.disabled = false;
                }

                if (loginButtonText) {
                    loginButtonText.textContent = "SIGN IN";
                }

                if (loginArrow) {
                    loginArrow.textContent = "→";
                }

                return;

            }


            /* -----------------------------------------
               Login successful
            ----------------------------------------- */

            if (data && data.session) {

                if (loginButtonText) {
                    loginButtonText.textContent = "SUCCESS";
                }

                if (loginArrow) {
                    loginArrow.textContent = "✓";
                }


                /*
                 * Send the user to the dashboard.
                 */

                window.location.href =
                    "./dashboard.html";

            }

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            if (!supabaseClient) {

                showLoginMessage(
                    "Login system is not connected yet."
                );

                return;

            }


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            if (!email) {

                showLoginMessage(
                    "Enter your email first."
                );

                return;

            }


            const {
                error
            } =
                await supabaseClient.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo:
                            window.location.origin +
                            "/reset-password.html"
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

        }
    );

}


/* =========================================================
   REQUEST INVITE
========================================================= */

if (requestInviteButton) {

    requestInviteButton.addEventListener(
        "click",
        function () {

            alert(
                "VoidRecords distribution is invite-only. Please contact the label to request access."
            );

        }
    );

}


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "VoidRecords app loaded."
);

console.log(
    "Supabase connected:",
    !!supabaseClient
);
