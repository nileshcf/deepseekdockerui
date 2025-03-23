// Importing necessary dependencies from React and Firebase
import { useState, useEffect } from 'react';
import './ChatManager.css';
import ChatWindow from './ChatWindow';
import {
  db,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from '../firebase';
import DeleteIcon from '../assets/delete.png';
import EditIcon from '../assets/edit.png';
import Modal from './Modal';

// ChatManager component to manage chat list and interactions
function ChatManager({ userId, userName }) {
  // State to store the list of chats
  const [chats, setChats] = useState([]);

  // State to track the currently selected chat
  const [selectedChatId, setSelectedChatId] = useState(null);

  // State to track the chat being edited
  const [editingChatId, setEditingChatId] = useState(null);

  // State for the new chat title during editing
  const [newChatTitle, setNewChatTitle] = useState('');

  // State to control the delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State to track the chat ID to delete
  const [chatToDelete, setChatToDelete] = useState(null);

  // Debug: Log the doc function to verify it's imported correctly
  console.log('doc function:', doc);

  // Effect to listen for real-time updates to the user's chats
  useEffect(() => {
    const q = query(
      collection(db, `users/${userId}/chats`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(loadedChats);
      if (!selectedChatId && loadedChats.length > 0) {
        setSelectedChatId(loadedChats[0].id);
      }
    });
    return () => unsubscribe();
  }, [userId, selectedChatId]);

  // Function to create a new chat
  const handleNewChat = async () => {
    const newChat = await addDoc(collection(db, `users/${userId}/chats`), {
      createdAt: Date.now(),
      title: `Chat ${chats.length + 1}`,
    });
    setSelectedChatId(newChat.id);
    await addDoc(collection(db, `users/${userId}/chats/${newChat.id}/messages`), {
      text: `Hello, ${userName}! How can I assist you today?`,
      sender: 'ai',
      timestamp: Date.now(),
    });
  };

  // Function to initiate chat deletion
  const handleDeleteChat = (chatId) => {
    setChatToDelete(chatId);
    setShowDeleteModal(true);
  };

  // Function to confirm chat deletion
  const confirmDeleteChat = async () => {
    if (chatToDelete) {
      await deleteDoc(doc(db, `users/${userId}/chats`, chatToDelete));
      if (selectedChatId === chatToDelete) {
        setSelectedChatId(chats.length > 1 ? chats[0].id : null);
      }
      setChatToDelete(null);
    }
    setShowDeleteModal(false);
  };

  // Function to start editing a chat title
  const handleEditChat = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setNewChatTitle(currentTitle);
  };

  // Function to save the edited chat title
  const handleSaveChatTitle = async (chatId) => {
    if (newChatTitle.trim()) {
      try {
        const chatRef = doc(db, `users/${userId}/chats`, chatId);
        console.log('chatRef:', chatRef);
        await updateDoc(chatRef, {
          title: newChatTitle.trim(),
        });
        setEditingChatId(null);
        setNewChatTitle('');
      } catch (error) {
        console.error('Error updating chat title:', error);
      }
    }
  };

  // Render the chat manager UI
  return (
    <div className="chat-manager">
      <div className="chat-list">
        {/* Button to start a new chat */}
        <button className="new-chat-button" onClick={handleNewChat}>
          New Chat
        </button>
        {chats.map((chat) => (
          <div key={chat.id} className="chat-item-container">
            {editingChatId === chat.id ? (
              // Edit mode for the chat title
              <div className="chat-edit">
                <input
                  type="text"
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleSaveChatTitle(chat.id)
                  }
                  className="chat-title-input"
                />
                <button
                  onClick={() => handleSaveChatTitle(chat.id)}
                  className="save-button"
                >
                  Save
                </button>
              </div>
            ) : (
              // Display mode with edit/delete options
              <>
                <button
                  className={`chat-item ${
                    selectedChatId === chat.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  {chat.title}
                </button>
                <button
                  className="chat-action-button edit"
                  onClick={() => handleEditChat(chat.id, chat.title)}
                >
                  <img src={EditIcon} alt="Edit" className="action-icon" />
                </button>
                <button
                  className="chat-action-button delete"
                  onClick={() => handleDeleteChat(chat.id)}
                >
                  <img src={DeleteIcon} alt="Delete" className="action-icon" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="chat-content">
        {selectedChatId ? (
          // Show the chat window if a chat is selected
          <ChatWindow chatId={selectedChatId} userId={userId} />
        ) : (
          // Show a placeholder message if no chat is selected
          <p>Select a chat or start a new one.</p>
        )}
      </div>
      {/* Modal for confirming chat deletion */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteChat}
        message="Are you sure you want to delete this chat?"
      />
    </div>
  );
}

// Export the ChatManager component as the default export
export default ChatManager;