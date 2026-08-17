'use client'

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import type { SemesterGpa } from '@/types/api'

interface Props {
    data: SemesterGpa[]
}

export default function CgpaChart({ data }: Props) {
    const chartData = data.map(d => ({ name: `Sem ${d.semester}`, gpa: d.gpa }))
    const min = Math.max(0, Math.min(...data.map(d => d.gpa)) - 0.3)
    const max = 4.0

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-900">CGPA Trend</h2>
                <span className="text-xs text-gray-500">Semester by semester</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="10%" stopColor="#1d4ed8" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[min, max]}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => v.toFixed(1)}
                    />
                    <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                        formatter={(value) =>
                            typeof value === "number"
                                ? [value.toFixed(2), "CGPA"]
                                : ["0.00", "CGPA"]
                        }
                    />
                    <ReferenceLine y={2.5} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Min 2.5', fontSize: 10, fill: '#ef4444', position: 'right' }} />
                    <Area
                        type="monotone"
                        dataKey="gpa"
                        stroke="#1d4ed8"
                        strokeWidth={2}
                        fill="url(#cgpaGradient)"
                        dot={{ r: 4, fill: '#1d4ed8', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#1d4ed8' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
