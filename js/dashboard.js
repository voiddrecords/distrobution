// =========================================
// VOIDRECORDS — DASHBOARD
// =========================================


// =========================================
// SUPABASE
// =========================================

const SUPABASE_URL =
    "https://kttpyshyutdmxhcqekxh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-r75b5qVPiikM20aF8NwA_I4h5lhau";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );


let currentUser = null;


// =========================================
// START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupNavigation();
        setupReleaseModal();
        setupArtistModal();
        setupLogout();

        const loggedIn =
            await loadUser();

        if (!loggedIn) {
            return;
        }

        await loadReleaseCount();
        await loadReleases();
        await loadArtists();

    }
);


// =========================================
// AUTHENTICATION
// =========================================

async function loadUser() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            redirectToLogin();

            return false;

        }


        const session =
            data?.session;


        if (!session) {

            redirectToLogin();

            return false;

        }


        currentUser =
            session.user;


        const emailElement =
            document.getElementById(
                "userEmail"
            );


        if (emailElement) {

            emailElement.textContent =
                currentUser.email || "";

        }


        await loadUserProfile();


        return true;


    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        redirectToLogin();

        return false;

    }

}


// =========================================
// USER PROFILE
// =========================================

async function loadUserProfile() {

    const nameElement =
        document.getElementById(
            "welcomeName"
        );


    if (!currentUser) {
        return;
    }


    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "first_name, last_name, artist_name, role"
            )
            .eq(
                "id",
                currentUser.id
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        if (nameElement) {
            nameElement.textContent =
                "there";
        }

        return;

    }


    if (!profile) {

        if (nameElement) {
            nameElement.textContent =
                "there";
        }

        return;

    }


    const firstName =
        profile.first_name?.trim();


    const artistName =
        profile.artist_name?.trim();


    const displayName =
        firstName ||
        artistName ||
        "there";


    if (nameElement) {

        nameElement.textContent =
            displayName;

    }


    currentUser.role =
        profile.role || null;

}


// =========================================
// REDIRECT
// =========================================

function redirectToLogin() {

    window.location.href =
        "./index.html";

}


