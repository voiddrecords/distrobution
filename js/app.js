document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS
    ========================================= */

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


    /* =========================================
       LOADING PROGRESS
    ========================================= */

    let progress = 0;


    function setProgress(value) {

        progress = Math.min(
            Math.max(value, 0),
            100
        );

        if (loadingProgress) {

            loadingProgress.style.width =
                progress + "%";

        }
    }


    function increaseProgress(value) {

        setProgress(progress + value);

    }


    /* =========================================
       INITIAL PROGRESS
    ========================================= */

    setProgress(5);


    /* =========================================
       FINISH LOADING
    ========================================= */

    function finishLoading() {

        setProgress(100);

        setTimeout(() => {

            if (loginPage) {

                loginPage.classList.add(
                    "ready"
                );

            }

            if (loadingScreen) {

                loadingScreen.classList.add(
                    "fade-out"
                );

            }

            setTimeout(() => {

                if (loadingScreen) {

                    loadingScreen.style.display =
                        "none";

                }

            }, 900);

        }, 250);
    }


    /* =========================================
       GET REMEMBERED USER
    ========================================= */

    function getRememberedUser() {

        try {

            const savedUser =
                localStorage.getItem(
                    "voidrecords_user"
                );

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
       BACKGROUND CHECKS
    ========================================= */

    function runBackgroundChecks() {

        return new Promise((resolve) => {

            /* -------------------------------
               STEP 1 — Browser check
            -------------------------------- */

            setTimeout(() => {

                try {

                    localStorage.setItem(
                        "voidrecords_test",
                        "true"
                    );

                    localStorage.removeItem(
                        "voidrecords_test"
                    );

                    increaseProgress(20);

                } catch (error) {

                    console.warn(
                        "Local storage unavailable."
                    );

                    increaseProgress(10);

                }


                /* -------------------------------
                   STEP 2 — User check
                -------------------------------- */

                setTimeout(() => {

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

                    increaseProgress(25);


                    /* -------------------------------
                       STEP 3 — Website initialization
                    -------------------------------- */

                    setTimeout(() => {

                        increaseProgress(25);


                        /* -------------------------------
                           STEP 4 — Final check
                        -------------------------------- */

                        setTimeout(() => {

                            increaseProgress(15);

                            resolve();

                        }, 250);

                    }, 250);

                }, 250);

            }, 200);

        });

    }


    /* =========================================
       START LOADING
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

            finishLoading();

        });


    /* =========================================
       SLOW WEBSITE WARNING
    ========================================= */

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

    }, 8000);


    /* =========================================
       EMERGENCY TIMEOUT
    ========================================= */

    setTimeout(() => {

        if (
            loadingScreen &&
            !loadingScreen.classList.contains(
                "fade-out"
            )
        ) {

            console.warn(
                "Loading took too long."
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


                if (
                    !emailInput ||
                    !passwordInput
                ) {

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
                    rememberInput
                        ? rememberInput.checked
                        : false;


                /* -------------------------------
                   Validate
                -------------------------------- */

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


                /* -------------------------------
                   User information
                -------------------------------- */

                const user = {

                    email: email,

                    artistName: "Artist",

                    firstName: "",

                    lastName: "",

                    role: "artist"

                };


                /* -------------------------------
                   Remember me
                -------------------------------- */

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


                /* -------------------------------
                   Dashboard
                -------------------------------- */

                window.location.href =
                    "dashboard.html";

            }
        );

    }


    /* =========================================
       REQUEST INVITE
    ========================================= */

    window.requestInvite = function () {

        window.location.href =
            "https://fiya8.github.io/voidrecords/";

    };


    /* =========================================
       LOGOUT
    ========================================= */

    window.logoutUser = function () {

        localStorage.removeItem(
            "voidrecords_user"
        );

        window.location.href =
            "index.html";

    };


    /* =========================================
       CURRENT USER
    ========================================= */

    window.getCurrentUser = function () {

        return getRememberedUser();

    };


    /* =========================================
       DASHBOARD USER DATA
    ========================================= */

    const currentUser =
        getRememberedUser();


    if (
        currentUser &&
        document.body.classList.contains(
            "dashboard-page"
        )
    ) {


        /* Artist */

        document
            .querySelectorAll(
                "[data-user-artist]"
            )
            .forEach((element) => {

                element.textContent =
                    currentUser.artistName ||
                    "Artist";

            });


        /* Email */

        document
            .querySelectorAll(
                "[data-user-email]"
            )
            .forEach((element) => {

                element.textContent =
                    currentUser.email || "";

            });


        /* First name */

        document
            .querySelectorAll(
                "[data-user-first-name]"
            )
            .forEach((element) => {

                element.textContent =
                    currentUser.firstName || "";

            });


        /* Last name */

        document
            .querySelectorAll(
                "[data-user-last-name]"
            )
            .forEach((element) => {

                element.textContent =
                    currentUser.lastName || "";

            });


        /* Role */

        document
            .querySelectorAll(
                "[data-user-role]"
            )
            .forEach((element) => {

                element.textContent =
                    currentUser.role ||
                    "artist";

            });

    }

});
