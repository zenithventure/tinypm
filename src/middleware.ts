import { auth } from "@/auth"
import { NextResponse } from "next/server"

const publicRoutes = [
  "/", "/login",
  "/api/auth",
  "/api/share",
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))
}

function isPublicDynamicRoute(pathname: string): boolean {
  if (pathname.startsWith("/share/")) return true
  if (pathname.startsWith("/invite/")) return true
  return false
}

export default auth((req: any) => {
  const { pathname } = req.nextUrl
  if (isPublicRoute(pathname) || isPublicDynamicRoute(pathname)) {
    return NextResponse.next()
  }
  if (!req.auth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const url = new URL("/login", req.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)","/(api|trpc)(.*)"],
}
