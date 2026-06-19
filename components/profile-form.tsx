"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  defaultFullName,
  defaultNickname,
}: {
  defaultFullName: string;
  defaultNickname: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_prev: { error: string | null } | null, formData: FormData) => {
      const result = await updateProfile(formData);
      if (!result.error) router.refresh();
      return result;
    },
    null
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" defaultValue={defaultFullName} placeholder="Jane Doe" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nickname">Nickname</Label>
        <Input id="nickname" name="nickname" defaultValue={defaultNickname} placeholder="Jane" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state && !state.error && (
        <p className="text-sm text-green-600">Profile updated successfully.</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save Profile"}
      </Button>
    </form>
  );
}