// =========================================
// NAVIGATION
// =========================================

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
        button => {

            button.addEventListener(
                "click",
                () => {

                    const sectionName =
                        button.dataset.section;


                    navItems.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    sections.forEach(
                        section => {

                            section.classList.remove(
                                "active-section"
                            );

                        }
                    );


                    const section =
                        document.getElementById(
                            sectionName
                        );


                    if (section) {

                        section.classList.add(
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


    openButton?.addEventListener(
        "click",
        () => {

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
                event.target === modal
            ) {

                modal.classList.add(
                    "hidden"
                );

            }

        }
    );

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


    openButton?.addEventListener(
        "click",
        () => {

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
                event.target === modal
            ) {

                modal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// =========================================
// CREATE RELEASE
// =========================================

async function createRelease(event) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "You are not signed in."
        );

        return;

    }


    const title =
        document.getElementById(
            "releaseTitle"
        )?.value.trim();


    const artist =
        document.getElementById(
            "artistName"
        )?.value.trim();


    const releaseType =
        document.getElementById(
            "releaseType"
        )?.value;


    const releaseDate =
        document.getElementById(
            "releaseDate"
        )?.value;


    const description =
        document.getElementById(
            "releaseDescription"
        )?.value.trim() || "";


    const artworkFile =
        document.getElementById(
            "releaseArtwork"
        )?.files?.[0];


    const audioFile =
        document.getElementById(
            "releaseAudio"
        )?.files?.[0];


    const message =
        document.getElementById(
            "releaseFormMessage"
        );


    const submitButton =
        document.getElementById(
            "createReleaseSubmit"
        );


    if (
        !title ||
        !artist ||
        !releaseType ||
        !releaseDate
    ) {

        showReleaseMessage(
            "Please complete all release information."
        );

        return;

    }


    if (!artworkFile) {

        showReleaseMessage(
            "Please select release artwork."
        );

        return;

    }


    if (!audioFile) {

        showReleaseMessage(
            "Please select an audio file."
        );

        return;

    }


    if (artworkFile.size > 20 * 1024 * 1024) {

        showReleaseMessage(
            "Artwork must be 20 MB or smaller."
        );

        return;

    }


    if (audioFile.size > 500 * 1024 * 1024) {

        showReleaseMessage(
            "Audio file must be 500 MB or smaller."
        );

        return;

    }


    submitButton.disabled =
        true;


    submitButton.textContent =
        "CREATING RELEASE...";


    message.textContent =
        "";


    try {

        // =====================================
        // CREATE RELEASE RECORD
        // =====================================

        const {
            data: release,
            error: releaseError
        } =
            await supabaseClient
                .from("releases")
                .insert({

                    user_id:
                        currentUser.id,

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
                        "DRAFT"

                })
                .select()
                .single();


        if (releaseError) {

            throw new Error(
                releaseError.message
            );

        }


        if (!release?.id) {

            throw new Error(
                "Release was created, but no release ID was returned."
            );

        }


        const releaseId =
            release.id;


        // =====================================
        // FILE PATHS
        // =====================================

        const artworkExtension =
            getExtension(
                artworkFile.name
            );


        const audioExtension =
            getExtension(
                audioFile.name
            );


        const artworkPath =
            `${currentUser.id}/${releaseId}/artwork.${artworkExtension}`;


        const audioPath =
            `${currentUser.id}/${releaseId}/audio.${audioExtension}`;


        // =====================================
        // ARTWORK UPLOAD
        // =====================================

        submitButton.textContent =
            "UPLOADING ARTWORK...";


        const {
            error: artworkError
        } =
            await supabaseClient
                .storage
                .from("release-artwork")
                .upload(
                    artworkPath,
                    artworkFile,
                    {
                        cacheControl: "3600",
                        upsert: true
                    }
                );


        if (artworkError) {

            throw new Error(
                "Artwork upload failed: " +
                artworkError.message
            );

        }


        // =====================================
        // AUDIO UPLOAD
        // =====================================

        submitButton.textContent =
            "UPLOADING AUDIO...";


        const {
            error: audioError
        } =
            await supabaseClient
                .storage
                .from("release-audio")
                .upload(
                    audioPath,
                    audioFile,
                    {
                        cacheControl: "3600",
                        upsert: true
                    }
                );


        if (audioError) {

            throw new Error(
                "Audio upload failed: " +
                audioError.message
            );

        }


        // =====================================
        // SAVE STORAGE PATHS
        // =====================================

        submitButton.textContent =
            "FINISHING...";


        const {
            error: updateError
        } =
            await supabaseClient
                .from("releases")
                .update({

                    artwork_path:
                        artworkPath,

                    audio_path:
                        audioPath

                })
                .eq(
                    "id",
                    releaseId
                );


        if (updateError) {

            throw new Error(
                "Files uploaded, but the release could not save their paths: " +
                updateError.message
            );

        }


        // =====================================
        // SUCCESS
        // =====================================

        event.target.reset();


        document
            .getElementById(
                "releaseModal"
            )
            ?.classList.add(
                "hidden"
            );


        await loadReleaseCount();
        await loadReleases();


        alert(
            "Release created successfully!"
        );


    } catch (error) {

        console.error(
            "Release creation error:",
            error
        );


        showReleaseMessage(
            error.message ||
            "Unable to create release."
        );


    } finally {

        submitButton.disabled =
            false;


        submitButton.textContent =
            "CREATE RELEASE";

    }

}


// =========================================
// RELEASE MESSAGE
// =========================================

function showReleaseMessage(message) {

    const element =
        document.getElementById(
            "releaseFormMessage"
        );


    if (element) {

        element.textContent =
            message;

    }

}


// =========================================
// FILE EXTENSION
// =========================================

function getExtension(filename) {

    const parts =
        filename.split(".");


    if (parts.length < 2) {
        return "file";
    }


    return parts
        .pop()
        .toLowerCase()
        .replace(
            /[^a-z0-9]/g,
            ""
        );

}


// =========================================
// LOAD RELEASE COUNT
// =========================================

async function loadReleaseCount() {

    if (!currentUser) {
        return;
    }


    const element =
        document.getElementById(
            "releaseCount"
        );


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
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Release count error:",
            error
        );

        return;

    }


    if (element) {

        element.textContent =
            count ?? 0;

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


    if (!list || !currentUser) {
        return;
    }


    list.innerHTML =
        `<div class="empty-state">
            Loading releases...
        </div>`;


    const {
        data: releases,
        error
    } =
        await supabaseClient
            .from("releases")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Release loading error:",
            error
        );


        list.innerHTML =
            `<div class="empty-state">
                Unable to load releases.
                <br><br>
                ${escapeHtml(error.message)}
            </div>`;


        return;

    }


    if (
        !releases ||
        releases.length === 0
    ) {

        list.innerHTML =
            `<div class="empty-state">
                No releases yet.
                <br><br>
                Create your first release.
            </div>`;


        return;

    }


    list.innerHTML =
        "";


    releases.forEach(
        release => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "release-card";


            card.innerHTML = `

                <div class="release-card-content">

                    <p class="eyebrow">
                        ${escapeHtml(
                            release.release_type ||
                            "RELEASE"
                        )}
                    </p>

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
                    </p>

                    <div class="release-meta">

                        <span>
                            ${escapeHtml(
                                release.status ||
                                "DRAFT"
                            )}
                        </span>

                        <span>
                            ${escapeHtml(
                                release.release_date ||
                                ""
                            )}
                        </span>

                    </div>

                </div>

            `;


            list.appendChild(
                card
            );

        }
    );

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


    list.innerHTML =
        `<div class="empty-state">
            Loading artists...
        </div>`;


    const {
        data: artists,
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
            "Artist loading error:",
            error
        );


        list.innerHTML =
            `<div class="empty-state">
                Unable to load artists.
                <br><br>
                ${escapeHtml(error.message)}
            </div>`;


        return;

    }


    if (
        !artists ||
        artists.length === 0
    ) {

        list.innerHTML =
            `<div class="empty-state">
                No artists added yet.
                <br><br>
                Add an artist to begin.
            </div>`;


        return;

    }


    list.innerHTML =
        "";


    artists.forEach(
        artist => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "artist-card";


            const artistName =
                artist.artist_name ||
                artist.name ||
                "Unnamed Artist";


            card.innerHTML = `

                <div class="artist-card-content">

                    <p class="eyebrow">
                        ARTIST
                    </p>

                    <h3>
                        ${escapeHtml(
                            artistName
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            artist.email ||
                            ""
                        )}
                    </p>

                </div>

            `;


            list.appendChild(
                card
            );

        }
    );

}


