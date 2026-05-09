"use client";
import { useLanguage } from '@/context/LanguageContext';
import { IconClock, IconTrash } from '@/components/Icons';
import { formatDate, formatDateTime, formatTime } from '@/lib/utils';

const priorityBadgeMap = {
  low: 'badge-priority-low', normal: 'badge-priority-normal',
  high: 'badge-priority-high', urgent: 'badge-priority-urgent',
};

const categoryBadgeMap = {
  'Alışveriş': 'badge-success',
  'İş': 'badge-primary',
  'Eğitim': 'badge-info',
  'Sağlık': 'badge-danger',
  'Kişisel': 'badge-warning',
  'Genel': 'badge-muted'
};

export default function TaskItem({ task, onToggle, onDelete, showActions = true }) {
  const { t } = useLanguage();
  const isCompleted = task.status === 'completed';
  const priorityKey = `priority.${task.priority}`;
  const dueDate = task.dueDate
    ? (formatTime(task.dueDate) === '00:00' ? formatDate(task.dueDate) : formatDateTime(task.dueDate))
    : null;

  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''}`} role="listitem">
      <input
        type="checkbox"
        className="task-checkbox"
        checked={isCompleted}
        onChange={() => onToggle?.(task.id)}
        aria-label={`${task.title} ${isCompleted ? t('tasks.filter.completed') : t('tasks.filter.pending')}`}
      />
      <div className="task-info">
        <span className="task-title">{task.title}</span>
        <div className="task-meta">
          <span className={`badge ${priorityBadgeMap[task.priority] || 'badge-muted'}`}>
            {t(priorityKey)}
          </span>
          <span className={`badge ${categoryBadgeMap[task.category] || 'badge-muted'}`}>{task.category}</span>
          {dueDate && (
            <span className="task-date">
              <IconClock width={12} height={12} />
              {dueDate}
            </span>
          )}
        </div>
      </div>
      {showActions && (
        <div className="task-actions">
          <button className="btn btn-icon btn-ghost" onClick={() => onDelete?.(task.id)} aria-label={t('common.delete')}>
            <IconTrash width={16} height={16} />
          </button>
        </div>
      )}
    </div>
  );
}
