import { dragModal } from "@/lib/component_lib";
/**
 * Builds and returns the Router configuration form.
 *
 * The form has two tab sections toggled via a nav panel:
 * - **basic-section**: interface selector with Add/Delete buttons, and
 *   per-interface IPv4 address and netmask inputs.
 * - **routing-rules-section**: destination IP/CIDR, exit interface, and
 *   next-hop inputs with Add/Delete rule buttons and a live
 *   `#routing-rules-table`.
 *
 * Event listeners wired up:
 * - `submit` → `saveRouterMenu`
 * - `#iface` change → `selectGraphicInterface`
 * - All inputs change → `registerNetworkChanges`
 * - `#del-iface` click → `deleteGraphicInterface`
 * - `#add-iface` click → `addGraphicInterface`
 * - All `.nav-panel` buttons click → `showRouterGraphicTab`
 * - `#btn-add-rule` click → `addRoutingRuleGraphicHandler`
 * - `#btn-del-rule` click → `removeRoutingRuleGraphicHandler`
 * - `.window-frame` mousedown → `dragModal`
 * - `#close-btn` click → `closeRouterMenu`
 *
 * @returns {HTMLFormElement} The assembled router configuration form element.
 */
export function router_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("router-form", "modal", "draggable-modal");
    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p></div>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab" data-tab="basic-section">Basic</button>
            <button class="btn-modern-blue dark" id="btn-routing-rules" data-tab="routing-rules-section">Routing Rules</button>
        </div>

        <section id="basic-section">

            <div class="interfaces-wrapper">
                <select id="iface"></select>
                <button class="btn-modern-red" id="del-iface">Delete</button>
                <button class="btn-modern-blue dark" id="add-iface">Add</button>
            </div>

            <div class="form-item">
                <label for="router-ip">IP Address (IPv4):</label>
                <input type="text" id="router-ip" name="router-ip">
            </div>

            <div class="form-item">
                <label for="router-netmask">Netmask:</label>
                <input type="text" name="router-netmask" id="router-netmask">
            </div>

            <div class="form-item">
                <button class="btn-modern-blue dark" style="padding: 10px;">Save</button>
                <button class="btn-modern-red dark" style="padding: 10px;" id="close-btn">Close</button>
            </div>

        </section>

        <section id="routing-rules-section" class="hidden">

            <div class="form-item">
                <label for="destination-ip">Destination IP (IPv4/CIDR):</label>
                <input type="text" id="destination-ip" name="destination-ip" placeholder="192.168.0.0/24">
            </div>

            <div class="form-item">
                <label for="gateway-interface">Exit Interface:</label>
                <input type="text" id="gateway-interface" name="gateway-interface" placeholder="enp0s3">
            </div>

            <div class="form-item">
                <label for="nexthop">Next Hop:</label>
                <input type="text" id="nexthop" name="nexthop" placeholder="0.0.0.0">
            </div>

            <div class="form-item">
                <button class="btn-modern-blue dark" style="padding: 10px;" id="btn-add-rule">Add Rule</button>
                <button class="btn-modern-red dark" style="padding: 10px;" id="btn-del-rule">Delete Rule</button>
            </div>

            <div class="table-wrapper"><table id="routing-rules-table" class="inner-table"></table></div>

        </section>

    `;

    $menu.addEventListener("submit", saveRouterMenu);
    $menu.querySelector("#iface").addEventListener("change", selectGraphicInterface);
    $menu.querySelectorAll("input").forEach(input => input.addEventListener("change", registerNetworkChanges));
    $menu.querySelector("#del-iface").addEventListener("click", deleteGraphicInterface);
    $menu.querySelector("#add-iface").addEventListener("click", addGraphicInterface);
    $menu.querySelector(".nav-panel").querySelectorAll("button").forEach(button => button.addEventListener("click", showRouterGraphicTab));
    $menu.querySelector("#btn-add-rule").addEventListener("click", addRoutingRuleGraphicHandler);
    $menu.querySelector("#btn-del-rule").addEventListener("click", removeRoutingRuleGraphicHandler);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#close-btn").addEventListener("click", closeRouterMenu);

    return $menu;

}

/**
 * Opens the router configuration form for the network device that triggered
 * the event and pre-populates all fields.
 *
 * - If `quickPingToggle` is active, performs a quick ping instead and returns.
 * - Populates `routerChangesBuffer` with the current IP/netmask for every
 *   interface so changes can be tracked without immediately committing them.
 * - Loads the first interface's values into the IP/netmask fields.
 * - Copies the current routing table from the device's `.routing-table` into
 *   `#routing-rules-table`.
 * - Closes the advanced-options popover before displaying the form.
 *
 * @param {Event} event - The click event originating from inside an `.item-dropped` element.
 * @returns {void}
 */
