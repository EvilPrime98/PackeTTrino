/**
 * Builds and returns the animation controls menu widget.
 *
 * The returned element contains:
 * - A play/pause toggle button: clicking the play icon calls `pauseSimulation()`
 *   and swaps the icon to the pause icon, and vice-versa.
 * - An animation speed slider (`#visual-speed`, range 100–1000 ms) that updates
 *   the global `visualSpeed` variable and displays the current value in
 *   `#visual-speed-value` on each `input` event.
 *
 * The element is initially hidden via the "hidden" CSS class.
 *
 * @returns {HTMLDivElement} The assembled animation controls modal element.
 */
function AnimationControls() {
    
    const $animationControls = document.createElement("div");
    
    $animationControls.classList.add("video-controls", "hidden", "modal");
    
    $animationControls.innerHTML = `

        <div class="control-buttons">

            <button class="control-btn play-pause">
                <svg class="play-icon" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M8 5v14l11-7z"></path>
                </svg>
                <svg class="pause-icon hidden" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                </svg>
            </button>

            <div class="slider-container">
                <label for="visual-speed"> Animation Speed </label>
                <input type="range" id="visual-speed" name="visual-speed" min="100" max="1000">
                <p id="visual-speed-value">300</p><span>ms</span>
            </div>

        </div>
    `;

    /**
     * Pauses the simulation and swaps the play icon for the pause icon.
     *
     * @param {Event} event - The click event fired by the play icon.
     * @returns {void}
     */
    $animationControls.querySelector(".play-icon").addEventListener("click", function () {
        event.preventDefault();
        pauseSimulation();
        $animationControls.querySelector(".play-icon").classList.add("hidden");
        $animationControls.querySelector(".pause-icon").classList.remove("hidden");
    });

    /**
     * Resumes the simulation and swaps the pause icon for the play icon.
     *
     * @param {Event} event - The click event fired by the pause icon.
     * @returns {void}
     */
    $animationControls.querySelector(".pause-icon").addEventListener("click", function () {
        event.preventDefault();
        resumeSimulation();
        $animationControls.querySelector(".pause-icon").classList.add("hidden");
        $animationControls.querySelector(".play-icon").classList.remove("hidden");
    });

    /**
     * Updates the global `visualSpeed` variable and the displayed speed label
     * whenever the slider value changes.
     *
     * @param {Event} event - The input event fired by the range slider.
     * @returns {void}
     */
    $animationControls.querySelector("#visual-speed").addEventListener("input", function () {
        visualSpeed = this.value;
        $animationControls.querySelector("#visual-speed-value").innerHTML = this.value;
    });

    return $animationControls;

}
