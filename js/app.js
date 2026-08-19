/* =========================================================
   VOIDRECORDS — APP.JS
   Direct Supabase Authentication
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_KEY =
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

const loginPage =
    document.querySelector(".login-page");

const loginForm =
    document.getElementById("loginForm");

const forgotPassword =
    document.getElementById("forgotPassword");

const requestInviteButton =
    document.getElementById("requestInviteButton");


/* =========================================================
   LOADING BAR
========================================================= */

let progress = 0;

function setProgress(value) {

    progress = Math.min(
        100,
        Math.max(0, value)
    );

    if (loadingProgress) {

        loadingProgress.style.width =
            progress + "%";

    }

}


/* Start loading */

setProgress(10);


/* Slowly move loading bar */

const loadingTimer = setInterval(() => {

    if (progress < 85) {

        setProgress(
            progress + Math.random() * 7
        );

    }

}, 200);


/* =========================================================
   FINISH LOADING
========================================================= */

function finishLoading() {

    clearInterval(
        loadingTimer
    );

    setProgress(100);

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
   SLOW MESSAGE
========================================================= */

setTimeout(() => {

    if (
        loadingScreen &&
        !loadingScreen.classList.contains("fade-out")
    ) {

        if (slowMessage) {

            slowMessage.classList.add(
                "show"
            );

        }

    }

}, 6000);


/* =========================================================
   TEST SUPABASE CONNECTION
========================================================= */

async function testSupabaseConnection() {

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/auth/v1/settings",
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY
                    }
                }
            );


        if (!response.ok) {

            console.error(
                "Supabase connection failed:",
                response.status,
                await response.text()
            );

            return false;

        }


        console.log(
            "VoidRecords: Supabase connection successful."
        );

        return true;

    }
    catch (error) {

        console.error(
            "Supabase connection error:",
            error
        );

        return false;

    }

}


/* =========================================================
   CHECK EXISTING SESSION
========================================================= */

function getSavedSession() {

    const savedSession =
        localStorage.getItem(
            "voidrecords_session"
        );

    if (!savedSession) {

        return null;

    }

    try {

        return JSON.parse(
            savedSession
        );

    }
    catch {

        localStorage.removeItem(
            "voidrecords_session"
        );

        return null;

    }

}


/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener(
    "load",
    async () => {

        setProgress(30);


        /*
         * Test that GitHub Pages can
         * reach your Supabase project.
         */

        const connected =
            await testSupabaseConnection();


        setProgress(70);


        /*
         * Check for an existing login.
         */

        const session =
            getSavedSession();


        setProgress(90);


        /*
         * If a valid saved session exists,
         * send the user to dashboard.
         */

        if (
            connected &&
            session &&
            session.access_token
        ) {

            console.log(
                "Existing VoidRecords session found."
            );


            /*
             * You can enable this once
             * dashboard.html exists.
             */

            // window.location.href = "dashboard.html";

        }


        finishLoading();

    }
);


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "email"
                );

            const passwordInput =
                document.getElementById(
                    "password"
                );


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            /* Validation */

            if (!email) {

                alert(
                    "Please enter your email."
                );

                emailInput.focus();

                return;

            }


            if (!password) {

                alert(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;

            }


            /* Button */

            const button =
                loginForm.querySelector(
                    ".login-button"
                );


            const originalHTML =
                button.innerHTML;


            button.disabled = true;

            button.innerHTML =
                "<span>SIGNING IN...</span><span>→</span>";


            try {

                console.log(
                    "VoidRecords: attempting login..."
                );


                /*
                 * Supabase password authentication
                 */

                const response =
                    await fetch(
                        SUPABASE_URL +
                        "/auth/v1/token?grant_type=password",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_KEY
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Supabase login response:",
                    result
                );


                /* Login failed */

                if (!response.ok) {

                    throw new Error(
                        result.error_description ||
                        result.msg ||
                        result.message ||
                        "Invalid email or password."
                    );

                }


                /*
                 * Save the session.
                 */

                localStorage.setItem(
                    "voidrecords_session",
                    JSON.stringify(result)
                );


                /*
                 * Save the access token separately.
                 */

                localStorage.setItem(
                    "voidrecords_access_token",
                    result.access_token
                );


                console.log(
                    "VoidRecords: login successful."
                );


                button.innerHTML =
                    "<span>SIGNED IN</span><span>✓</span>";


                /*
                 * Go to dashboard.
                 */

                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 500);

            }
            catch (error) {

                console.error(
                    "VoidRecords login error:",
                    error
                );


                alert(
                    error.message
                );


                button.disabled = false;

                button.innerHTML =
                    originalHTML;

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
        async (event) => {

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

                const response =
                    await fetch(
                        SUPABASE_URL +
                        "/auth/v1/recover",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_KEY
                            },

                            body: JSON.stringify({
                                email: email
                            })
                        }
                    );


                if (!response.ok) {

                    const result =
                        await response.json();

                    throw new Error(
                        result.message ||
                        "Unable to send reset email."
                    );

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
                    error.message
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
        () => {

            alert(
                "VoidRecords is currently invite-only."
            );

        }
    );

}
