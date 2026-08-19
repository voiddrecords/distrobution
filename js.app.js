const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        return;
    }

    /*
        FRONTEND DEMO ONLY

        Replace this with your real authentication API
        when your backend is ready.
    */

    console.log("Login attempt:", email);

    alert(
        "Authentication is not connected yet. " +
        "Connect this form to your backend."
    );
});


/* =========================
   REQUEST AN INVITE
========================= */

function requestInvite() {
    window.location.href = "https://fiya8.github.io/voidrecords/";
}
