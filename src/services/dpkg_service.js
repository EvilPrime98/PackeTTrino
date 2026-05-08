/**
 * Simulates the Debian package manager (dpkg) to install or remove network service packages
 * on a network object.
 *
 * Maps package names to their corresponding service attributes and delegates to the appropriate
 * installer or uninstaller helper. Throws if the package name is unrecognised, if an already-
 * installed package is installed again, or if an uninstalled package is removed.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object to install/remove the package on.
 * @param {string} option - Action to perform: "install" or "remove".
 * @param {string} package - Package name. One of: "apache2", "bind9", "isc-dhcp-server",
 *   "isc-dhcp-relay", "isc-dhcp-client", "amin-search".
 * @returns {void}
 * @throws {Error} If the package is unknown, already installed (on install), or not installed (on remove).
 */
function dpkg(networkObjectId, option, package) {

    const $networkObject = document.getElementById(networkObjectId);

    const availablePackages = ["apache2", "bind9", "isc-dhcp-server", "isc-dhcp-relay", "isc-dhcp-client", "amin-search"];

    const packagesToServices = {
        "apache2": "apache2",
        "bind9": "named",
        "isc-dhcp-server": "dhcpd",
        "isc-dhcp-relay": "dhcrelay",
        "isc-dhcp-client": "dhclient",
        "amin-search": "browser",
    }

    if (!availablePackages.includes(package)) throw new Error(`Error: Unable to locate package ${package}.`);

    const service = packagesToServices[package];
    const isServiceInstalled = $networkObject.getAttribute(service) !== null;

    if (option === "install" && isServiceInstalled) throw new Error(`${package} is already at its newest version.`);
    if (option === "remove" && !isServiceInstalled) throw new Error(`Error: Package ${package} is not installed, so it will not be removed.`);
    if (option === "install") dpkgInstaller(package);
    if (option === "remove") dpkgUninstaller(package);

    /**
     * Calls the appropriate install function for the given package.
     *
     * @param {string} package - The package name to install.
     * @returns {void}
     */
    function dpkgInstaller(package) {

        const installFunctions = {
            "apache2": () => installApache2($networkObject),
            "bind9": () => installBind9($networkObject),
            "isc-dhcp-server": () => installDhcpd($networkObject),
            "isc-dhcp-relay": () => installDhcprelay($networkObject),
            "isc-dhcp-client": () => installDhclient($networkObject),
            "amin-search": () => installBrowser($networkObject),
        }

        installFunctions[package]();

    }

    /**
     * Calls the appropriate uninstall function for the given package.
     *
     * @param {string} package - The package name to remove.
     * @returns {void}
     */
    function dpkgUninstaller(package) {

        const uninstallFunctions = {
            "apache2": () => uninstallApache2(networkObjectId),
            "bind9": () => uninstallBind9(networkObjectId),
            "isc-dhcp-server": () => uninstallDhcpd(networkObjectId),
            "isc-dhcp-relay": () => uninstallDhcprelay(networkObjectId),
            "isc-dhcp-client": () => uninstallDhclient(networkObjectId),
            "amin-search": () => uninstallBrowser(networkObjectId),
        }

        uninstallFunctions[package]();

    }

}
