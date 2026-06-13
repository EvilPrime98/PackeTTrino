/**
 * Installs the Apache2 web server package on a network object.
 * Sets the `apache2` attribute, creates the standard Apache directory structure and
 * default files in the virtual filesystem, and updates the PC icon to reflect the
 * web-server role when the element is a PC.
 *
 * @param {HTMLElement} $networkObject - The DOM element representing the network device.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
import { $APACHEDEFAULTCONTENT, $APACHECONFIGCONTENT } from '../lib/apache2_lib.js';
import { FileSystem } from '../lib/fileSystem_lib.js';
// esm-migration: scope unclear — terminalMessage is defined in src/components/network_tools/terminal.js (Phase 06)
// import { terminalMessage } from '../components/network_tools/terminal.js';

// [agent-added: esm-migration phase 05]
export function installApache2($networkObject) {

    terminalMessage("Installing Apache...", $networkObject.id);

    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    //apache attributes

    attr("apache2", "true");

    //directories and files

    const defaultApacheContent = $APACHEDEFAULTCONTENT.replace(/\s+/g, " ");

    const defaultApacheConf = $APACHECONFIGCONTENT.split("\n").map(line => line.trim()).filter(line => line !== "").join("\n");

    const networkObjectFileSystem = new FileSystem($networkObject);
    networkObjectFileSystem.mkdir("html", ["var", "www"]);
    networkObjectFileSystem.mkdir("sites", ["etc", "apache2"]);
    networkObjectFileSystem.touch("index.html", ["var", "www", "html"]);
    networkObjectFileSystem.write("index.html", ["var", "www", "html"], defaultApacheContent);
    networkObjectFileSystem.touch("000-default.conf", ["etc", "apache2", "sites"]);
    networkObjectFileSystem.write("000-default.conf", ["etc", "apache2", "sites"], defaultApacheConf);

    //events are added
    if ($networkObject.id.startsWith("pc-")) $networkObject.querySelector("img").src = "./assets/board/www-server.svg";

    terminalMessage("Apache installed successfully.", $networkObject.id);

}

/**
 * Uninstalls the Apache2 web server package from a network object.
 * Removes the virtual filesystem directories created by the installer, strips the
 * `apache2` attribute, and restores the default PC icon when the element is a PC.
 *
 * @param {string} networkObjectId - The DOM element ID of the network device.
 * @returns {void}
 */
// [agent-added: esm-migration phase 05]
export function uninstallApache2(networkObjectId) {

    terminalMessage("Uninstalling Apache...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const networkObjectFileSystem = new FileSystem($networkObject);

    networkObjectFileSystem.rmdir("www", ["var"]);
    networkObjectFileSystem.rmdir("apache2", ["etc"]);

    rattr("apache2");

    if ($networkObject.id.startsWith("pc-")) $networkObject.querySelector("img").src = "./assets/board/pc.svg";

    terminalMessage("Apache uninstalled successfully.", networkObjectId);
}
