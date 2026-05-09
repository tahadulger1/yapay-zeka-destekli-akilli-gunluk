"use client";
import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import TaskItem from '@/components/TaskItem';
import { IconPlus } from '@/components/Icons';
import useSWR from 'swr';
import { demoFetch } from '@/lib/demo-user-client';

const filters = ['all', 'pending', 'completed'];

export default function TasksPage() {
  const { t } = useLanguage();
  const { data, mutate } = useSWR('/api/tasks');
  const tasks = data?.tasks || [];
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter(tk => tk.status === activeFilter);

  const handleToggle = useCallback(async (id) => {
    const tk = tasks.find(t => t.id === id);
    if (!tk) return;
    const newStatus = tk.status === 'completed' ? 'pending' : 'completed';
    
    // Optimistic Update
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    mutate({ tasks: updatedTasks }, false);

    try {
      await demoFetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-app-secret": process.env.NEXT_PUBLIC_APP_API_SECRET },
        body: JSON.stringify({ status: newStatus })
      });
      mutate();
    } catch (e) {
      mutate();
    }
  }, [tasks, mutate]);

  const handleDelete = useCallback(async (id) => {
    // Optimistic Update
    const updatedTasks = tasks.filter(t => t.id !== id);
    mutate({ tasks: updatedTasks }, false);

    try {
      await demoFetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "x-app-secret": process.env.NEXT_PUBLIC_APP_API_SECRET }
      });
      mutate();
    } catch (e) {
      mutate();
    }
  }, [tasks, mutate]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('tasks.title')}</h1>
        <button className="btn btn-secondary" disabled title="Demo modunda gorevleri AI input ile ekleyin">
          <IconPlus width={18} height={18} />
          AI ile ekle
        </button>
      </div>

      {/* Filtreler */}
      <div className="filter-bar" role="tablist" aria-label="Görev filtreleri">
        {filters.map(f => (
          <button
            key={f}
            className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
            role="tab"
            aria-selected={activeFilter === f}
          >
            {t(`tasks.filter.${f}`)}
            {f !== 'all' && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>
                ({tasks.filter(tk => f === 'all' ? true : tk.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Görev Listesi */}
      <div className="card">
        <div className="tasks-list" role="list" aria-live="polite">
          {filteredTasks.map(task => (
            <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
          {filteredTasks.length === 0 && (
            <div className="empty-state">
              <h3 className="empty-state-title">{t('empty.tasks')}</h3>
              <p className="empty-state-desc">{t('empty.tasksDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
