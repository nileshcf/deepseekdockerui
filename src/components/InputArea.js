// Importing React hooks and component-specific styles
import { useState } from 'react';
import './InputArea.css';

// InputArea component for typing and sending messages
function InputArea({ onSend }) {
  // State to manage the input text
  const [input, setInput] = useState('');

  // Function to handle sending the message
  const handleSend = () => {
    onSend(input);
    setInput('');
  };

  // Function to handle sending the message on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  // Render the input area UI
  return (
    <div className="input-area">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

// Export the InputArea component as the default export
export default InputArea;