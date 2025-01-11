document.addEventListener("DOMContentLoaded", loadTasks);

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.classList.add("list-group-item", "text-center");
    emptyMessage.textContent = "Nothing to do currently";
    taskList.appendChild(emptyMessage);
  } else {
    tasks.forEach(({ task, dueDate }, index) => {
      const li = document.createElement("li");
      li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

      const taskText = document.createElement("span");
      taskText.textContent = `${index + 1}. ${task} ${dueDate ? `(Due: ${dueDate})` : ""}`;
      taskText.setAttribute("contenteditable", "true");
      taskText.classList.add("editable-task");

      taskText.addEventListener("blur", () => updateTaskName(index, taskText.textContent.split(". ")[1]));

      li.appendChild(taskText);
      taskList.appendChild(li);
    });
  }
}

function updateTaskName(index, newTaskName) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  if (tasks[index]) {
    tasks[index].task = newTaskName.trim();
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
  }
}
