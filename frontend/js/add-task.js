document.getElementById("add-task").addEventListener("click", addTask);
document.getElementById("new-task").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
  const taskInput = document.getElementById("new-task");
  const dueDateInput = document.getElementById("due-date");
  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }

  const taskList = document.getElementById("task-list");
  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between align-items-center";

  const taskContent = document.createElement("span");
  taskContent.textContent = taskText + (dueDate ? ` (Due: ${dueDate})` : "");
  li.appendChild(taskContent);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "5px";

  const editButton = document.createElement("button");
  editButton.className = "btn btn-warning btn-sm";
  editButton.innerHTML = "✏️"; // Pencil icon
  editButton.onclick = () => editTask(taskContent, editButton);
  buttonContainer.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-danger btn-sm";
  deleteButton.innerHTML = "🗑️"; // Trash icon
  deleteButton.onclick = () => deleteTask(li);
  buttonContainer.appendChild(deleteButton);

  li.appendChild(buttonContainer);
  taskList.appendChild(li);

  saveTaskToLocalStorage(taskText, dueDate);

  taskInput.value = "";
  dueDateInput.value = "";

  if (dueDate && isToday(new Date(dueDate))) {
    alert(`Reminder: The task "${taskText}" is due today!`);
  }
}

function saveTaskToLocalStorage(task, dueDate) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ task, dueDate });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach(({ task, dueDate }) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const taskContent = document.createElement("span");
    taskContent.textContent = task + (dueDate ? ` (Due: ${dueDate})` : "");
    li.appendChild(taskContent);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";

    const editButton = document.createElement("button");
    editButton.className = "btn btn-warning btn-sm";
    editButton.innerHTML = "✏️"; // Pencil icon
    editButton.onclick = () => editTask(taskContent, editButton);
    buttonContainer.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-danger btn-sm";
    deleteButton.innerHTML = "🗑️"; // Trash icon
    deleteButton.onclick = () => deleteTask(li);
    buttonContainer.appendChild(deleteButton);

    li.appendChild(buttonContainer);
    taskList.appendChild(li);
  });
}

function editTask(taskContent, editButton) {
  const originalTask = taskContent.textContent.split(" (Due")[0];
  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.value = originalTask;
  taskContent.textContent = "";
  taskContent.appendChild(inputField);

  editButton.innerHTML = "💾"; // Save icon
  editButton.onclick = () => saveEditedTask(inputField, taskContent, editButton, originalTask);
  inputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      saveEditedTask(inputField, taskContent, editButton, originalTask);
    }
  });
}

function saveEditedTask(inputField, taskContent, editButton, originalTask) {
  const newTaskText = inputField.value.trim();
  if (newTaskText === "") {
    alert("Task name cannot be empty.");
    return;
  }

  taskContent.textContent = newTaskText;

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskIndex = tasks.findIndex((task) => task.task === originalTask);
  if (taskIndex > -1) {
    tasks[taskIndex].task = newTaskText;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  editButton.innerHTML = "✏️"; // Pencil icon
  editButton.onclick = () => editTask(taskContent, editButton);
}

function deleteTask(taskItem) {
  const taskList = document.getElementById("task-list");
  const taskText = taskItem.querySelector("span").textContent.split(" (Due")[0];
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const updatedTasks = tasks.filter((task) => task.task !== taskText);

  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  taskList.removeChild(taskItem);
}

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
