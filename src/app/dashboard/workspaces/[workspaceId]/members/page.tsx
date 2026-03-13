"use client"

import { use } from "react"
import useSWR from "swr"
import { Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = use(params)
  const { data: members, isLoading } = useSWR(
    `/api/workspaces/${workspaceId}/members`,
    fetcher
  )

  return (
    <div>
      <PageHeader
        title="Members"
        description="Team members with access to this workspace"
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : members?.length === 0 ? (
        <p className="text-sm text-gray-500">No members found.</p>
      ) : (
        <div className="space-y-2">
          {members?.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center gap-3 border rounded-lg p-3 bg-white"
            >
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium flex-1">{member.userId}</span>
              <Badge variant={member.role === "owner" ? "info" : "neutral"}>
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
