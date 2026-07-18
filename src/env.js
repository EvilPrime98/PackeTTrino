/* eslint-disable prefer-const */
/**
 * @fileoverview Global application state. Declares every mutable variable
 * shared across the simulation: UI flags, network device registries, per-
 * protocol control flags, packet-trace structures, routing helpers, async
 * buffers, background-process timer handles, and NAT connection tracking.
 * PS: did my best with the types, dont judge me :P
*/

/** @type {number} Auto-increment counter used when assigning IDs to new items placed on the board. */
let itemIndex = 0;

/** @type {boolean} Whether dark mode is currently active. */
let darkMode = false;

/** @type {boolean} Whether the packet-visualization overlay is shown. */
let visualToggle = false;

/** @type {number} Delay in milliseconds between each animation step in the packet visualizer. */
let visualSpeed = 300;

/** @type {boolean} Whether the simulation is currently paused. */
let paused = false;

/** @type {Array<string>} History of commands entered into the terminal, used for arrow-key navigation. */
let terminalBuffer = [];

/** @type {number} Pointer into `terminalBuffer` tracking the currently browsed history entry. */
let currentCommandIndex = 0;

/** @type {boolean} When true, ARP traffic is suppressed from the packet visualizer. */
let ignoreArpTraffic = false;

/** @type {Record<string, Object>} Registry of all PC network objects keyed by device ID. */
let pcs = {};

/** @type {Record<string, Object>} Registry of all router network objects keyed by device ID. */
let routers = {};

/** @type {Record<string, Object>} Registry of all switch network objects keyed by device ID. */
let switches = {};

/** @type {Record<string, Object>} Registry of all server network objects keyed by device ID. */
let servers = {};

/** @type {number} Default time-to-live in seconds for ARP cache entries. */
let $ARPENTRYTTL = 120;

/** @type {number} Default time-to-live in seconds for MAC address table entries. */
let $MACENTRYTTL = 120;

/** @type {Array<string>} Current working directory path segments for the active terminal session. */
let $PWD = [];

/** @type {Record<string, boolean>} Tracks in-flight ARP requests keyed by a composite lookup key. */
let arpFlag = {};

/** @type {Record<string, boolean>} Tracks in-flight ICMP echo requests keyed by a composite lookup key. */
let icmpFlag = {};

/** @type {Record<string, boolean>} Tracks pending DHCP Discover broadcasts keyed by client device ID. */
let dhcpDiscoverFlag = {};

/** @type {Record<string, boolean>} Tracks pending DHCP Request messages keyed by client device ID. */
let dhcpRequestFlag = {};

/** @type {Record<string, boolean>} Tracks pending DNS query messages keyed by a composite lookup key. */
let dnsRequestFlag = {};

/** @type {Record<string, boolean>} Tracks pending TCP SYN segments keyed by a composite lookup key. */
let tcpSyncFlag = {};

/** @type {Record<string, boolean>} Tracks active traceroute probes keyed by a composite lookup key. */
let traceFlag = {};

/** @type {boolean} When true, a quick-ping session is running without opening the full terminal. */
let quickPingToggle = false;

/** @type {string|Object} Holds the target descriptor for the active quick-ping session. */
let quickPingObject = "";

/** @type {Record<string, Object>} Forward-path trace data keyed by trace session ID. */
let trace = {};

/** @type {Record<string, Object>} Return-path trace data keyed by trace session ID. */
let traceReturn = {};

/** @type {Record<string, Object>} Graph nodes used by the auto-routing procedure, keyed by device ID. */
let nodes = {};

/** @type {Record<string, string>} Subnet masks for each node, keyed by device ID. */
let nodesNetmask = {};

/** @type {Record<string, string>} IP addresses for each node, keyed by device ID. */
let nodesIp = {};

/** @type {string} CIDR string for the default network used as the routing baseline. */
let defaultNetwork = "";

/** @type {Record<string, Object>} General-purpose packet buffer keyed by a composite lookup key. */
let buffer = {};

/** @type {Record<string, Object>} Pending HTTP response payloads keyed by a composite lookup key. */
let httpBuffer = {};

/** @type {Record<string, Object>} Pending DHCP Offer payloads keyed by client device ID. */
let dhcpOfferBuffer = {};

/** @type {Record<string, Object>} Pending TCP segment payloads keyed by a composite lookup key. */
let tcpBuffer = {};

/** @type {Record<string, Object>} Intermediate traceroute hop data keyed by trace session ID. */
let traceBuffer = {};

/** @type {Array<Object>} Ordered log of all packets that have traversed the simulation, used by the packet-tracer view. */
let trafficBuffer = [];

/** @type {Record<string, Object>} Pending configuration changes for router interfaces keyed by interface ID (not device ID). */
let routerChangesBuffer = {};

/** @type {Record<string, number>} `setInterval` handles for DHCP lease-renewal timers on server side, keyed by lease ID. */
let serverLeaseTimers = {};

/** @type {Record<string, number>} `setInterval` handles for DHCP lease-renewal timers on client side, keyed by device ID. */
let clientLeaseTimers = {};

/** @type {Record<string, number>} `setTimeout` handles for ARP cache expiry, keyed by a composite cache key. */
let arpEntryTimers = {};

/** @type {Record<string, number>} `setTimeout` handles for MAC table entry expiry, keyed by a composite cache key. */
let macEntryTimers = {};

/** @type {Record<string, number>} `setTimeout` handles for DNS cache entry expiry, keyed by a composite cache key. */
let dnsCacheTimers = {};

/** @type {Record<string, Object>} SNAT/DNAT connection-tracking table keyed by a five-tuple hash. */
let connTrack = {};

/** @type {number} Maximum zoom-out limit for the map view. */
let zoomOutLimit = .5