// =========================================
// CREATE ARTIST
// =========================================

async function createArtist(event) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "You are not signed in."
        );

        return;

    }


    const artistName =
        document.getElementById(
            "newArtistName"
        )?.value.trim();


    const firstName =
        document.getElementById(
            "artistFirstName"
        )?.value.trim();


    const lastName =
        document.getElementById(
            "artistLastName"
        )?.value.trim();


    const email =
        document.getElementById(
            "artistEmail"
        )?.value.trim();


    const button =
        document.getElementById(
            "createArtistButton"
        );


    const message =
        document.getElementById(
            "artistFormMessage"
        );


    if (
        !artistName ||
        !firstName ||
        !lastName ||
        !email
    ) {

        if (message) {
            message.textContent =
                "Please complete all fields.";
        }

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "CREATING...";


    if (message) {
        message.textContent =
            "";
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .functions
                .invoke(
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

            throw new Error(
                error.message
            );

        }


        console.log(
            "Artist created:",
            data
        );


        event.target.reset();


        document
            .getElementById(
                "artistModal"
            )
            ?.classList.add(
                "hidden"
            );


        await loadArtists();


        alert(
            "Artist created successfully!"
        );


    } catch (error) {

        console.error(
            "Artist creation error:",
            error
        );


        if (message) {

            message.textContent =
                error.message ||
                "Unable to create artist.";

        }

    } finally {

        button.disabled =
            false;


        button.textContent =
            "CREATE ARTIST";

    }

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

            button.disabled =
                true;


            await supabaseClient.auth.signOut();


            window.location.href =
                "./index.html";

        }
    );

}


// =========================================
// FORM EVENTS
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById(
                "releaseForm"
            )
            ?.addEventListener(
                "submit",
                createRelease
            );


        document
            .getElementById(
                "artistForm"
            )
            ?.addEventListener(
                "submit",
                createArtist
            );

    }
);


// =========================================
// HTML ESCAPING
// =========================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
