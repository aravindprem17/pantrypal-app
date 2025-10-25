document.addEventListener('DOMContentLoaded', () => {
    // API Base URL
    const API_URL = 'http://127.0.0.1:8000'; // Change if your backend runs elsewhere

    // DOM Elements
    const authSection = document.getElementById('auth-section');
    const inventorySection = document.getElementById('inventory-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const addItemForm = document.getElementById('add-item-form');
    const inventoryList = document.getElementById('inventory-list');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');
    const authError = document.getElementById('auth-error');
    const addItemError = document.getElementById('add-item-error');
    const itemsError = document.getElementById('items-error');
    const searchInput = document.getElementById('search-input');
    const editModal = document.getElementById('edit-modal');
    const editItemForm = document.getElementById('edit-item-form');
    const editItemId = document.getElementById('edit-item-id');
    const editItemName = document.getElementById('edit-item-name');
    const editItemCategory = document.getElementById('edit-item-category');
    const editItemQuantity = document.getElementById('edit-item-quantity');
    const editItemUnit = document.getElementById('edit-item-unit');
    const editItemExpiry = document.getElementById('edit-item-expiry-date');
    const editItemLowStock = document.getElementById('edit-item-low-stock');
    const editItemError = document.getElementById('edit-item-error');
    const closeModalButton = document.querySelector('.close-button');


    let userToken = localStorage.getItem('pantrypal_token');
    let currentUsername = localStorage.getItem('pantrypal_username');

    // --- Utility Functions ---
    function clearErrors() {
        authError.textContent = '';
        addItemError.textContent = '';
        itemsError.textContent = '';
        editItemError.textContent = '';
    }

    function showAuthError(message) {
        authError.textContent = message;
    }
     function showAddItemError(message) {
        addItemError.textContent = message;
    }
     function showItemsError(message) {
        itemsError.textContent = message;
    }
     function showEditItemError(message) {
        editItemError.textContent = message;
    }


    function updateUIBasedOnAuthState() {
        clearErrors();
        if (userToken && currentUsername) {
            authSection.style.display = 'none';
            inventorySection.style.display = 'block';
            welcomeMessage.textContent = `Welcome, ${currentUsername}!`;
            logoutButton.style.display = 'inline';
            loadInventory();
        } else {
            authSection.style.display = 'block';
            inventorySection.style.display = 'none';
            welcomeMessage.textContent = '';
            logoutButton.style.display = 'none';
            // Clear inventory list if logged out
            inventoryList.innerHTML = '';
        }
    }

    // --- API Call Functions ---
    async function apiCall(endpoint, method = 'GET', body = null, token = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(API_URL + endpoint, options);

             // Handle specific error codes for auth/item fetching
            if (!response.ok) {
                 if (response.status === 401 && endpoint !== '/api/users/token') { // Don't logout on login fail
                     console.error("Authentication error, logging out.");
                     handleLogout(); // Force logout on auth errors (expired token, etc.)
                     throw new Error('Authentication required.');
                 }
                const errorData = await response.json();
                console.error('API Error:', response.status, errorData);
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            // Handle successful responses (including 204 No Content for DELETE)
             if (response.status === 204 || response.headers.get('content-length') === '0') {
                 return null; // Or return an empty object/true based on context
             }

            return await response.json();

        } catch (error) {
            console.error('API Call failed:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    }


    // --- Authentication ---
    async function handleLogin(event) {
        event.preventDefault();
        clearErrors();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // FastAPI token endpoint expects form data
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch(API_URL + '/api/users/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                body: formData,
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Login failed: ${response.status}`);
            }

            const data = await response.json();
            userToken = data.access_token;
            currentUsername = username; // Assuming login success implies this username
            localStorage.setItem('pantrypal_token', userToken);
            localStorage.setItem('pantrypal_username', currentUsername);
            loginForm.reset();
            updateUIBasedOnAuthState();
        } catch (error) {
            console.error('Login failed:', error);
            showAuthError(error.message);
        }
    }

    async function handleRegister(event) {
        event.preventDefault();
        clearErrors();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            const newUser = await apiCall('/api/users/register', 'POST', { username, password });
            console.log('Registration successful:', newUser);
            // Optionally, log the user in directly after registration
            // For simplicity, just show the login form
            showLoginForm();
            registerForm.reset();
            alert('Registration successful! Please log in.'); // Simple feedback

        } catch (error) {
            console.error('Registration failed:', error);
            showAuthError(error.message);
        }
    }

    function handleLogout() {
        userToken = null;
        currentUsername = null;
        localStorage.removeItem('pantrypal_token');
        localStorage.removeItem('pantrypal_username');
        updateUIBasedOnAuthState();
    }

    function showRegistrationForm() {
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
        clearErrors();
    }
     function showLoginForm() {
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
        clearErrors();
    }


    // --- Inventory Management ---
    async function loadInventory(searchTerm = '') {
         clearErrors();
         if (!userToken) return;

         try {
             let items = await apiCall('/api/items/', 'GET', null, userToken);

             // Client-side filtering
             if(searchTerm) {
                 items = items.filter(item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
                 );
             }

             renderInventory(items);
         } catch (error) {
             console.error('Failed to load inventory:', error);
             showItemsError(`Failed to load items: ${error.message}`);
         }
    }

    function renderInventory(items) {
        inventoryList.innerHTML = ''; // Clear existing list
        if (!items || items.length === 0) {
            inventoryList.innerHTML = '<tr><td colspan="6">Your pantry is empty!</td></tr>';
            return;
        }

        const today = new Date();
        today.setHours(0,0,0,0); // Normalize today's date

        items.forEach(item => {
            const row = document.createElement('tr');

            const expiryDate = item.expiry_date ? new Date(item.expiry_date + 'T00:00:00') : null; // Ensure date is parsed correctly
            let expiryStatus = '';
            let rowClass = '';

             if (expiryDate) {
                 const diffTime = expiryDate - today;
                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                 if (diffDays < 0) {
                     expiryStatus = `Expired ${Math.abs(diffDays)} days ago`;
                     rowClass = 'expired';
                 } else if (diffDays <= 7) {
                     expiryStatus = `Expires in ${diffDays} days`;
                     // Optional: Add a 'warning' class for expiring soon
                 } else {
                     expiryStatus = expiryDate.toLocaleDateString();
                 }
            } else {
                expiryStatus = 'N/A';
            }

            // Check low stock
            if (item.low_stock_threshold !== null && item.quantity <= item.low_stock_threshold) {
                rowClass = rowClass ? rowClass + ' low-stock' : 'low-stock'; // Add low-stock class, potentially keeping expired class
            }
             row.className = rowClass;


            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>${item.unit || 'N/A'}</td>
                <td>${expiryStatus}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${item.id}">Edit</button>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </td>
            `;
            inventoryList.appendChild(row);

             // Add event listeners for edit/delete buttons
             row.querySelector('.edit-btn').addEventListener('click', () => openEditModal(item));
             row.querySelector('.delete-btn').addEventListener('click', () => handleDeleteItem(item.id, item.name));
        });
    }

    async function handleAddItem(event) {
        event.preventDefault();
        clearErrors();
        const newItem = {
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value || null,
            quantity: parseFloat(document.getElementById('item-quantity').value),
            unit: document.getElementById('item-unit').value || null,
            purchase_date: document.getElementById('item-purchase-date').value || null,
            expiry_date: document.getElementById('item-expiry-date').value || null,
            low_stock_threshold: parseFloat(document.getElementById('item-low-stock').value) || null,
        };

        // Basic validation
        if (isNaN(newItem.quantity)) {
             showAddItemError("Quantity must be a number.");
             return;
        }
         if (newItem.low_stock_threshold !== null && isNaN(newItem.low_stock_threshold)) {
              showAddItemError("Low Stock Alert must be a number if provided.");
             return;
         }


        try {
            await apiCall('/api/items/', 'POST', newItem, userToken);
            addItemForm.reset();
            loadInventory(); // Refresh the list
        } catch (error) {
            console.error('Failed to add item:', error);
            showAddItemError(`Failed to add item: ${error.message}`);
        }
    }

    async function handleDeleteItem(itemId, itemName) {
        if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
            clearErrors();
            try {
                // Adjust endpoint based on API structure; assuming DELETE /api/items/{item_id}
                const response = await apiCall(`/api/items/${itemId}`, 'DELETE', null, userToken);
                 console.log(`Item ${itemId} deleted`, response); // Response might be null or confirmation
                loadInventory(); // Refresh the list
            } catch (error) {
                console.error(`Failed to delete item ${itemId}:`, error);
                showItemsError(`Failed to delete item: ${error.message}`);
            }
        }
    }


    // --- Edit Modal Logic ---
    function openEditModal(item) {
        clearErrors();
        editItemId.value = item.id;
        editItemName.value = item.name;
        editItemCategory.value = item.category || '';
        editItemQuantity.value = item.quantity;
        editItemUnit.value = item.unit || '';
        editItemExpiry.value = item.expiry_date || ''; // Dates need YYYY-MM-DD
        editItemLowStock.value = item.low_stock_threshold === null ? '' : item.low_stock_threshold;
        editModal.style.display = "block";
    }

    function closeEditModal() {
        editModal.style.display = "none";
        editItemForm.reset();
        clearErrors();
    }

    async function handleEditItem(event) {
        event.preventDefault();
        clearErrors();

        const itemId = editItemId.value;
        const updatedItemData = {
            name: editItemName.value,
            category: editItemCategory.value || null,
            quantity: parseFloat(editItemQuantity.value),
            unit: editItemUnit.value || null,
            expiry_date: editItemExpiry.value || null,
            low_stock_threshold: editItemLowStock.value ? parseFloat(editItemLowStock.value) : null
            // Note: purchase_date is often not editable, but you could add it
        };

         // Basic validation
        if (isNaN(updatedItemData.quantity)) {
             showEditItemError("Quantity must be a number.");
             return;
        }
         if (updatedItemData.low_stock_threshold !== null && isNaN(updatedItemData.low_stock_threshold)) {
              showEditItemError("Low Stock Alert must be a number if provided.");
             return;
         }

        try {
            await apiCall(`/api/items/${itemId}`, 'PUT', updatedItemData, userToken);
            closeEditModal();
            loadInventory(); // Refresh list
        } catch (error) {
             console.error('Failed to update item:', error);
            showEditItemError(`Failed to update item: ${error.message}`);
        }
    }

    // --- Event Listeners ---
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutButton.addEventListener('click', handleLogout);
    showRegisterLink.addEventListener('click', showRegistrationForm);
    showLoginLink.addEventListener('click', showLoginForm);
    addItemForm.addEventListener('submit', handleAddItem);
    editItemForm.addEventListener('submit', handleEditItem);
    closeModalButton.addEventListener('click', closeEditModal);

    // Close modal if user clicks outside of it
    window.onclick = function(event) {
      if (event.target == editModal) {
        closeEditModal();
      }
    }

     // Search functionality
    searchInput.addEventListener('input', (e) => {
        loadInventory(e.target.value); // Reload/filter inventory on search input
    });

    // --- Initial Load ---
    updateUIBasedOnAuthState();
});
