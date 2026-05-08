/**
 * Simulates the systemd service manager to control network services on a network object.
 *
 * Supports the "start", "restart", "stop", and "status" options for the known services.
 * "restart" stops then starts the service; "status" prints the current state to the terminal.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object whose service is managed.
 * @param {string} service - Service name. One of: "dhcpd", "apache2", "dhclient", "dhcrelay",
 *   "resolved", "named".
 * @param {string} option - Action to perform: "start", "restart", "stop", or "status".
 * @returns {void}
 * @throws {Error} If the service name is unknown or the service is not installed on the device.
 */
function systemd(networkObjectId, service, option) {

    const $networkObject = document.getElementById(networkObjectId);
    const currentServices = ["dhcpd", "apache2", "dhclient", "dhcrelay", "resolved", "named"];
    const isServiceInstalled = $networkObject.getAttribute(service) !== null;

    if (!currentServices.includes(service)) throw new Error(`Error: Service "${service}" unknown.`);
    if (!isServiceInstalled) throw new Error(`Error: Service "${service}" not installed.`);

    const stateFunctions = {

        "start": () => startService(networkObjectId, service),

        "restart": () => {
            $networkObject.setAttribute(service, "false");
            startService(networkObjectId, service);
        },

        "stop": () => {
            $networkObject.setAttribute(service, "false");
        },

        "status": () => {
            const serviceStatus = $networkObject.getAttribute(service) === "true";
            const daemonMessage = (serviceStatus) ? "<span style='color:#4ade80;'> Active (running)</span>" : "<span style='color:red;'> Inactive (dead) </span>";
            terminalMessage(`${service}.service`, networkObjectId);
            terminalMessage(`Status: ${daemonMessage}`, networkObjectId);
        },

    }

    stateFunctions[option]();

}

/**
 * Lists all installed services on a network object and prints their status to the terminal,
 * mimicking `systemctl list-units --type=service`.
 *
 * Only services whose attribute exists on the element are listed. Each line shows the service
 * unit name, load state, active/inactive status, and a short description.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object whose services are listed.
 * @returns {void}
 */
function listallServices(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableServices = {
        "dhcpd": "LSB: DHCP server",
        "apache2": "The Apache HTTP Server",
        "dhclient": "LSB: DHCP client",
        "dhcrelay": "",
        "resolved": "",
        "named": "",
    };

    for (const service in availableServices) {

        const isServiceAvailable = $networkObject.getAttribute(service) !== null;

        if (isServiceAvailable) {
            const isServiceActive = $networkObject.getAttribute(service) === "true";
            const status = (isServiceActive) ? "active running" : "inactive dead";
            terminalMessage(`${(service + ".service").padEnd(20, " ")} loaded ${status.padEnd(20, " ")} ${availableServices[service]}`, networkObjectId);
        }

    }

}

/**
 * Returns the list of service names that are currently installed on a network object.
 *
 * A service is considered installed when its corresponding DOM attribute exists (regardless of value).
 *
 * @param {string} networkObjectId - The DOM element ID of the network object to inspect.
 * @returns {Array<string>} Array of installed service name strings.
 */
function getAvailableServices(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableServices = ["dhcpd", "apache2", "dhclient", "dhcrelay", "resolved", "named"];
    const response = [];

    availableServices.forEach(service => {
        if ($networkObject.getAttribute(service) !== null) response.push(service);
    });

    return response;
}

/**
 * Starts a specific service on a network object by setting its attribute to "true" and
 * executing any associated initialization logic (e.g. parsing configuration files).
 *
 * Each service has its own start routine:
 * - `dhcpd`: reads `/etc/default/isc-dhcp-server` and `/etc/dhcp/dhcpd.conf`.
 * - `dhclient`: simply enables the service flag.
 * - `apache2`: enables the service flag and parses virtual-host configuration.
 * - `dhcrelay`: reads `/etc/default/isc-dhcp-relay`.
 * - `named`: enables the service flag.
 * - `resolved`: enables the service flag and flushes the DNS cache.
 *
 * @param {string} networkObjectId - The DOM element ID of the network object on which the service is started.
 * @param {string} service - The service name to start.
 * @returns {void}
 */
function startService(networkObjectId, service) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkElementFileSystem = new FileSystem($networkObject);

    const startFunctions = {

        "dhcpd": () => {
            $networkObject.setAttribute("dhcpd", "true");
            iscDhcpServerInterpreter(networkObjectId, networkElementFileSystem.read("isc-dhcp-server", ["etc", "default"]));
            dhcpdConfInterpreter(networkObjectId, networkElementFileSystem.read("dhcpd.conf", ["etc", "dhcp"]));
        },

        "dhclient": () => {
            $networkObject.setAttribute("dhclient", "true");
        },

        "apache2": () => {
            $networkObject.setAttribute("apache2", "true");
            apacheSitesParser(networkObjectId);
        },

        "dhcrelay": () => {
            $networkObject.setAttribute("dhcrelay", "true");
            iscDhcpRelayInterpreter(networkObjectId, networkElementFileSystem.read("isc-dhcp-relay", ["etc", "default"]));
        },

        "named": () => {
            $networkObject.setAttribute("named", "true");
        },

        "resolved": () => {
            $networkObject.setAttribute("resolved", "true");
            flushDnsCache(networkObjectId);
        },

    }

    startFunctions[service]();

}
