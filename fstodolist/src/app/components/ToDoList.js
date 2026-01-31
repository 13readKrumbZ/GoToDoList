import { useState } from "react";
import { useEffect } from "react";

export function ToDoList({ todolist, deleteTodo }) {
  // displays the todo list.
  return (
    <div className="list">
      {todolist.map((todo, index) => (
        <div className="cell" key={Math.random(index)}>
          <div className="todo">
            <span>{todo.content}</span>
          </div>
          <button className="btn" onClick={() => deleteTodo(index)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
