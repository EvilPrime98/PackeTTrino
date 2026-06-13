/**
 * @description Default Apache2 welcome page HTML served when no virtual host content is
 * configured. Displayed to confirm that the simulated Apache2 server is running correctly.
 * @type {string}
 */
// [agent-added: esm-migration phase 04]
export const $APACHEDEFAULTCONTENT = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Apache2 PackeTTrino Default Page: It works</title>
<style type="text/css" media="screen">
:root {
--primary-color: #2563eb;
--accent-color: #ea580c;
--text-color: #1e293b;
--light-bg: #f8fafc;
--dark-bg: #0f172a;
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
line-height: 1.6;
color: var(--text-color);
background-color: var(--light-bg);
padding: 0 20px;
}

.main_page {
max-width: 900px;
margin: 40px auto;
background-color: white;
border-radius: 12px;
overflow: hidden;
box-shadow: var(--shadow);
}

.page_header {
display: flex;
align-items: center;
padding: 24px;
background-color: var(--dark-bg);
color: white;
}

.page_header img {
height: 40px;
margin-right: 16px;
}

.page_header .floating_element {
font-size: 24px;
font-weight: 600;
}

.content_section {
padding: 24px;
}

.section_header_red {
color: var(--accent-color);
font-size: 32px;
font-weight: 700;
margin-bottom: 24px;
position: relative;
padding-bottom: 10px;
}

.section_header_red::after {
content: "";
position: absolute;
bottom: 0;
left: 0;
width: 60px;
height: 4px;
background-color: var(--primary-color);
border-radius: 2px;
}

.content_section_text p {
margin-bottom: 16px;
font-size: 16px;
}

b {
color: var(--primary-color);
font-weight: 600;
}

tt {
background-color: #e2e8f0;
padding: 2px 6px;
border-radius: 4px;
font-family: 'Courier New', monospace;
font-size: 14px;
}

@media (max-width: 768px) {
.main_page {
margin: 20px auto;
}

.page_header {
flex-direction: column;
text-align: center;
}

.page_header img {
margin-right: 0;
margin-bottom: 12px;
}
}
</style>
</head>
<body>
<div class="main_page">
<div class="page_header floating_element">
<img src="./assets/favicon.svg" alt="Ubuntu Logo" class="floating_element"/>
<span class="floating_element">
Apache2 PackeTTrino Default Page
</span>
</div>
<div class="content_section floating_element">
<div class="section_header section_header_red">
<div id="about"></div>
It works!
</div>
<div class="content_section_text">
<p>
This is the default welcome page used to verify that the Apache2 PackeTTrino server is
working correctly after installation.
It is based on the equivalent Debian page, from which the Apache package in Ubuntu is derived.
If you can read this page, the Apache PackeTTrino HTTP server installed at this site is working correctly.
You should <b>replace this file</b> (located at
<tt>/var/www/html/index.html</tt>) before continuing to use your HTTP server.
</p>
</div>
</div>
</div>
</body>
</html>`;

/**
 * @description Example Apache2 virtual-host configuration template written to the server's
 * filesystem when the Apache2 package is installed.
 * @type {string}
 */
// [agent-added: esm-migration phase 04]
export const $APACHECONFIGCONTENT = `
#Example Apache configuration
<VirtualHost ip="*" port="80">
   <DocumentRoot value="/var/www/html"/>
   <DirectoryIndex value="index.html"/>
   <Options Indexes="true" FollowSymLinks="false"/>
   <ServerName value=""/>
