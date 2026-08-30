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


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =========================================
// GLOBAL USER
// =========================================

let currentUser = null;
let currentProfile = null;


// =========================================
// PAGE START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // Start interface first.

        setupNavigation();

        setupReleaseModal();

        setupArtistModal();

        setupLogout();

        setupDistributionForm();


        // Authenticate.

        const loggedIn =
            await loadUser();


        if (!loggedIn) {
            return;
        }


        // Load dashboard.

        await loadReleaseCount();

        await loadReleases();

        await loadArtists();

        await loadDistributionRequests();

    }
);


// =========================================
// USER
// =========================================

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

        return false;

    }


    currentUser =
        data.user;


    const userEmail =
        document.getElementById(
            "userEmail"
        );


    if (userEmail) {

        userEmail.textContent =
            data.user.email || "";

    }


    // Try to load the user's profile.

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient

            .from("profiles")

            .select("*")

            .eq(
                "id",
                data.user.id
            )

            .maybeSingle();


    if (!profileError) {

        currentProfile =
            profile;

    }


    return true;

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


                    if (targetSection) {

                        targetSection.classList.add(
                            "active-section"
                        );

                    }


                    // Refresh data when
                    // entering important sections.

                    if (
                        target === "releases"
                    ) {

                        await loadReleases();

                    }


                    if (
                        target === "artists"
                    ) {

                        await loadArtists();

                    }


                    if (
                        target === "distribution"
                    ) {

                        await loadDistributionRequests();

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

    if (!currentUser) {

        alert(
            "Your session has expired."
        );

        return;

    }


    const formData =
        new FormData(form);


    const release = {

        user_id:
            currentUser.id,

        title:
            String(
                formData.get("title") || ""
            ).trim(),

        artist:
            String(
                formData.get("artist") || ""
            ).trim(),

        release_type:
            formData.get(
                "release_type"
            ),

        release_date:
            formData.get(
                "release_date"
            ),

        description:
            String(
                formData.get(
                    "description"
                ) || ""
            ).trim(),

        status:
            "DRAFT"

    };


    if (!release.title) {

        alert(
            "Enter a release title."
        );

        return;

    }


    if (!release.artist) {

        alert(
            "Enter an artist name."
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

    const list =
        document.getElementById(
            "releaseList"
        );


    if (!list) {
        return;
    }


    let query =
        supabaseClient

            .from("releases")

            .select("*")

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    // Artists only see their own releases.

    if (
        currentProfile?.role === "artist"
    ) {

        query =
            query.eq(
                "user_id",
                currentUser.id
            );

    }


    const {
        data,
        error
    } =
        await query;


    if (error) {

        console.error(
            "Load releases error:",
            error
        );

        list.innerHTML = `

            <div class="empty-state">

                Unable to load releases.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

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
            release => {

                const status =
                    String(
                        release.status ||
                        "DRAFT"
                    ).toUpperCase();


                const ownerActions =
                    isOwner() &&
                    (
                        status === "PENDING" ||
                        status === "APPROVED"
                    )
                    ?
                    getOwnerReleaseActions(
                        release
                    )
                    :
                    "";


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


                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:10px;
                            "
                        >

                            <div
                                class="status ${status.toLowerCase().replaceAll("_", "-")}"
                            >

                                ${escapeHtml(
                                    status
                                )}

                            </div>

                            ${ownerActions}

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// =========================================
// OWNER RELEASE ACTIONS
// =========================================

function getOwnerReleaseActions(
    release
) {

    const status =
        String(
            release.status ||
            "DRAFT"
        ).toUpperCase();


    if (
        status === "PENDING"
    ) {

        return `

            <button
                class="approve-button"
                type="button"
                onclick="approveRelease('${release.id}')"
            >
                APPROVE
            </button>

            <button
                class="decline-button"
                type="button"
                onclick="declineRelease('${release.id}')"
            >
                DECLINE
            </button>

        `;

    }


    if (
        status === "APPROVED"
    ) {

        return `

            <button
                class="takedown-button"
                type="button"
                onclick="takedownRelease('${release.id}')"
            >
                TAKE DOWN
            </button>

        `;

    }


    return "";

}


// =========================================
// APPROVE RELEASE
// =========================================

async function approveRelease(
    releaseId
) {

    if (!isOwner()) {

        alert(
            "Only an owner can approve releases."
        );

        return;

    }


    const confirmed =
        confirm(
            "Approve this release for distribution?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient

            .from("releases")

            .update({

                status:
                    "APPROVED",

                reviewed_by:
                    currentUser.id,

                reviewed_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                releaseId
            );


    if (error) {

        console.error(error);

        alert(
            "Unable to approve release:\n\n" +
            error.message
        );

        return;

    }


    await loadReleases();

    await loadDistributionRequests();


    alert(
        "Release approved."
    );

}


// =========================================
// DECLINE RELEASE
// =========================================

async function declineRelease(
    releaseId
) {

    if (!isOwner()) {

        alert(
            "Only an owner can decline releases."
        );

        return;

    }


    const reason =
        prompt(
            "Optional reason for declining this release:"
        );


    const {
        error
    } =
        await supabaseClient

            .from("releases")

            .update({

                status:
                    "DECLINED",

                review_note:
                    reason || null,

                reviewed_by:
                    currentUser.id,

                reviewed_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                releaseId
            );


    if (error) {

        console.error(error);

        alert(
            "Unable to decline release:\n\n" +
            error.message
        );

        return;

    }


    await loadReleases();

    await loadDistributionRequests();


    alert(
        "Release declined."
    );

}


// =========================================
// TAKE DOWN RELEASE
// =========================================

async function takedownRelease(
    releaseId
) {

    if (!isOwner()) {

        alert(
            "Only an owner can take down releases."
        );

        return;

    }


    const confirmed =
        confirm(
            "Take this release down?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient

            .from("releases")

            .update({

                status:
                    "TAKEN_DOWN",

                reviewed_by:
                    currentUser.id,

                reviewed_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                releaseId
            );


    if (error) {

        console.error(error);

        alert(
            "Unable to take down release:\n\n" +
            error.message
        );

        return;

    }


    await loadReleases();

    await loadDistributionRequests();


    alert(
        "Release taken down."
    );

}


// =========================================
// DISTRIBUTION FORM
// =========================================

function setupDistributionForm() {

    const form =
        document.getElementById(
            "distributionForm"
        );


    if (!form) {
        return;
    }


    const audioInput =
        document.getElementById(
            "audioFile"
        );


    const artworkInput =
        document.getElementById(
            "artworkFile"
        );


    audioInput?.addEventListener(
        "change",
        () => {

            validateAudioFile(
                audioInput
            );

        }
    );


    artworkInput?.addEventListener(
        "change",
        async () => {

            await validateArtwork(
                artworkInput
            );

        }
    );


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await submitDistributionRequest(
                form
            );

        }
    );

}


// =========================================
// AUDIO VALIDATION
// =========================================

function validateAudioFile(
    input
) {

    const file =
        input.files?.[0];


    if (!file) {
        return false;
    }


    const extension =
        getExtension(
            file.name
        );


    if (
        extension !== "wav"
    ) {

        input.value = "";


        alert(
            "The audio file must be a WAV file."
        );


        return false;

    }


    return true;

}


// =========================================
// ARTWORK VALIDATION
// =========================================

async function validateArtwork(
    input
) {

    const file =
        input.files?.[0];


    if (!file) {
        return false;
    }


    const extension =
        getExtension(
            file.name
        );


    if (
        extension !== "jpg" &&
        extension !== "jpeg"
    ) {

        input.value = "";


        alert(
            "The cover artwork must be a JPG or JPEG file."
        );


        return false;

    }


    try {

        const dimensions =
            await getImageDimensions(
                file
            );


        if (
            dimensions.width !== 3000 ||
            dimensions.height !== 3000
        ) {

            input.value = "";


            alert(
                "Artwork must be exactly 3000 × 3000 pixels."
            );


            return false;

        }


        return true;

    } catch (error) {

        console.error(error);

        input.value = "";


        alert(
            "Unable to read the artwork file."
        );


        return false;

    }

}


// =========================================
// IMAGE DIMENSIONS
// =========================================

function getImageDimensions(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const image =
                new Image();


            const url =
                URL.createObjectURL(
                    file
                );


            image.onload =
                () => {

                    URL.revokeObjectURL(
                        url
                    );


                    resolve({

                        width:
                            image.naturalWidth,

                        height:
                            image.naturalHeight

                    });

                };


            image.onerror =
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                    reject(
                        new Error(
                            "Invalid image."
                        )
                    );

                };


            image.src =
                url;

        }
    );

}


// =========================================
// SUBMIT DISTRIBUTION
// =========================================

async function submitDistributionRequest(
    form
) {

    if (!currentUser) {

        alert(
            "You must be signed in."
        );

        return;

    }


    const formData =
        new FormData(form);


    const releaseId =
        String(
            formData.get(
                "release_id"
            ) || ""
        );


    const audioFile =
        document.getElementById(
            "audioFile"
        )?.files?.[0];


    const artworkFile =
        document.getElementById(
            "artworkFile"
        )?.files?.[0];


    if (!releaseId) {

        alert(
            "Please select a release."
        );

        return;

    }


    if (!audioFile) {

        alert(
            "Please select a WAV audio file."
        );

        return;

    }


    if (!artworkFile) {

        alert(
            "Please select JPG artwork."
        );

        return;

    }


    if (
        !validateAudioFile(
            document.getElementById(
                "audioFile"
            )
        )
    ) {

        return;

    }


    if (
        !await validateArtwork(
            document.getElementById(
                "artworkFile"
            )
        )
    ) {

        return;

    }


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    try {

        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "UPLOADING...";

        }


        // ---------------------------------
        // AUDIO
        // ---------------------------------

        const audioPath =
            `releases/${currentUser.id}/${crypto.randomUUID()}.wav`;


        const {
            error: audioError
        } =
            await supabaseClient.storage

                .from("distribution")

                .upload(
                    audioPath,
                    audioFile,
                    {
                        contentType:
                            "audio/wav",

                        upsert:
                            false
                    }
                );


        if (audioError) {

            throw audioError;

        }


        // ---------------------------------
        // ARTWORK
        // ---------------------------------

        const artworkPath =
            `artwork/${currentUser.id}/${crypto.randomUUID()}.jpg`;


        const {
            error: artworkError
        } =
            await supabaseClient.storage

                .from("distribution")

                .upload(
                    artworkPath,
                    artworkFile,
                    {
                        contentType:
                            "image/jpeg",

                        upsert:
                            false
                    }
                );


        if (artworkError) {

            throw artworkError;

        }


        // ---------------------------------
        // UPDATE RELEASE
        // ---------------------------------

        const {
            error: updateError
        } =
            await supabaseClient

                .from("releases")

                .update({

                    audio_path:
                        audioPath,

                    artwork_path:
                        artworkPath,

                    status:
                        "PENDING",

                    submitted_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    releaseId
                );


        if (updateError) {

            throw updateError;

        }


        form.reset();


        await loadReleases();

        await loadDistributionRequests();


        alert(
            "Release submitted for owner review."
        );


    } catch (error) {

        console.error(
            "Distribution submission error:",
            error
        );


        alert(
            "Unable to submit release:\n\n" +
            (
                error.message ||
                "Unknown error"
            )
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "SUBMIT FOR DISTRIBUTION";

        }

    }

}


// =========================================
// DISTRIBUTION REQUESTS
// =========================================

async function loadDistributionRequests() {

    const list =
        document.getElementById(
            "distributionList"
        );


    if (!list) {
        return;
    }


    let query =
        supabaseClient

            .from("releases")

            .select("*")

            .in(
                "status",
                [
                    "PENDING",
                    "APPROVED",
                    "DECLINED",
                    "TAKEN_DOWN"
                ]
            )

            .order(
                "submitted_at",
                {
                    ascending: false
                }
            );


    if (
        currentProfile?.role === "artist"
    ) {

        query =
            query.eq(
                "user_id",
                currentUser.id
            );

    }


    const {
        data,
        error
    } =
        await query;


    if (error) {

        console.error(
            "Distribution request error:",
            error
        );

        list.innerHTML = `

            <div class="empty-state">

                Unable to load distribution requests.

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

                No distribution requests yet.

            </div>

        `;

        return;

    }


    list.innerHTML =
        data.map(
            release => {

                const status =
                    String(
                        release.status ||
                        "PENDING"
                    ).toUpperCase();


                let actions = "";


                if (
                    isOwner() &&
                    status === "PENDING"
                ) {

                    actions = `

                        <div class="distribution-actions">

                            <button
                                class="approve-button"
                                type="button"
                                onclick="approveRelease('${release.id}')"
                            >
                                APPROVE
                            </button>

                            <button
                                class="decline-button"
                                type="button"
                                onclick="declineRelease('${release.id}')"
                            >
                                DECLINE
                            </button>

                        </div>

                    `;

                }


                if (
                    isOwner() &&
                    status === "APPROVED"
                ) {

                    actions = `

                        <div class="distribution-actions">

                            <button
                                class="takedown-button"
                                type="button"
                                onclick="takedownRelease('${release.id}')"
                            >
                                TAKE DOWN
                            </button>

                        </div>

                    `;

                }


                return `

                    <div class="distribution-card">

                        <div class="distribution-header">

                            <div class="distribution-title">

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

                            </div>


                            <div
                                class="status ${status.toLowerCase().replaceAll("_", "-")}"
                            >
                                ${escapeHtml(
                                    status
                                )}
                            </div>

                        </div>


                        <div class="distribution-meta">

                            <div class="distribution-meta-item">

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


                            <div class="distribution-meta-item">

                                <span>
                                    RELEASE DATE
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        release.release_date ||
                                        "Not set"
                                    )}
                                </strong>

                            </div>


                            <div class="distribution-meta-item">

                                <span>
                                    FILE STATUS
                                </span>

                                <strong>
                                    ${
                                        release.audio_path &&
                                        release.artwork_path
                                            ? "FILES READY"
                                            : "FILES MISSING"
                                    }
                                </strong>

                            </div>

                        </div>


                        ${
                            release.review_note
                                ? `

                                    <div class="review-panel">

                                        <h4>
                                            REVIEW NOTE
                                        </h4>

                                        <p>
                                            ${escapeHtml(
                                                release.review_note
                                            )}
                                        </p>

                                    </div>

                                `
                                : ""
                        }


                        ${actions}

                    </div>

                `;

            }
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

        button.disabled =
            true;

        button.textContent =
            "CREATING...";


        clearArtistMessage();


        if (!currentUser) {

            throw new Error(
                "Your session has expired."
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

        button.disabled =
            false;

        button.textContent =
            "CREATE ARTIST";

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

                <div class="artist-card">

                    <div class="artist-card-info">

                        <div class="artist-avatar">

                            ${escapeHtml(
                                (
                                    artist.artist_name ||
                                    "A"
                                ).charAt(0).toUpperCase()
                            )}

                        </div>


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
// ROLE CHECK
// =========================================

function isOwner() {

    if (!currentProfile) {
        return false;
    }


    const role =
        String(
            currentProfile.role || ""
        ).toLowerCase();


    return (
        role === "owner" ||
        role === "label_manager"
    );

}


// =========================================
// FILE EXTENSION
// =========================================

function getExtension(
    filename
) {

    return String(
        filename || ""
    )
        .split(".")
        .pop()
        .toLowerCase();

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

            await supabaseClient.auth.signOut();

            window.location.href =
                "./index.html";

        }
    );

}


// =========================================
// HTML ESCAPE
// =========================================

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
