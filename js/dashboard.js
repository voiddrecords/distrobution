const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );



/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    await checkAuthentication();

    setupNavigation();

    setupModal();

});



/* =========================================
   AUTHENTICATION
========================================= */

async function checkAuthentication() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();


    if (error || !data.user) {

        window.location.href = "./index.html";

        return;

    }


    const user = data.user;


    const emailElement =
        document.getElementById("userEmail");

    if (emailElement) {

        emailElement.textContent =
            user.email || "";

    }


    const welcomeName =
        document.getElementById("welcomeName");

    if (welcomeName) {

        welcomeName.textContent =
            "Welcome back.";

    }


    await loadReleases(user.id);

}



/* =========================================
   LOAD RELEASES
========================================= */

async function loadReleases(userId) {

    const releaseList =
        document.getElementById("releaseList");

    const releaseCount =
        document.getElementById("releaseCount");


    const {
        data: releases,
        error
    } = await supabaseClient
        .from("releases")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Could not load releases:",
            error
        );

        if (releaseList) {

            releaseList.innerHTML = `
                <div class="empty-state">
                    Unable to load releases.
                </div>
            `;

        }

        return;

    }


    const releaseArray =
        releases || [];


    if (releaseCount) {

        releaseCount.textContent =
            releaseArray.length;

    }


    if (!releaseList) {
        return;
    }


    if (releaseArray.length === 0) {

        releaseList.innerHTML = `
            <div class="empty-state">
                No releases yet.
                Create your first release to get started.
            </div>
        `;

        return;

    }


    releaseList.innerHTML = "";


    releaseArray.forEach(release => {

        const card =
            document.createElement("div");

        card.className =
            "list-card";


        const title =
            release.title ||
            release.name ||
            "Untitled Release";


        const artist =
            release.artist ||
            release.artist_name ||
            "Unknown Artist";


        const status =
            release.status ||
            "DRAFT";


        card.innerHTML = `

            <div>

                <h3>
                    ${escapeHtml(title)}
                </h3>

                <p>
                    ${escapeHtml(artist)}
                </p>

            </div>

            <span class="status">
                ${escapeHtml(
                    String(status).toUpperCase()
                )}
            </span>

        `;


        releaseList.appendChild(card);

    });

}



/* =========================================
   NAVIGATION
========================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");


    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    navItems.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.section;


                navItems.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                sections.forEach(section => {

                    section.classList.remove(
                        "active-section"
                    );

                });


                button.classList.add(
                    "active"
                );


                const targetSection =
                    document.getElementById(
                        target
                    );


                if (targetSection) {

                    targetSection.classList.add(
                        "active-section"
                    );

                }

            }
        );

    });

}



/* =========================================
   MODAL
========================================= */

function setupModal() {

    const modal =
        document.getElementById(
            "releaseModal"
        );


    const openButton =
        document.getElementById(
            "newReleaseButton"
        );


    const closeButton =
        document.getElementById(
            "closeReleaseModal"
        );


    if (openButton) {

        openButton.addEventListener(
            "click",
            () => {

                modal.classList.remove(
                    "hidden"
                );

            }
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.classList.add(
                    "hidden"
                );

            }
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }


    const form =
        document.getElementById(
            "releaseForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            createRelease
        );

    }

}



/* =========================================
   CREATE RELEASE
========================================= */

async function createRelease(event) {

    event.preventDefault();


    const form =
        event.target;


    const formData =
        new FormData(form);


    const title =
        formData.get("title");


    const artist =
        formData.get("artist");


    const type =
        formData.get("type");


    const releaseDate =
        formData.get("release_date");


    const {
        data: userData
    } =
        await supabaseClient.auth.getUser();


    if (
        !userData ||
        !userData.user
    ) {

        window.location.href =
            "./index.html";

        return;

    }


    const user =
        userData.user;


    /*
     * These are the basic fields.
     * Your releases table must contain
     * matching columns for this insert.
     */

    const {
        error
    } = await supabaseClient
        .from("releases")
        .insert({

            user_id: user.id,

            title: title,

            artist: artist,

            type: type,

            release_date:
                releaseDate || null

        });


    if (error) {

        console.error(
            "Release creation error:",
            error
        );

        alert(
            "Could not create release: " +
            error.message
        );

        return;

    }


    document
        .getElementById("releaseModal")
        .classList.add("hidden");


    form.reset();


    await loadReleases(user.id);


    alert(
        "Release created successfully."
    );

}



/* =========================================
   LOGOUT
========================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "./index.html";

        }
    );

}



/* =========================================
   HTML ESCAPING
========================================= */

function escapeHtml(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}
