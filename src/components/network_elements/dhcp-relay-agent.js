/**
 * Creates and returns a DHCP relay agent network element as an `<article>` DOM node.
 * The element is positioned on the board at `(x, y)`, clipped to board boundaries,
 * and given a unique id based on the global `itemIndex`. It includes an icon, an ARP
 * table, a routing table, and advanced-options controls. The element is pre-configured
 * with a single network interface (`enp0s3`), a random MAC address, an empty virtual
 * filesystem, IPv4 forwarding disabled, and the `dhcprelay` and `iptables` packages
 * installed.
 *
 * @param {number} x - Desired left position in pixels relative to the board.
 * @param {number} y - Desired top position in pixels relative to the board.
 * @returns {HTMLElement} The configured DHCP relay agent `<article>` element.
 */
export function DhcpRelayObject(x, y) {

    const $networkObject = document.createElement("article");
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    $networkObject.id = `dhcp-relay-server-${itemIndex}`;
    [x,y] = checkObjectClip(x, y);
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "dhcp-relay");

    append(
        IconObject("dhcprelay.svg"),
        arpTable(),
        routingTable(),
        advancedOptionsObject("terminal", "delete")
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


    attr("ip-enp0s3", "");
    attr("netmask-enp0s3", "");
    attr("mac-enp0s3", getRandomMac());
    attr("data-switch-enp0s3", "");
    attr("ipv4-forwarding", "false");
    attr("filesystem", JSON.stringify(filesystem));
    attr("ondragstart", "BoardItemDragStart(event)");
    attr("oncontextmenu", "showAdvancedOptions(event)");
    attr("onclick", "showDhcpRelayMenu(event)");

    installDhcprelay($networkObject);
    installIptables($networkObject);

    return $networkObject;

}
