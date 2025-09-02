import { promises as fs } from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("filePath")

  if (!filePath) {
    return new NextResponse("File path is required", { status: 400 })
  }

  try {
    const publicDir = path.join(process.cwd(), "public")
    const resolvedPath = path.join(publicDir, filePath)

    if (!resolvedPath.startsWith(publicDir)) {
      return new NextResponse("Invalid file path", { status: 400 })
    }

    const content = await fs.readFile(resolvedPath, "utf-8")
    return new NextResponse(content, {
      headers: { "Content-Type": "text/plain" }
    })
  } catch (error) {
    console.error("Failed to read file:", error)
    return new NextResponse("File not found", { status: 404 })
  }
}