</VirtualHost>`;

/**
 * @description HTML page returned by the simulated Apache2 server when access to the requested
 * resource is denied (HTTP 403 Forbidden — firewall/access-control rejection).
 * @type {string}
 */
// [agent-added: esm-migration phase 04]
export const $APACHEREJECTCONTENT = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Connection Rejected - Access Denied</title>
<style type="text/css" media="screen">
:root {
--primary-color: #dc2626;
--accent-color: #f59e0b;
--text-color: #1e293b;
--light-bg: #fef2f2;
--dark-bg: #7f1d1d;
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
line-height: 1.6;
color: var(--text-color);
background-color: var(--light-bg);
padding: 0 20px;
}

.main_page {
max-width: 900px;
margin: 40px auto;
background-color: white;
border-radius: 12px;
overflow: hidden;
box-shadow: var(--shadow);
border: 2px solid #fecaca;
}

.page_header {
display: flex;
align-items: center;
padding: 24px;
background-color: var(--dark-bg);
color: white;
}

.page_header img {
height: 40px;
margin-right: 16px;
}

.page_header .floating_element {
font-size: 24px;
font-weight: 600;
}

.warning-icon {
width: 40px;
height: 40px;
margin-right: 16px;
background-color: var(--primary-color);
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 24px;
color: white;
}

.content_section {
padding: 24px;
}

.section_header_red {
color: var(--primary-color);
font-size: 32px;
font-weight: 700;
margin-bottom: 24px;
position: relative;
padding-bottom: 10px;
}

.section_header_red::after {
content: "";
position: absolute;
bottom: 0;
left: 0;
width: 60px;
height: 4px;
background-color: var(--primary-color);
border-radius: 2px;
}

.content_section_text p {
margin-bottom: 16px;
font-size: 16px;
}

.error-code {
background-color: #fee2e2;
padding: 12px 16px;
border-radius: 8px;
border-left: 4px solid var(--primary-color);
margin: 20px 0;
font-weight: 600;
}

b {
color: var(--primary-color);
font-weight: 600;
}

tt {
background-color: #fee2e2;
padding: 2px 6px;
border-radius: 4px;
font-family: 'Courier New', monospace;
font-size: 14px;
color: var(--primary-color);
}

.recommendations {
background-color: #fef3c7;
padding: 16px;
border-radius: 8px;
border-left: 4px solid var(--accent-color);
margin-top: 20px;
}

.recommendations h3 {
color: #d97706;
margin-bottom: 12px;
font-size: 18px;
}

.recommendations ul {
margin-left: 20px;
}

.recommendations li {
margin-bottom: 8px;
}

@media (max-width: 768px) {
.main_page {
margin: 20px auto;
}

.page_header {
flex-direction: column;
text-align: center;
}

.warning-icon {
margin-right: 0;
margin-bottom: 12px;
}
}
</style>
</head>
<body>
<div class="main_page">
<div class="page_header floating_element">
<div class="warning-icon">⚠</div>
<span class="floating_element">
Apache2 PackeTTrino Server
</span>
</div>
<div class="content_section floating_element">
<div class="section_header section_header_red">
<div id="error"></div>
Connection Rejected
</div>
<div class="error-code">
Error 403 - Access Denied
</div>
<div class="content_section_text">
<p>
We're sorry, but your connection request has been <b>rejected</b> by the server.
You do not have sufficient permissions to access this resource on
<tt>Apache2 PackeTTrino</tt>.
</p>
<p>
This message indicates that the web server is working correctly, but access
to the requested page or directory is <b>restricted</b> by the security configuration.
</p>
<p>
If you believe you should have access to this content, please contact the
<b>system administrator</b> to verify your access permissions.
</p>
</div>

<div class="recommendations">
<h3>Possible causes:</h3>
<ul>
<li>Insufficient file or directory permissions</li>
<li>Restrictive access configuration in <tt>apache2.conf</tt></li>
<li>Configured IP or domain restrictions</li>
</ul>
</div>
</div>
</div>
</body>
</html>`;

/**
 * @description HTML page returned when the requested path is forbidden by Apache2 directory
 * permissions (HTTP 403 Forbidden — directory-level restriction).
 * @type {string}
 */
// [agent-added: esm-migration phase 04]
export const $FORBIDDENCONTENT = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Connection Rejected - Access Denied</title>
<style type="text/css" media="screen">
:root {
--primary-color: #dc2626;
--accent-color: #f59e0b;
--text-color: #1e293b;
--light-bg: #fef2f2;
--dark-bg: #7f1d1d;
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
line-height: 1.6;
color: var(--text-color);
background-color: var(--light-bg);
padding: 0 20px;
}

