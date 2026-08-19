/* =========================================================
   VOIDRECORDS
   Authentication System
   ========================================================= */

/* -------------------------
   SUPABASE CONFIG
------------------------- */

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";


/* -------------------------
   SUPABASE CLIENT
------------------------- */

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

const loadingLogo =
    document.getElementById("loadingLogo");

const loadingWarning =
    document.getElementById("loadingWarning");

const loadingBar =
    document.getElementById("loadingBar");

let loadingProgress = 0;
let loadingFinished = false;


/* -------------------------
   Loading progress
------------------------- */

function updateLoadingProgress(amount) {

    loadingProgress += amount;

    if (loadingProgress > 100) {
        loadingProgress = 100;
    }

    if (loadingBar) {
        loadingBar.style.width =
            loadingProgress + "%";
    }
}


/* -------------------------
   Slow loading warning
------------------------- */

setTimeout(() => {

    if (!loadingFinished && loadingWarning) {

        loadingWarning.style.display = "block";

    }

}, 8000);


/* -------------------------
   Hide loading screen
------------------------- */

function finishLoading() {

    if (loadingFinished) return;

    loadingFinished = true;

    updateLoadingProgress(100);

    setTimeout(() => {

        if (loadingScreen) {

            loadingScreen.classList.add("loading-hidden");

        }

    }, 500);

}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

async function checkUser() {

    try {

        updateLoadingProgress(20);

        const {
            data: {
                session
            },
            error
        } = await supabaseClient.auth.getSession();

        updateLoadingProgress(30);


        if (error) {

            console.error(
                "Session error:",
                error
            );

            finishLoading();

            return;

        }


        /* -------------------------
           No logged-in user
        ------------------------- */

        if (!session) {

            updateLoadingProgress(50);

            finishLoading();

            return;

        }


        /* -------------------------
           Logged-in user
        ------------------------- */

        const user =
            session.user;

        console.log(
            "Logged in user:",
            user.email
        );


        updateLoadingProgress(60);


        /* -------------------------
           Get profile
        ------------------------- */

        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


        if (profileError) {

            console.error(
                "Profile error:",
                profileError
            );

            finishLoading();

            return;

        }


        updateLoadingProgress(80);


        /* -------------------------
           Save user information
        ------------------------- */

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


        /* -------------------------
           Redirect to dashboard
        ------------------------- */

        updateLoadingProgress(95);

        window.location.href =
            "dashboard.html";

    } catch (error) {

        console.error(
            "Website loading error:",
            error
        );

        finishLoading();

    }

}


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");

            const rememberInput =
                document.getElementById("remember");


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            /* -------------------------
               Login button
            ------------------------- */

            const loginButton =
                loginForm.querySelector(
                    ".login-button"
                );


            const originalButtonText =
                loginButton.innerHTML;


            loginButton.disabled = true;

            loginButton.innerHTML =
                "SIGNING IN...";


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({
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
                        originalButtonText;

                    return;

                }


                /* -------------------------
                   Remember me
                ------------------------- */

                if (rememberInput) {

                    if (rememberInput.checked) {

                        localStorage.setItem(
                            "vr_remember_me",
                            "true"
                        );

                    } else {

                        localStorage.removeItem(
                            "vr_remember_me"
                        );

                    }

                }


                /* -------------------------
                   Get profile
                ------------------------- */

                const {
                    data: profile,
                    error: profileError
                } =
                    await supabaseClient
                        .from("profiles")
                        .select("*")
                        .eq(
                            "id",
                            data.user.id
                        )
                        .single();


                if (profileError) {

                    console.error(
                        profileError
                    );

                    alert(
                        "Your account exists, but your VoidRecords profile could not be found."
                    );

                    await supabaseClient.auth.signOut();

                    loginButton.disabled =
                        false;

                    loginButton.innerHTML =
                        originalButtonText;

                    return;

                }


                /* -------------------------
                   Store profile
                ------------------------- */

                localStorage.setItem(
                    "vr_user_email",
                    data.user.email || ""
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


                /* -------------------------
                   Redirect
                ------------------------- */

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Something went wrong. Please try again."
                );

                loginButton.disabled =
                    false;

                loginButton.innerHTML =
                    originalButtonText;

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
                document.getElementById("email");

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
            "Auth event:",
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

        updateLoadingProgress(10);

        checkUser();

    }
);
