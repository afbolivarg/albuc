"use client"

import { signOut } from "../(login)/actions"
import { Button } from "@/components/ui/button"

export default function SignOut() {
  return <Button onClick={() => signOut()}>Sign Out</Button>
}
