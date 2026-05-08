/**
 * Installs the ISC DHCP server package on a network object.
 * Creates the `/etc/dhcp/dhcpd.conf` and `/etc/default/isc-dhcp-server` config files
 * in the virtual filesystem with commented-out example content, sets all DHCP service
 * attributes (pool range, gateway, netmask, DNS, lease time, reservations, and
 * listen interfaces), and injects the leases table and server configuration panel into
 * the element and its advanced-options modal respectively.
 *
 * @param {HTMLElement} $networkObject - The DOM element representing the network device.
 * @returns {void}
 */
function installDhcpd($networkObject) {

    const networkObjectId = $networkObject.id;
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));
    const networkObjectFileSystem = new FileSystem($networkObject);

    terminalMessage("Installing DHCP Server...", networkObjectId);

    const dhcpdConfDefaultContent = `
    # Example DHCP configuration file
    #
    #   shared-network 192.168.0.0 255.255.255.0 {
    #        subnet 192.168.0.0 netmask 255.255.255.0 {
    #            range 192.168.0.10 192.168.0.200;
    #            option routers 192.168.0.1;
    #            option subnet-mask 255.255.255.0;
    #            option domain-name-servers 192.168.0.1;
    #            lease-time 600;
    #        }
    #    }
    #
    #    host 192.168.0.10 {
    #        hardware ethernet 00:00:00:00:00:00;
    #        fixed-address 192.168.0.10;
    #    }
    `;

    const iscDhcpServerDefaultContent = `
    #This file configures the available interfaces for the DHCP server
    #Example: INTERFACESv4="enp0s3 enp0s8"
    INTERFACESv4=""
    `;

    //directories and files
    networkObjectFileSystem.mkdir("dhcp", ["etc"]);
    networkObjectFileSystem.touch("dhcpd.conf", ["etc", "dhcp"]);
    networkObjectFileSystem.write("dhcpd.conf", ["etc", "dhcp"], dhcpdConfDefaultContent.split('\n').map(line => line.trimStart()).join('\n'));
    networkObjectFileSystem.mkdir("default", ["etc"]);
    networkObjectFileSystem.touch("isc-dhcp-server", ["etc", "default"]);
    networkObjectFileSystem.write("isc-dhcp-server", ["etc", "default"], iscDhcpServerDefaultContent.split('\n').map(line => line.trimStart()).join('\n'));

    //DHCP server attributes
    attr("dhcpd", "true");
    attr("dhcp-listen-on-interfaces", "");
    attr("data-interval", "false");

    //DHCP service attributes
    attr("data-range-start", "");
    attr("data-range-end", "");
    attr("dhcp-offer-gateway", "");
    attr("dhcp-offer-netmask", "");
    attr("dhcp-offer-dns", "");
    attr("dhcp-offer-lease-time", "");
    attr("dhcp-reservations", `{}`);

    addOption(leasesTableOptionButton(), dhcpServerConfig()); //<-- options are added to the advanced options
    append(dhcpTable()); //<-- the DHCP table is added

    terminalMessage("DHCP Server installed successfully.", networkObjectId);
}

/**
 * Uninstalls the ISC DHCP server package from a network object.
 * Deletes the `/etc/dhcp` and `/etc/default` directories from the virtual filesystem,
 * removes all DHCP-related attributes, removes the leases table and server config
 * entries from the advanced-options modal, clears the active lease-renewal interval,
 * and deletes the server's entry from the global `serverLeaseTimers` registry.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @returns {void}
 */
function uninstallDhcpd(networkObjectId) {

    terminalMessage("Uninstalling DHCP Server...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const $dhcpTable = $networkObject.querySelector(".dhcp-table");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());
    const networkObjectFileSystem = new FileSystem($networkObject);

    //directories and files
    networkObjectFileSystem.rmdir("dhcp", ["etc"]);
    networkObjectFileSystem.rmdir("default", ["etc"]);

    //DHCP server attributes
    rattr(
        "dhcpd",
        "data-range-start",
        "data-range-end",
        "dhcp-offer-gateway",
        "dhcp-offer-netmask",
        "dhcp-offer-dns",
        "dhcp-offer-lease-time",
        "data-interval",
        "dhcp-listen-on-interfaces"
    );

    //remove options from the advanced options
    remOption("dhcp-option", "dhcp-server-config");
    remove($dhcpTable);

    //delete the lease timer associated with the DHCP server
    clearInterval(serverLeaseTimers[networkObjectId]);
    delete serverLeaseTimers[networkObjectId];

    terminalMessage("DHCP Server uninstalled successfully.", networkObjectId);

}
