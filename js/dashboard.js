// =========================================
// VOIDRECORDS DASHBOARD
// =========================================


// =========================================
// SUPABASE CONFIGURATION
// =========================================
//
// IMPORTANT:
// Replace these with your actual Supabase
// Project URL and Publishable Key.
//
// Do NOT use your service_role key here.
//

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


// =========================================
// SUPABASE CLIENT
// =========================================

let supabaseClient = null;

function initializeSupabase() {

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "Supabase library was not loaded."
        );

        return false;
    }

    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

        return true;

    } catch (error) {

        console.error(
            "Supabase initialization failed:",
            error
        );

        return false;
    }
}


// =========================================
// PAGE START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "VoidRecords dashboard starting..."
        );


        // Always initialize the UI first.

        setupNavigation();

        setupReleaseModal();

        setupArtistModal();

        setupLogout();


        // Then initialize Supabase.

        const supabaseReady =
            initializeSupabase();


        if (!supabaseReady) {

            setDashboardStatus(
                "OFFLINE"
            );

            return;
        }


        // Authenticate user.

        const loggedIn =
            await loadUser();


        if (!loggedIn) {
            return;
        }


        // Load dashboard information.

        await loadReleaseCount();

        await loadReleases();

        await loadArtists();


        setDashboardStatus(
            "READY"
        );


        console.log(
            "VoidRecords dashboard loaded."
        );

    }
);


// =========================================
// DASHBOARD STATUS
// =========================================

function setDashboardStatus(
    status
) {

    const statusElements =
        document.querySelectorAll(
            "[data-dashboard-status]"
        );


    statusElements.forEach(
        element => {

            element.textContent =
                status;

        }
    );

}


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

            console.warn(
                "No authenticated user.",
                error
            );


            window.location.href =
                "./index.html";


            return false;
        }


        const user =
            data.user;


        const userEmail =
            document.getElementById(
                "userEmail"
            );


        if (userEmail) {

            userEmail.textContent =
                user.email || "";

        }


        // Store useful information for
        // other dashboard functions.

        window.voidRecordsUser =
            user;


        return true;

    } catch (error) {

        console.error(
            "Authentication error:",
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


    if (!buttons.length) {

        console.warn(
            "No navigation buttons found."
        );

        return;
    }


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const target =
                        button.dataset.section;


                    if (!target) {
                        return;
                    }


                    // Remove active state.

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


                    // Activate clicked button.

                    button.classList.add(
                        "active"
                    );


                    // Activate requested section.

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


    // OPEN

    openButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            modal.classList.remove(
                "hidden"
            );

        }
    );


    // CLOSE

    closeButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            closeReleaseModal();

        }
    );


    // CLICK OUTSIDE

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeReleaseModal();

            }

        }
    );


    // ESCAPE KEY

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !modal.classList.contains("hidden")
            ) {

                closeReleaseModal();

            }

        }
    );


    // SUBMIT

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
// CLOSE RELEASE MODAL
// =========================================

function closeReleaseModal() {

    const modal =
        document.getElementById(
            "releaseModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
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

        alert(
            "Supabase is not connected yet."
        );

        return;
    }


    try {

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


        const title =
            String(
                formData.get("title") || ""
            ).trim();


        const artist =
            String(
                formData.get("artist") || ""
            ).trim();


        const releaseType =
            String(
                formData.get("release_type") || ""
            ).trim();


        const releaseDate =
            String(
                formData.get("release_date") || ""
            ).trim();


        const description =
            String(
                formData.get("description") || ""
            ).trim();


        if (
            !title ||
            !artist ||
            !releaseType ||
            !releaseDate
        ) {

            alert(
                "Please complete all required release fields."
            );

            return;
        }


        const release = {

            user_id:
                userData.user.id,

            title:
                title,

            artist:
                artist,

            release_type:
                releaseType,

            release_date:
                releaseDate,

            description:
                description,

            status:
                "PENDING"

        };


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
            "Release submitted successfully."
        );


    } catch (error) {

        console.error(
            "Create release failed:",
            error
        );


        alert(
            "Something went wrong while creating the release."
        );

    }

}


// =========================================
// RELEASE COUNT
// =========================================

async function loadReleaseCount() {

    if (!supabaseClient) {
        return;
    }


    const element =
        document.getElementById(
            "releaseCount"
        );


    if (!element) {
        return;
    }


    try {

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


        element.textContent =
            count || 0;


    } catch (error) {

        console.error(
            "Release count failed:",
            error
        );

    }

}


// =========================================
// LOAD RELEASES
// =========================================

async function loadReleases() {

    const list =
        document.getElementById(
            "releaseList"
        );


    if (!list) {
        return;
    }


    if (!supabaseClient) {

        list.innerHTML = `
            <div class="empty-state">
                Supabase is not connected.
            </div>
        `;

        return;
    }


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
            data
                .map(
                    release => {

                        const status =
                            release.status ||
                            "PENDING";


                        return `

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
                                        status
                                    )}

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "Loading releases failed:",
            error
        );

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


    if (!modal) {
        return;
    }


    // OPEN

    openButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            clearArtistMessage();

            modal.classList.remove(
                "hidden"
            );

        }
    );


    // CLOSE

    closeButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            closeArtistModal();

        }
    );


    // CLICK OUTSIDE

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeArtistModal();

            }

        }
    );


    // ESCAPE

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !modal.classList.contains("hidden")
            ) {

                closeArtistModal();

            }

        }
    );


    // SUBMIT

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
// CLOSE ARTIST MODAL
// =========================================

function closeArtistModal() {

    const modal =
        document.getElementById(
            "artistModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
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

        if (!supabaseClient) {

            throw new Error(
                "Supabase is not connected."
            );

        }


        if (button) {

            button.disabled = true;

            button.textContent =
                "CREATING...";

        }


        clearArtistMessage();


        // Check session.

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


        // Your existing invitation system.

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
                "Create artist function error:",
                error
            );


            throw new Error(
                error.message ||
                "Unable to create artist."
            );

        }


        if (
            data &&
            data.error
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

                closeArtistModal();

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

    const list =
        document.getElementById(
            "artistList"
        );


    if (!list) {
        return;
    }


    if (!supabaseClient) {

        list.innerHTML = `
            <div class="empty-state">
                Supabase is not connected.
            </div>
        `;

        return;
    }


    try {

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
            data
                .map(
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
                )
                .join("");


    } catch (error) {

        console.error(
            "Loading artists failed:",
            error
        );

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


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            if (!supabaseClient) {

                window.location.href =
                    "./index.html";

                return;
            }


            try {

                await supabaseClient.auth.signOut();

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }


            window.location.href =
                "./index.html";

        }
    );

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
