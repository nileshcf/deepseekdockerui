// Importing necessary dependencies from React and other modules
import { useState, useEffect } from 'react';
import './App.css';
import ChatManager from './components/ChatManager';
import CompanyDashboard from './components/CompanyDashboard';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  setDoc,
  getDoc,
} from './firebase';

// Importing icons and images used in the UI
import GoogleIcon from './assets/google-icon.svg';
import LoginImage from './assets/main.gif';
import NightModeIcon from './assets/night-mode.png';
import DayModeIcon from './assets/day-mode.png';
import LogoutIcon from './assets/logout.png';
import DashboardIcon from './assets/dashboard.png';
import ChatIcon from './assets/chat.png';
import KeyIcon from './assets/key.png';

// Main App component that serves as the entry point of the application
function App() {
  // State to manage the currently logged-in user, initialized from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // State to manage the app's theme (dark or light), defaults to 'dark' if not set
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // State to track if the user is a company admin
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);

  // State to manage the active tab (chat or company dashboard), defaults to 'chat'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'chat';
  });

  // State to control the visibility of the product key modal
  const [showKeyModal, setShowKeyModal] = useState(false);

  // State to store the product key entered by the user
  const [productKey, setProductKey] = useState('');

  // State to display error messages related to product key validation
  const [keyError, setKeyError] = useState('');

  // State to display success messages after product key activation
  const [keyMessage, setKeyMessage] = useState('');

  // Effect to handle authentication state changes and check admin status
  useEffect(() => {
    // Listen for changes in the authentication state
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log('onAuthStateChanged fired:', currentUser);
      if (currentUser) {
        // If a user is logged in, update the user state and save to localStorage
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));

        try {
          // Query the 'admins' collection to check if the user is an admin
          const q = query(
            collection(db, 'admins'),
            where('email', '==', currentUser.email)
          );
          const adminSnapshot = await getDocs(q);
          const isAdmin = !adminSnapshot.empty;
          setIsCompanyAdmin(isAdmin);

          // If the user is an admin but their UID doesn't match the document ID,
          // add a new admin document with their UID
          if (isAdmin && adminSnapshot.docs[0].id !== currentUser.uid) {
            await addDoc(collection(db, 'admins'), {
              email: currentUser.email,
              uid: currentUser.uid,
            });
          }
          console.log('User is admin:', isAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsCompanyAdmin(false);
        }
      } else {
        // If no user is logged in, clear the user state and reset related states
        setUser(null);
        setIsCompanyAdmin(false);
        setActiveTab('chat');
        localStorage.removeItem('user');
        localStorage.removeItem('activeTab');
        console.log('User logged out');
      }
    });

    // Cleanup the auth listener on component unmount
    return () => unsubscribe();
  }, []);

  // Effect to save the active tab to localStorage when it changes (for admins only)
  useEffect(() => {
    if (user && isCompanyAdmin) {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab, user, isCompanyAdmin]);

  // Function to handle user login with Google
  const handleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        // On successful login, update the user state and save to localStorage
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
      })
      .catch((error) => console.error('Login error:', error));
  };

  // Function to handle user logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // On successful logout, clear user-related states and localStorage
        setUser(null);
        setIsCompanyAdmin(false);
        setActiveTab('chat');
        localStorage.removeItem('user');
        localStorage.removeItem('activeTab');
      })
      .catch((error) => console.error('Logout error:', error));
  };

  // Function to toggle between dark and light themes
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Function to toggle between chat and company dashboard tabs
  const handleTogglePage = () => {
    setActiveTab(activeTab === 'chat' ? 'company' : 'chat');
  };

  // Function to handle product key submission for admin privilege activation
  const handleKeySubmit = async () => {
    // Define the expected format for the product key (XXXX-XXXX-XXXX-XXXX)
    const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!keyPattern.test(productKey)) {
      setKeyError('Product key must be in the format XXXX-XXXX-XXXX-XXXX');
      return;
    }

    try {
      // Fetch the product keys document from Firestore
      const keyDocRef = doc(db, 'product-key', 'iAD50KN8TdpgcJ7zElBa');
      const keyDoc = await getDoc(keyDocRef);
      if (!keyDoc.exists()) {
        setKeyError('Product key database not found.');
        return;
      }

      // Extract the valid keys from the document
      const keyData = keyDoc.data();
      const validKeys = [
        keyData.key1,
        keyData.key2,
        keyData.key3,
        keyData.key4,
        keyData.key5,
      ];

      // Check if the entered key matches any of the valid keys
      if (!validKeys.includes(productKey)) {
        setKeyError('Invalid product key.');
        return;
      }

      // If the key is valid, add the user to the admins collection
      const uid = user.uid;
      await setDoc(doc(db, 'admins', uid), {
        email: user.email,
      });

      // Update the admin status and show a success message
      setIsCompanyAdmin(true);
      setKeyMessage('Activation successful!');
      setKeyError('');

      // Close the modal after 2 seconds
      setTimeout(() => {
        setShowKeyModal(false);
        setProductKey('');
        setKeyMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error validating product key:', error);
      setKeyError('Failed to validate product key.');
    }
  };

  // Render the main UI of the app
  return (
    <div className={`app ${theme}`}>
      {/* Header section with the app title and navigation buttons */}
      <header className="header">
        <h1>Re/Syst.ai</h1>
        <div className="header-buttons">
          {/* Show the nav button for admins to toggle between chat and dashboard */}
          {user && isCompanyAdmin && (
            <button className="nav-button" onClick={handleTogglePage}>
              <img
                src={activeTab === 'chat' ? DashboardIcon : ChatIcon}
                alt={activeTab === 'chat' ? 'Company Dashboard' : 'Chat Window'}
                className="nav-icon"
              />
              {activeTab === 'chat' ? 'Company Dashboard' : 'Chat Window'}
            </button>
          )}

          {/* Show the key button for non-admins to enter a product key */}
          {user && !isCompanyAdmin && (
            <button
              className="key-button"
              onClick={() => setShowKeyModal(true)}
            >
              <img src={KeyIcon} alt="Enter Product Key" className="key-icon" />
            </button>
          )}

          {/* Theme toggle button to switch between dark and light modes */}
          <button className="theme-toggle" onClick={toggleTheme}>
            <img
              src={theme === 'dark' ? DayModeIcon : NightModeIcon}
              alt="Toggle Theme"
              className="theme-icon"
            />
          </button>

          {/* Show logout button if user is logged in, otherwise show login button */}
          {user ? (
            <button className="auth-button logout" onClick={handleLogout}>
              <img src={LogoutIcon} alt="Logout" className="logout-icon" />
            </button>
          ) : (
            <button className="auth-button google-login" onClick={handleLogin}>
              <img src={GoogleIcon} alt="Google" className="google-icon" />
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="main">
        {user ? (
          // If user is logged in, show either the dashboard or chat based on active tab
          activeTab === 'company' ? (
            <CompanyDashboard userId={user.uid} />
          ) : (
            <ChatManager userId={user.uid} userName={user.displayName} />
          )
        ) : (
          // If user is not logged in, show the login prompt
          <div className="login-prompt">
            <img src={LoginImage} alt="Login prompt" className="login-image" />
            <p>Please log in to start chatting.</p>
          </div>
        )}
      </main>

      {/* Modal for entering product key to activate admin privileges */}
      {showKeyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>License to Activate Admin Privileges</h2>
            <input
              type="text"
              placeholder="Enter product key (XXXX-XXXX-XXXX-XXXX)"
              value={productKey}
              onChange={(e) => setProductKey(e.target.value.toUpperCase())}
              className="key-input"
            />
            {keyError && <p className="error">{keyError}</p>}
            {keyMessage && <p className="success">{keyMessage}</p>}
            <div className="modal-buttons">
              <button onClick={handleKeySubmit} className="confirm-button">
                Submit
              </button>
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setProductKey('');
                  setKeyError('');
                  setKeyMessage('');
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the App component as the default export
export default App;