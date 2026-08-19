/* =========================================================
   VOIDRECORDS
   LOGIN + LOADING SYSTEM
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

let supabaseClient = null;


try {

    if (
        typeof supabase !== "undefined" &&
        supabase.createClient
    ) {

        supabaseClient =
            supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                }
            );

        console.log(
            "VoidRecords: Supabase connected."
        );

    }

} catch (error) {

    console.error(
        "Supabase initialization error:",
        error
    );

}


/* =========================================================
   PAGE ELEMENTS
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


/* =========================================================
   LOADING PROGRESS
========================================================= */

let progress = 0;


function setProgress(value) {

    progress = Math.max(
        0,
        Math.min(100, value)
    );


    if (loadingProgress) {

        loadingProgress.style.width =
            progress + "%";

    }

}


/* =========================================================
   SHOW LOGIN PAGE
========================================================= */

function showLoginPage() {

    if (!loginPage) {
        return;
    }


    loginPage.classList.add(
        "ready"
    );

}


/* =========================================================
   HIDE LOADING SCREEN
========================================================= */

function hideLoadingScreen() {

    console.log(
        "VoidRecords: finishing loading."
    );


    setProgress(100);


    /*
     * Make the login page visible.
     */

    showLoginPage();


    /*
     * Fade out loading screen.
     */

    if (loadingScreen) {

        loadingScreen.classList.add(
            "loading-hidden"
        );

    }


    /*
     * Absolute fail-safe.
     *
     * Even if CSS has a problem,
     * remove the loading screen.
     */

    setTimeout(() => {

        if (loadingScreen) {

            loadingScreen.style.display =
                "none";

        }

    }, 700);

}


/* =========================================================
   LOADING BAR ANIMATION
========================================================= */

setProgress(5);


const loadingTimer =
    setInterval(() => {

        if (progress < 90) {

            setProgress(
                progress + 5
            );

        }

    }, 150);


/* =========================================================
   SLOW MESSAGE
========================================================= */

if (slowMessage) {

    slowMessage.style.display =
        "none";


    setTimeout(() => {

        /*
         * Only show the message if
         * we're still loading.
         */

        if (
            loadingScreen &&
            !loadingScreen.classList.contains(
                "loading-hidden"
            )
        ) {

            slowMessage.style.display =
                "block";

        }

    }, 3000);

}


/* =========================================================
   FORCE LOADING TO FINISH
========================================================= */

/*
 * The loading screen can NEVER remain
 * forever.
 *
 * Maximum loading time:
 * 4 seconds.
 */

const maximumLoadingTime =
    setTimeout(() => {

        clearInterval(
            loadingTimer
        );


        hideLoadingScreen();

    }, 4000);


/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

async function checkExistingSession() {

    /*
     * If Supabase isn't available,
     * don't prevent the login page.
     */

    if (!supabaseClient) {

        console.warn(
            "Supabase unavailable."
        );

        return;

    }


    try {

        /*
         * Give Supabase 3 seconds
         * to check the session.
         */

        const result =
            await Promise.race([

                supabaseClient.auth
                    .getSession(),

                new Promise(resolve => {

                    setTimeout(() => {

                        resolve({
                            timedOut: true
                        });

                    }, 3000);

                })

            ]);


        /*
         * Supabase took too long.
         *
         * The normal login screen
         * will appear automatically.
         */

        if (result.timedOut) {

            console.warn(
                "Supabase session check timed out."
            );

            return;

        }


        const {
            data,
            error
        } = result;


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return;

        }


        /*
         * Existing logged-in user.
         */

        if (
            data &&
            data.session
        ) {

            console.log(
                "Existing user:",
                data.session.user.email
            );


            /*
             * Stop loading animation.
             */

            clearInterval(
                loadingTimer
            );


            clearTimeout(
                maximumLoadingTime
            );


            setProgress(100);


            /*
             * Send user to dashboard.
             */

            window.location.href =
                "dashboard.html";


            return;

        }


        console.log(
            "No existing session."
        );

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }

}


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
        async function(event) {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "email"
                );


            const passwordInput =
                document.getElementById(
                    "password"
                );


            const rememberInput =
                document.getElementById(
                    "remember"
                );


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                !email ||
                !password
            ) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            /* -----------------------------------------
               BUTTON
            ----------------------------------------- */

            const loginButton =
                loginForm.querySelector(
                    ".login-button"
                );


            const originalButton =
                loginButton.innerHTML;


            loginButton.disabled =
                true;


            loginButton.innerHTML =
                "<span>SIGNING IN...</span><span>→</span>";


            try {

                if (!supabaseClient) {

                    throw new Error(
                        "Supabase is unavailable."
                    );

                }


                /* -----------------------------------------
                   SIGN IN
                ----------------------------------------- */

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


                /* -----------------------------------------
                   LOGIN ERROR
                ----------------------------------------- */

                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    alert(
                        error.message
                    );


                    loginButton.disabled =
                        false;


                    loginButton.innerHTML =
                        originalButton;


                    return;

                }


                /* -----------------------------------------
                   REMEMBER ME
                ----------------------------------------- */

                if (
                    rememberInput &&
                    rememberInput.checked
                ) {

                    localStorage.setItem(
                        "vr_remember_me",
                        "true"
                    );

                } else {

                    localStorage.removeItem(
                        "vr_remember_me"
                    );

                }


                /* -----------------------------------------
                   SAVE EMAIL
                ----------------------------------------- */

                if (
                    data &&
                    data.user
                ) {

                    localStorage.setItem(
                        "vr_user_email",
                        data.user.email || ""
                    );

                }


                /* -----------------------------------------
                   GO TO DASHBOARD
                ----------------------------------------- */

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                alert(
                    "Unable to sign in. Please check your connection and try again."
                );


                loginButton.disabled =
                    false;


                loginButton.innerHTML =
                    originalButton;

            }

        }
    );

}


/* =========================================================
   REQUEST INVITE
========================================================= */

function requestInvite() {

    window.location.href =
        "https://fiya8.github.io/voidrecords/";

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

const forgotLink =
    document.querySelector(
        ".password-label a"
    );


if (forgotLink) {

    forgotLink.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "email"
                );


            const email =
                emailInput.value.trim();


            if (!email) {

                alert(
                    "Enter your email address first."
                );


                emailInput.focus();


                return;

            }


            if (!supabaseClient) {

                alert(
                    "Supabase is currently unavailable."
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
                                    window.location.origin
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


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "Unable to send the password reset email."
                );

            }

        }
    );

}


/* =========================================================
   AUTH STATE
========================================================= */

if (supabaseClient) {

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            console.log(
                "Auth event:",
                event
            );

        }
    );

}


/* =========================================================
   START
========================================================= */

checkExistingSession();
