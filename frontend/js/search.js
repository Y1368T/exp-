document.getElementById("search-button").addEventListener("click", searchTasks);
document.getElementById("search-input").addEventListener("input", suggestTasks);
document.getElementById("search-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchTasks();
    }
});

function suggestTasks() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const filteredTasks = tasks.filter(task => task.task.toLowerCase().startsWith(query));

    const suggestionsContainer = document.getElementById("search-suggestions");
    suggestionsContainer.innerHTML = "";

    if (query !== "") {
        filteredTasks.forEach(task => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = task.task;
            suggestionItem.addEventListener("click", function() {
                document.getElementById("search-input").value = task.task;
                searchTasks();
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
    }
}

function searchTasks() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const filteredTasks = tasks.filter(task => task.task.toLowerCase().includes(query));

    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = "";

    if (filteredTasks.length === 0) {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = "Nothing Found";
        resultsContainer.appendChild(li);
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.textContent = task.task + (task.dueDate ? ` (Due: ${task.dueDate})` : "");
            resultsContainer.appendChild(li);
        });
    }
}
