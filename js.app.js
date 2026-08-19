/* =====================================================
   VOIDRECORDS DISTRIBUTION
   COMPLETE AUTHENTICATION / ROLE SYSTEM
===================================================== */


/* =====================================================
   ROLE DEFINITIONS
===================================================== */

const VOID_ROLES = {

    OWNER: "owner",

    LABEL_MANAGER: "label_manager",

    AR: "ar",

    ARTIST: "artist",

    RELEASE_MANAGER: "release_manager",

    ROYALTY_MANAGER: "royalty_manager",

    MARKETING: "marketing",

    FINANCE: "finance",

    LEGAL: "legal",

    SUPPORT: "support"

};


/* =====================================================
   ROLE PERMISSIONS
===================================================== */

const ROLE_PERMISSIONS = {

    owner: [

        "dashboard.view",

        "users.view",
        "users.create",
        "users.edit",
        "users.delete",

        "artists.view",
        "artists.create",
        "artists.edit",
        "artists.delete",

        "releases.view",
        "releases.create",
        "releases.edit",
        "releases.delete",
        "releases.approve",

        "catalog.view",
        "catalog.edit",

        "distribution.view",
        "distribution.manage",

        "analytics.view",

        "royalties.view",
        "royalties.edit",

        "reports.view",
        "reports.create",

        "marketing.view",
        "marketing.edit",

        "finance.view",
        "finance.edit",

        "legal.view",
        "legal.edit",

        "settings.view",
        "settings.edit"

    ],


    label_manager: [

        "dashboard.view",

        "users.view",
        "users.create",
        "users.edit",

        "artists.view",
        "artists.create",
        "artists.edit",

        "releases.view",
        "releases.create",
        "releases.edit",
        "releases.approve",

        "catalog.view",
        "catalog.edit",

        "distribution.view",
        "distribution.manage",

        "analytics.view",

        "royalties.view",

        "reports.view",
        "reports.create",

        "marketing.view",

        "settings.view"

    ],


    ar: [

        "dashboard.view",

        "artists.view",
        "artists.create",
        "artists.edit",

        "releases.view",
        "releases.edit",
        "releases.approve",

        "catalog.view",

        "analytics.view"

    ],


    artist: [

        "dashboard.view",

        "profile.view",
        "profile.edit",

        "releases.view",
        "releases.create",
        "releases.edit",

        "catalog.view",

        "analytics.view",

        "royalties.view",

        "reports.view"

    ],


    release_manager: [

        "dashboard.view",

        "artists.view",

        "releases.view",
        "releases.create",
        "releases.edit",
        "releases.approve",

        "catalog.view",
        "catalog.edit",

        "distribution.view",
        "distribution.manage",

        "analytics.view"

    ],


    royalty_manager: [

        "dashboard.view",

        "artists.view",

        "releases.view",

        "royalties.view",
        "royalties.edit",

        "reports.view",
        "reports.create",

        "finance.view"

    ],


    marketing: [

        "dashboard.view",

        "artists.view",

        "releases.view",

        "catalog.view",

        "analytics.view",

        "marketing.view",
        "marketing.edit"

    ],


    finance: [

        "dashboard.view",

        "artists.view",

        "releases.view",

        "royalties.view",
        "royalties.edit",

        "reports.view",
        "reports.create",

        "finance.view",
        "finance.edit"

    ],


    legal: [

        "dashboard.view",

        "artists.view",

        "releases.view",

        "catalog.view",

        "legal.view",
        "legal.edit"

    ],


    support: [

        "dashboard.view",

        "users.view",

        "artists.view",

        "releases.view"

    ]

};


/* =====================================================
   GET CURRENT USER
===================================================== */

function getCurrentUser() {

    const currentUser =
        sessionStorage.getItem(
            "voidrecords_current_user"
        );

    if (!currentUser) {
        return null;
    }

    try {

        return JSON.parse(
            currentUser
        );

    } catch (error) {

        sessionStorage.removeItem(
            "voidrecords_current_user"
        );

        return null;

    }

}


/* =====================================================
   REMEMBERED USER
===================================================== */

function getRememberedUser() {

    const savedUser =
        localStorage.getItem(
            "voidrecords_user"
        );

    if (!savedUser) {
        return null;
    }

    try {

        return JSON.parse(
            savedUser
        );

    } catch (error) {

        localStorage.removeItem(
            "voidrecords_user"
        );

        return null;

    }

}


/* =====================================================
   SAVE USER
===================================================== */

