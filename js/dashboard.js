// =========================================
// VOIDRECORDS DASHBOARD
// =========================================


// -----------------------------------------
// SUPABASE
// -----------------------------------------

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";

const supabaseKey =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        supabaseKey
    );


// -----------------------------------------
// PAGE
// -----------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadUser();

        setupNavigation();

        setupReleaseModal();

        setupLogout();

        await loadReleaseCount();

    }
);


// -----------------------------------------
// LOAD USER
// -----------------------------------------

async function loadUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        window.location.href =
            "./index.html";

        return;

    }


    const userEmail =
        document.getElementById(
            "userEmail"
        );


    if (userEmail) {

        userEmail.textContent =
            data.user.email || "";

    }

}


// -----------------------------------------
// NAVIGATION
// -----------------------------------------

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-item"
        );


    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.section;


                buttons.forEach(item => {

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


// -----------------------------------------
// RELEASE MODAL
// -----------------------------------------

function setupReleaseModal() {

    const modal =
        document.getElementById(
            "releaseModal"
        );


    const openButton =
        document.getElementById(
            "createReleaseButton"
        );


    const closeButton =
        document.getElementById(
            "closeReleaseModal"
        );


    const form =
        document.getElementById(
            "releaseForm"
        );


    if (!modal) return;


    openButton?.addEventListener(
        "click",
        () => {

            modal.classList.remove(
                "hidden"
            );

        }
    );


    closeButton?.addEventListener(
        "click",
        () => {

            modal.classList.add(
                "hidden"
            );

        }
    );


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


    form?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await createRelease(
                form,
                modal
            );

        }
    );

}


// -----------------------------------------
// CREATE RELEASE
// -----------------------------------------

async function createRelease(
    form,
    modal
) {

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "Your session has expired. Please sign in again."
        );

        window.location.href =
            "./index.html";

        return;

    }


    const formData =
        new FormData(form);


    const release = {

        user_id:
            userData.user.id,

        title:
            formData.get("title"),

        artist:
            formData.get("artist"),

        release_type:
            formData.get("release_type"),

        release_date:
            formData.get("release_date"),

        description:
            formData.get("description")

    };


    const {
        error
    } =
        await supabaseClient

            .from("releases")

            .insert(release);


    if (error) {

        console.error(error);

        alert(
            "Unable to create release:\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Release created successfully."
    );


    form.reset();

    modal.classList.add(
        "hidden"
    );


    await loadReleaseCount();

    await loadReleases();

}


// -----------------------------------------
// RELEASE COUNT
// -----------------------------------------

async function loadReleaseCount() {

    const {
        count,
        error
    } =
        await supabaseClient

            .from("releases")

            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    if (error) {

        console.error(error);

        return;

    }


    const element =
        document.getElementById(
            "releaseCount"
        );


    if (element) {

        element.textContent =
            count || 0;

    }

}


// -----------------------------------------
// LOAD RELEASES
// -----------------------------------------

async function loadReleases() {

    const list =
        document.getElementById(
            "releaseList"
        );


    if (!list) return;


    const {
        data,
        error
    } =
        await supabaseClient

            .from("releases")

            .select("*")

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        list.innerHTML = `

            <div class="empty-state">

                No releases yet.

                <br><br>

                Create your first release to
                begin building your catalog.

            </div>

        `;

        return;

    }


    list.innerHTML =
        data.map(
            release => `

                <div class="list-card">

                    <div>

                        <h3>
                            ${escapeHtml(
                                release.title || "Untitled Release"
                            )}
                        </h3>

                        <p>

                            ${escapeHtml(
                                release.artist || "Unknown Artist"
                            )}

                            ·

                            ${escapeHtml(
                                release.release_type || "Release"
                            )}

                        </p>

                    </div>


                    <div class="status">

                        ${escapeHtml(
                            release.status || "DRAFT"
                        )}

                    </div>

                </div>

            `
        ).join("");

}


// -----------------------------------------
// LOGOUT
// -----------------------------------------

function setupLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );


    button?.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "./index.html";

        }
    );

}


// -----------------------------------------
// HTML ESCAPE
// -----------------------------------------

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}