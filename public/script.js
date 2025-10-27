// This will hold the data we fetch from the server
let allPets = [];

// This relative path will correctly fetch '/api/pets' on Vercel
const API_URL = ''; 

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
    // We use pet._id, which is the unique ID from the database
    card.innerHTML = `
  _    <img src="${pet.image}" alt="${pet.name}">
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

// Updated to find by ID
function showDetails(id) {
  const pet = allPets.find((p) => p._id === id); 
  if (!pet) return;

  document.getElementById("modalImage").src = pet.image;
  document.getElementById("modalName").textContent = pet.name;
  document.getElementById("modalBreed").textContent = `Breed: ${pet.breed}`;
  document.getElementById("modalAge").textContent = `Age: ${pet.age}`;
  document.getElementById("modalLocation").textContent = `Location: ${pet.location}`;
  document.getElementById("modalBio").textContent = pet.bio;
  document.getElementById("petModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("petModal").style.display = "none";
}

function applyToAdopt() {
  alert(" Thank you! We'll contact you soon about your adoption application.");
  closeModal();
}

function scrollToPets() {
  document.getElementById("pets").scrollIntoView({ behavior: "smooth" });
}

// This function runs when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Fetch pets from our backend API
    const response = await fetch(`${API_URL}/api/pets`);
    allPets = await response.json(); 
    
    // 2. Render them
    renderPets(allPets); 
  } catch (error) {
    console.error('Failed to load pets:', error);
    document.getElementById("petList").innerHTML = "<p>Failed to load pets. Check the console for errors.</p>";
  }
  
  // 3. Set up the event listeners
  document.getElementById("filterType").addEventListener("change", filterPets);
  document.getElementById("searchBox").addEventListener("input", filterPets);
});