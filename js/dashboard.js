// =========================================
// VOIDRECORDS DASHBOARD
// =========================================


// =========================================
// SUPABASE
// =========================================

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


let supabaseClient = null;


// =========================================
// PAGE START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "VoidRecords dashboard starting..."
        );


        // Always enable the interface first.

        setupNavigation();

        setupReleaseModal();

        setupArtistModal();

        setupLogout();


        // Check Supabase library.

        if (
            !window.supabase
        ) {

            console.error(
                "Supabase JavaScript library did not load."
            );

            setUserMessage(
                "Supabase library failed to load."
            );

            return;

        }


        // Create Supabase client.

        try {

            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_PUBLISHABLE_KEY
                );

        } catch (error) {

            console.error(
                "Supabase initialization failed:",
                error
            );

            setUserMessage(
                "Supabase configuration error."
            );

            return;

        }


        // Authenticate.

        const loggedIn =
            await loadUser();


        if (!loggedIn) {
            return;
        }


        // Load dashboard data.

        await loadReleaseCount();

        await loadReleases();

        await loadArtists();

    }
);


// =========================================
// USER
// =========================================

async function loadUser() {

    if (!supabaseClient) {
        return false;
    }


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


        const userEmail =
            document.getElementById(
                "userEmail"
            );


        if (userEmail) {

            userEmail.textContent =
                data.user.email || "ACCOUNT";

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
                () => {

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


                    if (targetSection) {

                        targetSection.classList.add(
                            "active-section"
                        );

                    }

                }
            );

        }
    );

}


// =========================================
// RELEASE MODAL
// =========================================

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


    if (!modal) {
        return;
    }


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


// =========================================
// CREATE RELEASE
// =========================================

async function createRelease(
    form,
    modal
) {

    if (!supabaseClient) {
        return;
    }


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !userData ||
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
            String(
                formData.get("title") || ""
            ).trim(),

        artist:
            String(
                formData.get("artist") || ""
            ).trim(),

        release_type:
            formData.get("release_type"),

        release_date:
            formData.get("release_date"),

        description:
            String(
                formData.get("description") || ""
            ).trim(),

        status:
            "DRAFT"

    };


    if (
        !release.title ||
        !release.artist ||
        !release.release_date
    ) {

        alert(
            "Please complete the required fields."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("releases")
            .insert(release);


    if (error) {

        console.error(
            "Create release error:",
            error
        );

        alert(
            "Unable to create release:\n\n" +
            error.message
        );

        return;

    }


    form.reset();

    modal.classList.add(
        "hidden"
    );


    await loadReleaseCount();

    await loadReleases();


    alert(
        "Release created successfully."
    );

}


// =========================================
// RELEASE COUNT
// =========================================

async function loadReleaseCount() {

    if (!supabaseClient) {
        return;
    }


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

        console.error(
            "Release count error:",
            error
        );

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


// =========================================
// LOAD RELEASES
// =========================================

async function loadReleases() {

    if (!supabaseClient) {
        return;
    }


    const list =
        document.getElementById(
            "releaseList"
        );


    if (!list) {
        return;
    }


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

        console.error(
            "Load releases error:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">
                Unable to load releases.
            </div>
        `;

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

                        </p>

                    </div>

                    <div class="status">

                        ${escapeHtml(
                            release.status ||
                            "DRAFT"
                        )}

                    </div>

                </div>

            `
        ).join("");

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


    if (!modal) {
        return;
    }


    openButton?.addEventListener(
        "click",
        () => {

            clearArtistMessage();

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

        if (button) {

            button.disabled = true;

            button.textContent =
                "CREATING...";

        }


        clearArtistMessage();


        const {
            data: userData,
            error: userError
        } =
            await supabaseClient.auth.getUser();


        if (
            userError ||
            !userData ||
            !userData.user
        ) {

            throw new Error(
                "Your session has expired. Please sign in again."
            );

        }


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
                "Please complete every artist field."
            );

        }


        // Existing invitation system.

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

            console.error(
                "Edge Function error:",
                error
            );

            throw new Error(
                error.message ||
                "Unable to create artist."
            );

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
            "Artist created. An invitation email has been sent.",
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
            "Artist creation failed:",
            error
        );


        showArtistMessage(
            error.message ||
            "Unable to create artist.",
            "error"
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "CREATE ARTIST";

        }

    }

}


// =========================================
// LOAD ARTISTS
// =========================================

async function loadArtists() {

    if (!supabaseClient) {
        return;
    }


    const list =
        document.getElementById(
            "artistList"
        );


    if (!list) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("artists")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Load artists error:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">
                Unable to load artists.
            </div>
        `;

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        list.innerHTML = `

            <div class="empty-state">

                No artists added yet.

                <br><br>

                Add an artist to begin managing
                their releases and distribution.

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
                                artist.email ||
                                "No portal email"
                            )}
                        </p>

                    </div>

                    <div class="status">

                        ${escapeHtml(
                            artist.status ||
                            "ACTIVE"
                        )}

                    </div>

                </div>

            `
        ).join("");

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


// =========================================
// CLEAR ARTIST MESSAGE
// =========================================

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

            if (supabaseClient) {

                await supabaseClient.auth.signOut();

            }


            window.location.href =
                "./index.html";

        }
    );

}


// =========================================
// ERROR MESSAGE
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
