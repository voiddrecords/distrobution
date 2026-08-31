// =========================================
// VOIDRECORDS OWNER / A&R DASHBOARD
// =========================================


// =========================================
// STATE
// =========================================

let currentUser = null;

let currentProfile = null;


// =========================================
// PAGE START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "VoidRecords dashboard starting..."
        );


        setupNavigation();

        setupArtistModal();

        setupLogout();


        // Check Supabase

        if (
            !window.supabase
        ) {

            console.error(
                "Supabase library did not load."
            );

            setUserMessage(
                "Supabase library failed to load."
            );

            return;

        }


        // Check the Supabase client

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "supabaseClient was not found."
            );

            setUserMessage(
                "Supabase configuration is missing."
            );

            return;

        }


        // Authenticate

        const loggedIn =
            await loadUser();


        if (!loggedIn) {
            return;
        }


        // Load dashboard

        await loadReleaseCount();

        await loadPendingReleaseCount();

        await loadReleaseInbox();

        await loadArtists();

    }
);


// =========================================
// USER
// =========================================

async function loadUser() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (
            error ||
            !data ||
            !data.user
        ) {

            console.error(
                "Authentication error:",
                error
            );

            window.location.href =
                "./index.html";

            return false;

        }


        currentUser =
            data.user;


        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .single();


        if (profileError) {

            console.error(
                "Profile error:",
                profileError
            );

            setUserMessage(
                "Profile could not be loaded."
            );

            return false;

        }


        currentProfile =
            profile;


        const userEmail =
            document.getElementById(
                "userEmail"
            );


        if (userEmail) {

            userEmail.textContent =
                currentUser.email ||
                "ACCOUNT";

        }


        // Owner / A&R only

        if (
            profile.role !== "owner" &&
            profile.role !== "ar"
        ) {


            if (
                profile.role ===
                "artist"
            ) {

                window.location.href =
                    "./artist/dashboard.html";

                return false;

            }


            alert(
                "You do not have permission to access this dashboard."
            );


            await supabaseClient.auth.signOut();


            window.location.href =
                "./index.html";


            return false;

        }


        return true;

    } catch (error) {

        console.error(
            "User loading failed:",
            error
        );


        window.location.href =
            "./index.html";


        return false;

    }

}


// =========================================
// NAVIGATION
// =========================================

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-item"
        );


    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const target =
                        button.dataset.section;


                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    sections.forEach(
                        section => {

                            section.classList.remove(
                                "active-section"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const targetSection =
                        document.getElementById(
                            target
                        );


                    if (
                        targetSection
                    ) {

                        targetSection.classList.add(
                            "active-section"
                        );

                    }


                    if (
                        target ===
                        "releases"
                    ) {

                        await loadReleaseInbox();

                    }


                    if (
                        target ===
                        "artists"
                    ) {

                        await loadArtists();

                    }

                }
            );

        }
    );

}


// =========================================
// TOTAL RELEASE COUNT
// =========================================

async function loadReleaseCount() {

    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from("releases")
                .select(
                    "id",
                    {
                        count:
                            "exact",
                        head:
                            true
                    }
                );


        if (error) {
            throw error;
        }


        const element =
            document.getElementById(
                "releaseCount"
            );


        if (element) {

            element.textContent =
                count || 0;

        }

    } catch (error) {

        console.error(
            "Release count error:",
            error
        );

    }

}


// =========================================
// PENDING RELEASE COUNT
// =========================================

async function loadPendingReleaseCount() {

    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from("releases")
                .select(
                    "id",
                    {
                        count:
                            "exact",
                        head:
                            true
                    }
                )
                .eq(
                    "status",
                    "SUBMITTED"
                );


        if (error) {
            throw error;
        }


        const element =
            document.getElementById(
                "pendingReleaseCount"
            );


        if (element) {

            element.textContent =
                count || 0;

        }

    } catch (error) {

        console.error(
            "Pending count error:",
            error
        );

    }

}


// =========================================
// RELEASE INBOX
// =========================================

