/* =========================================================
   VOIDRECORDS DASHBOARD
   Authentication + User Profile
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";


const { createClient } = supabase;


const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    }
);


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const {
            data: {
                session
            },
            error
        } =
            await supabaseClient.auth.getSession();


        /* -------------------------
           Session error
        ------------------------- */

        if (error) {

            console.error(error);

            window.location.href =
                "login.html";

            return;

        }


        /* -------------------------
           No session
        ------------------------- */

        if (!session) {

            window.location.href =
                "login.html";

            return;

        }


        const user =
            session.user;


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
                .eq("id", user.id)
                .single();


        if (profileError || !profile) {

            console.error(
                "Could not load profile:",
                profileError
            );

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

            return;

        }


        /* -------------------------
           Display user
        ------------------------- */

        displayUser(
            user,
            profile
        );


        /* -------------------------
           Configure role
        ------------------------- */

        configureRole(
            profile.role
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        window.location.href =
            "login.html";

    }

}


/* =========================================================
   DISPLAY USER
========================================================= */

function displayUser(
    user,
    profile
) {

    const firstName =
        profile.first_name || "";


    const lastName =
        profile.last_name || "";


    const artistName =
        profile.artist_name ||
        "VoidRecords";


    const role =
        profile.role ||
        "artist";


    /* -------------------------
       Welcome
    ------------------------- */

    const welcomeName =
        document.getElementById(
            "welcomeName"
        );


    if (welcomeName) {

        welcomeName.textContent =
            firstName || artistName;

    }


    /* -------------------------
       Top name
    ------------------------- */

    const topArtistName =
        document.getElementById(
            "topArtistName"
        );


    if (topArtistName) {

        topArtistName.textContent =
            artistName;

    }


    /* -------------------------
       Role
    ------------------------- */

    const topRole =
        document.getElementById(
            "topRole"
        );


    if (topRole) {

        topRole.textContent =
            formatRole(role);

    }


    /* -------------------------
       Avatar
    ------------------------- */

    const avatar =
        document.getElementById(
            "userAvatar"
        );


    if (avatar) {

        const letter =
            (
                firstName ||
                artistName ||
                "V"
            )
                .charAt(0)
                .toUpperCase();


        avatar.textContent =
            letter;

    }


    /* -------------------------
       Settings
    ------------------------- */

    const settingsEmail =
        document.getElementById(
            "settingsEmail"
        );


    if (settingsEmail) {

        settingsEmail.textContent =
            user.email || "";

    }


    const settingsRole =
        document.getElementById(
            "settingsRole"
        );


    if (settingsRole) {

        settingsRole.textContent =
            "Role: " +
            formatRole(role);

    }


    /* -------------------------
       Local storage
    ------------------------- */

    localStorage.setItem(
        "vr_user_email",
        user.email || ""
    );


    localStorage.setItem(
        "vr_first_name",
        firstName
    );


    localStorage.setItem(
        "vr_last_name",
        lastName
    );


    localStorage.setItem(
        "vr_artist_name",
        artistName
    );


    localStorage.setItem(
        "vr_role",
        role
    );

}


/* =========================================================
   ROLE FORMATTER
========================================================= */

function formatRole(role) {

    const roles = {

        owner:
            "OWNER",

        label_manager:
            "LABEL MANAGER",

        ar:
            "A&R",

        artist:
            "ARTIST"

    };


    return roles[role] ||
        "ARTIST";

}


/* =========================================================
   ROLE PERMISSIONS
========================================================= */

function configureRole(role) {

    const artistOnlyHidden = [

        "artists"

    ];


    /* -------------------------
       Artist
    ------------------------- */

    if (role === "artist") {

        artistOnlyHidden.forEach(
            section => {

                const item =
                    document.querySelector(
                        `[data-section="${section}"]`
                    );


                if (item) {

                    item.style.display =
                        "none";

                }

            }
        );

    }


    /* -------------------------
       A&R
    ------------------------- */

    if (role === "ar") {

        console.log(
            "A&R access enabled"
        );

    }


    /* -------------------------
       Label Manager
    ------------------------- */

    if (role === "label_manager") {

        console.log(
            "Label Manager access enabled"
        );

    }


    /* -------------------------
       Owner
    ------------------------- */

    if (role === "owner") {

        console.log(
            "Owner access enabled"
        );

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const sectionName =
                        item.dataset.section;


                    if (!sectionName) {
                        return;
                    }


                    navItems.forEach(
                        nav => {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );


                    item.classList.add(
                        "active"
                    );


                    sections.forEach(
                        section => {

                            section.classList.remove(
                                "active-section"
                            );

                        }
                    );


                    const target =
                        document.getElementById(
                            sectionName
                        );


                    if (target) {

                        target.classList.add(
                            "active-section"
                        );

                    }

                }
            );

        }
    );


    /* -------------------------
       View all button
    ------------------------- */

    const sectionLinks =
        document.querySelectorAll(
            "[data-section-link]"
        );


    sectionLinks.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.sectionLink;


                    const nav =
                        document.querySelector(
                            `[data-section="${target}"]`
                        );


                    if (nav) {

                        nav.click();

                    }

                }
            );

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled =
                true;


            logoutButton.textContent =
                "LOGGING OUT...";


            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    error
                );

                logoutButton.disabled =
                    false;

                logoutButton.textContent =
                    "LOG OUT";

                return;

            }


            /* Clear locally stored profile */

            localStorage.removeItem(
                "vr_user_email"
            );

            localStorage.removeItem(
                "vr_first_name"
            );

            localStorage.removeItem(
                "vr_last_name"
            );

            localStorage.removeItem(
                "vr_artist_name"
            );

            localStorage.removeItem(
                "vr_role"
            );


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================================
   NEW RELEASE
========================================================= */

function setupNewRelease() {

    const button =
        document.getElementById(
            "newReleaseButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            alert(
                "Release submission will be available here."
            );

        }
    );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();

        setupLogout();

        setupNewRelease();

        loadDashboard();

    }
);
