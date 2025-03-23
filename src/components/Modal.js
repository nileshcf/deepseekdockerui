// Importing component-specific styles
import './Modal.css';

// Modal component for displaying confirmation dialogs
function Modal({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) {
  // Return null if the modal is not open
  if (!isOpen) return null;

  // Function to close the modal on Escape key press
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Render the modal UI
  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="modal">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            {cancelLabel}
          </button>
          <button className="modal-button confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the Modal component as the default export
export default Modal;