async function loadReleaseInbox() {

    const list =
        document.getElementById(
            "releaseList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="empty-state">
            Loading releases...
        </div>
    `;


    try {

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
                        ascending:
                            false
                    }
                );


        if (error) {
            throw error;
        }


        renderReleaseInbox(
            data || []
        );


    } catch (error) {

        console.error(
            "Release inbox error:",
            error
        );


        list.innerHTML = `
            <div class="empty-state">

                Unable to load releases.

                <br><br>

                ${escapeHtml(
                    error.message ||
                    ""
                )}

            </div>
        `;

    }

}


// =========================================
// RENDER RELEASE INBOX
// =========================================

function renderReleaseInbox(
    releases
) {

    const list =
        document.getElementById(
            "releaseList"
        );


    if (!list) {
        return;
    }


    if (
        !releases ||
        releases.length === 0
    ) {

        list.innerHTML = `
            <div class="empty-state">

                No releases have been
                submitted yet.

            </div>
        `;

        return;

    }


    list.innerHTML =
        releases.map(
            release => {

                const status =
                    String(
                        release.status ||
                        "DRAFT"
                    ).toUpperCase();


                const date =
                    release.created_at
                        ? new Date(
                            release.created_at
                        ).toLocaleDateString()
                        : "";


                return `

                    <div
                        class="list-card release-card"
                    >

                        <div>

                            <h3>

                                ${escapeHtml(
                                    release.title ||
                                    "Untitled Release"
                                )}

                            </h3>


                            <p>

                                ${escapeHtml(
                                    release.artist ||
                                    "Unknown Artist"
                                )}

                                ·

                                ${escapeHtml(
                                    release.release_type ||
                                    "Release"
                                )}

                                ${
                                    date
                                        ? ` · ${escapeHtml(date)}`
                                        : ""
                                }

                            </p>

                        </div>


                        <div class="release-card-right">

                            <div class="status">

                                ${escapeHtml(
                                    status
                                )}

                            </div>


                            <button
                                type="button"
                                class="secondary-button"
                                onclick="openRelease('${escapeHtml(
                                    release.id
                                )}')"
                            >

                                VIEW

                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// =========================================
// OPEN RELEASE
// =========================================

async function openRelease(
    releaseId
) {

    try {

        const {
            data: release,
            error
        } =
            await supabaseClient
                .from("releases")
                .select("*")
                .eq(
                    "id",
                    releaseId
                )
                .single();


        if (error) {
            throw error;
        }


        showReleaseDetails(
            release
        );


    } catch (error) {

        console.error(
            "Open release error:",
            error
        );


        alert(
            "Unable to open release:\n\n" +
            error.message
        );

    }

}


// =========================================
// RELEASE DETAILS
// =========================================

function showReleaseDetails(
    release
) {

    let modal =
        document.getElementById(
            "releaseDetailsModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "releaseDetailsModal";


        modal.className =
            "modal";


        document.body.appendChild(
            modal
        );

    }


    const status =
        String(
            release.status ||
            "DRAFT"
        ).toUpperCase();


    modal.innerHTML = `

        <div class="modal-box">

            <button
                class="modal-close"
                type="button"
                onclick="closeReleaseDetails()"
            >
                ×
            </button>


            <p class="eyebrow">
                RELEASE REVIEW
            </p>


            <h2>

                ${escapeHtml(
                    release.title ||
                    "Untitled Release"
                )}

            </h2>


            <div class="release-detail-status">

                ${escapeHtml(
                    status
                )}

            </div>


            <div class="release-meta">


                <div>

                    <span>
                        ARTIST
                    </span>

                    <strong>

                        ${escapeHtml(
                            release.artist ||
                            "Unknown Artist"
                        )}

                    </strong>

                </div>


                <div>

                    <span>
                        RELEASE TYPE
                    </span>

                    <strong>

                        ${escapeHtml(
                            release.release_type ||
                            "Release"
                        )}

                    </strong>

                </div>


                <div>

                    <span>
                        RELEASE DATE
                    </span>

                    <strong>

                        ${escapeHtml(
                            release.release_date ||
                            "Not specified"
                        )}

                    </strong>

                </div>


            </div>


            ${
                release.description
                    ? `

                        <div
                            class="release-description"
                        >

                            <span>
                                DESCRIPTION
                            </span>

                            <p>

                                ${escapeHtml(
                                    release.description
                                )}

                            </p>

                        </div>

                    `
                    : ""
            }


            <div class="release-actions">


                ${
                    status !==
                    "APPROVED"

                        ? `

                            <button
                                type="button"
                                class="primary-button"
                                onclick="approveRelease('${escapeHtml(
                                    release.id
                                )}')"
                            >

                                APPROVE RELEASE

                            </button>

                          `

                        : ""
                }


                ${
                    status !==
                    "REJECTED"

                        ? `

                            <button
                                type="button"
                                class="secondary-button"
                                onclick="rejectRelease('${escapeHtml(
                                    release.id
                                )}')"
                            >

                                REJECT

                            </button>

                          `

                        : ""
                }


            </div>


        </div>

    `;


    modal.classList.remove(
        "hidden"
    );

}


