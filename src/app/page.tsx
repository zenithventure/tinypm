import Link from "next/link"
import { ArrowRight, GitBranch, FileText, Video, Layers } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            Tiny<span className="text-gray-900">PM</span>
          </span>
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
          Context layer for product work
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Connect Google Meet, Drive, and GitHub. Stop being the human bridge
          between systems that don&apos;t talk to each other.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Get started free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard
            icon={<Layers className="w-6 h-6 text-blue-600" />}
            title="Roadmap items"
            description="Tag by quarter, theme, or milestone. Health derived automatically from linked work items."
          />
          <FeatureCard
            icon={<GitBranch className="w-6 h-6 text-blue-600" />}
            title="GitHub integration"
            description="Issues and PRs auto-link to work items. Unlinked issues surface in your inbox."
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            title="Drive artefacts"
            description="Link PRDs, decision docs, and notes to any work item. Always know the 'why'."
          />
          <FeatureCard
            icon={<Video className="w-6 h-6 text-blue-600" />}
            title="Meet transcript parsing"
            description="AI extracts action items, decisions, and sales insights from your meetings."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>TinyPM v0.0.1</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border rounded-xl p-6">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
