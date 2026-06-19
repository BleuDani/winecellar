import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account details and session.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signed in as</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          {user?.created_at && (
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full gap-2">
              <LogOut size={16} />
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
