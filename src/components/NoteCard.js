import { IconEdit, IconTrash } from '@/components/Icons';
import { formatDate } from '@/lib/utils';

export default function NoteCard({ note, onEdit, onDelete }) {
  const date = formatDate(note.createdAt);

  return (
    <article 
      className="note-card animate-scale-in group" 
      role="listitem" 
      aria-label={note.title}
      onClick={() => onEdit?.(note)}
    >
      <div className="note-card-header">
        <h4 className="note-title">{note.title}</h4>
        <div className="note-actions">
          <button 
            className="btn btn-icon btn-ghost" 
            onClick={(e) => { e.stopPropagation(); onEdit?.(note); }}
          >
            <IconEdit width={16} height={16} />
          </button>
          <button 
            className="btn btn-icon btn-ghost text-danger" 
            onClick={(e) => { e.stopPropagation(); onDelete?.(note.id); }}
          >
            <IconTrash width={16} height={16} />
          </button>
        </div>
      </div>
      <p className="note-preview">{note.content}</p>
      <div className="note-footer">
        <span className="badge badge-muted">{note.category}</span>
        <span className="note-date">{date}</span>
      </div>
    </article>
  );
}
