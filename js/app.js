/* =========================================================
   VOIDRECORDS — LOGIN / AUTHENTICATION
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

const { createClient } = supabase;

const supabaseClient = createClient(
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


/* =========================================================
   LOADING SCREEN
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const loadingProgress =
    document.getElementById("loadingProgress");

const slowMessage =
    document.getElementById("slowMessage");


let progress = 0;
let loadingFinished = false;


/* =========================================================
   LOADING PROGRESS
========================================================= */

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
   SLOW WEBSITE MESSAGE
========================================================= */

if (slowMessage) {

    slowMessage.style.display = "none";

}


setTimeout(() => {

    if (
        !loadingFinished &&
        slowMessage
    ) {

        slowMessage.style.display = "block";

    }

}, 8000);


/* =========================================================
   FINISH LOADING
========================================================= */

function finishLoading() {

    if (loadingFinished) {
        return;
    }

    loadingFinished = true;

    setProgress(100);


    setTimeout(() => {

        if (loadingScreen) {

            loadingScreen.classList.add(
                "loading-hidden"
            );

        }

    }, 600);

}


/* =========================================================
   CHECK EXISTING SESSION
========================================================= */

async function checkExistingSession() {

    try {

        setProgress(15);


        /*
         * Give Supabase a maximum of 5 seconds.
         * If it takes longer, show the login page
         * instead of leaving the loading screen stuck.
         */

        const sessionRequest =
            supabaseClient.auth.getSession();


        const timeout =
            new Promise((resolve) => {

                setTimeout(() => {

                    resolve(null);

                }, 5000);

            });


        const result =
            await Promise.race([
                sessionRequest,
                timeout
            ]);


        /* -----------------------------------------
           SUPABASE TOOK TOO LONG
        ----------------------------------------- */

        if (!result) {

            console.warn(
                "Supabase is taking too long. Showing login screen."
            );

            setProgress(100);

            finishLoading();

            return;

        }


        const {
            data: {
                session
            },
            error
        } = result;


        setProgress(50);


        /* -----------------------------------------
           SESSION ERROR
        ----------------------------------------- */

        if (error) {

            console.error(
                "Session error:",
                error
            );

            finishLoading();

            return;

        }


        /* -----------------------------------------
           NO USER LOGGED IN
        ----------------------------------------- */

        if (!session) {

            console.log(
                "No active session."
            );

            setProgress(100);

            finishLoading();

            return;

        }


        /* -----------------------------------------
           USER ALREADY LOGGED IN
        ----------------------------------------- */

        console.log(
            "Existing session:",
            session.user.email
        );


        setProgress(100);


        /*
         * User already has an active Supabase
         * session, so send them directly
         * to their dashboard.
         */

        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "Loading error:",
            error
        );


        /*
         * Never leave the user trapped
         * on the loading screen.
         */

        setProgress(100);

        finishLoading();

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
               LOGIN BUTTON
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

                setProgress(20);


                /* -----------------------------------------
                   SUPABASE LOGIN
                ----------------------------------------- */

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email: email,

                            password: password

                        });


                /* -----------------------------------------
                   LOGIN FAILED
                ----------------------------------------- */

                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    alert(
                        "Invalid email or password."
                    );


                    loginButton.disabled =
                        false;


                    loginButton.innerHTML =
                        originalButton;


                    return;

                }


                setProgress(50);


                const user =
                    data.user;


                if (!user) {

                    throw new Error(
                        "No user returned from Supabase."
                    );

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


                setProgress(65);


                /* -----------------------------------------
                   GET PROFILE
                ----------------------------------------- */

                const {
                    data: profile,
                    error: profileError
                } =
                    await supabaseClient
                        .from("profiles")
                        .select("*")
                        .eq(
                            "id",
                            user.id
                        )
                        .single();


                /* -----------------------------------------
                   PROFILE NOT FOUND
                ----------------------------------------- */

                if (profileError) {

                    console.error(
                        "Profile error:",
                        profileError
                    );


                    alert(
                        "Your account was found, but your VoidRecords profile could not be found."
                    );


                    await supabaseClient.auth.signOut();


                    loginButton.disabled =
                        false;


                    loginButton.innerHTML =
                        originalButton;


                    return;

                }


                setProgress(80);


                /* -----------------------------------------
                   SAVE USER INFORMATION
                ----------------------------------------- */

                localStorage.setItem(
                    "vr_user_email",
                    user.email || ""
                );


                localStorage.setItem(
                    "vr_first_name",
                    profile.first_name || ""
                );


                localStorage.setItem(
                    "vr_last_name",
                    profile.last_name || ""
                );


                localStorage.setItem(
                    "vr_artist_name",
                    profile.artist_name || ""
                );


                localStorage.setItem(
                    "vr_role",
                    profile.role || "artist"
                );


                setProgress(95);


                /* -----------------------------------------
                   GO TO DASHBOARD
                ----------------------------------------- */

                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 300);


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                alert(
                    "Something went wrong while signing in."
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
   REQUEST AN INVITE
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

                    console.error(
                        error
                    );


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
   AUTH STATE LISTENER
========================================================= */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        console.log(
            "Supabase auth:",
            event
        );

    }
);


/* =========================================================
   START WEBSITE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setProgress(5);

        checkExistingSession();

    }
);