export function showRouterMenu(event) {

    event.stopPropagation();

    const $networkObject = event.target.closest(".item-dropped");

    if (quickPingToggle) {
        quickPing($networkObject.id);
        return;
    }

    //add the device id to the menu
    const $menu = document.querySelector(".router-form");
    $menu.dataset.id = $networkObject.id;
    $menu.querySelector(".frame-title").innerHTML = $networkObject.id;

    //load available interfaces

    const availableInterfaces = getInterfaces($networkObject.id);

    loadInterfaces("router-form");

    availableInterfaces.forEach(iface => {

        routerChangesBuffer[iface] = {
            ip: $networkObject.getAttribute("ip-" + iface),
            netmask: $networkObject.getAttribute("netmask-" + iface)
        };

    });

    //load the first interface information

    $menu.querySelector("#router-ip").value = routerChangesBuffer[availableInterfaces[0]].ip;
    $menu.querySelector("#router-netmask").value = routerChangesBuffer[availableInterfaces[0]].netmask;

    //load routing rules
    $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;

    //display the menu
    $networkObject.querySelector(".advanced-options-modal").style.display = "none";
    $menu.style.display = "flex";
}

/**
 * Handles form submission for the router menu.
 * Iterates over `routerChangesBuffer` and for each interface: validates the
 * IP and netmask (both may be empty to deconfigure), then calls either
 * `deconfigureInterface` (empty IP) or `configureInterface`. Finally refreshes
 * `#routing-rules-table` and renders a success popup.
 *
 * On validation failure, renders an error popup and returns without saving.
 *
 * @param {Event} event - The form submit event.
 * @returns {void}
 */
export function saveRouterMenu(event) {

    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const $networkObject = document.getElementById($menu.dataset.id);

    for (const networkObjectInterface in routerChangesBuffer){

        const ip = routerChangesBuffer[networkObjectInterface].ip;
        const netmask = routerChangesBuffer[networkObjectInterface].netmask;

        if (ip !== "" && !isValidIp(ip)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>IP "${ip}" is not valid.`));
            return;
        }

        if (netmask !== "" && !isValidIp(netmask)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>Netmask "${netmask}" is not valid.`));
            return;
        }

        if (ip === "") deconfigureInterface($networkObject.id, networkObjectInterface);
        else configureInterface($networkObject.id, ip, netmask, networkObjectInterface);

    }

    $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;
    bodyComponent.render(popupMessage(`Changes have been saved successfully.`));

}

/**
 * Closes the router form, clears the interface selector and `routerChangesBuffer`,
 * and hides the modal.
 *
 * @param {Event} event - The click event fired by the close button.
 * @returns {void}
 */
export function closeRouterMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $form = document.querySelector(".router-form");
    $form.querySelector("#iface").innerHTML = "";
    routerChangesBuffer = {};
    $form.style.display = "none";
}

/**
 * Updates the IP and netmask input fields to reflect the values stored in
 * `routerChangesBuffer` for the newly selected interface.
 *
 * @param {Event} event - The change event fired by the `#iface` select element.
 * @returns {void}
 */
