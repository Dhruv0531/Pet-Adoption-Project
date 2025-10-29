// Get the token from storage
const token = localStorage.getItem('admin-token');
const API_URL = ''; // Relative path

// --- Main Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // If no token, redirect to login
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Load pets and applications
    loadPets();
    loadApplications();

    // Add event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addPetForm').addEventListener('submit', addPet);
});

// --- Auth Functions ---
function logout() {
    localStorage.removeItem('admin-token');
    window.location.href = '/login';
}

// --- Pet Management ---
async function loadPets() {
    // We fetch *all* pets for the admin, not just available ones
    // But for this project, the public /api/pets is fine.
    // A better route would be a protected /api/admin/pets
    const res = await fetch(`${API_URL}/api/pets`);
    const pets = await res.json();
    const petList = document.getElementById('petManagementList');
    petList.innerHTML = '';

    pets.forEach(pet => {
        const li = document.createElement('li');
        li.innerHTML = `
      <span><strong>${pet.name}</strong> (${pet.breed})</span>
      <div class="pet-actions">
        <button class="btn-adopt" onclick="markAsAdopted('${pet._id}')">Mark Adopted</button>
        <button class="btn-delete" onclick="deletePet('${pet._id}')">Delete</button>
      </div>
    `;
        petList.appendChild(li);
    });
}

async function addPet(e) {
    e.preventDefault();

    const pet = {
        name: document.getElementById('petName').value,
        type: document.getElementById('petType').value,
        breed: document.getElementById('petBreed').value,
        age: document.getElementById('petAge').value,
        location: document.getElementById('petLocation').value,
        image: document.getElementById('petImage').value,
        bio: document.getElementById('petBio').value,
    };


    await fetch(`${API_URL}/api/pets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Send the token
        },
        body: JSON.stringify(pet)
    });

    document.getElementById('addPetForm').reset();
    loadPets(); // Refresh the list
}

async function deletePet(id) {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    await fetch(`${API_URL}/api/pets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    loadPets(); // Refresh the list
}

async function markAsAdopted(id) {
    if (!confirm('Mark this pet as adopted? This will remove it from the public list.')) return;

    // We send a PUT request to update the status
    await fetch(`${API_URL}/api/pets/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adoptionStatus: 'Adopted' })
    });

    loadPets(); // Refresh the list
}

// --- Application Management ---
async function loadApplications() {
    const res = await fetch(`${API_URL}/api/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
        alert('Failed to load applications. Your session may have expired.');
        logout();
        return;
    }

    const applications = await res.json();
    const appList = document.getElementById('applicationsList');
    appList.innerHTML = '';

    if (applications.length === 0) {
        appList.innerHTML = '<li>No applications yet.</li>';
    }

    applications.forEach(app => {
        const li = document.createElement('li');
        li.innerHTML = `
      <strong>Pet: ${app.petName}</strong>
      <p>Applicant: ${app.name} (<a href="mailto:${app.email}">${app.email}</a> | <a href="tel:${app.phone}">${app.phone}</a>)</p>
      <p>Message: ${app.message || 'N/A'}</p>
      <small>Applied on: ${new Date(app.createdAt).toLocaleString()}</small>
    `;
        appList.appendChild(li);
    });
}