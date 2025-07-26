"use server"

import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  users,
  teams,
  teamMembers,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
} from "@/lib/db/schema"
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { actionClient, authenticatedAction } from "@/lib/auth/middleware"

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
})

export const signIn = actionClient
  .inputSchema(signInSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput

    const userWithTeam = await db
      .select({
        user: users,
        team: teams,
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(users.email, email))
      .limit(1)

    if (userWithTeam.length === 0) {
      return {
        error: "Invalid email or password. Please try again.",
        email,
        password,
      }
    }

    const { user: foundUser } = userWithTeam[0]

    const isPasswordValid = await comparePasswords(
      password,
      foundUser.passwordHash
    )

    if (!isPasswordValid) {
      return {
        error: "Invalid email or password. Please try again.",
        email,
        password,
      }
    }

    await setSession(foundUser)
    redirect("/dashboard")
  })

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const signUp = actionClient
  .inputSchema(signUpSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return {
        error: "Failed to create user. Please try again.",
        email,
        password,
      }
    }

    const passwordHash = await hashPassword(password)

    const newUser: NewUser = {
      email,
      passwordHash,
      role: "owner",
    }

    const [createdUser] = await db.insert(users).values(newUser).returning()

    if (!createdUser) {
      return {
        error: "Failed to create user. Please try again.",
        email,
        password,
      }
    }

    // Create a new team
    const newTeam: NewTeam = {
      name: `${email}'s Team`,
    }

    const [createdTeam] = await db.insert(teams).values(newTeam).returning()

    if (!createdTeam) {
      return {
        error: "Failed to create team. Please try again.",
        email,
        password,
      }
    }

    const newTeamMember: NewTeamMember = {
      userId: createdUser.id,
      teamId: createdTeam.id,
      role: "owner",
    }

    await db.insert(teamMembers).values(newTeamMember)
    await setSession(createdUser)

    redirect("/dashboard")
  })

export async function signOut() {
  ;(await cookies()).delete("session")
  redirect("/sign-in")
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
})

export const updatePassword = authenticatedAction
  .inputSchema(updatePasswordSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { currentPassword, newPassword, confirmPassword } = parsedInput
    const { user } = ctx

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    )

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "Current password is incorrect.",
      }
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "New password must be different from the current password.",
      }
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "New password and confirmation password do not match.",
      }
    }

    const newPasswordHash = await hashPassword(newPassword)

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id))

    return {
      success: "Password updated successfully.",
    }
  })

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
})

export const deleteAccount = authenticatedAction
  .inputSchema(deleteAccountSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { password } = parsedInput
    const { user } = ctx

    const isPasswordValid = await comparePasswords(password, user.passwordHash)
    if (!isPasswordValid) {
      return {
        password,
        error: "Incorrect password. Account deletion failed.",
      }
    }

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        email: `${user.email}-${user.id}-deleted`,
      })
      .where(eq(users.id, user.id))
    ;(await cookies()).delete("session")
    redirect("/sign-in")
  })

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
})

export const updateAccount = authenticatedAction
  .schema(updateAccountSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { name, email } = parsedInput
    const { user } = ctx

    await db.update(users).set({ name, email }).where(eq(users.id, user.id))

    return { name, success: "Account updated successfully." }
  })
