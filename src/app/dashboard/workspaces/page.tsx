"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Plus, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WorkspacesPage() {
  const router = useRouter()
  const { data: workspaces, isLoading } = useSWR("/api/workspaces", fetcher)

  return (
    <div>
      <PageHeader
        title="Workspaces"
        description="Your product workspaces"
        actions={
          <Button onClick={() => router.push("/dashboard/workspaces/new")}>
            <Plus className="w-4 h-4 mr-1" /> New workspace
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : workspaces?.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-12 h-12" />}
          title="No workspaces yet"
          description="Create your first workspace to start tracking product work."
          actionLabel="Create workspace"
          onAction={() => router.push("/dashboard/workspaces/new")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces?.map((ws: any) => (
            <button
              key={ws.id}
              onClick={() => router.push(`/dashboard/workspaces/${ws.id}`)}
              className="border rounded-xl p-6 text-left hover:border-blue-300 hover:shadow-sm transition bg-white"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{ws.name}</h3>
              {ws.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{ws.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <span className="capitalize">{ws.role}</span>
                {ws.isPublic && <span className="text-green-600">Public</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
