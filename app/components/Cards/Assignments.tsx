'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { clsx } from 'clsx'
import { getApiFileUrl } from '@/app/config/api'
import { submitAssignment } from '@/services/studentService'
import type { SubmissionResponse } from '@/services/studentService'
import type { UpcomingAssignment } from '@/types/api'

interface Props {
  assignments: UpcomingAssignment[]
  onSubmitted?: (assignmentId: string, submission: SubmissionResponse) => void
}

const MAX_SUBMISSION_FILE_BYTES = 25 * 1024 * 1024
const SUBMISSION_FILE_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg'

const URGENCY_STYLES = {
  Urgent: 'bg-red-50 text-red-700',
  Soon: 'bg-amber-50 text-amber-700',
  Ok: 'bg-green-50 text-green-700',
}

const URGENCY_DOT = {
  Urgent: 'bg-red-500',
  Soon: 'bg-amber-500',
  Ok: 'bg-green-500',
}

export default function AssignmentsCard({ assignments, onSubmitted }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | undefined>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ assignmentId: string; ok: boolean; text: string } | null>(null)

  const selectFile = (assignmentId: string, file?: File) => {
    setMessage(null)
    if (file && file.size > MAX_SUBMISSION_FILE_BYTES) {
      setSelectedFiles(current => ({ ...current, [assignmentId]: undefined }))
      setMessage({ assignmentId, ok: false, text: 'The submission must be 25 MB or smaller.' })
      return
    }

    setSelectedFiles(current => ({ ...current, [assignmentId]: file }))
  }

  const submit = async (assignmentId: string) => {
    const file = selectedFiles[assignmentId]
    if (!file) {
      setMessage({ assignmentId, ok: false, text: 'Choose a file to submit.' })
      return
    }

    setSubmittingId(assignmentId)
    setMessage(null)
    try {
      const submission = await submitAssignment(assignmentId, file)
      onSubmitted?.(assignmentId, submission)
      setSelectedFiles(current => ({ ...current, [assignmentId]: undefined }))
      setMessage({ assignmentId, ok: true, text: 'Assignment submitted successfully.' })
    } catch (error) {
      setMessage({
        assignmentId,
        ok: false,
        text: error instanceof Error ? error.message : 'Failed to submit assignment.',
      })
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-medium text-gray-900 mb-3">Assignments</h2>

      {assignments.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No assignments for your enrolled sections.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {assignments.map(assignment => {
            const isSubmitting = submittingId === assignment.assignmentId
            const itemMessage = message?.assignmentId === assignment.assignmentId ? message : null

            return (
              <li key={assignment.assignmentId} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <span
                  className={clsx(
                    'mt-1.5 w-2 h-2 rounded-full flex-shrink-0',
                    assignment.isSubmitted ? 'bg-blue-500' : URGENCY_DOT[assignment.urgencyLabel]
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {assignment.courseCode} — {assignment.courseTitle}
                      </p>
                      <p className="text-[11px] text-gray-500">Section {assignment.sectionName}</p>
                    </div>
                    <span
                      className={clsx(
                        'flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full',
                        assignment.isSubmitted
                          ? 'bg-blue-50 text-blue-700'
                          : URGENCY_STYLES[assignment.urgencyLabel]
                      )}
                    >
                      {assignment.isSubmitted ? 'Submitted' : assignment.urgencyLabel}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-gray-700">{assignment.title}</p>
                  {assignment.description && (
                    <p className="mt-0.5 text-xs text-gray-500 whitespace-pre-line">{assignment.description}</p>
                  )}
                  <p className="mt-1 text-[11px] text-gray-400">
                    Due {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {assignment.filePath && (
                      <a
                        href={getApiFileUrl(assignment.filePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Open assignment brief
                      </a>
                    )}
                    {assignment.submissionFilePath && (
                      <a
                        href={getApiFileUrl(assignment.submissionFilePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Open my submission
                      </a>
                    )}
                  </div>

                  {assignment.isSubmitted ? (
                    assignment.submittedAt && (
                      <p className="mt-2 text-[11px] text-green-700">
                        Submitted {format(new Date(assignment.submittedAt), 'PPp')}
                      </p>
                    )
                  ) : assignment.isPastDue ? (
                    <p className="mt-2 text-xs font-medium text-red-600">Submission deadline has passed.</p>
                  ) : (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <label className="block text-xs font-medium text-gray-700" htmlFor={`submission-${assignment.assignmentId}`}>
                        Submit your work
                      </label>
                      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          id={`submission-${assignment.assignmentId}`}
                          type="file"
                          accept={SUBMISSION_FILE_TYPES}
                          disabled={isSubmitting}
                          onChange={event => selectFile(assignment.assignmentId, event.target.files?.[0])}
                          className="min-w-0 flex-1 text-xs text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-white file:px-2 file:py-1 file:text-blue-700"
                        />
                        <button
                          type="button"
                          disabled={isSubmitting || !selectedFiles[assignment.assignmentId]}
                          onClick={() => submit(assignment.assignmentId)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSubmitting ? 'Submitting…' : 'Submit'}
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-gray-400">Maximum file size: 25 MB.</p>
                    </div>
                  )}

                  {itemMessage && (
                    <p className={clsx('mt-2 text-xs', itemMessage.ok ? 'text-green-700' : 'text-red-600')}>
                      {itemMessage.text}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
