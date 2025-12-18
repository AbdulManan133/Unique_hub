// Admin Panel JavaScript - Client-side only (uses JSON file for credentials)

// Credentials cache (loaded from JSON file)
let adminCredentials = null;
let credentialsLoading = false;

// Load credentials from JSON file
async function loadCredentials() {
  if (adminCredentials) {
    return adminCredentials; // Return cached credentials
  }
  
  if (credentialsLoading) {
    // Wait for ongoing load
    while (credentialsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return adminCredentials;
  }
  
  credentialsLoading = true;
  
  try {
    const response = await fetch('../static/data/admin_credentials.json');
    if (!response.ok) {
      throw new Error('Failed to load credentials');
    }
    adminCredentials = await response.json();
    credentialsLoading = false;
    return adminCredentials;
  } catch (error) {
    console.error('Error loading credentials:', error);
    // Fallback to default credentials
    adminCredentials = {
      username: 'admin',
      password: 'admin123'
    };
    credentialsLoading = false;
    return adminCredentials;
  }
}

// Initialize maintenance mode if not set
function initMaintenanceMode() {
  if (!localStorage.getItem('maintenance_mode')) {
    localStorage.setItem('maintenance_mode', 'false');
  }
}

// Initialize contact submissions array if not set
function initContacts() {
  if (!localStorage.getItem('contact_submissions')) {
    localStorage.setItem('contact_submissions', JSON.stringify([]));
  }
}

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('admin_logged_in') === 'true';
}

// Login function
async function handleLogin(username, password) {
  const credentials = await loadCredentials();
  
  if (username === credentials.username && password === credentials.password) {
    localStorage.setItem('admin_logged_in', 'true');
    return true;
  }
  return false;
}

// Logout function
function handleLogout() {
  localStorage.removeItem('admin_logged_in');
  window.location.href = 'login.html';
}

// Get maintenance mode status
function getMaintenanceMode() {
  initMaintenanceMode();
  return localStorage.getItem('maintenance_mode') === 'true';
}

// Toggle maintenance mode
function toggleMaintenanceMode() {
  initMaintenanceMode();
  const current = getMaintenanceMode();
  localStorage.setItem('maintenance_mode', (!current).toString());
  return !current;
}

// Get contact submissions
function getContacts() {
  initContacts();
  const contacts = localStorage.getItem('contact_submissions');
  return JSON.parse(contacts || '[]');
}

// Add contact submission
function addContact(contactData) {
  initContacts();
  const contacts = getContacts();
  contactData.timestamp = new Date().toISOString();
  contacts.push(contactData);
  localStorage.setItem('contact_submissions', JSON.stringify(contacts));
}

// Update credentials (shows instructions since we can't write files from static site)
async function updateCredentials(currentPassword, newUsername, newPassword) {
  const credentials = await loadCredentials();
  
  if (currentPassword !== credentials.password) {
    return { success: false, error: 'Current password is incorrect' };
  }
  
  if (newUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' };
  }
  
  if (newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  // Update the JSON file content
  const newCredentials = {
    username: newUsername,
    password: newPassword
  };
  
  // Update cache
  adminCredentials = newCredentials;
  
  // Create download link for updated credentials file
  const credentialsJSON = JSON.stringify(newCredentials, null, 2);
  const blob = new Blob([credentialsJSON], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'admin_credentials.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return { 
    success: true, 
    message: 'Credentials updated! A file has been downloaded. Please replace static/data/admin_credentials.json with the downloaded file and commit to your repository.',
    newCredentials: newCredentials
  };
}

// Check maintenance mode on page load (for main site)
function checkMaintenanceMode() {
  if (window.location.pathname.includes('/admin/')) {
    return; // Don't block admin pages
  }
  
  if (getMaintenanceMode()) {
    window.location.href = 'maintenance.html';
  }
}

// Initialize everything
initMaintenanceMode();
initContacts();

// Login page functionality
if (document.getElementById('login-form')) {
  const loginForm = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');
  
  // Redirect if already logged in
  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorDiv.style.display = 'none';
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const loginSuccess = await handleLogin(username, password);
    if (loginSuccess) {
      window.location.href = 'dashboard.html';
    } else {
      errorDiv.textContent = 'Invalid credentials';
      errorDiv.style.display = 'block';
    }
  });
}

// Dashboard page functionality
if (document.getElementById('maintenance-toggle')) {
  // Check if logged in
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
  
  // Load dashboard data
  (async function() {
    const contacts = getContacts();
    const totalContacts = contacts.length;
    const maintenanceStatus = getMaintenanceMode();
    const credentials = await loadCredentials();
    
    // Update stats
    document.getElementById('total-contacts').textContent = totalContacts;
    document.getElementById('maintenance-status-text').textContent = maintenanceStatus ? 'ON' : 'OFF';
    document.getElementById('maintenance-toggle').checked = maintenanceStatus;
    document.getElementById('current-username').textContent = credentials.username || 'admin';
  })();
  
  // Load contacts table
  const contactsContainer = document.getElementById('contacts-container');
  if (contacts.length > 0) {
    const recentContacts = contacts.slice(-10).reverse();
    let tableHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Service</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    recentContacts.forEach(contact => {
      const date = new Date(contact.timestamp).toLocaleDateString();
      const message = contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message;
      tableHTML += `
        <tr>
          <td>${contact.name || 'N/A'}</td>
          <td><a href="mailto:${contact.email}">${contact.email || 'N/A'}</a></td>
          <td>${contact.service || 'N/A'}</td>
          <td class="message-cell">${message || 'N/A'}</td>
          <td>${date}</td>
        </tr>
      `;
    });
    
    tableHTML += `
          </tbody>
        </table>
      </div>
    `;
    contactsContainer.innerHTML = tableHTML;
  }
  
  // Maintenance toggle
  document.getElementById('maintenance-toggle').addEventListener('change', function() {
    const enabled = toggleMaintenanceMode();
    document.getElementById('maintenance-status-text').textContent = enabled ? 'ON' : 'OFF';
  });
  
  // Credentials form
  const credentialsForm = document.getElementById('credentials-form');
  const errorDiv = document.getElementById('credentials-error');
  const successDiv = document.getElementById('credentials-success');
  
  credentialsForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    const currentPassword = document.getElementById('current-password').value;
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    
    const result = await updateCredentials(currentPassword, newUsername, newPassword);
    
    if (result.success) {
      successDiv.innerHTML = result.message || 'Credentials updated successfully!<br><br><strong>Important:</strong> Replace <code>static/data/admin_credentials.json</code> with the downloaded file and commit to your repository for changes to take effect across all browsers.';
      successDiv.style.display = 'block';
      credentialsForm.reset();
      
      // Don't auto-logout since they need to update the file
      // setTimeout(() => {
      //   handleLogout();
      // }, 2000);
    } else {
      errorDiv.textContent = result.error || 'Failed to update credentials';
      errorDiv.style.display = 'block';
    }
  });
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    handleLogout();
  });
}

// Check maintenance mode on main site pages
if (!window.location.pathname.includes('/admin/') && !window.location.pathname.includes('maintenance.html')) {
  checkMaintenanceMode();
}

// Export functions for use in contact form
if (typeof window !== 'undefined') {
  window.addContactSubmission = addContact;
}

