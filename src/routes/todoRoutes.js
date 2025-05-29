import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all todos for logged-in user
router.get('/', (req, res) => {
  const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`);
  const todos = getTodos.all(req.userId);
  res.json(todos);
});

// Create new todo
router.post('/', (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ message: 'Task is required' });

  const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`);
  const result = insertTodo.run(req.userId, task);

  res.status(201).json({ id: result.lastInsertRowid, task, completed: 0 });
});

// Update todo
router.put('/:id', (req, res) => {
  const { completed } = req.body;
  const { id } = req.params;

  const updatedTodo = db.prepare(`UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?`);
  const result = updatedTodo.run(completed, id, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Todo not found or unauthorized' });
  }

  res.json({ message: 'Todo updated' });
});

// Delete todo
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleteTodo = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?');
  const result = deleteTodo.run(id, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Todo not found or unauthorized' });
  }

  res.json({ message: 'Todo deleted successfully' });
});

export default router;