const apiUrl = "http://localhost:3000/todos";

const taskContainer = document.getElementById("taskContainer");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.querySelector(".close");
const taskForm = document.getElementById("taskForm");
const searchInput = document.getElementById("search");
const darkModeToggle = document.getElementById("darkModeToggle");

let tasks = [];

// Open modal
addTaskBtn.addEventListener("click", () => {
  document.getElementById("modalTitle").innerText = "Add Task";
  taskForm.reset();
  document.getElementById("taskId").value = "";
  taskModal.style.display = "flex";
});

closeModal.addEventListener("click", () => taskModal.style.display = "none");

// Load tasks from server
async function loadTasks(query="") {
  try {
    const res = await fetch(`${apiUrl}?q=${query}`);
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    alert("Failed to load tasks");
    console.error(err);
  }
}

// Render tasks
function renderTasks() {
  taskContainer.innerHTML = "";
  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "taskCard";
    if(task.completed) card.classList.add("completed");

    card.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p><strong>Category:</strong> ${task.category}</p>
      <p><strong>Due:</strong> ${task.dueDate}</p>
      <button onclick="toggleComplete(${task.id}, ${task.completed})">${task.completed ? 'Undo' : 'Complete'}</button>
      <button onclick="editTask(${task.id})">Edit</button>
      <button onclick="deleteTask(${task.id})">Delete</button>
    `;
    taskContainer.appendChild(card);
  });
}

// Add/Edit task
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("taskId").value;
  const taskData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value,
    dueDate: document.getElementById("dueDate").value,
    completed: false
  };

  try {
    if(id) {
      await fetch(`${apiUrl}/${id}`, {
        method: "PATCH",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(taskData)
      });
    } else {
      await fetch(apiUrl, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(taskData)
      });
    }
    taskModal.style.display = "none";
    loadTasks(searchInput.value);
  } catch(err) {
    alert("Failed to save task");
    console.error(err);
  }
});

// Toggle complete
async function toggleComplete(id, completed) {
  try {
    await fetch(`${apiUrl}/${id}`, {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({completed: !completed})
    });
    loadTasks(searchInput.value);
  } catch(err) {
    alert("Failed to update task");
    console.error(err);
  }
}

// Edit task
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  document.getElementById("modalTitle").innerText = "Edit Task";
  document.getElementById("taskId").value = task.id;
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("category").value = task.category;
  document.getElementById("dueDate").value = task.dueDate;
  taskModal.style.display = "flex";
}

// Delete task
async function deleteTask(id) {
  if(confirm("Are you sure you want to delete this task?")) {
    try {
      await fetch(`${apiUrl}/${id}`, {method: "DELETE"});
      loadTasks(searchInput.value);
    } catch(err) {
      alert("Failed to delete task");
      console.error(err);
    }
  }
}

// Search
searchInput.addEventListener("input", () => loadTasks(searchInput.value));

// Dark mode
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Initial load
loadTasks();