// =========================================
// CLOSE RELEASE
// =========================================

function closeReleaseDetails() {

    const modal =
        document.getElementById(
            "releaseDetailsModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


// =========================================
// APPROVE RELEASE
// =========================================

async function approveRelease(
    releaseId
) {

    if (
        !confirm(
            "Approve this release?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("releases")
                .update({

                    status:
                        "APPROVED",

                    reviewed_at:
                        new Date()
                            .toISOString(),

                    reviewed_by:
                        currentUser.id

                })
                .eq(
                    "id",
                    releaseId
                );


        if (error) {
            throw error;
        }


        closeReleaseDetails();


        await loadReleaseInbox();

        await loadReleaseCount();

        await loadPendingReleaseCount();


        alert(
            "Release approved."
        );


    } catch (error) {

        console.error(
            "Approve release error:",
            error
        );


        alert(
            "Unable to approve release:\n\n" +
            error.message
        );

    }

}


// =========================================
// REJECT RELEASE
// =========================================

async function rejectRelease(
    releaseId
) {

    const reason =
        prompt(
            "Why is this release being rejected?"
        );


    if (
        reason === null
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("releases")
                .update({

                    status:
                        "REJECTED",

                    rejection_reason:
                        reason.trim(),

                    reviewed_at:
                        new Date()
                            .toISOString(),

                    reviewed_by:
                        currentUser.id

                })
                .eq(
                    "id",
                    releaseId
                );


        if (error) {
            throw error;
        }


        closeReleaseDetails();


        await loadReleaseInbox();

        await loadPendingReleaseCount();


        alert(
            "Release rejected."
        );


    } catch (error) {

        console.error(
            "Reject release error:",
            error
        );


        alert(
            "Unable to reject release:\n\n" +
            error.message
        );

    }

}


// =========================================
// ARTISTS
// =========================================

async function loadArtists() {

    const list =
        document.getElementById(
            "artistList"
        );


    if (!list) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, first_name, last_name, artist_name, role"
                )
                .eq(
                    "role",
                    "artist"
                )
                .order(
                    "artist_name",
                    {
                        ascending:
                            true
                    }
                );


        if (error) {
            throw error;
        }


        if (
            !data ||
            data.length === 0
        ) {

            list.innerHTML = `

                <div class="empty-state">

                    No artists added yet.

                    <br><br>

                    Add an artist to begin
                    managing their releases.

                </div>

            `;

            return;

        }


        list.innerHTML =
            data.map(
                artist => `

                    <div class="list-card">

                        <div>

                            <h3>

                                ${escapeHtml(
                                    artist.artist_name ||
                                    "Unnamed Artist"
                                )}

                            </h3>


                            <p>

                                ${escapeHtml(
                                    artist.first_name ||
                                    ""
                                )}

                                ${escapeHtml(
                                    artist.last_name ||
                                    ""
                                )}

                            </p>

                        </div>


                        <div class="status">

                            ARTIST

                        </div>

                    </div>

                `
            ).join("");


    } catch (error) {

        console.error(
            "Load artists error:",
            error
        );


        list.innerHTML = `

            <div class="empty-state">

                Unable to load artists.

                <br><br>

                ${escapeHtml(
                    error.message ||
                    ""
                )}

            </div>

        `;

    }

}


// =========================================
// ARTIST MODAL
// =========================================

function setupArtistModal() {

    const modal =
        document.getElementById(
            "artistModal"
        );


    const openButton =
        document.getElementById(
            "addArtistButton"
        );


    const closeButton =
        document.getElementById(
            "closeArtistModal"
        );


    const form =
        document.getElementById(
            "artistForm"
        );


    openButton?.addEventListener(
        "click",
        () => {

            clearArtistMessage();

            modal?.classList.remove(
                "hidden"
            );

        }
    );


    closeButton?.addEventListener(
        "click",
        () => {

            modal?.classList.add(
                "hidden"
            );

        }
    );


    modal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
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


            await createArtist(
                form,
                modal
            );

        }
    );

}