.main_page {
max-width: 900px;
margin: 40px auto;
background-color: white;
border-radius: 12px;
overflow: hidden;
box-shadow: var(--shadow);
border: 2px solid #fecaca;
}

.page_header {
display: flex;
align-items: center;
padding: 24px;
background-color: var(--dark-bg);
color: white;
}

.page_header img {
height: 40px;
margin-right: 16px;
}

.page_header .floating_element {
font-size: 24px;
font-weight: 600;
}

.warning-icon {
width: 40px;
height: 40px;
margin-right: 16px;
background-color: var(--primary-color);
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 24px;
color: white;
}

.content_section {
padding: 24px;
}

.section_header_red {
color: var(--primary-color);
font-size: 32px;
font-weight: 700;
margin-bottom: 24px;
position: relative;
padding-bottom: 10px;
}

.section_header_red::after {
content: "";
position: absolute;
bottom: 0;
left: 0;
width: 60px;
height: 4px;
background-color: var(--primary-color);
border-radius: 2px;
}

.content_section_text p {
margin-bottom: 16px;
font-size: 16px;
}

.error-code {
background-color: #fee2e2;
padding: 12px 16px;
border-radius: 8px;
border-left: 4px solid var(--primary-color);
margin: 20px 0;
font-weight: 600;
}

b {
color: var(--primary-color);
font-weight: 600;
}

tt {
background-color: #fee2e2;
padding: 2px 6px;
border-radius: 4px;
font-family: 'Courier New', monospace;
font-size: 14px;
color: var(--primary-color);
}

.recommendations {
background-color: #fef3c7;
padding: 16px;
border-radius: 8px;
border-left: 4px solid var(--accent-color);
margin-top: 20px;
}

.recommendations h3 {
color: #d97706;
margin-bottom: 12px;
font-size: 18px;
}

.recommendations ul {
margin-left: 20px;
}

.recommendations li {
margin-bottom: 8px;
}

