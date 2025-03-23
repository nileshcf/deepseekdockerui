// Importing component-specific styles and icons
import './Message.css';
import BotIcon from '../assets/unicodebot-icon.svg';
import UserIcon from '../assets/user.png';

// Message component to display individual chat messages
function Message({ text, sender }) {
  // Render the message UI with appropriate icon and text
  return (
    <div className={`message ${sender}`}>
      {sender === 'ai' && (
        <img src={BotIcon} alt="Bot" className="bot-icon" />
      )}
      {sender === 'user' && (
        <img src={UserIcon} alt="User" className="user-icon" />
      )}
      <span>{text}</span>
    </div>
  );
}

// Export the Message component as the default export
export default Message;