export function selectGraphicInterface(event)  {
    const $select = event.target;
    const $menu = document.querySelector(".router-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const ip = routerChangesBuffer[$select.value].ip;
    const netmask = routerChangesBuffer[$select.value].netmask;
    $menu.querySelector("#router-ip").value = ip;
    $menu.querySelector("#router-netmask").value = netmask;
}

/**
 * Writes the current IP and netmask input values back into `routerChangesBuffer`
 * for the currently selected interface.
 * Called on any input change so pending edits are not lost when switching interfaces.
 *
 * @returns {void}
 */
export function registerNetworkChanges()  {
    const $form = document.querySelector(".router-form");
    const iface = $form.querySelector("#iface").value;
    const ip = $form.querySelector("#router-ip").value;
    const netmask = $form.querySelector("#router-netmask").value;
    routerChangesBuffer[iface] = { ip: ip, netmask: netmask };
}

/**
 * Adds a new network interface to the router device and updates the interface
 * selector and `routerChangesBuffer` accordingly.
 * The new interface is named `enp0s<N>` where N is the next available index.
 *
 * @param {Event} event - The click event fired by the Add interface button.
 * @returns {void}
 */
export function addGraphicInterface(event) {

    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $interfacesContainer = $menu.querySelector("#iface");

    //add the interface
    addInterface($networkObject.id);
    const index = maxIfaceIndex($networkObject.id);

    //add the new interface option
    $interfacesContainer.innerHTML += `<option value="enp0s${index}">enp0s${index}</option>`;

    //add a new interface reference
    routerChangesBuffer[`enp0s${index}`] = { ip: "",netmask: "" };

    bodyComponent.render(popupMessage(`Interface enp0s${index} added successfully.`));

}

/**
 * Removes the currently selected interface from the router device, the
 * interface selector, and `routerChangesBuffer`.
 *
 * Guards:
 * - `enp0s3` is protected and cannot be deleted.
 * - Interfaces with an active switch connection cannot be deleted.
 *
 * @param {Event} event - The click event fired by the Delete interface button.
 * @returns {void}
 */
export function deleteGraphicInterface(event) {

    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const currentInterface = $menu.querySelector("#iface").value;
    const fixedInterfaces = ["enp0s3"];

    if (fixedInterfaces.includes(currentInterface)) {
        bodyComponent.render(popupMessage(`<span>Error: </span>Interface ${currentInterface} cannot be deleted.`));
        return;
    }

    if ($networkObject.getAttribute("data-switch-" + currentInterface) !== "") {
        bodyComponent.render(popupMessage(`<span>Error: </span>Interface ${currentInterface} has an active connection.`));
        return;
    }

    deleteInterface($networkObject.id, currentInterface);

    $menu.querySelector("#iface").querySelectorAll("option").forEach($option => {
        if ($option.value === currentInterface) $option.remove();
    });

    delete routerChangesBuffer[currentInterface];

    bodyComponent.render(popupMessage(`Interface ${currentInterface} deleted successfully.`));
}

/**
 * Switches the visible section in the router form to the tab whose `data-tab`
 * attribute matches the clicked button, updating the active button highlight.
 *
 * @param {Event} event - The click event fired by a nav-panel tab button.
 * @returns {void}
 */
export function showRouterGraphicTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".router-form");
    const $targetButton = event.target;
    const $sections = $menu.querySelectorAll("section");
    const $navButtons = $menu.querySelector(".nav-panel").querySelectorAll("button");
    const $targetSection = $menu.querySelector(`#${$targetButton.getAttribute("data-tab")}`);
    $navButtons.forEach($button => $button.classList.remove("active"));
    $targetButton.classList.add("active");
    $sections.forEach($section => $section.classList.add("hidden"));
    $targetSection.classList.remove("hidden");
}

/**
 * Handles the "Añadir Regla" button click in the routing rules tab.
 * Reads destination IP/CIDR, exit interface, and next-hop from the form,
 * delegates validation and insertion to `addRoutingRuleGraphic`, then refreshes
 * `#routing-rules-table`. Renders an error popup on failure.
 *
 * @param {Event} event - The click event fired by the add-rule button.
 * @returns {void}
 */
export function addRoutingRuleGraphicHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const networkObjectId = $menu.dataset.id;
    const $networkObject = document.getElementById(networkObjectId);
    const $routingSection = $menu.querySelector("#routing-rules-section");

    //<-- get the rule parameters

    const destination = $routingSection.querySelector("#destination-ip").value;
    const gatewayInterface = $routingSection.querySelector("#gateway-interface").value;
    const nexthop = $routingSection.querySelector("#nexthop").value;

    //<-- try to add the rule

    try {
        addRoutingRuleGraphic(networkObjectId, destination, gatewayInterface, nexthop);
        $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;
    }catch (error) {
        bodyComponent.render(popupMessage(error.message));
    }

}

/**
 * Handles the "Eliminar Regla" button click in the routing rules tab.
 * Reads the destination IP/CIDR from the form, delegates validation and
 * removal to `removeRoutingRuleGraphic`, then refreshes `#routing-rules-table`.
 * Renders an error popup on failure.
 *
 * @param {Event} event - The click event fired by the remove-rule button.
 * @returns {void}
 */
export function removeRoutingRuleGraphicHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const networkObjectId = $menu.dataset.id;
    const $networkObject = document.getElementById(networkObjectId);
    const $routingSection = $menu.querySelector("#routing-rules-section");

    //<-- get the rule parameters

    const destination = $routingSection.querySelector("#destination-ip").value;

    //<-- try to remove the rule

    try {
        removeRoutingRuleGraphic(networkObjectId, destination);
        $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;
    }catch (error) {
        bodyComponent.render(popupMessage(error.message));
    }

}

/**
 * Validates and adds a static remote routing rule to the specified router device.
 *
 * Validation steps:
 * 1. `destination` must be a valid CIDR prefix and must represent a network
 *    address (host bits must be zero).
 * 2. `gatewayInterface` must exist on the device and must be configured with
 *    an IP address.
 * 3. `nexthop` must be a valid IPv4 address, reachable within the gateway
 *    interface's subnet, and must not be `0.0.0.0`.
 *
 * On success, calls `setRemoteRoutingRule` to persist the rule.
 *
 * @param {string} networkObjectId - The DOM id of the router element.
 * @param {string} destination - Destination network in CIDR notation (e.g. `"192.168.1.0/24"`).
 * @param {string} gatewayInterface - Name of the exit interface (e.g. `"enp0s3"`).
 * @param {string} nexthop - IPv4 address of the next hop router.
 * @returns {void}
 * @throws {Error} If any validation step fails.
 */
export function addRoutingRuleGraphic(networkObjectId, destination, gatewayInterface, nexthop) {

    //<-- validate destination IP

    if (!isValidCidrIp(destination)) throw new Error(`Error: expected a valid prefix instead of "${destination}".`);
    const [destinationIP, destinationNetmask] = parseCidr(destination);
    if (getNetwork(destinationIP, destinationNetmask) !== destinationIP) throw new Error(`Error: destination "${destination}" is NOT a network.`);

    //<-- validate the exit interface

    if (!(getInterfaces(networkObjectId)).includes(gatewayInterface)) throw new Error(`Error: interface "${gatewayInterface}" is not recognized.`);
    const [gatewayIp, gatewayNetmask, interfaceMac] = getIfaceData(networkObjectId, gatewayInterface);
    if (!gatewayIp) throw new Error(`Error: interface "${gatewayInterface}" is not configured.`);

    //<-- validate the next hop

    if (!isValidIp(nexthop)) throw new Error(`Error: expected a valid IP instead of "${nexthop}" for the next hop.`);
    if (getNetwork(gatewayIp, gatewayNetmask) !== getNetwork(nexthop, gatewayNetmask)) throw new Error(`Error: next hop "${nexthop}" is unreachable.`);
    if (nexthop === "0.0.0.0") throw new Error(`Error: next hop "${nexthop}" is not valid for a remote rule.`);

    setRemoteRoutingRule(networkObjectId,
        destinationIP, //destination network
        destinationNetmask, //netmask
        gatewayIp, //exit IP
        gatewayInterface, //interface
        nexthop //next hop IP
    );

}

/**
 * Validates and removes a static remote routing rule from the specified router device.
 *
 * Validation:
 * - `destination` must be a valid CIDR prefix and must represent a network address.
 *
 * On success, calls `removeRemoteRoutingRule` to delete the rule.
 *
 * @param {string} networkObjectId - The DOM id of the router element.
 * @param {string} destination - Destination network in CIDR notation (e.g. `"192.168.1.0/24"`).
 * @returns {void}
 * @throws {Error} If the destination is not a valid CIDR network address.
 */
export function removeRoutingRuleGraphic(networkObjectId, destination) {

    //<-- validate destination IP

    if (!isValidCidrIp(destination)) throw new Error(`Error: expected a valid prefix instead of "${destination}".`);
    const [destinationIP, destinationNetmask] = parseCidr(destination);
    if (getNetwork(destinationIP, destinationNetmask) !== destinationIP) throw new Error(`Error: destination "${destination}" is NOT a network.`);

    removeRemoteRoutingRule(networkObjectId,
        destinationIP, //destination network
        destinationNetmask //netmask
    );

}
