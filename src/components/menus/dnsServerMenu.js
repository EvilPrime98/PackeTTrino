import { dragModal } from "@/lib/component_lib";

/**
 * Builds and returns the DNS server configuration form.
 *
 * The form has two tab sections toggled via a nav panel:
 * - **basic-section**: optional network settings (`#network-section`, shown only
 *   for pure DNS servers) with interface/IP/netmask/gateway inputs, plus
 *   toggles for recursive and cache DNS modes.
 * - **records-section**: DNS record management (domain, type A/CNAME/NS/SOA,
 *   value, and SOA-specific serial/TTL fields) with add/remove buttons and a
 *   live `#records-table`.
 *
 * Event listeners wired up:
 * - `submit` → `saveDnsServerMenu`
 * - `.window-frame` mousedown → `dragModal`
 * - `#close-btn` click → `closeDnsMenu`
 * - All `.nav-panel` buttons click → `showDnsGraphicTab`
 * - `#btn-add-record` click → `addDnsRecordHandler`
 * - `#btn-del-record` click → `removeDnsRecordHandler`
 * - `#type` change → `recordTypeHandler`
 * - `#iface` change → `interfaceHandler(..., "dns-form")`
 *
 * @returns {HTMLFormElement} The assembled DNS server configuration form element.
 */
export function dns_server_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dns-form", "modal", "draggable-modal");
    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p> </div>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab" data-tab="basic-section">Basic</button>
            <button class="btn-modern-blue dark" id="btn-records" data-tab="records-section">Records</button>
        </div>

        <section id="basic-section">

            <section id="network-section" class="hidden">

                <div class="form-item">
                    <label for="iface">Interface:</label>
                    <select id="iface" name="iface"></select>
                </div>

                <div class="form-item">
                    <label for="ip">IP Address (IPv4):</label>
                    <input type="text" id="ip" name="ip">
                </div>

                <div class="form-item">
                    <label for="netmask">Netmask:</label>
                    <input type="text" id="netmask" name="netmask">
                </div>

                <div class="form-item">
                    <label for="gateway">Gateway:</label>
                    <input type="text" id="gateway" name="gateway">
                </div>

            </section>

            <section id ="dns-server-section">

                <div class="form-item">
                    <label for="dns-recursive">Recursive DNS Server:</label>
                    <input class="btn-toggle" type="checkbox" id="dns-recursive" name="dns-recursive">
                </div>

                <div class="form-item">
                    <label for="dns-cache">Cache DNS Server:</label>
                    <input class="btn-toggle" type="checkbox" id="dns-cache" name="dns-cache">
                </div>

            </section>

            <div class="button-wrapper">
                <button class="btn-modern-blue dark" type="submit">Save</button>
                <button class="btn-modern-red dark" id="close-btn">Close</button>
            </div>

        </section>

        <section id="records-section" class="hidden">

            <div class="form-item">
                <label for="domain">Domain:</label>
                <input type="text" id="domain" name="domain">
            </div>

            <div class="form-item">
                <label for="type">Record Type:</label>
                <select id="type" name="type">
                    <option value="A">A</option>
                    <option value="CNAME">CNAME</option>
                    <option value="NS">NS</option>
                    <option value="SOA">SOA</option>
                </select>
            </div>

            <div class="form-item">
                <label for="value">Value:</label>
                <input type="text" id="value" name="value">
            </div>

            <div class="soa-record-wrapper hidden">

                <div class="form-item">
                    <label for="serial">Serial Number:</label>
                    <input type="text" id="serial" name="serial">
                </div>

                <div class="form-item">
                    <label for="cache-ttl">Cache TTL:</label>
                    <input type="text" id="cache-ttl" name="cache-ttl">
                </div>

            </div>

            <div class="button-wrapper">
                <button class="btn-modern-blue dark" id="btn-add-record" style="padding: 5px;">Add Record</button>
                <button class="btn-modern-red dark" id="btn-del-record" style="padding: 5px;">Delete Record</button>
            </div>

            <div class="table-wrapper">
                <table id="records-table" class="inner-table"></table>
            </div>

        </section>

    `;

    $menu.addEventListener("submit", saveDnsServerMenu);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#close-btn").addEventListener("click", closeDnsMenu);
    $menu.querySelector(".nav-panel").querySelectorAll("button").forEach(button => button.addEventListener("click", showDnsGraphicTab));
    $menu.querySelector("#btn-add-record").addEventListener("click", addDnsRecordHandler);
    $menu.querySelector("#btn-del-record").addEventListener("click", removeDnsRecordHandler);
    $menu.querySelector("#type").addEventListener("change", recordTypeHandler);
    $menu.querySelector("#iface").addEventListener("change", (event) => interfaceHandler(event, "dns-form"));

    return $menu;

}

/**
 * Opens the DNS server configuration menu for the network device that triggered
 * the event and pre-populates all fields with its current attributes.
 *
 * - If `quickPingToggle` is active, performs a quick ping instead and returns.
 * - Reveals `#network-section` only for pure DNS servers
 *   (id starts with `"dns-server-"`).
 * - Copies the current DNS records table from the device's `.dns-table` into
 *   the form's `#records-table`.
 * - Closes the advanced-options popover before displaying the menu.
 *
 * @param {Event} event - The click event originating from inside an `.item-dropped` element.
 * @returns {void}
 */
