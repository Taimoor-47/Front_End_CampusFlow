import { formatDistanceToNow } from 'date-fns'
import type { UpcomingAssignment } from '@/types/api'
import { clsx } from 'clsx'

interface Props { assignments: UpcomingAssignment[] }

const URGENCY_STYLES = {
  Urgent: 'bg-red-50 text-red-700',
  Soon:   'bg-amber-50 text-amber-700',
  Ok:     'bg-green-50 text-green-700',
}
const URGENCY_DOT = {
  Urgent: 'bg-red-500',
  Soon:   'bg-amber-500',
  Ok:     'bg-green-500',
}

export default function AssignmentsCard({ assignments }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-medium text-gray-900 mb-3">Upcoming Assignments</h2>

      {assignments.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No upcoming assignments 🎉</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {assignments.map(a => (
            <li key={a.assignmentId} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={clsx('mt-1.5 w-2 h-2 rounded-full flex-shrink-0', URGENCY_DOT[a.urgencyLabel])} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800">{a.courseCode} — {a.courseTitle}</p>
                <p className="text-xs text-gray-600 truncate">{a.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Due {formatDistanceToNow(new Date(a.dueDate), { addSuffix: true })}
                </p>
              </div>
              <span className={clsx('flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full', URGENCY_STYLES[a.urgencyLabel])}>
                {a.urgencyLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
