import { notFound } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { HealthBar } from "@/components/shared/health-bar"

async function getPublicRoadmap(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/share/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

export default async function PublicSharePage({
  params,
}: {
  params: { workspaceSlug: string }
}) {
  const { workspaceSlug } = params
  const data = await getPublicRoadmap(workspaceSlug)

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <span className="text-lg font-bold text-blue-600">
            Tiny<span className="text-gray-900">PM</span>
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.workspace.name}</h1>
        {data.workspace.description && (
          <p className="text-gray-600 mb-8">{data.workspace.description}</p>
        )}

        <div className="space-y-4">
          {data.roadmapItems?.map((item: any) => (
            <div key={item.id} className="border rounded-xl p-4 bg-white">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <StatusBadge status={item.status} />
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                {item.quarter && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.quarter}</span>}
                {item.theme && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.theme}</span>}
                {item.milestone && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.milestone}</span>}
              </div>

              {item.health && item.health.total > 0 && (
                <HealthBar
                  percentage={item.health.percentage}
                  total={item.health.total}
                  done={item.health.done}
                />
              )}

              {item.workItems?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {item.workItems.map((wi: any) => (
                    <div key={wi.id} className="flex items-center gap-2 text-sm">
                      <StatusBadge status={wi.status} />
                      <span>{wi.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-12">
          Powered by TinyPM
        </p>
      </main>
    </div>
  )
}
