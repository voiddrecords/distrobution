/* =========================================================
   VOIDRECORDS — APP.JS
   Supabase Login + Loading Screen
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

try {

    if (
        typeof window.supabase === "undefined" ||
        typeof window.supabase.createClient !== "function"
    ) {

        throw new Error(
            "Supabase library did not load."
        );

    }


    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            }
        );


    console.log(
        "VoidRecords: Supabase connected."
    );

}
catch (error) {

    console.error(
        "VoidRecords: Supabase connection failed:",
        error
    );

}



/* =========================================================
   LOADING SCREEN
========================================================= */

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

const loadingProgress =
    document.getElementById(
        "loadingProgress"
    );

const slowMessage =
    document.getElementById(
        "slowMessage"
    );

const loginPage =
    document.querySelector(
        ".login-page"
    );


let progress = 0;


/* Progress animation */

function updateProgress(value) {

    progress = Math.min(
        100,
        Math.max(0, value)
    );


    if (loadingProgress) {

        loadingProgress.style.width =
            progress + "%";

    }

}


/* Initial progress */

updateProgress(10);


/* Simulated loading progress */

const progressTimer =
    setInterval(() => {

        if (progress < 85) {

            updateProgress(
                progress + Math.random() * 8
            );

        }

    }, 180);



/* =========================================================
   FINISH LOADING
========================================================= */

function finishLoading() {

    clearInterval(
        progressTimer
    );


    updateProgress(100);


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

    }, 400);

}


/* =========================================================
   SLOW WEBSITE MESSAGE
========================================================= */

setTimeout(() => {

    if (
        loadingScreen &&
        !loadingScreen.classList.contains(
            "fade-out"
        )
    ) {

        if (slowMessage) {

            slowMessage.classList.add(
                "show"
            );

        }

    }

}, 6000);



/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener(
    "load",
    async () => {

        try {

            /*
             * Give the browser a moment to
             * finish loading the page.
             */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );


            updateProgress(100);


            /*
             * Check whether a user is
             * already logged in.
             */

            if (supabaseClient) {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .getSession();


                if (error) {

                    console.error(
                        "Session check failed:",
                        error
                    );

                }


                /*
                 * If already logged in,
                 * send them to dashboard.
                 */

                if (
                    data &&
                    data.session
                ) {

                    window.location.href =
                        "dashboard.html";

                    return;

                }

            }

        }
        catch (error) {

            console.error(
                "Startup error:",
                error
            );

        }


        finishLoading();

    }
);



/* =========================================================
   LOGIN FORM
========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /* Make sure Supabase loaded */

            if (!supabaseClient) {

                alert(
                    "Login system is not connected yet."
                );

                return;

            }


            const email =
                document
                    .getElementById(
                        "email"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "password"
                    )
                    .value;


            const button =
                loginForm.querySelector(
                    ".login-button"
                );


            const originalButtonHTML =
                button.innerHTML;


            /*
             * Basic validation
             */

            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            /*
             * Disable button while
             * logging in.
             */

            button.disabled = true;

            button.innerHTML =
                "<span>CONNECTING...</span><span>→</span>";


            try {

                /*
                 * Supabase email/password login
                 */

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithPassword({
                            email: email,
                            password: password
                        });


                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );

                    alert(
                        error.message
                    );

                    button.disabled = false;

                    button.innerHTML =
                        originalButtonHTML;

                    return;

                }


                /*
                 * Login successful
                 */

                if (
                    data &&
                    data.session
                ) {

                    button.innerHTML =
                        "<span>SIGNED IN</span><span>✓</span>";


                    /*
                     * Send user to dashboard
                     */

                    setTimeout(() => {

                        window.location.href =
                            "dashboard.html";

                    }, 500);

                }

            }
            catch (error) {

                console.error(
                    "Unexpected login error:",
                    error
                );

                alert(
                    "Something went wrong while signing in."
                );


                button.disabled = false;

                button.innerHTML =
                    originalButtonHTML;

            }

        }
    );

}



/* =========================================================
   FORGOT PASSWORD
========================================================= */

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            if (!supabaseClient) {

                alert(
                    "Login system is not connected yet."
                );

                return;

            }


            const emailInput =
                document.getElementById(
                    "email"
                );


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (!email) {

                alert(
                    "Enter your email address first."
                );

                if (emailInput) {

                    emailInput.focus();

                }

                return;

            }


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    window.location.origin +
                                    window.location.pathname
                            }
                        );


                if (error) {

                    alert(
                        error.message
                    );

                    return;

                }


                alert(
                    "Password reset instructions have been sent to your email."
                );

            }
            catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                alert(
                    "Unable to send password reset email."
                );

            }

        }
    );

}



/* =========================================================
   REQUEST INVITE
========================================================= */

const requestInviteButton =
    document.getElementById(
        "requestInviteButton"
    );


if (requestInviteButton) {

    requestInviteButton.addEventListener(
        "click",
        () => {

            alert(
                "VoidRecords is currently invite-only. Please contact the label for an invitation."
            );

        }
    );

}



/* =========================================================
   AUTH STATE LISTENER
========================================================= */

if (supabaseClient) {

    supabaseClient
        .auth
        .onAuthStateChange(
            (event, session) => {

                console.log(
                    "Auth event:",
                    event
                );


                /*
                 * If the user signs in from
                 * somewhere other than the
                 * login form, send them to
                 * the dashboard.
                 */

                if (
                    event === "SIGNED_IN" &&
                    session
                ) {

                    if (
                        !window.location.pathname
                            .toLowerCase()
                            .endsWith(
                                "dashboard.html"
                            )
                    ) {

                        window.location.href =
                            "dashboard.html";

                    }

                }

            }
        );

}
