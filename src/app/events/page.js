"use client";
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import EventCard from '@/components/EventCard';
import { IconPlus, IconX } from '@/components/Icons';
import useSWR from 'swr';
import { demoFetch } from '@/lib/demo-user-client';

export default function EventsPage() {
  const { t } = useLanguage();
  const { data, mutate } = useSWR('/api/events');
  const events = data?.events || [];
  const [editingEvent, setEditingEvent] = useState(null);

  const handleDelete = async (id) => {
    // Optimistic Update
    const updatedEvents = events.filter(e => e.id !== id);
    mutate({ events: updatedEvents }, false);

    try {
      await demoFetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { "x-app-secret": process.env.NEXT_PUBLIC_APP_API_SECRET }
      });
      mutate();
    } catch (e) {
      mutate();
    }
  };

  const handleUpdate = async (id, updatedData) => {
    // Optimistic Update
    const updatedEvents = events.map(e => e.id === id ? { ...e, ...updatedData } : e);
    mutate({ events: updatedEvents }, false);
    setEditingEvent(null);

    try {
      await demoFetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-app-secret": process.env.NEXT_PUBLIC_APP_API_SECRET },
        body: JSON.stringify(updatedData)
      });
      mutate();
    } catch (e) {
      mutate();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('events.title')}</h1>
        <button className="btn btn-secondary" disabled title="Demo modunda etkinlikleri AI input ile ekleyin">
          <IconPlus width={18} height={18} />
          AI ile ekle
        </button>
      </div>

      <div className="card">
        <div className="events-list" role="list">
          {events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onEdit={setEditingEvent}
              onDelete={handleDelete}
            />
          ))}
          {events.length === 0 && !data && (
            <div className="py-8 text-center opacity-50">{t('dashboard.aiThinking')}</div>
          )}
          {events.length === 0 && data && (
            <div className="empty-state">
              <h3 className="empty-state-title">{t('empty.events')}</h3>
              <p className="empty-state-desc">{t('empty.eventsDesc')}</p>
            </div>
          )}
        </div>
      </div>

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
                    defaultValue={editingEvent.startDate ? new Date(editingEvent.startDate).toISOString().slice(0, 16) : ''}
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
                onClick={() => handleUpdate(editingEvent.id, editingEvent)}
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
