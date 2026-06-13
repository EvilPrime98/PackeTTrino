import { checkObjectClip } from "@/lib/component_lib";
/**
 * Creates and returns a PC network element as an `<article>` DOM node.
 * The element is positioned on the board at `(x, y)`, clipped to board boundaries,
 * and given a unique id based on the global `itemIndex`. It includes an icon, an ARP
 * table, a DNS cache table, a routing table, and advanced-options controls. The element
 * is pre-configured with a single network interface (`enp0s3`), a random MAC address,
 * an empty virtual filesystem, IPv4 forwarding disabled, the DNS resolver enabled,
 * and the `dhclient`, `iptables`, and browser packages installed.
 *
 * @param {number} x - Desired left position in pixels relative to the board.
 * @param {number} y - Desired top position in pixels relative to the board.
 * @returns {HTMLElement} The configured PC `<article>` element.
 */
export function PcObject(x, y) {

    const $networkObject = document.createElement("article");
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    $networkObject.id = `pc-${itemIndex}`;
    [x,y] = checkObjectClip(x, y);
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "pc");

    append(
        IconObject("pc.svg"),
        arpTable(),
        cacheDnsTable(),
        routingTable(),
        advancedOptionsObject("terminal", "arp", "cacheDns", "delete")
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

    //add basic attributes
    attr("ip-enp0s3", "");
    attr("netmask-enp0s3", "");
    attr("mac-enp0s3", getRandomMac());
    attr("data-switch-enp0s3", "");
    attr("filesystem", JSON.stringify(filesystem));
    attr("ipv4-forwarding", "false");

    //add the resolver
    attr("resolved", "true");

    //install packages
    installDhclient($networkObject);
    installIptables($networkObject);
    installBrowser($networkObject);

    //add events
    attr("onclick", "showPcMenu('" + $networkObject.id + "')");
    attr("oncontextmenu", "showAdvancedOptions(event)");
    attr("ondragstart", "BoardItemDragStart(event)");

    return $networkObject;

}
