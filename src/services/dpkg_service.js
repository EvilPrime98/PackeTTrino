/**
 * Simulates the Debian pkg manager (dpkg) to install or remove network service pkgs
 * on a network object.
 *
 * Maps pkg names to their corresponding service attributes and delegates to the appropriate
 * installer or uninstaller helper. Throws if the pkg name is unrecognised, if an already-
 * installed pkg is installed again, or if an uninstalled pkg is removed.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object to install/remove the pkg on.
 * @param {string} option - Action to perform: "install" or "remove".
 * @param {string} pkg - Package name. One of: "apache2", "bind9", "isc-dhcp-server",
 *   "isc-dhcp-relay", "isc-dhcp-client", "amin-search".
 * @returns {void}
 * @throws {Error} If the pkg is unknown, already installed (on install), or not installed (on remove).
 */
// [agent-added: esm-migration phase 05]
import { installApache2, uninstallApache2 } from '../packages/apache2_pkg.js';
import { installBind9, uninstallBind9 } from '../packages/bind9_pkg.js';
import { installDhcpd, uninstallDhcpd } from '../packages/isc-dhcp-server_pkg.js';
import { installDhcprelay, uninstallDhcprelay } from '../packages/isc-dhcp-relay_pkg.js';
import { installDhclient, uninstallDhclient } from '../packages/isc-dhcp-client_pkg.js';
import { installBrowser, uninstallBrowser } from '../packages/browser_pkg.js';

// [agent-added: esm-migration phase 05]
export function dpkg(networkObjectId, option, pkg) {

    const $networkObject = document.getElementById(networkObjectId);

    const availablePackages = ["apache2", "bind9", "isc-dhcp-server", "isc-dhcp-relay", "isc-dhcp-client", "amin-search"];

    const pkgsToServices = {
        "apache2": "apache2",
        "bind9": "named",
        "isc-dhcp-server": "dhcpd",
        "isc-dhcp-relay": "dhcrelay",
        "isc-dhcp-client": "dhclient",
        "amin-search": "browser",
    }

    if (!availablePackages.includes(pkg)) throw new Error(`Error: Unable to locate pkg ${pkg}.`);

    const service = pkgsToServices[pkg];
    const isServiceInstalled = $networkObject.getAttribute(service) !== null;

    if (option === "install" && isServiceInstalled) throw new Error(`${pkg} is already at its newest version.`);
    if (option === "remove" && !isServiceInstalled) throw new Error(`Error: Package ${pkg} is not installed, so it will not be removed.`);
    if (option === "install") dpkgInstaller(pkg);
    if (option === "remove") dpkgUninstaller(pkg);

    /**
     * Calls the appropriate install function for the given pkg.
     *
     * @param {string} pkg - The pkg name to install.
     * @returns {void}
     */
    function dpkgInstaller(pkg) {

        const installFunctions = {
            "apache2": () => installApache2($networkObject),
            "bind9": () => installBind9($networkObject),
            "isc-dhcp-server": () => installDhcpd($networkObject),
            "isc-dhcp-relay": () => installDhcprelay($networkObject),
            "isc-dhcp-client": () => installDhclient($networkObject),
            "amin-search": () => installBrowser($networkObject),
        }

        installFunctions[pkg]();

    }

    /**
     * Calls the appropriate uninstall function for the given pkg.
     *
     * @param {string} pkg - The pkg name to remove.
     * @returns {void}
     */
    function dpkgUninstaller(pkg) {

        const uninstallFunctions = {
            "apache2": () => uninstallApache2(networkObjectId),
            "bind9": () => uninstallBind9(networkObjectId),
            "isc-dhcp-server": () => uninstallDhcpd(networkObjectId),
            "isc-dhcp-relay": () => uninstallDhcprelay(networkObjectId),
            "isc-dhcp-client": () => uninstallDhclient(networkObjectId),
            "amin-search": () => uninstallBrowser(networkObjectId),
        }

        uninstallFunctions[pkg]();

    }

}
