/**
 * Handles the `ip` terminal command to manage IP addresses and routing on a network object.
 *
 * Supports two main sub-commands:
 *
 * **`ip addr`**
 * - (no sub-option): prints interface information via `showNetworkObjectInfo`.
 * - `add <cidr> dev <iface>`: assigns an IP/netmask to an interface and adds the direct route.
 * - `flush dev <iface>`: removes the IP from an interface and deletes its direct route.
 *
 * **`ip route`**
 * - (no sub-option): prints the routing table via `printRouting`.
 * - `add <cidr|default> via <nexthop> dev <iface>`: inserts a remote routing rule.
 * - `del <cidr>`: removes a remote routing rule.
 *
 * Exactly one of `addr` or `route` must be provided. Conflicting sub-options (e.g.
 * both `add` and `flush`) are rejected. Validation errors are printed to the terminal.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object running the command.
 * @param {Array<string>} args - Tokenised command arguments. First element is "ip".
 * @returns {void}
 */
function command_Ip(networkObjectId, args) {

    let opt_addr = false;
    let opt_route = false;
    let opt_flush = false;
    let opt_add = false;
    let opt_del = false;
    let opt_dev = false;
    let opt_via = false;
    let val_add;
    let val_del;
    let val_via;
    let val_dev;

    const $OPTS = catchopts(["addr", "route", "add:", "flush", "del:", "via:", "dev:"], args);

    const optionHandlers = {

        "addr": () => opt_addr = true,

        "route": () => opt_route = true,

        "add": () => {
            opt_add = true;
            val_add = $OPTS["add"];
        },

        "flush": () => opt_flush = true,

        "del": () => {
            opt_del = true;
            val_del = $OPTS["del"];
        },

        "via": () => {
            opt_via = true;
            val_via = $OPTS["via"];
        },

        "dev": () => {
            opt_dev = true;
            val_dev = $OPTS["dev"];
        }

    }

    for (option in $OPTS) {
        if (optionHandlers[option]) optionHandlers[option]();
    }

    if (opt_addr === opt_route) {
        terminalMessage('Argument error: ip [addr|route] [add|flush|del] [ip/netmask] [dev interface] ] [via ip].', networkObjectId);
        return;
    }

    if (opt_addr) { //ip addr [add|flush] [ip]/[netmask] dev [interface]

        if (opt_add && opt_flush) {
            terminalMessage('Argument error: ip [addr|route] [add|flush|del] [ip/netmask] [dev interface] [via ip]', networkObjectId);
            return;
        }

        if (!opt_add && !opt_flush) {
            showNetworkObjectInfo(networkObjectId);
            return;
        }

        if (opt_add) { //ip addr add [ip]/[netmask] dev [interface]

            if (!isValidCidrIp(val_add)) {
                terminalMessage(`Expected a valid prefix near ${val_add}.`, networkObjectId);
                return;
            }

            if (!getInterfaces(networkObjectId).includes(val_dev)) {
                terminalMessage(`Interface ${val_dev} not recognized`, networkObjectId);
                return;
            }

            const [ip, netmask] = parseCidr(val_add);
            configureInterface(networkObjectId, ip, netmask, val_dev);
            setDirectRoutingRule(networkObjectId, ip, netmask, val_dev);
            terminalMessage(`IP ${val_add} has been successfully added to interface ${val_dev}.`, networkObjectId);
        }

        if (opt_flush) { //ip addr flush dev [interface]

            if (!getInterfaces(networkObjectId).includes(val_dev)) {
                terminalMessage(`Interface ${val_dev} not recognized`, networkObjectId);
                return;
            }

            deconfigureInterface(networkObjectId, val_dev);
            removeDirectRoutingRule(networkObjectId, val_dev);
            terminalMessage(`The IP of interface ${val_dev} has been successfully unconfigured.`, networkObjectId);
        }

    }

    if (opt_route) { //ip route [add|del] [ip]/[netmask] via [gateway] dev [interface]

        if (opt_add && opt_del) {
            terminalMessage('Argument error: ip [addr|route] [add|flush|del] [ip/netmask] [dev interface] [via ip]', networkObjectId);
            return;
        }

        if (!opt_add && !opt_del) {
            printRouting(networkObjectId);
            return;
        }

        if (opt_add) { //ip route add [ip]/[netmask] via [ip] dev [interface]

            if (!isValidCidrIp(val_add)) {
                if (val_add === "default") val_add = "0.0.0.0/0";
                else {
                    terminalMessage(`Expected a valid prefix instead of ${val_add}.`, networkObjectId);
                    return;
                }
            }

            if (!isValidIp(val_via)) {
                terminalMessage(`Expected a valid ip instead of ${val_via}.`, networkObjectId);
                return;
            }

            if (!getInterfaces(networkObjectId).includes(val_dev)) {
                terminalMessage(`Interface ${val_dev} not recognized`, networkObjectId);
                return;
            }

            const [ip, netmask] = parseCidr(val_add);

            setRemoteRoutingRule(networkObjectId,
                ip, //destination network
                netmask, //network mask
                getIfaceData(networkObjectId, val_dev)[0], //gateway
                val_dev, //interface
                val_via //next hop
            );

            terminalMessage(`Route ${val_add} has been successfully added to interface ${val_dev}.`, networkObjectId);

        }

        if (opt_del) { //ip route del [ip]/[netmask]

            if (!isValidCidrIp(val_del)) {
                terminalMessage(`Expected a valid prefix near ${val_del}.`, networkObjectId);
                return;
            }

            const [ip, netmask] = parseCidr(val_del);
            removeRemoteRoutingRule(networkObjectId, getNetwork(ip, netmask), netmask);
            terminalMessage(`Route ${val_del} has been successfully deleted.`, networkObjectId);

        }

    }

}
