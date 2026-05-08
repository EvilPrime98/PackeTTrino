/**
 * Builds, appends, and returns the Dynamic Routing confirmation modal.
 *
 * The modal contains:
 * - An optional CIDR input for a default network route (e.g. `8.0.0.0/8`).
 * - A confirm button that triggers `dynamicRoutingHandler`.
 * - A cancel button that triggers `closeDynamicRoutingModal`.
 *
 * As a side effect, makes the `.modal-overlay` visible immediately upon
 * creation.
 *
 * @returns {HTMLDivElement} The assembled dynamic-routing modal container element.
 */
function DynamicRoutingMenu() {

    const $menu = document.createElement("div");
    $menu.classList.add("dynamic-routing-modal-container", "modal");


    $menu.innerHTML = `

        <div class="dynamic-routing-modal">

            <h1> Automatic Routing Tool </h1>

            <div class="default-network-routing-container">
                <p>Default route to a network (Optional):</p>
                <input class="default-network-routing" type="text" placeholder="For example, 8.0.0.0/8">
            </div>

            <p>⚠︎ Are you sure you want to enable the Automatic Routing feature?</p>

            <button class="btn-accept btn-modern-blue dark no-animation">Yes, I want to route automatically</button>

            <button class="btn-reject btn-modern-red no-animation" id="close-btn">No, go back to panel</button>

        </div>
    `;

    $menu.querySelector(".btn-accept").addEventListener("click", dynamicRoutingHandler);
    $menu.querySelector(".btn-reject").addEventListener("click", closeDynamicRoutingModal);
    document.querySelector(".modal-overlay").style.display = "block";

    return $menu;

}

/**
 * Closes and removes the Dynamic Routing modal from the DOM.
 *
 * Hides the `.modal-overlay`, removes the event listeners from the confirm and
 * cancel buttons to avoid memory leaks, and removes the container element.
 *
 * @returns {void}
 */
function closeDynamicRoutingModal() {
    const $menu = document.querySelector(".dynamic-routing-modal-container");
    document.querySelector(".modal-overlay").style.display = "none";
    $menu.querySelector(".btn-accept").removeEventListener("click", dynamicRoutingHandler);
    $menu.querySelector(".btn-reject").removeEventListener("click", closeDynamicRoutingModal);
    $menu.remove();
}

/**
 * Confirms and executes automatic dynamic routing after optional CIDR validation.
 *
 * Steps:
 * 1. If a CIDR network is provided in the input, validates it with
 *    `isValidCidrIp` and `getNetwork`. On failure, renders an error popup and
 *    returns early. On success, sets the global `defaultNetwork` to the
 *    network address portion.
 * 2. Replaces the modal body with a `.loader` spinner.
 * 3. Calls `dynamicRouting()` inside a try/catch; renders an error popup if it
 *    throws.
 * 4. After a 1.5 s delay hides the overlay and removes the modal container.
 *
 * @async
 * @returns {Promise<void>} Resolves after the 1.5 s cleanup delay.
 */
async function dynamicRoutingHandler() {

    const $modalComponent = document.querySelector(".dynamic-routing-modal-container");
    const $inputComponentValue = $modalComponent.querySelector("input").value;

    if ( $inputComponentValue !== "") {

        if (!isValidCidrIp($inputComponentValue)) {
            bodyComponent.render(popupMessage(`<span>Error: </span> Invalid network format.`));
            return;
        }

        const [networkIp, networkNetmask] = parseCidr($inputComponentValue);

        if (getNetwork(networkIp, networkNetmask) !== networkIp) {
            bodyComponent.render(popupMessage(`<span> Error: </span> Does not match a valid network.`));
            return;
        }

        defaultNetwork = networkIp;

    }

    $modalComponent.querySelector(".dynamic-routing-modal").remove();

    $modalComponent.innerHTML += `<div class="loader"></div>`;

    try {
        dynamicRouting();
    }catch(error) {
        console.log(error);
        bodyComponent.render(popupMessage(`<span>Error: </span>An error occurred while enabling the Automatic Routing feature.`));
    }

    return new Promise(resolve => {
        setTimeout(() => {
            document.querySelector(".modal-overlay").style.display = "none";
            $modalComponent.remove();
            resolve();
        }, 1500);
    });

}
