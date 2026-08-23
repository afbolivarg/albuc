import { redirect } from "next/navigation";
import { publicProfilePath } from "@/lib/sharing";

export default async function LegacyPublicProfileRedirect({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  redirect(publicProfilePath(handle));
}
