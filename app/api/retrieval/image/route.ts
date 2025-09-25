import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
  let redirectUrl
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("filePath")
    if (!filePath) {
      throw new Error("Missing filePath query parameter")
    }
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(filePath, 60 * 60 * 24) // 24hrs

    if (error) {
      throw new Error("Error downloading image", error)
    }

    redirectUrl = data?.signedUrl
  } catch (error) {
    console.error(error)
    throw error
  }

  redirect(redirectUrl) // redirect throws!
}
