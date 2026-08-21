```javascript
// ============================================
// VOIDRECORDS — ARTIST MANAGEMENT
// ============================================

const artistManagementSupabase = window.supabaseClient || window.supabase;


// ============================================
// ELEMENTS
// ============================================

const addArtistButton =
    document.getElementById("addArtistButton");

const artistModal =
    document.getElementById("artistModal");

const closeArtistModal =
    document.getElementById("closeArtistModal");

const artistForm =
    document.getElementById("artistForm");

const artistFormMessage =
    document.getElementById("artistFormMessage");

const createArtistButton =
    document.getElementById("createArtistButton");

const artistList =
    document.getElementById("artistList");

const artistEmptyState =
    document.getElementById("artistEmptyState");


// ============================================
// OPEN MODAL
// ============================================

addArtistButton?.addEventListener(
    "click",
    () => {

        artistForm.reset();

        artistFormMessage.textContent = "";

        artistModal.classList.remove("hidden");

        document
            .getElementById("newArtistName")
            ?.focus();
    }
);


// ============================================
// CLOSE MODAL
// ============================================

closeArtistModal?.addEventListener(
    "click",
    () => {

        artistModal.classList.add("hidden");

    }
);


// Close when clicking outside box

artistModal?.addEventListener(
    "click",
    (event) => {

        if (event.target === artistModal) {

            artistModal.classList.add("hidden");

        }

    }
);


// ============================================
// CREATE ARTIST
// ============================================

artistForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const artistName =
            document
                .getElementById("newArtistName")
                .value
                .trim();

        const firstName =
            document
                .getElementById("artistFirstName")
                .value
                .trim();

        const lastName =
            document
                .getElementById("artistLastName")
                .value
                .trim();

        const email =
            document
                .getElementById("artistEmail")
                .value
                .trim()
                .toLowerCase();


        if (
            !artistName ||
            !firstName ||
            !lastName ||
            !email
        ) {

            artistFormMessage.textContent =
                "Please complete all fields.";

            return;

        }


        createArtistButton.disabled = true;

        createArtistButton.textContent =
            "CREATING...";

        artistFormMessage.textContent = "";


        try {

            // ====================================
            // CHECK CURRENT ADMIN SESSION
            // ====================================

            const {
                data: {
                    session
                },
                error: sessionError
            } =
                await artistManagementSupabase
                    .auth
                    .getSession();


            if (
                sessionError ||
                !session
            ) {

                throw new Error(
                    "Your session has expired. Please sign in again."
                );

            }


            // ====================================
            // CALL SUPABASE EDGE FUNCTION
            // ====================================

            const {
                data,
                error
            } =
                await artistManagementSupabase
                    .functions
                    .invoke(
                        "create-artist",
                        {
                            body: {
                                artist_name: artistName,
                                first_name: firstName,
                                last_name: lastName,
                                email: email
                            }
                        }
                    );


            if (error) {

                throw error;

            }


            if (!data?.success) {

                throw new Error(
                    data?.error ||
                    "Unable to create artist."
                );

            }


            // ====================================
            // SUCCESS
            // ====================================

            artistFormMessage.textContent =
                "Artist created successfully. An invitation has been sent.";


            artistForm.reset();


            // Reload artist list

            await loadArtists();


            // Close after short delay

            setTimeout(
                () => {

                    artistModal.classList.add("hidden");

                    artistFormMessage.textContent = "";

                },
                1200
            );


        } catch (error) {

            console.error(
                "Create artist error:",
                error
            );


            artistFormMessage.textContent =
                error.message ||
                "Something went wrong.";

        } finally {

            createArtistButton.disabled = false;

            createArtistButton.textContent =
                "CREATE ARTIST";

        }

    }
);


// ============================================
// LOAD ARTISTS
// ============================================

async function loadArtists() {

    try {

        const {
            data: artists,
            error
        } =
            await artistManagementSupabase
                .from("artist_profiles")
                .select(
                    `
                    id,
                    artist_id,
                    artist_name,
                    portal_email,
                    status,
                    created_at
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Unable to load artists:",
                error
            );

            return;

        }


        // Remove existing cards

        const cards =
            artistList.querySelectorAll(
                ".list-card"
            );

        cards.forEach(
            card => card.remove()
        );


        if (
            !artists ||
            artists.length === 0
        ) {

            artistEmptyState.style.display =
                "block";

            return;

        }


        artistEmptyState.style.display =
            "none";


        artists.forEach(
            artist => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "list-card";


                card.innerHTML = `

                    <div>

                        <h3>
                            ${escapeHtml(
                                artist.artist_name
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                artist.artist_id
                            )}
                            ·
                            ${escapeHtml(
                                artist.portal_email
                            )}
                        </p>

                    </div>


                    <span class="status">

                        ${escapeHtml(
                            artist.status
                                .toUpperCase()
                        )}

                    </span>

                `;


                artistList.appendChild(card);

            }
        );


    } catch (error) {

        console.error(
            "Artist loading error:",
            error
        );

    }

}


// ============================================
// HTML ESCAPE
// ============================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================================
// INITIAL LOAD
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadArtists();

    }
);
```