function rememberUser(user) {

    localStorage.setItem(

        "voidrecords_user",

        JSON.stringify({

            id: user.id,

            email: user.email,

            artistName: user.artistName,

            firstName: user.firstName,

            lastName: user.lastName,

            role: user.role,

            label: user.label,

            status: user.status

        })

    );

}


/* =====================================================
   REMOVE REMEMBERED USER
===================================================== */

function forgetUser() {

    localStorage.removeItem(
        "voidrecords_user"
    );

    sessionStorage.removeItem(
        "voidrecords_current_user"
    );

}


/* =====================================================
   PERMISSION CHECK
===================================================== */

function hasPermission(permission) {

    const user =
        getCurrentUser();

    if (!user) {
        return false;
    }

    const permissions =
        ROLE_PERMISSIONS[user.role];

    if (!permissions) {
        return false;
    }

    return permissions.includes(
        permission
    );

}


/* =====================================================
   LOADING SCREEN
===================================================== */

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

const slowMessage =
    document.getElementById(
        "slowMessage"
    );

const loginPage =
    document.getElementById(
        "loginPage"
    );


async function startWebsite() {

    let finished = false;


    /* -----------------------------------------
       SLOW LOAD WARNING
    ----------------------------------------- */

    const slowTimer =
        setTimeout(function() {

            if (!finished) {

                slowMessage.classList.add(
                    "show"
                );

            }

        }, 6000);


    /* -----------------------------------------
       MAXIMUM WAIT
    ----------------------------------------- */

    const maximumTimer =
        setTimeout(function() {

            if (!finished) {

                finished = true;

                clearTimeout(
                    slowTimer
                );

                showLogin();

            }

        }, 12000);


    try {

        /*
            Simulates checking the backend.

            Replace this with a real API call
            when authentication is connected.
        */

        const rememberedUser =
            getRememberedUser();


        await new Promise(
            function(resolve) {

                setTimeout(
                    resolve,
                    700
                );

            }
        );


        if (finished) {
            return;
        }


        finished = true;

        clearTimeout(
            slowTimer
        );

        clearTimeout(
            maximumTimer
        );


        /* -----------------------------------------
           REMEMBERED USER FOUND
        ----------------------------------------- */

        if (rememberedUser) {

            sessionStorage.setItem(

                "voidrecords_current_user",

                JSON.stringify(
                    rememberedUser
                )

            );


            loadingScreen.classList.add(
                "fade-out"
            );


            setTimeout(
                function() {

                    window.location.href =
                        "dashboard.html";

                },
                800
            );


            return;

        }


        /* -----------------------------------------
           NO USER
        ----------------------------------------- */

        showLogin();


    } catch (error) {

        console.error(
            "VoidRecords startup error:",
            error
        );

        finished = true;

        clearTimeout(
            slowTimer
        );

        clearTimeout(
            maximumTimer
        );

        showLogin();

    }

}


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    if (loginPage) {

        loginPage.classList.add(
            "ready"
        );

    }

    setTimeout(
        function() {

            loadingScreen.classList.add(
                "fade-out"
            );

        },
        300
    );

}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

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
                ).checked;


            if (!email || !password) {

                return;

            }


            /*
                DEMO ACCOUNT

                Your real backend will return
                this information after checking
                the email and password.

                DO NOT store passwords in
                localStorage.
            */

            const user = {

                id:
                    "user_" +
                    Date.now(),

                email:
                    email,

                artistName:
                    "Your Artist Name",

                firstName:
                    "First",

                lastName:
                    "Last",

                role:
                    "artist",

                label:
                    "VoidRecords",

                status:
                    "active"

            };


            /* -----------------------------------------
               REMEMBER ME
            ----------------------------------------- */

            if (remember) {

                rememberUser(
                    user
                );

            } else {

                localStorage.removeItem(
                    "voidrecords_user"
                );

            }


            /* -----------------------------------------
               CURRENT SESSION
            ----------------------------------------- */

            sessionStorage.setItem(

                "voidrecords_current_user",

                JSON.stringify(
                    user
                )

            );


            /* -----------------------------------------
               DASHBOARD
            ----------------------------------------- */

            window.location.href =
                "dashboard.html";

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

            window.location.href =
                "https://fiya8.github.io/voidrecords/";

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
        function(event) {

            event.preventDefault();

            alert(
                "Password recovery will be available once authentication is connected."
            );

        }
    );

}


/* =====================================================
   START WEBSITE
===================================================== */

if (loadingScreen) {

    startWebsite();

}
