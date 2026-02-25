export default class TodoManager {
    constructor() {
        this.STORAGE_KEY = 'officeVerse_todos';
        this.todos = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    }

    getTasks(deskId) {
        return this.todos[deskId] || [];
    }

    addTask(deskId, text, isImmutable = false) {
        if (!this.todos[deskId]) this.todos[deskId] = [];
        const newTask = {
            id: Date.now() + Math.random(),
            text: text,
            completed: false,
            immutable: isImmutable
        };
        this.todos[deskId].push(newTask);
        this.save();
        return newTask; // returns the task so caller can get the ID
    }

    // Add a task with a specific ID (used by employees receiving boss broadcast)
    addTaskWithId(deskId, taskId, text, isImmutable = false) {
        if (!this.todos[deskId]) this.todos[deskId] = [];
        // Avoid duplicates if message arrives twice
        if (this.todos[deskId].find(t => t.id === taskId)) return;
        const newTask = {
            id: taskId,
            text: text,
            completed: false,
            immutable: isImmutable
        };
        this.todos[deskId].push(newTask);
        this.save();
    }

    // Assign a task to ALL desks — returns array of {deskId, taskId} for broadcast
    assignGlobalTask(text) {
        const desks = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];
        const assignments = [];
        desks.forEach(desk => {
            const task = this.addTask(desk, text, true);
            assignments.push({ deskId: desk, taskId: task.id });
        });
        return assignments;
    }

    toggleTask(deskId, taskId) {
        if (!this.todos[deskId]) return;
        const task = this.todos[deskId].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.save();
        }
    }

    editTask(deskId, taskId, newText) {
        if (!this.todos[deskId] || !newText.trim()) return;
        const task = this.todos[deskId].find(t => t.id === taskId);
        if (task) {
            task.text = newText.trim();
            this.save();
        }
    }

    // Employee delete — only non-immutable tasks
    deleteTask(deskId, taskId) {
        if (!this.todos[deskId]) return;
        const task = this.todos[deskId].find(t => t.id === taskId);
        if (task && task.immutable) {
            console.warn('Cannot delete immutable boss task');
            return;
        }
        this.todos[deskId] = this.todos[deskId].filter(t => t.id !== taskId);
        this.save();
    }

    // Boss delete — can remove any task including immutable boss tasks
    deleteTaskByBoss(deskId, taskId) {
        if (!this.todos[deskId]) return;
        this.todos[deskId] = this.todos[deskId].filter(t => t.id !== taskId);
        this.save();
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
    }
}
