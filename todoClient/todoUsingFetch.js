(function () {
  class TodoCrud {
    constructor() {
      //   this.events();
      this.todosList = document.getElementById("todos-list");
      this.todoTitleInput = document.getElementById("todo-title");
      this.todoAddBtn = document.getElementById("add-task-btn");
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
      });
    }

    singleTodoTemplate(todo) {
      return `
        <li class="non-editable" data-id="${todo._id}">
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
  }

  new TodoCrud();
})();