// =========================================
// CREATE ARTIST
// =========================================

async function createArtist(
    form,
    modal
) {

    const button =
        document.getElementById(
            "createArtistButton"
        );


    try {

        button.disabled =
            true;


        button.textContent =
            "CREATING...";


        clearArtistMessage();


        const formData =
            new FormData(form);


        const artistName =
            String(
                formData.get(
                    "artist_name"
                ) || ""
            ).trim();


        const firstName =
            String(
                formData.get(
                    "first_name"
                ) || ""
            ).trim();


        const lastName =
            String(
                formData.get(
                    "last_name"
                ) || ""
            ).trim();


        const email =
            String(
                formData.get(
                    "email"
                ) || ""
            ).trim();


        if (
            !artistName ||
            !firstName ||
            !lastName ||
            !email
        ) {

            throw new Error(
                "Please complete every field."
            );

        }


        /*
         * Secure Edge Function.
         *
         * This creates/invites the artist
         * without exposing a Supabase
         * service-role key in GitHub.
         */

        const {
            data,
            error
        } =
            await supabaseClient.functions.invoke(
                "create-artist",
                {

                    body: {

                        artist_name:
                            artistName,

                        first_name:
                            firstName,

                        last_name:
                            lastName,

                        email:
                            email

                    }

                }
            );


        if (error) {
            throw error;
        }


        if (
            data?.error
        ) {

            throw new Error(
                data.error
            );

        }


        form.reset();


        showArtistMessage(
            "Artist created and invitation sent.",
            "success"
        );


        await loadArtists();


        setTimeout(
            () => {

                modal.classList.add(
                    "hidden"
                );


                clearArtistMessage();

            },
            1200
        );


    } catch (error) {

        console.error(
            "Create artist error:",
            error
        );


        showArtistMessage(
            error.message ||
            "Unable to create artist.",
            "error"
        );


    } finally {

        button.disabled =
            false;


        button.textContent =
            "CREATE ARTIST";

    }

}


// =========================================
// ARTIST MESSAGE
// =========================================

function showArtistMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "artistFormMessage"
        );


    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.style.display =
        "block";


    message.className =
        "login-message " +
        type;

}


function clearArtistMessage() {

    const message =
        document.getElementById(
            "artistFormMessage"
        );


    if (!message) {
        return;
    }


    message.textContent =
        "";


    message.style.display =
        "none";

}


// =========================================
// LOGOUT
// =========================================

function setupLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );


    button?.addEventListener(
        "click",
        async () => {

            if (
                supabaseClient
            ) {

                await supabaseClient.auth.signOut();

            }


            window.location.href =
                "./index.html";

        }
    );

}


// =========================================
// USER MESSAGE
// =========================================

function setUserMessage(
    message
) {

    const element =
        document.getElementById(
            "userEmail"
        );


    if (element) {

        element.textContent =
            message;

    }

}


// =========================================
// HTML ESCAPE
// =========================================

function escapeHtml(
    value
) {

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
