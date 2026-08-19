/* =========================================================
   VOIDRECORDS — LOGIN
========================================================= */

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";


/* =========================================================
   ELEMENTS
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const loadingProgress =
    document.getElementById("loadingProgress");

const slowMessage =
    document.getElementById("slowMessage");


/* =========================================================
   LOADING BAR
========================================================= */

function setProgress(value) {

    if (!loadingProgress) return;

    loadingProgress.style.width =
        value + "%";
}


/* =========================================================
   HIDE LOADING SCREEN
========================================================= */

function hideLoadingScreen() {

    if (!loadingScreen) return;

    loadingScreen.classList.add(
        "loading-hidden"
    );

}


/* =========================================================
   START LOADING
========================================================= */

setProgress(10);


/*
 * Animate the loading bar while the page starts.
 */

let progress = 10;

const progressTimer = setInterval(() => {

    if (progress < 90) {

        progress += 5;

        setProgress(progress);

    }

}, 150);


/*
 * IMPORTANT:
 * Never allow the loading screen to remain
 * forever.
 *
 * After 4 seconds, show the login page.
 */

setTimeout(() => {

    clearInterval(progressTimer);

    setProgress(100);

    hideLoadingScreen();

}, 4000);


/* =========================================================
   SLOW MESSAGE
========================================================= */

if (slowMessage) {

    slowMessage.style.display = "none";

    setTimeout(() => {

        slowMessage.style.display = "block";

    }, 3000);

}


/* =========================================================
   SUPABASE
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

    } else {

        console.error(
            "VoidRecords: Supabase library did not load."
        );

    }

} catch (error) {

    console.error(
        "VoidRecords: Supabase error:",
        error
    );

}


/* =========================================================
   CHECK LOGIN
========================================================= */

async function checkLogin() {

    /*
     * If Supabase didn't load, don't block
     * the login page.
     */

    if (!supabaseClient) {

        console.warn(
            "Login check skipped."
        );

        return;

    }


    try {

        const result =
            await Promise.race([

                supabaseClient.auth.getSession(),

                new Promise(resolve => {

                    setTimeout(() => {

                        resolve({
                            timeout: true
                        });

                    }, 3000);

                })

            ]);


        /*
         * Supabase took too long.
         */

        if (result.timeout) {

            console.warn(
                "Supabase login check timed out."
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
         * User already logged in.
         */

        if (
            data &&
            data.session
        ) {

            console.log(
                "User already logged in."
            );

            window.location.href =
                "dashboard.html";

        }

    } catch (error) {

        console.error(
            "Login check failed:",
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


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const remember =
                document.getElementById(
                    "remember"
                );


            const button =
                loginForm.querySelector(
                    ".login-button"
                );


            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            const originalText =
                button.innerHTML;


            button.disabled = true;

            button.innerHTML =
                "<span>SIGNING IN...</span><span>→</span>";


            try {

                if (!supabaseClient) {

                    throw new Error(
                        "Supabase is not available."
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

                    console.error(
                        error
                    );

                    alert(
                        error.message
                    );

                    button.disabled = false;

                    button.innerHTML =
                        originalText;

                    return;

                }


                /*
                 * Remember Me
                 */

                if (
                    remember &&
                    remember.checked
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


                /*
                 * Save email.
                 */

                localStorage.setItem(
                    "vr_user_email",
                    data.user.email || ""
                );


                /*
                 * Go to dashboard.
                 */

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Unable to sign in. Check your connection and try again."
                );


                button.disabled = false;

                button.innerHTML =
                    originalText;

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


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            if (!email) {

                alert(
                    "Enter your email address first."
                );

                return;

            }


            if (!supabaseClient) {

                alert(
                    "Supabase is not available."
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
   START SESSION CHECK
========================================================= */

checkLogin();
