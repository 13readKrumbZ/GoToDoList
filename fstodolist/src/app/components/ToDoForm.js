import { useState } from "react";

export function ToDoForm({ set_Todo, todo, addTodo }) {
  function handleSubmit(e) {
    e.preventDefault();
    if (!todo.trim()) return; // to prevent white space submissions. Curly bracket not used, so if returns on true s
    set_Todo("");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        id="input "
        type="text"
        className="input"
        placeholder="what next?"
        value={todo}
        onChange={(e) => set_Todo(e.target.value)}
      ></input>
      <button className="btn" id="addbtn" type="submit" onClick={addTodo}>
        Add
      </button>
    </form>
  );
}
