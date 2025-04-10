// Function to show the popup with a custom message
function showPopup(message) {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");

  // Set the message and show the popup
  popupMessage.textContent = message;
  popup.style.display = "flex";

  // Add event listener to close the popup when the "OK" button is clicked
  const closeButton = document.getElementById("popup-close");
  closeButton.onclick = () => {
    popup.style.display = "none";
  };

  // Close the popup when clicking outside of it
  popup.onclick = (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  };
}