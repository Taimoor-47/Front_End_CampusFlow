import type { ScheduleEntry } from "@/types/api"
import { clsx } from 'clsx'

interface Props { entries: ScheduleEntry[] }

function fmt(t: string) {
  // "14:00:00" → "2:00 PM"
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function ScheduleTimeline({ entries }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-medium text-gray-900 mb-3">Today&apos;s Schedule</h2>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No classes today</p>
      ) : (
        <ol className="space-y-0">
          {entries.map((entry, idx) => (
            <li key={entry.entryId} className="flex gap-3">
              {/* Time column */}
              <div className="w-14 flex-shrink-0 text-right">
                <span className={clsx(
                  'text-[10px]',
                  entry.isNow ? 'text-blue-600 font-semibold' : 'text-gray-400'
                )}>
                  {fmt(entry.startTime)}
                </span>
              </div>

              {/* Dot + line */}
              <div className="flex flex-col items-center">
                <div className={clsx(
                  'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5',
                  entry.isNow  ? 'bg-blue-600 ring-2 ring-blue-200' :
                  entry.isDone ? 'bg-gray-300' : 'bg-gray-200'
                )} />
                {idx < entries.length - 1 && (
                  <div className="w-px flex-1 bg-gray-100 my-1" />
                )}
              </div>

              {/* Label */}
              <div className={clsx('pb-3 min-w-0', idx === entries.length - 1 && 'pb-0')}>
                <p className={clsx(
                  'text-xs font-medium',
                  entry.isNow  ? 'text-blue-700' :
                  entry.isDone ? 'text-gray-400'  : 'text-gray-800'
                )}>
                  {entry.courseTitle}
                  {entry.isNow && <span className="ml-1.5 text-[10px] text-blue-500">← Now</span>}
                </p>
                <p className="text-[11px] text-gray-400">
                  {entry.room} · ends {fmt(entry.endTime)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
