import React, { useState } from 'react';
import {
  Plus,
  Kanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  ArrowRight,
  ArrowLeft,
  X,
  Filter,
} from 'lucide-react';
import { KanbanTask, TaskStatus, TaskPriority } from '../types';

interface KanbanViewProps {
  tasks: KanbanTask[];
  onSaveTasks: (tasks: KanbanTask[]) => void;
  onLogActivity: (type: 'task' | 'command', title: string, desc: string) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onSaveTasks,
  onLogActivity,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [taskDueDate, setTaskDueDate] = useState('Tomorrow');

  const openNewTaskModal = (initialStatus: TaskStatus = 'todo') => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus(initialStatus);
    setTaskPriority('medium');
    setTaskCategory('Work');
    setTaskDueDate('Tomorrow');
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: KanbanTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskCategory(task.category);
    setTaskDueDate(task.dueDate || '');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      const updated = tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: taskTitle.trim(),
              description: taskDescription.trim(),
              status: taskStatus,
              priority: taskPriority,
              category: taskCategory,
              dueDate: taskDueDate,
            }
          : t
      );
      onSaveTasks(updated);
      onLogActivity('task', 'Task Updated', `Updated "${taskTitle.trim()}"`);
    } else {
      const newTask: KanbanTask = {
        id: 'task-' + Date.now(),
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        status: taskStatus,
        priority: taskPriority,
        category: taskCategory,
        dueDate: taskDueDate,
        createdAt: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      onSaveTasks(updated);
      onLogActivity('task', 'Task Created', `Added "${taskTitle.trim()}"`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const task = tasks.find((t) => t.id === id);
    const updated = tasks.filter((t) => t.id !== id);
    onSaveTasks(updated);
    if (task) {
      onLogActivity('task', 'Task Deleted', `Removed "${task.title}"`);
    }
  };

  const handleMoveStatus = (id: string, newStatus: TaskStatus, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    onSaveTasks(updated);
    const task = tasks.find((t) => t.id === id);
    if (task) {
      onLogActivity('task', 'Status Changed', `Moved "${task.title}" to ${newStatus}`);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    return true;
  });

  const columns: { id: TaskStatus; title: string; count: number }[] = [
    {
      id: 'todo',
      title: 'To Do',
      count: filteredTasks.filter((t) => t.status === 'todo').length,
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      count: filteredTasks.filter((t) => t.status === 'in_progress').length,
    },
    {
      id: 'completed',
      title: 'Completed',
      count: filteredTasks.filter((t) => t.status === 'completed').length,
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-glow-sm">
            Kanban Task Board
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Organize project deliverables and track execution across your workspace.
          </p>
        </div>

        <button
          onClick={() => openNewTaskModal('todo')}
          className="btn-3d flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-white to-zinc-200 text-zinc-950 text-xs sm:text-sm font-bold shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-400 text-[11px] uppercase font-mono">Priority:</span>
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition cursor-pointer ${
                filterPriority === p
                  ? 'bg-zinc-800 text-white border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800/80'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-zinc-400 font-mono">
          {filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'} total
        </span>
      </div>

      {/* Kanban 3-Column Board with 3D Depth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          const glowColor =
            col.id === 'completed'
              ? 'rgba(16,185,129,0.3)'
              : col.id === 'in_progress'
              ? 'rgba(245,158,11,0.3)'
              : 'rgba(99,102,241,0.3)';

          return (
            <div
              key={col.id}
              className="relative bg-zinc-900/75 rounded-2xl border border-zinc-800/90 p-3.5 space-y-3.5 backdrop-blur-xl specular-card"
            >
              {/* Column Top Specular Rim */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
                }}
              />

              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      col.id === 'completed'
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : col.id === 'in_progress'
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                    }`}
                  />
                  <h3 className="font-bold text-xs sm:text-sm text-zinc-100">
                    {col.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 font-semibold">
                    {col.count}
                  </span>
                </div>

                <button
                  onClick={() => openNewTaskModal(col.id)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards list */}
              <div className="space-y-2.5 min-h-[220px]">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-zinc-500 space-y-1.5 border border-dashed border-zinc-800/80 rounded-xl">
                    <p className="text-xs">No tasks in {col.title.toLowerCase()}</p>
                    <button
                      onClick={() => openNewTaskModal(col.id)}
                      className="text-[11px] text-zinc-300 hover:text-white font-medium cursor-pointer"
                    >
                      + Add task
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => openEditTaskModal(task)}
                      className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 hover:border-zinc-700 transition-all duration-200 cursor-pointer space-y-2 group specular-card hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.8),0_0_20px_-6px_rgba(99,102,241,0.2)]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase ${
                            task.priority === 'high'
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
                              : task.priority === 'medium'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                              : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white leading-tight">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                        <span>{task.dueDate || 'No date'}</span>

                        {/* Status transition shortcuts */}
                        <div className="flex items-center gap-1">
                          {col.id !== 'todo' && (
                            <button
                              onClick={(e) =>
                                handleMoveStatus(
                                  task.id,
                                  col.id === 'completed' ? 'in_progress' : 'todo',
                                  e
                                )
                              }
                              className="p-1 rounded-md bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                              title="Move back"
                            >
                              <ArrowLeft className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {col.id !== 'completed' && (
                            <button
                              onClick={(e) =>
                                handleMoveStatus(
                                  task.id,
                                  col.id === 'todo' ? 'in_progress' : 'completed',
                                  e
                                )
                              }
                              className="p-1 rounded-md bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                              title="Advance status"
                            >
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation & Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-semibold text-white text-base">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Audit API response latency"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Additional context or notes..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    placeholder="Work"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    placeholder="e.g. Friday"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
