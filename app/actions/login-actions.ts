"use server"

import { createClient } from "@/lib/supabase/server"
import { get } from "@vercel/edge-config"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return redirect(`/login?message=${error.message}`)
  }

  const { data: homeWorkspace, error: homeWorkspaceError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("is_home", true)
    .single()

  if (!homeWorkspace) {
    throw new Error(
      homeWorkspaceError?.message || "An unexpected error occurred"
    )
  }

  return redirect(`/${homeWorkspace.id}/chat`)
}

async function getEnvVarOrEdgeConfigValue(name: string) {
  if (process.env.EDGE_CONFIG) {
    return await get<string>(name)
  }

  return process.env[name]
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const emailDomainWhitelistPatternsString = await getEnvVarOrEdgeConfigValue(
    "EMAIL_DOMAIN_WHITELIST"
  )
  const emailDomainWhitelist = emailDomainWhitelistPatternsString?.trim()
    ? emailDomainWhitelistPatternsString?.split(",")
    : []
  const emailWhitelistPatternsString =
    await getEnvVarOrEdgeConfigValue("EMAIL_WHITELIST")
  const emailWhitelist = emailWhitelistPatternsString?.trim()
    ? emailWhitelistPatternsString?.split(",")
    : []

  // If there are whitelist patterns, check if the email is allowed to sign up
  if (emailDomainWhitelist.length > 0 || emailWhitelist.length > 0) {
    const domainMatch = emailDomainWhitelist?.includes(email.split("@")[1])
    const emailMatch = emailWhitelist?.includes(email)
    if (!domainMatch && !emailMatch) {
      return redirect(
        `/login?message=Email ${email} is not allowed to sign up.`
      )
    }
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // USE IF YOU WANT TO SEND EMAIL VERIFICATION, ALSO CHANGE TOML FILE
      // emailRedirectTo: `${origin}/auth/callback`
    }
  })

  if (error) {
    console.error(error)
    return redirect(`/login?message=${error.message}`)
  }

  return redirect("/setup")

  // USE IF YOU WANT TO SEND EMAIL VERIFICATION, ALSO CHANGE TOML FILE
  // return redirect("/login?message=Check email to continue sign in process")
}

export async function handleResetPassword(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/login/password`
  })

  if (error) {
    return redirect(`/login?message=${error.message}`)
  }

  return redirect("/login?message=Check email to reset password")
}
