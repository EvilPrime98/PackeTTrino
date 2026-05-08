/**
 * Creates and returns a switch network element as an `<article>` DOM node.
 * The element is positioned on the board at `(x, y)`, clipped to board boundaries,
 * and given a unique id based on the global `itemIndex`. It includes a switch icon,
 * a MAC address table, and advanced-options controls with "Delete" and "Cluster"
 * buttons. The icon is initially draggable and accepts drop events for cable connections.
 *
 * @param {number} x - Desired left position in pixels relative to the board.
 * @param {number} y - Desired top position in pixels relative to the board.
 * @returns {HTMLElement} The configured switch `<article>` element.
 */
function SwitchObject(x, y) {

    const $switchObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectMacTable = macTable();
    const networkObjectAdvancedOptions = document.createElement("div");

    //general characteristics

    $switchObject.id = `switch-${itemIndex}`;
    $switchObject.classList.add("item-dropped", "switch");
    [x, y] = checkObjectClip(x, y); //check if the object is clipped outside the board, and adjust it
    $switchObject.style.left = `${x}px`;
    $switchObject.style.top = `${y}px`;
    $switchObject.setAttribute("mac-enp0s3", getRandomMac());
    $switchObject.setAttribute("clusterized", "false");

    //graphic switch with icon

    networkObjectIcon.src = "./assets/board/switch.svg";
    networkObjectIcon.alt = "switch";
    networkObjectIcon.draggable = true;

    //advanced options

    networkObjectAdvancedOptions.classList.add("advanced-options-modal");
    networkObjectAdvancedOptions.innerHTML = `
        <button onclick="deleteItem(event)">Delete</button>
        <button class="clusterize-button" onclick="clusterizeSwitch(event)">Cluster</button>
        `;
    $switchObject.appendChild(networkObjectAdvancedOptions);

    //build the object

    $switchObject.appendChild(networkObjectIcon);
    $switchObject.appendChild(networkObjectMacTable);
    $switchObject.appendChild(networkObjectAdvancedOptions);

    //events

    $switchObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $switchObject.setAttribute("ondrop", "switchConn(event)");
    $switchObject.setAttribute("onclick", "showObjectModalTable(event, '.mac-table')");
    $switchObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");

    return $switchObject;

}

/**
 * Handles a drop event on a switch to establish a cable connection between
 * a dragged network device and the switch. Shows an error popup if the switch
 * is currently clusterized. Ignores drops from other switches or non-board items.
 * Uses the next available interface on the source device for the cable binding.
 *
 * @param {DragEvent} event - The drop event fired on the switch element.
 * @returns {void}
 */
function switchConn(event) {

    event.preventDefault();
    event.stopPropagation();

    const item = event.dataTransfer.getData("json");
    const $switchObject = event.target.closest(".item-dropped");
    const isClusterized = $switchObject.getAttribute("clusterized");

    if (isClusterized === "true") {
        bodyComponent.render(popupMessage(`<span>Error: </span>You must de-cluster the switch before adding devices.`));
        return;
    }

    if (item) {

        const itemType = JSON.parse(item).itemType;
        const itemId = JSON.parse(item).itemId;
        const $networkObject = document.getElementById(itemId);
        const x1 = JSON.parse(item).originx;
        const y1 = JSON.parse(item).originy;

        if (itemType !== "item-dropped" || itemId.startsWith("switch-")) return;

        const availableInterface = getAvailableInterface(itemId);

        if (availableInterface) {
            CableObject(x1, y1, $switchObject.style.left, $switchObject.style.top, itemId, $switchObject.id, availableInterface);
            addSwitchPort($switchObject.id, itemId);
            $networkObject.setAttribute(`data-switch-${availableInterface}`, $switchObject.id);
            if(!getAvailableInterface(itemId)) $networkObject.querySelector("img").draggable = false;
        }

    }
}

/**
 * Hides the MAC address table panel of the switch that contains the event target.
 *
 * @param {MouseEvent} event - The click event fired on the close button inside the MAC table.
 * @returns {void}
 */
function closeMacTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    table.style.display = "none";
}

/**
 * Collapses a switch into a cluster view by hiding all connected non-router devices
 * and their cables, changing the switch icon to a cluster icon, and updating the
 * advanced-options button to offer "Des-clusterizar". Sets the `clusterized` attribute
 * to `"true"` on the switch element.
 *
 * @param {MouseEvent} event - The click event fired on the "Cluster" button.
 * @returns {void}
 */