@media (max-width: 768px) {
.main_page {
margin: 20px auto;
}

.page_header {
flex-direction: column;
text-align: center;
}

.warning-icon {
margin-right: 0;
margin-bottom: 12px;
}
}
</style>
</head>
<body>
<div class="main_page">
<div class="page_header floating_element">
<div class="warning-icon">⚠</div>
<span class="floating_element">
Apache2 PackeTTrino Server
</span>
</div>
<div class="content_section floating_element">
<div class="section_header section_header_red">
<div id="error"></div>
Forbidden
</div>
<div class="error-code">
You do not have access to this resource.
</div>
<div class="content_section_text">
<p>
We're sorry, but your connection request has been <b>rejected</b> by the server.
You do not have sufficient permissions to access this resource on
<tt>Apache2 PackeTTrino</tt>.
</p>
<p>
This message indicates that the web server is working correctly, but access
to the requested page or directory is <b>restricted</b> by the security configuration.
</p>
<p>
If you believe you should have access to this content, please contact the
<b>system administrator</b> to verify your access permissions.
</p>
</div>
</div>
</div>
</body>
</html>`;

/**
 * @description HTML page shown in the simulated browser when the destination device actively
 * rejects the TCP connection (no HTTP server listening, or port closed — HTTP 503 equivalent).
 * @type {string}
 */
// [agent-added: esm-migration phase 04]
export const $DEVICEREJECTIONCONTENT = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Connection Rejected - Server Unavailable</title>
<style type="text/css" media="screen">
:root {
--primary-color: #dc2626;
--accent-color: #7c2d12;
--text-color: #1e293b;
--light-bg: #fef2f2;
--dark-bg: #991b1b;
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
line-height: 1.6;
color: var(--text-color);
background-color: var(--light-bg);
padding: 0 20px;
}

.main_page {
max-width: 900px;
margin: 40px auto;
background-color: white;
border-radius: 12px;
overflow: hidden;
box-shadow: var(--shadow);
border: 2px solid #fca5a5;
}

.page_header {
display: flex;
align-items: center;
padding: 24px;
background-color: var(--dark-bg);
color: white;
}

.page_header .floating_element {
font-size: 24px;
font-weight: 600;
}

.error-icon {
width: 40px;
height: 40px;
margin-right: 16px;
background-color: var(--primary-color);
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 20px;
color: white;
}

.content_section {
padding: 24px;
}

.section_header_red {
color: var(--primary-color);
font-size: 32px;
font-weight: 700;
margin-bottom: 24px;
position: relative;
padding-bottom: 10px;
}

.section_header_red::after {
content: "";
position: absolute;
bottom: 0;
left: 0;
width: 60px;
height: 4px;
background-color: var(--primary-color);
border-radius: 2px;
}

.content_section_text p {
margin-bottom: 16px;
font-size: 16px;
}

.error-code {
background-color: #fee2e2;
padding: 12px 16px;
border-radius: 8px;
border-left: 4px solid var(--primary-color);
margin: 20px 0;
font-weight: 600;
text-align: center;
font-size: 18px;
}

b {
color: var(--primary-color);
font-weight: 600;
}

tt {
background-color: #fee2e2;
padding: 2px 6px;
border-radius: 4px;
font-family: 'Courier New', monospace;
font-size: 14px;
color: var(--primary-color);
}

.info-box {
background-color: #f3f4f6;
padding: 16px;
border-radius: 8px;
border-left: 4px solid #6b7280;
margin-top: 20px;
}

.info-box h3 {
color: #374151;
margin-bottom: 12px;
font-size: 18px;
}

.info-box ul {
margin-left: 20px;
}

.info-box li {
margin-bottom: 8px;
color: #4b5563;
}

.retry-section {
background-color: #ddd6fe;
padding: 16px;
border-radius: 8px;
border-left: 4px solid #7c3aed;
margin-top: 20px;
text-align: center;
}

.retry-section p {
color: #5b21b6;
font-weight: 500;
margin-bottom: 0;
}

@media (max-width: 768px) {
.main_page {
    margin: 20px auto;
}

.page_header {
    flex-direction: column;
    text-align: center;
}

.error-icon {
    margin-right: 0;
    margin-bottom: 12px;
}
}
</style>
</head>
<body>
<div class="main_page">
<div class="page_header floating_element">
    <div class="error-icon">✕</div>
    <span class="floating_element">
        Connection Rejected by Server
    </span>
</div>
<div class="content_section floating_element">
    <div class="section_header section_header_red">
        <div id="error"></div>
        Service Unavailable
    </div>
    <div class="error-code">
        Error 503 - Server Temporarily Unavailable
    </div>
    <div class="content_section_text">
        <p>
            The server has <b>rejected your connection</b> at this time. This may be because
            the service is temporarily overloaded, under maintenance, or experiencing
            technical difficulties.
        </p>
        <p>
            This type of error indicates that the server is <b>running</b> but cannot
            process your request at this time. The situation is generally temporary
            and the service should restore automatically.
        </p>
        <p>
            We recommend <b>trying again</b> in a few minutes. If the problem persists,
            the server may be experiencing more serious issues that require
            technical intervention.
        </p>
    </div>
</div>
</div>
</body>
</html>`;

/**
 * @description HTML page returned by the simulated Apache2 server when the requested resource
 * does not exist on the server (HTTP 404 Not Found).
 * @type {string}
 */
// [agent-added: esm-migration phase 04]
export const $404ERRORCONTENT = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Error 404 - Not Found</title>
<style type="text/css" media="screen">
:root {
--primary-color:rgb(0, 0, 0);
--accent-color:rgb(255, 255, 255);
--text-color: rgb(0, 0, 0);
--light-bg:rgb(255, 255, 255);
--dark-bg:rgb(0, 0, 0);
--shadow:rgb(0, 0, 0);
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
line-height: 1.6;
color: var(--text-color);
background-color: var(--light-bg);
padding: 0 20px;
}

