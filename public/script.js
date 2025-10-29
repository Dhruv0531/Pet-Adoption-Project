// This will hold the data we fetch from the server
let allPets = [];
const API_URL = ''; // Relative path for Vercel

function renderPets(list) {
  const petList = document.getElementById("petList");
  petList.innerHTML = "";
  if (list.length === 0) {
    petList.innerHTML = "<p>No pets found! (The database might be empty)</p>";
    return;
  }
  list.forEach((pet) => {
    const card = document.createElement("div");
    card.className = "pet-card";
    card.innerHTML = `
      <img src="${pet.image}" alt="${pet.name}">
      <div class="pet-info">
        <h3>${pet.name}</h3>
        <p>${pet.breed} • ${pet.age}</p>
        <p>${pet.location}</p>
      </div>
      <button class="details-btn" onclick="showDetails('${pet._id}')">View Details</button>
    `;
    petList.appendChild(card);
  });
}

function filterPets() {
  const type = document.getElementById("filterType").value;
  const search = document.getElementById("searchBox").value.toLowerCase();
  
  const filtered = allPets.filter(
    (p) =>
      (type === "" || p.type === type) &&
      (p.name.toLowerCase().includes(search) || p.breed.toLowerCase().includes(search))
  );
  renderPets(filtered);
}

function showDetails(id) {
  const pet = allPets.find((p) => p._id === id); 
  if (!pet) return;

  document.getElementById("modalImage").src = pet.image;
  document.getElementById("modalName").textContent = pet.name;
  document.getElementById("modalBreed").textContent = `Breed: ${pet.breed}`;
  document.getElementById("modalAge").textContent = `Age: ${pet.age}`;
  document.getElementById("modalLocation").textContent = `Location: ${pet.location}`;
  document.getElementById("modalBio").textContent = pet.bio;
  
  // Store pet info on the apply button
  const applyBtn = document.getElementById("applyBtn");
  applyBtn.dataset.petId = pet._id;
  applyBtn.dataset.petName = pet.name;

  document.getElementById("petModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("petModal").style.display = "none";
}

function scrollToPets() {
  document.getElementById("pets").scrollIntoView({ behavior: "smooth" });
}

// This function runs when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(`${API_URL}/api/pets`);
    allPets = await response.json(); 
    renderPets(allPets); 
  } catch (error) {
    console.error('Failed to load pets:', error);
    document.getElementById("petList").innerHTML = "<p>Failed to load pets. Please try again later.</p>";
  }
  
  document.getElementById("filterType").addEventListener("change", filterPets);
  document.getElementById("searchBox").addEventListener("input", filterPets);
});


// --- Application Modal Functions ---

function applyToAdopt(button) {
  const petId = button.dataset.petId;
  const petName = button.dataset.petName;

  document.getElementById("applyPetId").value = petId;
  document.getElementById("applyPetName").value = petName;
  document.getElementById("applyModalTitle").textContent = `Apply for ${petName}`;

  closeModal(); // Close the details modal
  document.getElementById("applyModal").style.display = "flex"; // Open the apply modal
}

function closeApplyModal() {
  document.getElementById("applyModal").style.display = "none";
}

async function submitApplication(event) {
  event.preventDefault(); 
  
  const form = document.getElementById("applyForm");
  const formData = new FormData(form);
  const applicationData = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`${API_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    if (response.ok) {
      alert('Thank you! Your application has been submitted successfully.');
      closeApplyModal();
      form.reset(); 
    } else {
      alert('Error: Could not submit application. Please try again.');
    }
  } catch (error) {
    console.error('Failed to submit application:', error);
    alert('An error occurred. Please check the console.');
  }
}