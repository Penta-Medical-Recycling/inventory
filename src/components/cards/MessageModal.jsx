// components/modals/MessageModal.jsx

import React from "react";

const MessageModal = ({ message, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p style={{ marginBottom: "1.5rem" }}>{message}</p>
        <button className="modal-button-primary" onClick={onClose}>
  Return
</button>

      </div>
    </div>
  );
};

export default MessageModal;
