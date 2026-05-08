/**
 * Creates and returns the browser modal component as a `<div>` DOM node.
 * The element includes a header with window controls (close, minimize, maximize),
 * a tab bar, an address bar with a refresh button, and an `<iframe>` for content.
 * Event listeners are wired for dragging, navigation, and window management.
 * The element is not appended to the DOM; the caller is responsible for mounting it.
 *
 * @returns {HTMLDivElement} The fully configured browser modal element.
 */
function browser() {

    const $browser = document.createElement("div");
    $browser.classList.add("browser-component", "draggable-modal");
    $browser.setAttribute("data-id", "");

    $browser.innerHTML = `

        <div class="browser-header">

            <div class="browser-controls">
                <button class="control close" aria-label="Close"></button>
                <button class="control minimize" aria-label="Minimize"></button>
                <button class="control maximize" aria-label="Maximize"></button>
            </div>

            <div class="browser-tabs">
                <button class="tab active">New tab</button>
            </div>

            <div class="browser-address-bar">

                <div class="address-bar-icons">
                   <!-- <button class="icon back" aria-label="Back">◀</button>
                    <button class="icon forward" aria-label="Forward">▶</button> -->
                    <button class="icon refresh" aria-label="Refresh" id="btn-refresh">↻</button>
                </div>

                <input type="text" class="address-input" placeholder="https://www.example.com" aria-label="Address bar">

               <!-- <div class="address-bar-icons">
                    <button class="icon star" aria-label="Bookmark">★</button>
                    <button class="icon menu" aria-label="Menu">⋮</button>
                </div> -->

            </div>

        </div>

        <iframe class="browser-content"></iframe>
    `;

    $browser.querySelector(".browser-tabs").addEventListener("mousedown", dragModal);
    $browser.querySelector(".control.close").addEventListener("click", closeBrowser);
    $browser.querySelector(".control.minimize").addEventListener("click", minimizeBrowser);
    $browser.querySelector(".control.maximize").addEventListener("click", maximizeBrowser);
    $browser.querySelector(".address-input").addEventListener("keydown", event => {
        if (event.key === 'Enter') browserSearch();
    });
    $browser.querySelector(".address-input").addEventListener("mousedown", event => { event.stopPropagation(); });
    $browser.querySelector(".browser-content").addEventListener("mousedown", event => { event.stopPropagation(); });
    $browser.querySelector("#btn-refresh").addEventListener("click", browserSearch);

    return $browser;

}

//browser constants

/** @type {string} Inline HTML document used as the browser's default home page. */
const $BROWSERHOMEPAGE = `
    <title>Amin Search</title><meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport>
    <style>body{margin:0;display:grid;place-items:center;height:70vh}</style><img alt=logo src=./assets/browser/aminsearch.png>
`;