.main_page {
max-width: 900px;
margin: 40px auto;
background-color: white;
border-radius: 12px;
overflow: hidden;
box-shadow: var(--shadow);
border: 2px solid #fecaca;
}

.page_header {
display: flex;
align-items: center;
padding: 24px;
background-color: var(--dark-bg);
color: white;
}

.page_header img {
height: 40px;
margin-right: 16px;
}

.page_header .floating_element {
font-size: 24px;
font-weight: 600;
}

.warning-icon {
width: 40px;
height: 40px;
margin-right: 16px;
background-color: var(--primary-color);
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 24px;
color: white;
}

.content_section {
padding: 24px;
}

.section_header_red {
color: var(--primary-color);
font-size: 32px;
font-weight: 700;
margin-bottom: 24px;
position: relative;
padding-bottom: 10px;
}

.section_header_red::after {
content: "";
position: absolute;
bottom: 0;
left: 0;
width: 60px;
height: 4px;
background-color: var(--primary-color);
border-radius: 2px;
}

.content_section_text p {
margin-bottom: 16px;
font-size: 16px;
}

.error-code {
background-color: #fee2e2;
padding: 12px 16px;
border-radius: 8px;
border-left: 4px solid var(--primary-color);
margin: 20px 0;
font-weight: 600;
}

b {
color: var(--primary-color);
font-weight: 600;
}

tt {
background-color: #fee2e2;
padding: 2px 6px;
border-radius: 4px;
font-family: 'Courier New', monospace;
font-size: 14px;
color: var(--primary-color);
}

.recommendations {
background-color: #fef3c7;
padding: 16px;
border-radius: 8px;
border-left: 4px solid var(--accent-color);
margin-top: 20px;
}

.recommendations h3 {
color: #d97706;
margin-bottom: 12px;
font-size: 18px;
}

.recommendations ul {
margin-left: 20px;
}

.recommendations li {
margin-bottom: 8px;
}

