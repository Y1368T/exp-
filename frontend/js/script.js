document.addEventListener('DOMContentLoaded', () => {
  const taskList = document.getElementById('task-list');
  const newTaskInput = document.getElementById('new-task');

  function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(taskItem => {
      if (taskItem.querySelector('span')) {
        tasks.push(taskItem.querySelector('span').textContent);
      }
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length === 0) {
      const noTaskItem = document.createElement('li');
      noTaskItem.className = 'list-group-item text-center';
      noTaskItem.textContent = 'Nothing to do currently';
      taskList.appendChild(noTaskItem);
    } else {
      tasks.forEach(taskText => {
        addTask(taskText);
      });
    }
  }

  function addTask(taskText = null) {
    if (taskText === null) {
      taskText = newTaskInput.value.trim();
      if (taskText === '') {
        alert('Please enter a task.');
        return;
      }
    }

    if (taskList.children.length === 1 && taskList.firstElementChild.textContent === 'Nothing to do currently') {
      taskList.innerHTML = '';
    }

    const taskItem = document.createElement('li');
    taskItem.className = 'list-group-item task-actions';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input me-2';
    checkbox.style.border = '1px solid #ccc';

    const taskTextSpan = document.createElement('span');
    taskTextSpan.textContent = taskText;

    const editButton = document.createElement('button');
    editButton.className = 'btn btn-warning btn-sm ms-2';
    editButton.textContent = 'Edit';
    editButton.onclick = () => enableEditing(taskTextSpan, editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm ms-2';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
      deleteTask(taskItem);
      saveTasks();
    };

    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskTextSpan);
    taskItem.appendChild(editButton);
    taskItem.appendChild(deleteButton);

    taskList.appendChild(taskItem);
    newTaskInput.value = '';
    saveTasks();

    // Auto-delete after 3 seconds 
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        setTimeout(() => {
          taskItem.remove();
          alert('You completed your task!');
          saveTasks();
        }, 3000); 
      }
    });
  }

  function enableEditing(taskTextSpan, editButton) {
    const taskText = taskTextSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.value = taskText;

    const saveButton = document.createElement('button');
    saveButton.className = 'btn btn-success btn-sm';
    saveButton.textContent = 'Save';
    saveButton.onclick = () => {
      saveTask(input, taskTextSpan, editButton, saveButton);
      saveTasks();
    };

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        saveTask(input, taskTextSpan, editButton, saveButton);
        saveTasks();
      }
    });

    taskTextSpan.replaceWith(input);
    editButton.replaceWith(saveButton);
  }

  function saveTask(input, taskTextSpan, editButton, saveButton) {
    const newTaskText = input.value.trim();
    if (newTaskText === '') {
      alert('Please enter a task.');
      return;
    }
    taskTextSpan.textContent = newTaskText;
    input.replaceWith(taskTextSpan);
    saveButton.replaceWith(editButton);
    saveTasks();
  }

  function deleteTask(taskItem) {
    taskItem.remove();
    if (taskList.children.length === 0) {
      const noTaskItem = document.createElement('li');
      noTaskItem.className = 'list-group-item text-center';
      noTaskItem.textContent = 'Nothing to do currently';
      taskList.appendChild(noTaskItem);
    }
  }

  newTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  });

  window.addTask = addTask;
  window.enableEditing = enableEditing;
  window.saveTask = saveTask;
  window.deleteTask = deleteTask;

  loadTasks();
});
