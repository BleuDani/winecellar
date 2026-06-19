"use client";

import { useActionState, useRef } from "react";
import { changePassword } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (_prev: { error: string | null } | null, formData: FormData) => {
      const result = await changePassword(formData);
      if (!result.error) formRef.current?.reset();
      return result;
    },
    null
  );

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
        <Input
          id="confirm-new-password"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state && !state.error && (
        <p className="text-sm text-green-600">Password updated successfully.</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