/** @type {string} Full HTML document displayed when a requested page is not found (404). */
const $BROWSERERRORPAGE = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Amin Search</title>
        <meta charset="UTF-8">
        <meta content="width=device-width,initial-scale=1" name="viewport">
        <style>
            :root {
                --primary-color: #2563eb;
                --accent-color: #ea580c;
                --text-color: #1e293b;
                --light-bg: #f8fafc;
                --dark-bg: #0f172a;
                --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1.6;
                color: var(--text-color);
                background-color: var(--light-bg);
                height: 100vh;
                display: grid;
                place-items: center;
                padding: 0 20px;
            }

            .container {
                max-width: 900px;
                width: 100%;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
                text-align: center;
                padding-bottom: 30px;
            }

            .error-header {
                background-color: var(--dark-bg);
                color: white;
                padding: 24px;
                margin-bottom: 20px;
            }

            .error-code {
                font-size: 96px;
                font-weight: 700;
                color: var(--primary-color);
                line-height: 1;
                margin: 20px 0;
            }

            h1 {
                color: var(--accent-color);
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 16px;
            }

            p {
                margin: 0 auto;
                max-width: 500px;
                font-size: 16px;
                padding: 0 20px;
            }

            @media (max-width: 768px) {
                .container {
                    margin: 20px auto;
                }

                .error-code {
                    font-size: 72px;
                }

                h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-header">
                <span>Amin Search</span>
            </div>
            <div class="error-code">404</div>
            <h1>Page Not Found!</h1>
            <p>The page you are looking for does not exist or has been moved to another location.</p>
            <p id="error-message"></p>
        </div>
    </body>
    </html>
`;

/**
 * Opens the browser modal and binds it to the network object that triggered the event.
 * Hides the advanced-options modal of the source device, resets the browser iframe to
 * the home page, makes the browser visible, and stores the network object's id in
 * `data-id` so subsequent navigation commands know which device is browsing.
 *
 * @param {MouseEvent} event - The click event fired from the network object's controls.
 * @returns {void}
 */
function openBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const $networkObject = event.target.closest(".item-dropped"); //get the nearest object
    $networkObject.querySelector(".advanced-options-modal").style.display = "none"; //hide the advanced options modal
    document.querySelector(".browser-content").srcdoc = $BROWSERHOMEPAGE //restore the original browser content
    document.querySelector(".browser-component").style.display = "flex"; //show the browser
    document.querySelector(".browser-component").setAttribute("data-id", $networkObject.id); //set the browser id
}

/**
 * Closes the browser modal and resets its content, address bar, and iframe source.
 * Does nothing if the browser is already in its minimized position (left === `"0px"`
 * or `"0%"`), preventing a close action from firing during a minimize animation.
 *
 * @param {MouseEvent} event - The click event fired by the close button.
 * @returns {void}
 */
function closeBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const browser = document.querySelector(".browser-component");
    if (browser.style.left !== "0px" && browser.style.left !== "0%") {
        //restore original browser content
        document.querySelector(".browser-content").innerHTML = `<img src="./assets/browser/aminsearch.png" alt="logo"></img>`;
        //clear the address input
        document.querySelector(".address-input").value = "";
        //remove the src reference
        document.querySelector(".browser-content").removeAttribute("src");
        //hide the browser
        document.querySelector(".browser-component").style.display = "none";
    }
}

/**
 * Animates the browser modal to a minimized thumbnail at the bottom-left corner of
 * the viewport (30 % of its current size). Resolves immediately if the browser is
 * hidden or already minimized. Returns a Promise that resolves when the CSS transition
 * ends.
 *
 * @returns {Promise<void>} Resolves when the minimize animation completes.
 */
async function minimizeBrowser() {
    const browser = document.querySelector(".browser-component");
    if (!browser || browser.style.display === "none") return resolve();
    if (browser.style.left === "0px" || browser.style.left === "0%") return resolve();
    return new Promise(resolve => {
        const rect = browser.getBoundingClientRect();
        const targetWidth = rect.width * 0.3;
        const targetHeight = rect.height * 0.3;
        const windowHeight = window.innerHeight;
        browser.style.transition = "all 0.5s ease-in-out";
        browser.style.width = `${targetWidth}px`;
        browser.style.height = `${targetHeight}px`;
        browser.style.top = `${windowHeight - targetHeight}px`;
        browser.style.left = "0%";
        browser.style.transform = "translate(0%, 0)";
        browser.addEventListener("transitionend", resolve, { once: true });
    });
}

/**
 * Animates the browser modal back to its default centered, full-size position
 * (60 dvw × 700 px, centered at 50 % / 40 %). Resolves immediately if the browser
 * is not present or is hidden. Returns a Promise that resolves when the CSS transition
 * ends and clears the transition property to avoid interfering with future dragging.
 *
 * @returns {Promise<void>} Resolves when the maximize animation completes.
 */
async function maximizeBrowser() {
    return new Promise(resolve => {
        const browser = document.querySelector(".browser-component");
        if (!browser || browser.style.display === "none") return;
        browser.style.transition = "all 0.5s ease-in-out";
        browser.style.width = "60dvw";
        browser.style.height = "700px";
        browser.style.top = "40%";
        browser.style.left = "50%";
        browser.style.transform = "translate(-50%, -50%)";
        browser.addEventListener("transitionend", () => {
            browser.style.transition = "none";
            resolve();
        }, { once: true });
    });
}