@media (max-width: 768px) {
.main_page {
margin: 20px auto;
}

.page_header {
flex-direction: column;
text-align: center;
}

.warning-icon {
margin-right: 0;
margin-bottom: 12px;
}
}
</style>
</head>
<body>
<div class="main_page">
<div class="page_header floating_element">
<div class="warning-icon">⚠</div>
<span class="floating_element">
Apache2 PackeTTrino Server
</span>
</div>
<div class="content_section floating_element">
<div class="section_header section_header_red">
<div id="error"></div>
Error 404
</div>
<div class="error-code">
The requested resource was not found on this server.
</div>
<div class="content_section_text">
<p>
We're sorry, but the requested resource was not found on this server.
<tt>Apache2 PackeTTrino</tt>.
</p>
</div>
</div>
</div>
</body>
</html>`;

/**
 * @description Generates an animated loading-screen HTML page shown in the simulated browser
 * while a connection is being established.
 * @param {string} site - Hostname or IP address being connected to, displayed in the status line.
 * @returns {string} Full HTML document string for the loading page.
 */
// [agent-added: esm-migration phase 04]
export const $LOADERCONTENT = (site) => {
return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Loading - PackeTTrino</title>
<style type="text/css" media="screen">
:root {
--primary-color: rgb(59, 130, 246);
--accent-color: rgb(147, 197, 253);
--text-color: rgb(55, 65, 81);
--light-bg: rgb(249, 250, 251);
--dark-bg: rgb(17, 24, 39);
--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
line-height: 1.6;
color: var(--text-color);
background: linear-gradient(135deg, var(--light-bg) 0%, #e5e7eb 100%);
min-height: 100vh;
display: flex;
align-items: center;
justify-content: center;
padding: 20px;
}

.main_page {
max-width: 500px;
width: 100%;
background-color: white;
border-radius: 16px;
overflow: hidden;
box-shadow: var(--shadow);
border: 1px solid #e5e7eb;
text-align: center;
}

.page_header {
display: flex;
align-items: center;
justify-content: center;
padding: 32px 24px 24px;
background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
color: white;
}

.page_header .server-icon {
width: 32px;
height: 32px;
margin-right: 12px;
background-color: rgba(255, 255, 255, 0.2);
border-radius: 8px;
display: flex;
align-items: center;
justify-content: center;
font-size: 18px;
}

.page_header .floating_element {
font-size: 20px;
font-weight: 600;
}

.content_section {
padding: 40px 24px;
}

.loader-container {
margin-bottom: 32px;
}

.spinner {
width: 64px;
height: 64px;
border: 4px solid #e5e7eb;
border-top: 4px solid var(--primary-color);
border-radius: 50%;
margin: 0 auto 24px;
animation: spin 1s linear infinite;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

.loading-text {
font-size: 24px;
font-weight: 600;
color: var(--primary-color);
margin-bottom: 16px;
}

.loading-subtitle {
font-size: 16px;
color: var(--text-color);
opacity: 0.7;
margin-bottom: 24px;
}

.progress-bar {
width: 100%;
height: 8px;
background-color: #e5e7eb;
border-radius: 4px;
overflow: hidden;
margin-bottom: 16px;
}

.progress-fill {
height: 100%;
background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
border-radius: 4px;
animation: progress 2s ease-in-out infinite;
transform-origin: left;
}

@keyframes progress {
0% { transform: scaleX(0.1); }
50% { transform: scaleX(0.7); }
100% { transform: scaleX(0.1); }
}

.loading-dots {
display: inline-block;
}

.loading-dots::after {
content: '';
animation: dots 1.5s infinite;
}

@keyframes dots {
0%, 20% { content: ''; }
40% { content: '.'; }
60% { content: '..'; }
80%, 100% { content: '...'; }
}

.server-info {
background-color: #f8fafc;
padding: 16px;
border-radius: 8px;
font-size: 14px;
color: var(--text-color);
opacity: 0.8;
}

@media (max-width: 768px) {
.main_page {
margin: 20px;
max-width: none;
}

.page_header {
padding: 24px 20px 20px;
}

.content_section {
padding: 32px 20px;
}

.spinner {
width: 56px;
height: 56px;
}

.loading-text {
font-size: 20px;
}
}

/* Pulse animation for the main container */
.main_page {
animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
0%, 100% { 
box-shadow: var(--shadow);
transform: scale(1);
}
50% { 
box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.2), 0 4px 10px -3px rgba(59, 130, 246, 0.1);
transform: scale(1.02);
}
}
</style>
</head>
<body>

    <div class="main_page">

        <div class="content_section">

            <div class="loader-container">
                <div class="spinner"></div>
                <div class="loading-text">Loading<span class="loading-dots"></span></div>
                <div class="loading-subtitle">Please wait while we process your request</div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>

            <div class="server-info">
                <strong>Status:</strong> Connecting to ${site}<br>
            </div>

        </div>

    </div>

</body>

</html>`};

/**
 * @description Generates an Apache-style directory listing HTML page when `Options Indexes` is
 * enabled and no index file is found at the requested path.
 * @param {string} documentRoot - Absolute path of the document root being listed (e.g. "/var/www/html").
 * @param {string[]} directoryIndexFiles - Array of filenames to display in the directory listing.
 * @returns {string} Full HTML document string for the directory index page.
 */
