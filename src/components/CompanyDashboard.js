// Importing necessary dependencies from React and Firebase
import { useState, useEffect } from 'react';
import './CompanyDashboard.css';
import {
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from '../firebase';
import Modal from './Modal';

// CompanyDashboard component for managing admins and knowledge base uploads
function CompanyDashboard({ userId }) {
  // State for the type of upload (text, pdf, etc.)
  const [uploadType, setUploadType] = useState('text');

  // State for the content input (text or URL)
  const [content, setContent] = useState('');

  // State for the selected file (for pdf, doc, image uploads)
  const [file, setFile] = useState(null);

  // State to store the list of knowledge base uploads
  const [uploads, setUploads] = useState([]);

  // State to store the list of admins
  const [admins, setAdmins] = useState([]);

  // State for error messages
  const [error, setError] = useState('');

  // State to control the admin deletion confirmation modal
  const [showDeleteAdminModal, setShowDeleteAdminModal] = useState(false);

  // State to control the upload deletion confirmation modal
  const [showDeleteUploadModal, setShowDeleteUploadModal] = useState(false);

  // State to track the admin ID to delete
  const [adminToDelete, setAdminToDelete] = useState(null);

  // State to track the upload ID to delete
  const [uploadToDelete, setUploadToDelete] = useState(null);

  // State to store the uploader's email
  const [uploaderEmail, setUploaderEmail] = useState('');

  // Effect to fetch the uploader's email from the admins collection
  useEffect(() => {
    const fetchUploaderEmail = async () => {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', userId));
        if (adminDoc.exists()) {
          setUploaderEmail(adminDoc.data().email);
        }
      } catch (error) {
        console.error('Error fetching uploader email:', error);
      }
    };
    fetchUploaderEmail();
  }, [userId]);

  // Function to load shared knowledge base uploads from Firestore
  const loadUploads = async () => {
    try {
      const uploadSnapshot = await getDocs(collection(db, 'knowledgeBase'));
      const loadedUploads = uploadSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUploads(loadedUploads);
    } catch (error) {
      console.error('Error loading uploads:', error);
    }
  };

  // Effect to load uploads when the component mounts
  useEffect(() => {
    loadUploads();
  }, []);

  // Effect to load the list of admins from Firestore
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const adminSnapshot = await getDocs(collection(db, 'admins'));
        const adminList = adminSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdmins(adminList);
      } catch (error) {
        console.error('Error loading admins:', error);
      }
    };
    loadAdmins();
  }, []);

  // Function to validate URL format
  const isValidUrl = (url) => {
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
    return urlPattern.test(url);
  };

  // Function to handle form submission for uploading content
  const handleUpload = async (e) => {
    e.preventDefault();
    if (uploadType === 'text' && !content.trim()) return;
    if (
      (uploadType === 'blog' || uploadType === 'website') &&
      (!content.trim() || !isValidUrl(content))
    ) {
      setError('Please enter a valid URL for Blog or Website.');
      return;
    }
    if (['pdf', 'doc', 'image'].includes(uploadType) && !file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      let uploadData = {
        type: uploadType,
        uploaderId: userId,
        uploaderEmail: uploaderEmail,
        timestamp: Date.now(),
      };

      if (['pdf', 'doc', 'image'].includes(uploadType)) {
        // Mock file upload (in a real app, upload to Firebase Storage and store the URL)
        uploadData.content = file.name; // Store file name as content (mocked)
        uploadData.fileType = file.type;
      } else {
        uploadData.content = content.trim();
      }

      await addDoc(collection(db, 'knowledgeBase'), uploadData);
      setContent('');
      setFile(null);
      setError('');
      loadUploads();
    } catch (error) {
      console.error('Error uploading data:', error);
      setError('Failed to upload data.');
    }
  };

  // Function to initiate admin deletion
  const handleDeleteAdmin = (adminId) => {
    if (adminId === userId) {
      setError('You cannot delete yourself as an admin.');
      return;
    }
    setAdminToDelete(adminId);
    setShowDeleteAdminModal(true);
  };

  // Function to confirm admin deletion
  const confirmDeleteAdmin = async () => {
    if (adminToDelete) {
      try {
        await deleteDoc(doc(db, 'admins', adminToDelete));
        setAdmins(admins.filter((admin) => admin.id !== adminToDelete));
        setAdminToDelete(null);
        setShowDeleteAdminModal(false);
      } catch (error) {
        console.error('Error deleting admin:', error);
        setError('Failed to delete admin.');
      }
    }
    setShowDeleteAdminModal(false);
  };

  // Function to initiate upload deletion
  const handleDeleteUpload = (uploadId) => {
    setUploadToDelete(uploadId);
    setShowDeleteUploadModal(true);
  };

  // Function to confirm upload deletion
  const confirmDeleteUpload = async () => {
    if (uploadToDelete) {
      try {
        await deleteDoc(doc(db, 'knowledgeBase', uploadToDelete));
        setUploads(uploads.filter((upload) => upload.id !== uploadToDelete));
        setUploadToDelete(null);
        setShowDeleteUploadModal(false);
      } catch (error) {
        console.error('Error deleting upload:', error);
        setError('Failed to delete upload.');
      }
    }
    setShowDeleteUploadModal(false);
  };

  // Render the company dashboard UI
  return (
    <div className="company-dashboard">
      <h2>Knowledge Base Dashboard</h2>
      <div className="dashboard-container">
        {/* Admin management section */}
        <div className="admin-section">
          <h3>Manage Admins</h3>
          <div className="admin-delete-section">
            <h4>Current Admins</h4>
            {admins.length === 0 ? (
              <p>No admins found.</p>
            ) : (
              <ul>
                {admins.map((admin) => (
                  <li key={admin.id}>
                    {admin.email}
                    {admin.id !== userId && (
                      <button
                        className="delete-admin-button"
                        onClick={() => handleDeleteAdmin(admin.id)}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error && <p className="error">{error}</p>}
        </div>

        {/* Upload section for adding new content */}
        <div className="upload-section">
          <h3>Upload Data</h3>
          <form onSubmit={handleUpload}>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="pdf">PDF File</option>
              <option value="doc">Doc File</option>
              <option value="image">Image File</option>
              <option value="website">Website URL</option>
              <option value="blog">Blog URL</option>
            </select>
            {['pdf', 'doc', 'image'].includes(uploadType) ? (
              <input
                type="file"
                accept={
                  uploadType === 'pdf'
                    ? '.pdf'
                    : uploadType === 'doc'
                    ? '.doc,.docx'
                    : 'image/*'
                }
                onChange={(e) => setFile(e.target.files[0])}
              />
            ) : (
              <textarea
                placeholder={
                  uploadType === 'text'
                    ? 'Enter content'
                    : 'Enter URL (e.g., https://example.com)'
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            )}
            <button type="submit">Upload</button>
          </form>
        </div>

        {/* Knowledge base section displaying uploaded content */}
        <div className="knowledge-base-section">
          <h3>Knowledge Base</h3>
          <button onClick={loadUploads} className="refresh-button">
            Refresh Knowledge Base
          </button>
          {uploads.length === 0 ? (
            <p>No content in the Knowledge Base yet.</p>
          ) : (
            <ul>
              {uploads.map((upload) => (
                <li key={upload.id}>
                  <div className="upload-item">
                    <div className="upload-content">
                      <strong>{upload.type.toUpperCase()}:</strong>{' '}
                      {['website', 'blog'].includes(uploadType) ? (
                        <a
                          href={upload.content}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {upload.content}
                        </a>
                      ) : (
                        upload.content
                      )}
                    </div>
                    <div className="upload-meta">
                      <span>Uploaded by: {upload.uploaderEmail}</span>
                      <span>
                        On: {new Date(upload.timestamp).toLocaleDateString()}
                      </span>
                      <button
                        className="delete-upload-button"
                        onClick={() => handleDeleteUpload(upload.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal for confirming admin deletion */}
      <Modal
        isOpen={showDeleteAdminModal}
        onClose={() => setShowDeleteAdminModal(false)}
        onConfirm={confirmDeleteAdmin}
        message="Are you sure you want to delete this admin?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      {/* Modal for confirming upload deletion */}
      <Modal
        isOpen={showDeleteUploadModal}
        onClose={() => setShowDeleteUploadModal(false)}
        onConfirm={confirmDeleteUpload}
        message="Are you sure you want to delete this item from the Knowledge Base?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}

// Export the CompanyDashboard component as the default export
export default CompanyDashboard;