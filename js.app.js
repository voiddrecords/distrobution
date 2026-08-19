document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS
    ========================================= */

    const loadingScreen = document.getElementById("loadingScreen");
    const slowMessage = document.getElementById("slowMessage");
    const loginPage = document.querySelector(".login-page");
    const loginForm = document.getElementById("loginForm");


    /* =========================================
       LOADING SCREEN
    ========================================= */

    function finishLoading() {

        // Make login page visible
        if (loginPage) {
            loginPage.classList.add("ready");
        }

        // Fade loading screen out
        if (loadingScreen) {
            loadingScreen.classList.add("fade-out");
        }

        // Completely remove it after fade animation
        setTimeout(() => {

            if (loadingScreen) {
                loadingScreen.style.display = "none";
            }

        }, 900);
    }


    /* =========================================
       CHECK REMEMBERED USER
    ========================================= */

    function getRememberedUser() {

        try {

            const savedUser =
                localStorage.getItem("voidrecords_user");

            if (!savedUser) {
                return null;
            }

            return JSON.parse(savedUser);

        } catch (error) {

            console.error(
                "Error reading remembered user:",
                error
            );

            return null;
        }
    }


    /* =========================================
       BACKGROUND WEBSITE CHECK
    ========================================= */

    function runBackgroundChecks() {

        return new Promise((resolve) => {

            /*
             * Check localStorage
             */

            try {

                localStorage.setItem(
                    "voidrecords_test",
                    "true"
                );

                localStorage.removeItem(
                    "voidrecords_test"
                );

            } catch (error) {

                console.warn(
                    "Local storage is unavailable."
                );
            }


            /*
             * Check remembered user
             */

            const rememberedUser =
                getRememberedUser();

            if (rememberedUser) {

                console.log(
                    "Remembered user:",
                    rememberedUser.artistName ||
                    rememberedUser.email
                );

            } else {

                console.log(
                    "No remembered user found."
                );
            }


            /*
             * Give the page a short amount of time
             * to initialize.
             */

            setTimeout(() => {

                resolve();

            }, 500);

        });
    }


    /* =========================================
       START WEBSITE LOADING
    ========================================= */

    runBackgroundChecks()
        .then(() => {

            finishLoading();

        })
        .catch((error) => {

            console.error(
                "Website initialization error:",
                error
            );

            /*
             * Never leave the user stuck
             * on the loading screen.
             */

            finishLoading();

        });


    /* =========================================
       SLOW LOADING MESSAGE
    ========================================= */

    setTimeout(() => {

        if (
            loadingScreen &&
            !loadingScreen.classList.contains("fade-out")
        ) {

            if (slowMessage) {

                slowMessage.classList.add("show");

            }

        }

    }, 8000);


    /* =========================================
       EMERGENCY LOADING TIMEOUT
    ========================================= */

    setTimeout(() => {

        if (
            loadingScreen &&
            !loadingScreen.classList.contains("fade-out")
        ) {

            console.warn(
                "Loading took longer than expected."
            );

            finishLoading();

        }

    }, 15000);


    /* =========================================
       LOGIN
    ========================================= */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                /*
                 * Get login fields
                 */

                const emailInput =
                    document.getElementById("email");

                const passwordInput =
                    document.getElementById("password");

                const rememberInput =
                    document.getElementById("remember");


                if (!emailInput || !passwordInput) {

                    console.error(
                        "Login fields are missing."
                    );

                    return;
                }


                const email =
                    emailInput.value.trim();

                const password =
                    passwordInput.value;

                const remember =
                    rememberInput ?
                    rememberInput.checked :
                    false;


                /*
                 * Validate fields
                 */

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


                /*
                 * =================================
                 * USER INFORMATION
                 * =================================
                 *
                 * This is the structure we'll use
                 * for your real authentication system.
                 *
                 * The real password should NOT be
                 * stored in localStorage.
                 */

                const user = {

                    email: email,

                    artistName: "Artist",

                    firstName: "",

                    lastName: "",

                    role: "artist"

                };


                /* =================================
                   REMEMBER ME
                ================================= */

                if (remember) {

                    localStorage.setItem(
                        "voidrecords_user",
                        JSON.stringify(user)
                    );

                } else {

                    localStorage.removeItem(
                        "voidrecords_user"
                    );

                }


                /*
                 * =================================
                 * GO TO DASHBOARD
                ================================= */

                window.location.href =
                    "dashboard.html";

            }
        );

    }


    /* =========================================
       REQUEST AN INVITE
    ========================================= */

    window.requestInvite = function () {

        window.location.href =
            "https://fiya8.github.io/voidrecords/";

    };


    /* =========================================
       LOGOUT FUNCTION
    ========================================= */

    window.logoutUser = function () {

        localStorage.removeItem(
            "voidrecords_user"
        );

        window.location.href =
            "index.html";

    };


    /* =========================================
       GET CURRENT USER
    ========================================= */

    window.getCurrentUser = function () {

        return getRememberedUser();

    };


    /* =========================================
       DASHBOARD USER INFORMATION
    ========================================= */

    const currentUser =
        getRememberedUser();


    if (
        currentUser &&
        document.body.classList.contains("dashboard-page")
    ) {

        /*
         * Artist name
         */

        const artistNameElements =
            document.querySelectorAll(
                "[data-user-artist]"
            );

        artistNameElements.forEach(
            (element) => {

                element.textContent =
                    currentUser.artistName ||
                    "Artist";

            }
        );


        /*
         * Email
         */

        const emailElements =
            document.querySelectorAll(
                "[data-user-email]"
            );

        emailElements.forEach(
            (element) => {

                element.textContent =
                    currentUser.email || "";

            }
        );


        /*
         * First name
         */

        const firstNameElements =
            document.querySelectorAll(
                "[data-user-first-name]"
            );

        firstNameElements.forEach(
            (element) => {

                element.textContent =
                    currentUser.firstName || "";

            }
        );


        /*
         * Last name
         */

        const lastNameElements =
            document.querySelectorAll(
                "[data-user-last-name]"
            );

        lastNameElements.forEach(
            (element) => {

                element.textContent =
                    currentUser.lastName || "";

            }
        );


        /*
         * Role
         */

        const roleElements =
            document.querySelectorAll(
                "[data-user-role]"
            );

        roleElements.forEach(
            (element) => {

                element.textContent =
                    currentUser.role || "artist";

            }
        );

    }

});
