"use client";
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import NoteCard from '@/components/NoteCard';
import { IconPlus, IconX } from '@/components/Icons';
import useSWR from 'swr';
import { demoFetch } from '@/lib/demo-user-client';

export default function NotesPage() {
  const { t } = useLanguage();
  const { data, mutate } = useSWR('/api/notes');
  const notes = data?.notes || [];
  const [editingNote, setEditingNote] = useState(null);

  const handleDelete = async (id) => {
    // Optimistic Update
    const updatedNotes = notes.filter(n => n.id !== id);
    mutate({ notes: updatedNotes }, false);

    try {
      await demoFetch(`/api/notes/${id}`, {
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
    const updatedNotes = notes.map(n => n.id === id ? { ...n, ...updatedData } : n);
    mutate({ notes: updatedNotes }, false);
    setEditingNote(null);

    try {
      await demoFetch(`/api/notes/${id}`, {
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
        <h1 className="page-title">{t('notes.title')}</h1>
        <button className="btn btn-secondary" disabled title="Demo modunda notlari AI input ile ekleyin">
          <IconPlus width={18} height={18} />
          AI ile ekle
        </button>
      </div>

      <div className="notes-grid" role="list">
        {notes.map(note => (
          <NoteCard 
            key={note.id} 
            note={note} 
            onEdit={setEditingNote}
            onDelete={handleDelete}
          />
        ))}
        {notes.length === 0 && !data && (
          <div className="py-8 text-center opacity-50 col-span-full">{t('dashboard.aiThinking')}</div>
        )}
        {notes.length === 0 && data && (
          <div className="empty-state col-span-full">
            <h3 className="empty-state-title">{t('empty.notes')}</h3>
            <p className="empty-state-desc">{t('empty.notesDesc')}</p>
          </div>
        )}
      </div>

      {/* Note Edit Modal */}
      {editingNote && (
        <div className="modal-overlay" onClick={() => setEditingNote(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('common.edit') || 'Notu Düzenle'}</h3>
              <button 
                className="header-btn" 
                onClick={() => setEditingNote(null)}
              >
                <IconX width={20} height={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group mb-4">
                <label className="input-label">{t('notes.titleLabel') || 'Başlık'}</label>
                <input 
                  className="input"
                  defaultValue={editingNote.title}
                  onChange={e => setEditingNote({...editingNote, title: e.target.value})}
                />
              </div>
              <div className="input-group mb-4">
                <label className="input-label">{t('notes.contentLabel') || 'İçerik'}</label>
                <textarea 
                  className="input textarea"
                  defaultValue={editingNote.content}
                  onChange={e => setEditingNote({...editingNote, content: e.target.value})}
                  rows={5}
                />
              </div>
              <div className="input-group">
                <label className="input-label">{t('notes.categoryLabel') || 'Kategori'}</label>
                <select 
                  className="input"
                  defaultValue={editingNote.category}
                  onChange={e => setEditingNote({...editingNote, category: e.target.value})}
                >
                  <option value="Genel">Genel</option>
                  <option value="İş">İş</option>
                  <option value="Kişisel">Kişisel</option>
                  <option value="Eğitim">Eğitim</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingNote(null)}>{t('common.cancel')}</button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleUpdate(editingNote.id, editingNote)}
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
