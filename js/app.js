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

let loadingFinished = false;


const loadingInterval = setInterval(() => {

    if (loadingFinished) {
        return;
    }

    progress += Math.random() * 12;

    if (progress > 90) {
        progress = 90;
    }

    if (loadingProgress) {

        loadingProgress.style.width =
            `${progress}%`;

    }

}, 150);


/* =========================================================
   FINISH LOADING
========================================================= */

function finishLoading() {

    if (loadingFinished) {
        return;
    }

    loadingFinished = true;

    clearInterval(
        loadingInterval
    );


    if (loadingProgress) {

        loadingProgress.style.width =
            "100%";

    }


    setTimeout(() => {

        if (loadingScreen) {

            loadingScreen.classList.add(
                "fade-out"
            );

        }


        if (loginPage) {

            loginPage.classList.add(
                "ready"
            );

        }

    }, 300);

}


/* =========================================================
   START WEBSITE
========================================================= */

/*
    IMPORTANT:

    We do NOT wait for window "load".

    External resources such as Supabase,
    fonts, images, etc. can cause that event
    to take too long.

    DOMContentLoaded is enough to display
    the login page.
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setTimeout(() => {

            finishLoading();

        }, 500);

    }
);


/* =========================================================
   SAFETY FALLBACK
========================================================= */

/*
    If something unexpected happens,
    never leave the user stuck on the
    loading screen forever.
*/

setTimeout(() => {

    finishLoading();

}, 5000);


/* =========================================================
   SLOW MESSAGE
========================================================= */

setTimeout(() => {

    if (
        !loadingFinished &&
        slowMessage
    ) {

        slowMessage.classList.add(
            "show"
        );

    }

}, 3000);


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
   SHOW LOGIN MESSAGE
========================================================= */

function showLoginMessage(
    message
) {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent =
        message;

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
               CHECK CONNECTION
            ----------------------------------------- */

            if (!supabaseClient) {

                showLoginMessage(
                    "Login system is not connected yet."
                );

                return;

            }


            /* -----------------------------------------
               GET FORM VALUES
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
               VALIDATE
            ----------------------------------------- */

            if (
                !email ||
                !password
            ) {

                showLoginMessage(
                    "Please enter your email and password."
                );

                return;

            }


            /* -----------------------------------------
               LOADING STATE
            ----------------------------------------- */

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


            /* -----------------------------------------
               SUPABASE AUTHENTICATION
            ----------------------------------------- */

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


                /* -----------------------------------------
                   LOGIN FAILED
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


                    return;

                }


                /* -----------------------------------------
                   LOGIN SUCCESSFUL
                ----------------------------------------- */

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


                    /*
                        Send user to dashboard.
                    */

                    window.location.href =
                        "./dashboard.html";

                }

            } catch (error) {

                console.error(
                    "VoidRecords authentication error:",
                    error
                );


                showLoginMessage(
                    "Unable to connect to the login system."
                );


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