export function showDnsServerMenu(event) {

    event.stopPropagation();

    const $networkObject = event.target.closest(".item-dropped");

    if (quickPingToggle) { //<-- check if we are in quick ping mode
        quickPing($networkObject.id);
        return;
    }

    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const $menu = document.querySelector(".dns-form");
    $menu.dataset.id = $networkObject.id;
    const isDnsServer = $networkObject.id.startsWith("dns-server-");
    const isRecursive = $networkObject.getAttribute("recursion");
    const isCache = $networkObject.getAttribute("resolved");

    //load available interfaces

    loadInterfaces("dns-form");

    //device attributes
    if (isDnsServer) {
        $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
        $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
        $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
        $menu.querySelector("#network-section").classList.remove("hidden");
    }

    //service attributes
    $menu.querySelector("#dns-recursive").checked = isRecursive === "true";
    $menu.querySelector("#dns-cache").checked = isCache === "true";
    $menu.querySelector("#records-table").innerHTML = $networkObject.querySelector(".dns-table").querySelector("table").innerHTML;
    $menu.querySelector(".frame-title").innerHTML = $networkObject.id;

    //display the menu
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    $menu.style.display = "flex";
}

/**
 * Handles form submission for the DNS server menu, validating inputs and
 * persisting the configuration to the network-object DOM element.
 *
 * For pure DNS servers (`id` starts with `"dns-server"`):
 * - If both IP and netmask are provided, validates them as IPv4 addresses.
 * - Gateway may be empty or must be a valid IPv4.
 * - Calls `configureInterface` and `setDefaultGateway`.
 *
 * Always updates the `recursion` and `resolved` attributes on the device.
 * On success renders a success popup; on failure renders the error and returns.
 *
 * @param {Event} event - The form submit event.
 * @returns {void}
 */
export function saveDnsServerMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $menu = document.querySelector(".dns-form");
    const $serverObject = document.getElementById($menu.dataset.id);
    const networkObjectInterface = $menu.querySelector("#iface").value;
    const ip = $menu.querySelector("#ip").value;
    const netmask = $menu.querySelector("#netmask").value;
    const gateway = $menu.querySelector("#gateway").value;
    const isDnsServer = $serverObject.id.startsWith("dns-server");
    const isRecursive = $menu.querySelector("#dns-recursive").checked;
    const isCache = $menu.querySelector("#dns-cache").checked;
    const isEmptyForm = ip === "" && netmask === "";

    try {

        if (isDnsServer) {

            if (!isEmptyForm) {
                if (!isValidIp(ip)) throw new Error(`Error: IP "${ip}" is not valid.`);
                if (!isValidIp(netmask)) throw new Error(`Error: Netmask "${netmask}" is not valid.`);
            }

            if (gateway !== "" && !isValidIp(gateway)) throw new Error(`Error: Gateway "${gateway}" is not valid.`);

            configureInterface($serverObject.id, ip, netmask, networkObjectInterface);
            setDefaultGateway($serverObject.id, gateway);

        }

        $serverObject.setAttribute("recursion", isRecursive);
        $serverObject.setAttribute("resolved", isCache);

        bodyComponent.render(popupMessage(`Changes have been saved successfully.`));

    } catch (error) {

        bodyComponent.render(popupMessage(error.message));
        return;

    }

}