function clusterizeSwitch(event) {
    event.preventDefault();
    event.stopPropagation();
    const $switchObject = event.target.closest(".item-dropped");
    const $advancedOptions = $switchObject.querySelector(".advanced-options-modal");
    const $icon = $switchObject.querySelector("img");
    const $connectedDevices = getDeviceTable($switchObject.id);

    $connectedDevices.forEach(deviceId => {
        if (!deviceId.startsWith("router-")) {
            const $device = document.getElementById(deviceId);
            const [$connsLines, $connsCircles] = getConns(deviceId);
            Array.from($connsLines).forEach($conn => $conn.style.display = "none");
            Array.from($connsCircles).forEach($conn => $conn.style.display = "none");
            $device.style.display = "none";
        }
    });

    $advancedOptions.querySelector(".clusterize-button").innerHTML = "De-cluster";
    $advancedOptions.querySelector(".clusterize-button").setAttribute("onclick", "desClusterizeSwitch(event)");
    $switchObject.setAttribute("clusterized", "true");
    $icon.src = "./assets/board/cluster.svg";
    $advancedOptions.style.display = "none";
}

/**
 * Expands a previously clusterized switch back to its normal view by making all
 * connected non-router devices and their cables visible again, restoring the switch
 * icon, and updating the advanced-options button to offer "Clusterizar". Sets the
 * `clusterized` attribute to `"false"` on the switch element.
 *
 * @param {MouseEvent} event - The click event fired on the "De-cluster" button.
 * @returns {void}
 */
function desClusterizeSwitch(event) {
    event.preventDefault();
    event.stopPropagation();
    const $switchObject = event.target.closest(".item-dropped");
    const $advancedOptions = $switchObject.querySelector(".advanced-options-modal");
    const $icon = $switchObject.querySelector("img");
    const $connectedDevices = getDeviceTable($switchObject.id);

    $connectedDevices.forEach(deviceId => {
        if (!deviceId.startsWith("router-")) {
            const $device = document.getElementById(deviceId); //node with the device
            const [$connsLines, $connsCircles] = getConns(deviceId); //nodes with the connections from that device
            Array.from($connsLines).forEach($conn => $conn.style.display = "block"); //show connections
            Array.from($connsCircles).forEach($conn => $conn.style.display = "block"); //show connections
            $device.style.display = "block"; //show the device
        }
    });

    $advancedOptions.querySelector(".clusterize-button").innerHTML = "Cluster";
    $advancedOptions.querySelector(".clusterize-button").setAttribute("onclick", "clusterizeSwitch(event)");
    $switchObject.setAttribute("clusterized", "false");
    $icon.src = "./assets/board/switch.svg";
    $advancedOptions.style.display = "none";
}

/**
 * Translates all non-router devices connected to a switch and their cable endpoints
 * by the given pixel deltas. Used to keep cables and devices in sync when the switch
 * itself is moved on the board.
 *
 * @param {string} switchId - The DOM id of the switch whose connected devices should move.
 * @param {number} dx - Horizontal offset in pixels to apply.
 * @param {number} dy - Vertical offset in pixels to apply.
 * @returns {void}
 */
function moveConns(switchId, dx, dy) {
    const $connectedDevices = getDeviceTable(switchId);

    $connectedDevices.forEach(deviceId => {
        if (!deviceId.startsWith("router-")) {
            const $device = document.getElementById(deviceId);
            const [$connsLines, $connsCircles] = getConns(deviceId);

            Array.from($connsLines).forEach($conn => {
                $conn.setAttribute("x1", `${parseInt($conn.getAttribute("x1")) + dx}`);
                $conn.setAttribute("y1", `${parseInt($conn.getAttribute("y1")) + dy}`);
                $conn.setAttribute("x2", `${parseInt($conn.getAttribute("x2")) + dx}`);
                $conn.setAttribute("y2", `${parseInt($conn.getAttribute("y2")) + dy}`);
            });

            Array.from($connsCircles).forEach($conn => {
                $conn.setAttribute("cx", `${parseInt($conn.getAttribute("cx")) + dx}`);
                $conn.setAttribute("cy", `${parseInt($conn.getAttribute("cy")) + dy}`);
            });

            $device.style.left = `${parseInt($device.style.left) + dx}px`;
            $device.style.top = `${parseInt($device.style.top) + dy}px`;
        }
    });
}
