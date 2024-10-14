const textareas = document.querySelectorAll(".auto-resizing-textarea");

// Add an event listener for input events
textareas.forEach((element) => {
  element.addEventListener("input", function () {
    // Reset height to ensure that shrinking works properly
    this.style.height = "20px";

    // Set height based on scrollHeight (the height required to fit the content)
    this.style.height = `${this.scrollHeight}px`;
  });
});
