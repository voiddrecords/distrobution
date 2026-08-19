/* =====================================================
   VOIDRECORDS APP
===================================================== */


/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

/*
    Use your PUBLIC / PUBLISHABLE Supabase key here.

    DO NOT put your Supabase SECRET key in this file.
*/

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_PUBLISHABLE_KEY_HERE";


let supabaseClient = null;


/* =====================================================
   INITIALIZE SUPABASE
===================================================== */

function initializeSupabase() {

    try {

        if (
            typeof window.supabase === "undefined"
        ) {

            console.warn(
                "Supabase library has not loaded."
            );

            return false;
        }

        if (
            SUPABASE_PUBLISHABLE_KEY ===
            "YOUR_PUBLISHABLE_KEY_HERE"
        ) {

            console.warn(
                "Supabase publishable key has not been added."
            );

            return false;
        }

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
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


/* =====================================================
   LOADING SCREEN
===================================================== */

const loadingScreen =
    document.getElementById("loadingScreen");

const loadingProgress =
    document.getElementById("loadingProgress");

const slowMessage =
    document.getElementById("slowMessage");

const loginPage =
    document.querySelector(".login-page");


let loadingValue = 0;


/* =====================================================
   LOADING BAR
===================================================== */

function updateLoadingBar(value) {

    loadingValue =
        Math.max(
            0,
            Math.min(100, value)
        );

    if (loadingProgress) {

        loadingProgress.style.width =
            loadingValue + "%";
    }
}


/* =====================================================
   FINISH LOADING
===================================================== */

function finishLoading() {

    updateLoadingBar(100);

    setTimeout(() => {

        if (loginPage) {

            loginPage.classList.add("ready");
        }

        if (loadingScreen) {

            loadingScreen.classList.add(
                "fade-out"
            );
        }

    }, 250);
}


/* =====================================================
   SLOW WEBSITE MESSAGE
===================================================== */

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


/* =====================================================
   LOADING PROGRESS
===================================================== */

let progressInterval =
    setInterval(() => {

        if (loadingValue < 90) {

            updateLoadingBar(
                loadingValue + 2
            );
        }

    }, 120);


/* =====================================================
   CHECK EXISTING SESSION
===================================================== */

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
                "Session error:",
                error
            );

            return;
        }

        const session =
            data?.session;

        if (session) {

            console.log(
                "Existing login found."
            );

            /*
                We do NOT redirect immediately here
                unless dashboard.html exists.
            */

            window.location.href =
                "dashboard.html";
        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );
    }
}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const remember =
                document
                    .getElementById("remember")
                    .checked;

            const loginButton =
                document
                    .getElementById("loginButton");


            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            if (!supabaseClient) {

                alert(
                    "Login system is not connected yet."
                );

                return;
            }


            try {

                loginButton.disabled = true;

                loginButton
                    .querySelector("span")
                    .textContent =
                    "SIGNING IN...";


                /*
                    Supabase manages the actual
                    authentication session.

                    The Remember Me option controls
                    whether we keep the browser session.
                */

                if (!remember) {

                    /*
                        Session storage is not directly
                        configurable through the browser
                        client in every Supabase setup.

                        We mark the preference locally
                        and clear it when the browser
                        session ends.
                    */

                    sessionStorage.setItem(
                        "vr_session_mode",
                        "session"
                    );

                    localStorage.removeItem(
                        "vr_remember"
                    );

                } else {

                    localStorage.setItem(
                        "vr_remember",
                        "true"
                    );

                }


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

                    throw error;
                }


                if (!data?.session) {

                    throw new Error(
                        "Login succeeded but no session was returned."
                    );
                }


                /*
                    Login successful.
                */

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to sign in."
                );


                loginButton.disabled =
                    false;

                loginButton
                    .querySelector("span")
                    .textContent =
                    "SIGN IN";
            }

        }
    );
}


/* =====================================================
   FORGOT PASSWORD
===================================================== */

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            if (!email) {

                alert(
                    "Enter your email address first."
                );

                return;
            }


            if (!supabaseClient) {

                alert(
                    "Login system is not connected."
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

                    throw error;
                }


                alert(
                    "Password reset instructions have been sent to your email."
                );


            } catch (error) {

                console.error(
                    error
                );

                alert(
                    error.message ||
                    "Unable to send password reset email."
                );
            }

        }
    );
}


/* =====================================================
   REQUEST INVITE
===================================================== */

const requestInviteButton =
    document.getElementById(
        "requestInviteButton"
    );


if (requestInviteButton) {

    requestInviteButton.addEventListener(
        "click",
        function() {

            alert(
                "Invite requests will be available soon."
            );

        }
    );
}


/* =====================================================
   STARTUP
===================================================== */

async function startVoidRecords() {

    updateLoadingBar(10);


    /*
        Initialize Supabase.
    */

    initializeSupabase();

    updateLoadingBar(30);


    /*
        Give the browser a moment to finish
        loading the page and CSS.
    */

    await new Promise(
        resolve =>
            setTimeout(resolve, 300)
    );

    updateLoadingBar(55);


    /*
        Check for an existing login.
    */

    await checkExistingSession();

    updateLoadingBar(80);


    /*
        Finish regardless of whether
        Supabase has an error.
    */

    clearInterval(
        progressInterval
    );

    finishLoading();
}


/* =====================================================
   EMERGENCY FAILSAFE
===================================================== */

setTimeout(() => {

    if (
        loadingScreen &&
        !loadingScreen.classList.contains(
            "fade-out"
        )
    ) {

        console.warn(
            "Loading timeout. Showing login page."
        );

        clearInterval(
            progressInterval
        );

        finishLoading();
    }

}, 10000);


/* =====================================================
   RUN
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startVoidRecords
    );

} else {

    startVoidRecords();
}
