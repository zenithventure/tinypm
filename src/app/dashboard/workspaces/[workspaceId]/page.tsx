"use client"

import useSWR from "swr"
import { Map, ListTodo, Users } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WorkspaceOverviewPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params
  const { data: workspace, isLoading } = useSWR(`/api/workspaces/${workspaceId}`, fetcher)
  const { data: roadmapItems } = useSWR(`/api/workspaces/${workspaceId}/roadmap`, fetcher)
  const { data: workItems } = useSWR(`/api/workspaces/${workspaceId}/work-items`, fetcher)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={workspace?.name || "Workspace"}
        description={workspace?.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Map className="w-5 h-5 text-blue-600" />}
          label="Roadmap Items"
          value={roadmapItems?.length ?? 0}
        />
        <StatCard
          icon={<ListTodo className="w-5 h-5 text-blue-600" />}
          label="Work Items"
          value={workItems?.length ?? 0}
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Status"
          value={workspace?.isPublic ? "Public" : "Private"}
        />
      </div>

      {roadmapItems?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Roadmap Items</h2>
          <div className="space-y-2">
            {roadmapItems.slice(0, 5).map((item: any) => (
              <div key={item.id} className="border rounded-lg p-3 bg-white flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {[item.quarter, item.theme, item.milestone].filter(Boolean).join(" / ") || "No tags"}
                  </p>
                </div>
                {item.health && (
                  <span className="text-xs text-gray-400">{item.health.percentage}% done</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
