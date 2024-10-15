(function () {
  class TodoCrud {
    constructor() {
      //   this.events();
      this.todosList = document.getElementById("todos-list");
      this.todoTitleInput = document.getElementById("todo-title");
      this.todoAddBtn = document.getElementById("add-task-btn");
      this.originalTextMap = new Map(); // Store original text here
      this.events();
      this.getTodos();
    }

    events() {
      this.todoAddBtn.addEventListener("click", this.addTodo.bind(this));

      // Event delegation: attach a click event listener to the parent (todosList)
      this.todosList.addEventListener("click", (event) => {
        // Check if the clicked element is a delete button
        if (event.target.closest(".delete-btn")) {
          const todoElement = event.target.closest("li"); // Get the parent <li> element
          this.deleteTodo(todoElement);
        }

        // Check if the clicked element is a edit button
        if (event.target.closest(".edit-btn")) {
          const todoElement = event.target.closest("li"); // Get the parent <li> element
          if (todoElement.dataset.editing === "true") {
            this.makeNonEditable(todoElement, true);
          } else {
            this.makeEditable(todoElement);
          }
        }

        // check if the save button is clicked
        if (event.target.closest(".save-btn")) {
          const todoElement = event.target.closest("li");
          this.updateTodo(todoElement);
        }

        // check if the complete button is clicked
        if (event.target.closest(".complete-btn")) {
          const todoElement = event.target.closest("li");
          if (todoElement.classList.contains("completed")) {
            this.markTodo(todoElement, false);
          } else {
            this.markTodo(todoElement, true);
          }
        }
      });
    }

    singleTodoTemplate(todo) {
      return `
        <li class="non-editable ${
          todo.completed ? "completed" : ""
        }" data-id="${todo._id}">
          <textarea readonly class="task-text auto-resizing-textarea">${
            todo.title
          }</textarea>
          <div class="task-actions">
            <button class="complete-btn">
            ${
              todo.completed
                ? '<iconify-icon icon="mdi:multiply" width="24" height="24"></iconify-icon>'
                : '<iconify-icon icon="mdi:tick" width="24" height="24"></iconify-icon>'
            }
            </button>
            <button class="save-btn"><iconify-icon icon="material-symbols:save" width="24" height="24"></iconify-icon></button>
            <button class="edit-btn"><iconify-icon icon="material-symbols:edit" width="24" height="24"></iconify-icon></button>
            <button class="delete-btn"><iconify-icon icon="mdi:trash" width="24" height="24"></iconify-icon></button>
          </div>
        </li>
        `;
    }

    async getTodos() {
      try {
        const response = await fetch("http://localhost:8080/todos");
        const data = await response.json();
        const todos = data.todos;

        this.todosList.innerHTML = "";
        todos.forEach((todo) => {
          this.todosList.innerHTML += this.singleTodoTemplate(todo);
        });
      } catch (err) {
        console.log(err);
      }
    }

    async addTodo() {
      const title = this.todoTitleInput.value?.trim();
      if (!title) return;

      try {
        const response = await fetch("http://localhost:8080/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        });
        const data = await response.json();

        this.todoTitleInput.value = "";
        this.todosList.innerHTML += this.singleTodoTemplate(data.todo);
      } catch (err) {
        console.log(err);
      }
    }

    async deleteTodo(todoElement) {
      try {
        const response = await fetch(
          `http://localhost:8080/todos/${todoElement.dataset.id}`,
          {
            method: "DELETE",
          }
        );
        if (response.status === 204) {
          todoElement.remove();
        }
      } catch (err) {
        console.log(err);
      }
    }

    async updateTodo(todoElement) {
      const title = todoElement.querySelector(".task-text").value;
      const id = todoElement.dataset.id;
      try {
        await fetch(`http://localhost:8080/todos/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        });
        this.makeNonEditable(todoElement, false);
        this.originalTextMap.delete(todoElement); // Clean up Map after saving
      } catch (err) {
        console.log(err);
      }
    }

    async markTodo(todoElement, isComplete) {
      try {
        const completed = isComplete;
        const id = todoElement.dataset.id;

        await fetch(`http://localhost:8080/todos/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed }),
        });

        const completedBtn = todoElement.querySelector(".complete-btn");
        if (completed) {
          todoElement.classList.add("completed");
          completedBtn.innerHTML =
            '<iconify-icon icon="mdi:multiply" width="24" height="24"></iconify-icon>';
        } else {
          todoElement.classList.remove("completed");
          completedBtn.innerHTML =
            '<iconify-icon icon="mdi:tick" width="24" height="24"></iconify-icon>';
        }
      } catch (err) {
        console.log(err);
      }
    }

    makeEditable(todoElement) {
      todoElement.dataset.editing = true;
      const taskTextarea = todoElement.querySelector(".task-text");
      // Store the original value in the Map
      this.originalTextMap.set(todoElement, taskTextarea.value);

      todoElement.classList.remove("non-editable");
      todoElement.classList.add("editable");
      taskTextarea.readOnly = false;
      taskTextarea.focus();
      todoElement.querySelector(".edit-btn").innerHTML =
        '<iconify-icon icon="mdi:multiply" width="24" height="24"></iconify-icon>';
    }

    makeNonEditable(todoElement, isCancel = false) {
      todoElement.dataset.editing = false;
      const taskTextarea = todoElement.querySelector(".task-text");

      if (isCancel) {
        // Revert to original value from Map if canceling
        const originalValue = this.originalTextMap.get(todoElement);
        taskTextarea.value = originalValue;
        this.originalTextMap.delete(todoElement); // Clean up Map after canceling
      }

      todoElement.classList.remove("editable");
      todoElement.classList.add("non-editable");
      taskTextarea.readOnly = true;
      todoElement.querySelector(".edit-btn").innerHTML =
        '<iconify-icon icon="material-symbols:edit" width="24" height="24"></iconify-icon>';
    }
  }

  new TodoCrud();
})();
