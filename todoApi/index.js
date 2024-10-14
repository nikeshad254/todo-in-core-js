import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import Todo from "./model.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json({
      todos,
      message: "Fetched all todos",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({
      todo,
      message: "Fetched todo",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const todo = await Todo.create({ title });

    res.status(201).json({
      todo,
      message: "Todo created",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const updateTodo = await Todo.findByIdAndUpdate(
      todo._id,
      {
        title: title || todo.title,
        completed: completed === undefined ? todo.completed : completed,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(201).json({
      todo: updateTodo,
      message: "Todo updated",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    await Todo.findByIdAndDelete(todo._id);

    res.status(204).json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(8080, async () => {
  try {
    console.log("Server is running on http://localhost:8080");
    await mongoose.connect("mongodb://localhost:27017/todoAndroid");
    console.log("Database connected");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
