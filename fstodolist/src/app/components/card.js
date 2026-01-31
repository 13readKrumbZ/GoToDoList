import { use, useEffect, useState } from "react";
import { ToDoForm } from "./ToDoForm";
import { ToDoList } from "./ToDoList";

export function Card() {
  const [todo, setTodo] = useState("");
  const [todolist, setTodoList] = useState([]);

  // for getting todo value from ToDoForm
  function set_Todo(value) {
    setTodo(value);
  }

  // fetches the todo list from external file. Used useEffect to run it only once when the component mounts.
  useEffect(() => {
    fetch("http://localhost:8080/todos")
      .then((response) => response.json())
      .then((data) => {
        setTodoList(data); // data is the array of todos
      })
      .catch((error) => {
        setTodoList([]); // fallback to empty array on error
        console.error("Failed to fetch todos:", error);
      });
  }, []);

  // saves todo to external file
  async function addToList(todoData) {
    const response = await fetch("http://localhost:8080/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to save todo: ${response.status} ${response.statusText}`
      );
    }
  }

  async function deleteFromList(todoData) {
    const response = await fetch(`http://localhost:8080/todos/${todoData.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete todo: ${response.status} ${response.statusText}`
      );
    }
  }

  // adds todo to the list
  function addTodo() {
    const todoData = {
      id: Math.random().toString(36).substring(2, 15), // use lowercase to match backend/json
      content: todo,
    };

    setTodoList((todolist) => [...todolist, todoData]); // store the object, not just the string
    addToList(todoData); // saves todo to external file
    setTodo(""); // resets the input field after adding a todo
  }

  // deletes todo from the list via the "delete" button in ToDoList component
  function deleteTodo(index) {
    const newlist = todolist.filter((_, idx) => idx !== index); // filters what does not meet the condition

    deleteFromList(todolist[index]); // delete from external file

    // update the state with the new list
    setTodoList(newlist);
  }

  return (
    <div className="Card">
      <h1>To Do List</h1>
      <ToDoList todolist={todolist} deleteTodo={deleteTodo} />
      <ToDoForm set_Todo={set_Todo} todo={todo} addTodo={addTodo} />
    </div>
  );
}
