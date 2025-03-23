// Importing necessary dependencies from React and Firebase
import { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';
import Message from './Message';
import InputArea from './InputArea';
import {
  db,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from '../firebase';

// ChatWindow component to display and manage messages in a selected chat
function ChatWindow({ chatId, userId }) {
  // State to store the list of messages
  const [messages, setMessages] = useState([]);

  // Ref to scroll to the bottom of the messages
  const messagesEndRef = useRef(null);

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect to listen for real-time updates to the chat's messages
  useEffect(() => {
    const q = query(
      collection(db, `users/${userId}/chats/${chatId}/messages`),
      orderBy('timestamp')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(loadedMessages);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [userId, chatId]);

  // Function to handle sending a new message
  const handleSend = async (text) => {
    if (text.trim() === '') return;
    await addDoc(collection(db, `users/${userId}/chats/${chatId}/messages`), {
      text,
      sender: 'user',
      timestamp: Date.now(),
    });
  };

  // Render the chat window UI
  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg) => (
          <Message key={msg.id} text={msg.text} sender={msg.sender} />
        ))}
        {/* Empty div for scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>
      <InputArea onSend={handleSend} />
    </div>
  );
}

// Export the ChatWindow component as the default export
export default ChatWindow;