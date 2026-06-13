/**
 * Closes all advanced options modals.
 */
export function closeAllAdvOptsModals() {
    const modals = $$(".advanced-options-modal");
    modals?.forEach(modal => modal.style.display = "none");
}

/**
 * Manages keyboard events in the document.
 * @param {KeyboardEvent} event 
 */
export function documentKeyboardHandler(event) {

    const keyboardActions = {
        "Escape": () => closeEveryThing(event)
    }

    if (keyboardActions[event.key]) keyboardActions[event.key]();
}

/**
 * Hides all modals and popups.
 * @param {Event} event 
 */
export function closeEveryThing(event) {

    //close all modals
    $$(".modal")?.forEach($modal => {
        if (window.getComputedStyle($modal).display === "none") return; //hacky, better use classes
        const $closeBtn = $('#close-btn', $modal);
        if ($closeBtn) $closeBtn.click();
    });

    //close all popups
    $$(".popup-content")?.forEach($popup => {
        const $closeBtn = $('#btn-close', $popup);
        const $cancelBtn = $('#btn-cancel', $popup);
        if ($closeBtn) $closeBtn.click();
        if ($cancelBtn) $cancelBtn.click();
    });

    //close all additional tools
    closeBrowser(event); 
    closeTraffic();
    closeTerminal(event);
}

/**
 * Manages the dark mode of the application.
 * @returns {void}
 */
export function activateDarkMode() {

    const $checkbox = $(".settings-modal #dark-mode");
    const $board = $(".board");
    const $panel = $("#item-panel");
    const $modals = $$(".modal");
    const $innerTables = $$(".inner-table");
    const $svgBoard = $("#svg-board");
    const $packetTraffic = $(".packet-traffic");
    const isChecked = $checkbox.checked;

    if ($checkbox.checked) {

        darkMode = true;
        localStorage.setItem("dark-mode", "true");
        $board.classList.add("dark-mode");
        $panel.classList.add("dark-mode");
        $modals?.forEach(modal => modal.classList.add("modal-dark-mode"));
        $('line', $svgBoard)?.forEach(line => line.setAttribute("stroke", "white"));
        $('.modal-table', $board)?.forEach(modal => modal.classList.add("dark-mode"));
        $packetTraffic.classList.add("dark-mode");
        $innerTables.forEach(table => table.classList.add("dark-mode"));
        changePanelIcons("dark");

    }else {

        darkMode = false;
        localStorage.setItem("dark-mode", "false");
        $board.classList.remove("dark-mode");
        $panel.classList.remove("dark-mode");
        $modals?.forEach(modal => modal.classList.remove("modal-dark-mode"));
        $('line', $svgBoard)?.forEach(line => line.setAttribute("stroke", "black"));
        $('.modal-table', $board)?.forEach(modal => modal.classList.remove("dark-mode"));
        $packetTraffic.classList.remove("dark-mode");
        $innerTables.forEach(table => table.classList.remove("dark-mode"));
        changePanelIcons("light");
        
    }

    /**
     * Changes the panel icons depending on the theme.
     * @param {'dark' | 'light'} theme
     * @returns {void}
     */
    function changePanelIcons(theme) {

        const $items = $$('.item', $panel);
    
        if (theme === "dark") {
            $items.forEach(item => {
                const fullname = (item.querySelector("img").src).split("/")[(item.querySelector("img").src).split("/").length - 1];
                item.querySelector("img").src = `./assets/panel/dark/${fullname}`;
            });
        }
    
        if (theme === "light") {
            $items.forEach(item => {
                const fullname = (item.querySelector("img").src).split("/")[(item.querySelector("img").src).split("/").length - 1];
                item.querySelector("img").src = `./assets/panel/${fullname}`;
            });
        }
        
    }
    
}