/**
 * Closes the DNS server menu, hides the network and SOA sub-sections,
 * resets the form, and hides the modal.
 *
 * @param {Event} event - The click event fired by the close button.
 * @returns {void}
 */
export function closeDnsMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    $menu.querySelector("#network-section").classList.add("hidden");
    $menu.querySelector(".soa-record-wrapper").classList.add("hidden");
    $menu.reset();
    $menu.style.display = "none";
}

/**
 * Switches the visible section in the DNS form to the tab whose `data-tab`
 * attribute matches the clicked button, updating the active button highlight.
 *
 * @param {Event} event - The click event fired by a nav-panel tab button.
 * @returns {void}
 */
export function showDnsGraphicTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    const $targetButton = event.target;
    const $sections = $menu.querySelectorAll(":scope > section");
    const $navButtons = $menu.querySelector(".nav-panel").querySelectorAll("button");
    const $targetSection = $menu.querySelector(`#${$targetButton.getAttribute("data-tab")}`);
    $navButtons.forEach($button => $button.classList.remove("active"));
    $targetButton.classList.add("active");
    $sections.forEach($section => $section.classList.add("hidden"));
    $targetSection.classList.remove("hidden");
}

/**
 * Handles the "Añadir Registro" button click.
 * Reads domain, record type, value, serial, and cache-TTL from the form,
 * validates the record via the appropriate type-specific validator, creates a
 * `dnsRecord` instance, adds it to the device via `addDnsEntry`, and refreshes
 * `#records-table`. Renders an error popup on validation failure.
 *
 * SOA records additionally receive `serial` and `cacheTTL` properties.
 *
 * @param {Event} event - The click event fired by the add-record button.
 * @returns {void}
 */
export function addDnsRecordHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".dns-form");
    const serverObjectId = $menu.dataset.id;
    const $serverObject = document.getElementById(serverObjectId);
    const domain = $menu.querySelector("#domain").value;
    const recordType = $menu.querySelector("#type").value;
    const value = $menu.querySelector("#value").value;
    const serial = $menu.querySelector("#serial").value;
    const cacheTTL = $menu.querySelector("#cache-ttl").value;

    const dnsRecordTypes = { //<-- mapeo de los tipos de registros a las funciones de validacion
        "SOA": () => isValidSOARecord(serverObjectId, domain, value, serial, cacheTTL),
        "NS": () => isValidNSRecord(serverObjectId, domain, value),
        "A": () => isValidARecord(serverObjectId, domain, value),
        "CNAME": () => isValidCNAMERecord(serverObjectId, domain, value)
    }

    try {

        dnsRecordTypes[recordType.toUpperCase()](); //<-- validamos el registro

        const record = new dnsRecord(domain, recordType, value);

        if (recordType === "SOA") {
            record.serial = serial;
            record.cacheTTL = cacheTTL;
        }

        addDnsEntry(serverObjectId, record);

        $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;

    } catch (error) {

        bodyComponent.render(popupMessage(error.message));

    }

}

/**
 * Handles the "Eliminar Registro" button click.
 * Reads domain and record type from the form, removes the matching entry from
 * the device via `delDnsEntry`, and refreshes `#records-table`.
 *
 * @param {Event} event - The click event fired by the remove-record button.
 * @returns {void}
 */
export function removeDnsRecordHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    const serverObjectId = $menu.dataset.id;
    const $serverObject = document.getElementById(serverObjectId);
    const domain = $menu.querySelector("#domain").value;
    const recordType = $menu.querySelector("#type").value;
    delDnsEntry(serverObjectId, recordType, domain);
    $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;
}

/**
 * Responds to changes in the `#type` record-type selector.
 * Auto-fills `#serial` with the current Unix timestamp (ms) and toggles the
 * visibility of `.soa-record-wrapper`: shown for SOA records, hidden otherwise.
 *
 * @param {Event} event - The change event fired by the record-type select element.
 * @returns {void}
 */
export function recordTypeHandler(event) {
    const $menu = document.querySelector(".dns-form");
    const $recordType = $menu.querySelector("#type");
    const $serial = $menu.querySelector("#serial");
    const $soaRecordWrapper = $menu.querySelector(".soa-record-wrapper");
    $serial.value = (new Date()).getTime(); //generate a serial number
    if ($recordType.value === "SOA") $soaRecordWrapper.classList.remove("hidden");
    else $soaRecordWrapper.classList.add("hidden");
}
