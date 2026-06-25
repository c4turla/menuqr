import { getSession } from "@/server/services/auth-service";
import { SettingsContent } from "./_components/settings-content";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  return <SettingsContent user={session.user} />;
}
