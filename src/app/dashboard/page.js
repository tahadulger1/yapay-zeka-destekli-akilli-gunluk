"use client";
import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import AIInputBar from '@/components/AIInputBar';
import StatCard from '@/components/StatCard';
import TaskItem from '@/components/TaskItem';
import EventCard from '@/components/EventCard';
import NoteCard from '@/components/NoteCard';
import { IconTasks, IconCheck, IconClock, IconCalendar, IconNotes, IconX } from '@/components/Icons';
import Link from 'next/link';
import useSWR from 'swr';
import { demoFetch } from '@/lib/demo-user-client';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: tasksData, mutate: mutateTasks } = useSWR('/api/tasks');
  const { data: eventsData, mutate: mutateEvents } = useSWR('/api/events');
  const { data: notesData, mutate: mutateNotes } = useSWR('/api/notes');
  
  const tasks = tasksData?.tasks || [];
  const events = eventsData?.events || [];
  const notes = notesData?.notes || [];
  const loading = !tasksData && !eventsData && !notesData;
  const [editingEvent, setEditingEvent] = useState(null);

  // --- Task Categorization Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const pendingTasks = tasks.filter(tk => tk.status === 'pending');
  
  const todaysTasks = pendingTasks.filter(tk => {
    if (!tk.dueDate) return false;
    const d = new Date(tk.dueDate);
    return d >= today && d < tomorrow;
  });

  const inboxTasks = pendingTasks.filter(tk => !tk.dueDate);

  const upcomingTasks = pendingTasks.filter(tk => {
    if (!tk.dueDate) return false;
    const d = new Date(tk.dueDate);
    return d >= tomorrow && d < sevenDaysLater;
  });

  const laterTasks = pendingTasks.filter(tk => {
    if (!tk.dueDate) return false;
    const d = new Date(tk.dueDate);
    return d >= sevenDaysLater;
  });

  const upcomingEvents = events.slice(0, 5);
  const recentNotes = notes.slice(0, 3);

  const handleToggleTask = useCallback(async (id) => {
    const tk = tasks.find(t => t.id === id);
    if (!tk) return;
    const newStatus = tk.status === 'completed' ? 'pending' : 'completed';
    
    // Optimistic Update
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    mutateTasks({ tasks: updatedTasks }, false);

    try {
      await demoFetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-app-secret": process.env.NEXT_PUBLIC_APP_API_SECRET },
        body: JSON.stringify({ status: newStatus })
      });
      mutateTasks(); // Revalidate
    } catch (e) {
      mutateTasks(); // Restore on error
    }
  }, [tasks, mutateTasks]);

  const handleDeleteEvent = async (id) => {
    // Optimistic Update
    const updatedEvents = events.filter(e => e.id !== id);
    mutateEvents({ events: updatedEvents }, false);

    try {
      await demoFetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { "x-app-secret": process.env.NEXT_PUBLIC_APP_API_SECRET }
      });
      mutateEvents(); // Revalidate
    } catch (e) {
      mutateEvents(); // Restore on error
    }
  };

  const handleUpdateEvent = async (id, data) => {
    // Optimistic Update
    const updatedEvents = events.map(e => e.id === id ? { ...e, ...data } : e);
    mutateEvents({ events: updatedEvents }, false);
    setEditingEvent(null);

    try {
      await demoFetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-app-secret": process.env.NEXT_PUBLIC_APP_API_SECRET },
        body: JSON.stringify(data)
      });
      mutateEvents();
    } catch (e) {
      mutateEvents();
    }
  };

  const handleTaskCreated = () => {
      mutateTasks();
      mutateEvents();
      mutateNotes();
  };

  const completedCount = tasks.filter(tk => tk.status === 'completed').length;
  const pendingCount = pendingTasks.length;

  return (
    <div className="animate-fade-in">
      {/* Hoşgeldin */}
      <div className="dashboard-welcome">
        <h1>{t('dashboard.welcome')} 👋</h1>
        <p className="dashboard-subtitle">{t('dashboard.subtitle')}</p>
      </div>

      {/* AI Input Bar */}
      <AIInputBar onTaskCreated={handleTaskCreated} />

      {/* İstatistikler */}
      <div className="stats-grid" role="region" aria-label={t('stats.totalTasks')}>
        <StatCard icon={<IconTasks />} value={tasks.length} label={t('stats.totalTasks')} variant="primary" />
        <StatCard icon={<IconCheck />} value={completedCount} label={t('stats.completed')} variant="success" />
        <StatCard icon={<IconClock />} value={pendingCount} label={t('stats.pending')} variant="warning" />
        <StatCard icon={<IconCalendar />} value={events.length} label={t('stats.upcomingEvents')} variant="info" />
      </div>

      {/* Ana Grid */}
      <div className="dashboard-grid">
        {/* Sol Kolon: Görevler */}
        <div className="dashboard-column">
          {/* Bugünün Görevleri */}
          <section className="card mb-6" aria-label={t('section.todaysTasks')}>
            <div className="section-header">
              <h3 className="section-title"><IconTasks />{t('section.todaysTasks')}</h3>
            </div>
            <div className="tasks-list">
              {todaysTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} showActions={false} />
              ))}
              {todaysTasks.length === 0 && (
                <div className="empty-state py-4">
                  <p className="empty-state-desc">{t('empty.tasksDesc')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Gelen Kutusu (Inbox) */}
          <section className="card mb-6" aria-label={t('section.inbox')}>
            <div className="section-header">
              <h3 className="section-title"><IconClock />{t('section.inbox')}</h3>
            </div>
            <div className="tasks-list">
              {inboxTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} showActions={false} />
              ))}
            </div>
          </section>
        </div>

        {/* Sağ Kolon: Etkinlikler ve Önümüzdekiler */}
        <div className="dashboard-column">
          {/* Yaklaşan Etkinlikler */}
          <section className="card mb-6" aria-label={t('section.upcomingEvents')}>
            <div className="section-header">
              <h3 className="section-title"><IconCalendar />{t('section.upcomingEvents')}</h3>
            </div>
            <div className="events-list">
              {upcomingEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onEdit={setEditingEvent}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          </section>

          {/* Önümüzdeki 7 Gün */}
          <section className="card mb-6" aria-label={t('section.upcoming7Days')}>
            <div className="section-header">
              <h3 className="section-title"><IconCalendar />{t('section.upcoming7Days')}</h3>
            </div>
            <div className="tasks-list">
              {upcomingTasks.slice(0, 5).map(task => (
                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} showActions={false} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Daha Sonra (Bottom section) */}
      {laterTasks.length > 0 && (
        <section className="card mt-6" aria-label={t('section.later')}>
          <div className="section-header">
            <h3 className="section-title">{t('section.later')}</h3>
          </div>
          <div className="tasks-list grid grid-cols-2 gap-4">
            {laterTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={handleToggleTask} showActions={false} />
            ))}
          </div>
        </section>
      )}

      {/* Son Notlar */}
      <section style={{ marginTop: 24 }} aria-label={t('section.recentNotes')}>
        <div className="section-header">
          <h3 className="section-title"><IconNotes />{t('section.recentNotes')}</h3>
          <Link href="/notes" className="card-action">{t('section.viewAll')}</Link>
        </div>
        <div className="notes-grid" role="list">
          {recentNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </section>

      {/* Event Edit Modal */}
      {editingEvent && (
        <div className="modal-overlay" onClick={() => setEditingEvent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('events.editTitle')}</h3>
              <button 
                className="header-btn" 
                onClick={() => setEditingEvent(null)}
              >
                <IconX width={20} height={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group mb-4">
                <label className="input-label">{t('events.titleLabel') || 'Başlık'}</label>
                <input 
                  className="input"
                  defaultValue={editingEvent.title}
                  onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                />
              </div>
              <div className="input-group mb-4">
                <label className="input-label">{t('events.descLabel') || 'Açıklama'}</label>
                <textarea 
                  className="input textarea"
                  defaultValue={editingEvent.description}
                  onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">{t('events.dateLabel') || 'Tarih'}</label>
                  <input 
                    type="datetime-local"
                    className="input"
                    defaultValue={new Date(editingEvent.startDate).toISOString().slice(0, 16)}
                    onChange={e => setEditingEvent({...editingEvent, startDate: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('events.locationLabel') || 'Konum'}</label>
                  <input 
                    className="input"
                    defaultValue={editingEvent.location}
                    onChange={e => setEditingEvent({...editingEvent, location: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingEvent(null)}>{t('common.cancel')}</button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleUpdateEvent(editingEvent.id, editingEvent)}
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
