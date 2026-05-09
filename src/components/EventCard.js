import { IconClock, IconMapPin, IconEdit, IconTrash } from '@/components/Icons';

const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

const categoryBadgeMap = {
  'Alışveriş': 'badge-success',
  'İş': 'badge-primary',
  'Eğitim': 'badge-info',
  'Sağlık': 'badge-danger',
  'Kişisel': 'badge-warning',
  'Genel': 'badge-muted'
};

export default function EventCard({ event, onEdit, onDelete }) {
  const date = new Date(event.startDate);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <article 
      className="event-card group" 
      role="listitem" 
      aria-label={event.title}
      onClick={() => onEdit?.(event)}
    >
      <div className="event-date-block">
        <span className="event-date-day" suppressHydrationWarning>{day}</span>
        <span className="event-date-month" suppressHydrationWarning>{month}</span>
      </div>
      <div className="event-info">
        <h4 className="event-title">{event.title}</h4>
        <div className="event-detail">
          <IconClock width={14} height={14} />
          <span suppressHydrationWarning>{time}</span>
        </div>
        {event.location && (
          <div className="event-detail">
            <IconMapPin width={14} height={14} />
            <span>{event.location}</span>
          </div>
        )}
      </div>
      <div className="event-actions-wrapper">
        <span className={`badge ${categoryBadgeMap[event.category] || 'badge-muted'}`}>{event.category}</span>
        <div className="event-actions">
          <button 
            className="btn btn-icon btn-ghost" 
            onClick={(e) => { e.stopPropagation(); onEdit?.(event); }}
          >
            <IconEdit width={16} height={16} />
          </button>
          <button 
            className="btn btn-icon btn-ghost text-danger" 
            onClick={(e) => { e.stopPropagation(); onDelete?.(event.id); }}
          >
            <IconTrash width={16} height={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
