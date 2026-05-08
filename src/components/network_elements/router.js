/**
 * Creates and returns a router network element as an `<article>` DOM node.
 * The element is positioned on the board at `(x, y)`, clipped to board boundaries,
 * and given a unique id based on the global `itemIndex`. It includes an icon, an ARP
 * table, a routing table, and advanced-options controls. The router is pre-configured
 * with three network interfaces (`enp0s3`, `enp0s8`, `enp0s9`), each with a unique
 * random MAC address, an empty virtual filesystem, IPv4 forwarding enabled, and the
 * `iptables` package installed.
 *
 * @param {number} x - Desired left position in pixels relative to the board.
 * @param {number} y - Desired top position in pixels relative to the board.
 * @returns {HTMLElement} The configured router `<article>` element.
 */
function RouterObject(x, y) {

    const $networkObject = document.createElement("article");
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    $networkObject.id = `router-${itemIndex}`;
    [x,y] = checkObjectClip(x, y);
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "router");

    append(
        IconObject("router.svg"),
        arpTable(),
        routingTable(),
        advancedOptionsObject("terminal", "routing", "delete")
    );

    const filesystem = {
        "/": {
            "bin" : {},
            "boot" : {},
            "dev" : {},
            "etc": {
                "hosts": "127.0.0.1 localhost" ,
                "resolv.conf": "",
                "network": {
                    "interfaces": ""
                }
            },
            "home" : {},
            "var": {}
        }
    };

    //has three network interfaces by default
    attr("ip-enp0s3", "");
    attr("netmask-enp0s3", "");
    attr("mac-enp0s3", getRandomMac());
    attr("data-switch-enp0s3", "");
    attr("ip-enp0s8", "");
    attr("netmask-enp0s8", "");
    attr("mac-enp0s8", getRandomMac());
    attr("data-switch-enp0s8", "");
    attr("ip-enp0s9", "");
    attr("netmask-enp0s9", "");
    attr("mac-enp0s9", getRandomMac());
    attr("data-switch-enp0s9", "");
    attr("ipv4-forwarding", "true");

    //add the filesystem
    attr("filesystem", JSON.stringify(filesystem));

    //add events
    attr("ondragstart", "BoardItemDragStart(event)");
    attr("oncontextmenu", "showAdvancedOptions(event)");
    attr("onclick", "showRouterMenu(event)");

    installIptables($networkObject);

    return $networkObject;

}
