/* =========================================================
   VOIDRECORDS — LOGIN / AUTHENTICATION
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE";


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

        slowMessage.style.display =
            "block";

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


        const {
            data: {
                session
            },
            error
        } =
            await supabaseClient.auth.getSession();


        setProgress(40);


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

            setProgress(100);

            finishLoading();

            return;

        }


        /* -----------------------------------------
           USER IS ALREADY LOGGED IN
        ----------------------------------------- */

        console.log(
            "Existing session:",
            session.user.email
        );


        setProgress(55);


        /*
         * The user already has a valid Supabase
         * session, so send them directly to
         * their dashboard.
         */

        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "Loading error:",
            error
        );

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
                   GET USER PROFILE
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


                if (profileError) {

                    console.error(
                        "Profile error:",
                        profileError
                    );


                    /*
                     * Authentication worked,
                     * but there isn't a profile
                     * connected to this account.
                     */

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
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setProgress(5);

        checkExistingSession();

    }
);
