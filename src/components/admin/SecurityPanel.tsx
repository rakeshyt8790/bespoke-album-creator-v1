import { useState } from "react";
import { toast } from "sonner";

import { changePassword, changeUsername } from "@/lib/security.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SecurityPanel() {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <UsernameCard />
      <PasswordCard />
    </div>
  );
}

function UsernameCard() {
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!newUsername.trim() || !currentPassword) {
      toast.error("Fill both fields");
      return;
    }
    setBusy(true);
    try {
      const res = await changeUsername({
        data: { newUsername: newUsername.trim(), currentPassword },
      });
      toast.success(`Username changed to ${res.username}. Use it next time you sign in.`);
      setNewUsername("");
      setCurrentPassword("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change username");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-border/70 bg-surface p-8">
      <p className="eyebrow">Sign-in username</p>
      <h2 className="mt-3 text-2xl">Change username</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        You will use the new username the next time you sign in.
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <Label className="eyebrow">New username</Label>
          <Input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            autoComplete="off"
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <div>
          <Label className="eyebrow">Current password</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <Button
          onClick={submit}
          disabled={busy}
          className="w-full rounded-none text-[11px] tracking-[0.22em]"
        >
          {busy ? "UPDATING…" : "UPDATE USERNAME"}
        </Button>
      </div>
    </div>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await changePassword({ data: { currentPassword, newPassword } });
      toast.success("Password updated. Use it next time you sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-border/70 bg-surface p-8">
      <p className="eyebrow">Password</p>
      <h2 className="mt-3 text-2xl">Change password</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick a strong password — at least 8 characters, mix of letters and numbers.
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <Label className="eyebrow">Current password</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <div>
          <Label className="eyebrow">New password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <div>
          <Label className="eyebrow">Confirm new password</Label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <Button
          onClick={submit}
          disabled={busy}
          className="w-full rounded-none text-[11px] tracking-[0.22em]"
        >
          {busy ? "UPDATING…" : "UPDATE PASSWORD"}
        </Button>
      </div>
    </div>
  );
}