// [agent-added: esm-migration phase 04]
export const $DIRECTORYINDEXCONTENT = (documentRoot, directoryIndexFiles) => {
return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Directory Index</title>
        <style type="text/css" media="screen">
            :root {
                --primary-color: #2563eb;
                --accent-color: #1d4ed8;
                --text-color: #1e293b;
                --light-bg: #f8fafc;
                --dark-bg: #1e40af;
                --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                --file-bg: #ffffff;
                --folder-color: #f59e0b;
                --file-color: #6b7280;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1.6;
                color: var(--text-color);
                background-color: var(--light-bg);
                padding: 0 20px;
            }

            .main_page {
                max-width: 1000px;
                margin: 40px auto;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
                border: 2px solid #bfdbfe;
            }

            .page_header {
                display: flex;
                align-items: center;
                padding: 24px;
                background-color: var(--dark-bg);
                color: white;
            }

            .page_header .floating_element {
                font-size: 24px;
                font-weight: 600;
            }

            .directory-icon {
                width: 40px;
                height: 40px;
                margin-right: 16px;
                background-color: var(--primary-color);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: white;
            }

            .content_section {
                padding: 24px;
            }

            .section_header_blue {
                color: var(--primary-color);
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 24px;
                position: relative;
                padding-bottom: 10px;
            }

            .section_header_blue::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0;
                width: 60px;
                height: 4px;
                background-color: var(--primary-color);
                border-radius: 2px;
            }

            .path-bar {
                background-color: #e0f2fe;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid var(--primary-color);
                margin: 20px 0;
                font-weight: 600;
                font-family: 'Courier New', monospace;
                font-size: 16px;
                color: var(--accent-color);
            }

            .directory-list {
                background-color: var(--file-bg);
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                overflow: hidden;
                margin-top: 20px;
            }

            .directory-header {
                background-color: #f1f5f9;
                padding: 12px 16px;
                border-bottom: 1px solid #e2e8f0;
                font-weight: 600;
                color: var(--text-color);
                display: grid;
                grid-template-columns: 40px 1fr auto auto;
                gap: 16px;
                align-items: center;
            }

            .directory-item {
                padding: 12px 16px;
                border-bottom: 1px solid #f1f5f9;
                display: grid;
                grid-template-columns: 40px 1fr auto auto;
                gap: 16px;
                align-items: center;
                transition: background-color 0.2s ease;
                cursor: pointer;
            }

            .directory-item:hover {
                background-color: #f8fafc;
            }

            .directory-item:last-child {
                border-bottom: none;
            }

            .file-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }

            .folder-icon {
                color: var(--folder-color);
            }

            .file-icon-regular {
                color: var(--file-color);
            }

            .file-name {
                color: var(--primary-color);
                text-decoration: none;
                font-weight: 500;
            }

            .file-name:hover {
                text-decoration: underline;
            }

            .file-size {
                color: var(--file-color);
                font-size: 14px;
                font-family: 'Courier New', monospace;
            }

            .file-date {
                color: var(--file-color);
                font-size: 14px;
            }

            .info-section {
                background-color: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                margin-top: 20px;
            }

            .info-section p {
                margin-bottom: 12px;
                font-size: 16px;
                color: #4b5563;
            }

            .stats-box {
                background-color: #dbeafe;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid var(--primary-color);
                margin-top: 20px;
                text-align: center;
            }

            .stats-box p {
                color: var(--accent-color);
                font-weight: 500;
                margin-bottom: 0;
            }

            @media (max-width: 768px) {
                .main_page {
                    margin: 20px auto;
                }

                .page_header {
                    flex-direction: column;
                    text-align: center;
                }

                .directory-icon {
                    margin-right: 0;
                    margin-bottom: 12px;
                }

                .directory-header,
                .directory-item {
                    grid-template-columns: 30px 1fr;
                    gap: 12px;
                }

                .file-size,
                .file-date {
                    display: none;
                }
            }

        </style>
    </head>
    <body>
        <div class="main_page">
            <div class="page_header floating_element">
                <div class="directory-icon">📁</div>
                <span class="floating_element">
                    Directory Index
                </span>
            </div>
            <div class="content_section floating_element">
                <div class="path-bar">
                    📂 ${documentRoot}
                </div>
                <div class="directory-list">
                    ${directoryIndexFiles.map(file => `
                        <div class="directory-item">
                            <div class="file-icon file-icon-regular">📄</div>
                            <p class="file-name">${file}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    </body>
</html>`};
