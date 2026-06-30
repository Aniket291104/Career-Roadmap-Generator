'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Kanban, 
  Plus, 
  Trash2, 
  Loader2, 
  Calendar, 
  Tag, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['learning', 'coding', 'project', 'interview', 'other']).default('learning'),
  dueDate: z.string().optional(),
});

type TaskInput = z.infer<typeof createTaskSchema>;

interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks);
    } catch (err) {
      toast.error('Failed to load Kanban tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      status: 'todo',
      priority: 'medium',
      category: 'learning',
    }
  });

  const onSubmit = async (data: TaskInput) => {
    setAddingTask(true);
    try {
      const res = await api.post('/tasks', data);
      toast.success(res.data.message);
      reset();
      setShowAddForm(false);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to create task.');
    } finally {
      setAddingTask(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: 'todo' | 'in_progress' | 'review' | 'done') => {
    try {
      const res = await api.put(`/tasks/${id}`, { status: nextStatus });
      toast.success(res.data.message);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task column.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted.');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  const columns: { title: string; id: 'todo' | 'in_progress' | 'review' | 'done'; color: string }[] = [
    { title: 'To Do', id: 'todo', color: 'border-t-blue-500 bg-blue-500/5' },
    { title: 'In Progress', id: 'in_progress', color: 'border-t-yellow-500 bg-yellow-500/5' },
    { title: 'In Review', id: 'review', color: 'border-t-purple-500 bg-purple-500/5' },
    { title: 'Completed', id: 'done', color: 'border-t-green-500 bg-green-500/5' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Organize study modules, interview prep checklists, and practice goals.</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:bg-primary/95 transition-all flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Add Custom Task</span>
            </button>
          )}
        </div>

        {/* ADD TASK WIZARD */}
        {showAddForm && (
          <div className="p-6 rounded-2xl glass-card max-w-xl bg-gradient-to-b from-primary/5 to-transparent">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              <span>Create Checklist Card</span>
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Build authentication endpoints"
                  {...register('title')}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
                />
                {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Details about components, schemas, or resources..."
                  rows={2}
                  {...register('description')}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full px-2.5 py-2.5 border border-border bg-background rounded-lg text-[11px] font-semibold text-muted-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-2.5 py-2.5 border border-border bg-background rounded-lg text-[11px] font-semibold text-muted-foreground"
                  >
                    <option value="learning">Learning</option>
                    <option value="coding">Coding</option>
                    <option value="project">Project</option>
                    <option value="interview">Interview</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Due Date</label>
                  <input
                    type="date"
                    {...register('dueDate')}
                    className="w-full px-2 py-2 border border-border bg-background rounded-lg text-[11px] font-semibold text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addingTask}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow flex items-center gap-1"
                >
                  {addingTask && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-border hover:bg-muted/40 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* KANBAN GRID */}
        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6 items-start">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className={`rounded-xl border border-border/40 border-t-4 ${col.color} p-4 space-y-4 shrink-0`}>
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <h4 className="font-extrabold text-sm">{col.title}</h4>
                    <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-extrabold text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[300px]">
                    {colTasks.length > 0 ? (
                      colTasks.map((task) => (
                        <div key={task._id} className="p-4 rounded-lg bg-card border border-border/40 space-y-3 shadow-sm hover:shadow transition-shadow">
                          
                          {/* Priority and delete actions */}
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                              task.priority === 'high' 
                                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                : task.priority === 'medium'
                                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                  : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                              {task.priority}
                            </span>
                            <button 
                              onClick={() => handleDelete(task._id)}
                              className="text-muted-foreground hover:text-red-500 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <h5 className="text-xs font-bold leading-snug">{task.title}</h5>
                            {task.description && (
                              <p className="text-[10px] text-muted-foreground leading-normal mt-1">{task.description}</p>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-border/20 text-[9px] font-bold text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-primary" />
                              <span className="capitalize">{task.category}</span>
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>

                          {/* Quick action buttons to cycle status */}
                          <div className="flex gap-1 pt-1.5 border-t border-border/20 justify-end">
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => handleUpdateStatus(task._id, col.id === 'in_progress' ? 'todo' : col.id === 'review' ? 'in_progress' : 'review')}
                                className="px-1.5 py-0.5 border border-border bg-card hover:bg-muted text-[8px] font-extrabold rounded"
                              >
                                ◀ Left
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={() => handleUpdateStatus(task._id, col.id === 'todo' ? 'in_progress' : col.id === 'in_progress' ? 'review' : 'done')}
                                className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-extrabold rounded flex items-center gap-0.5"
                              >
                                <span>Move</span>
                                <ArrowRight className="w-2 h-2" />
                              </button>
                            )}
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-[10px] text-muted-foreground font-bold border border-dashed border-border/40 rounded-lg">
                        Empty Column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
