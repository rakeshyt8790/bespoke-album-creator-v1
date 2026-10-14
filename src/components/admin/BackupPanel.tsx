import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TABLES = [
  "site_settings",
  "portfolio_media",
  "event_types",
  "services_cameras",
  "quote_inquiries",
] as const;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function BackupPanel() {
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<{ blob: Blob; name: string } | null>(null);

  const prepare = async () => {
    setBusy(true);
    setReady(null);
    try {
      const data: Record<string, unknown[]> = {};
      for (const t of TABLES) {
        const { data: rows, error } = await supabase.from(t).select("*");
        if (error) throw new Error(`${t}: ${error.message}`);
        data[t] = rows ?? [];
      }
      const backup = { exported_at: new Date().toISOString(), version: 1, tables: data };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const name = `parinayam-backup-${new Date().toISOString().slice(0, 10)}.json`;
      setReady({ blob, name });
      const counts = TABLES.map((t) => data[t].length).reduce((a, b) => a + b, 0);
      toast.success(`Backup ready (${counts} records)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Backup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-12 border border-border p-6">
      <h3 className="font-display text-xl">Full backup</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Download all photos list, prices, event types, inquiries and settings as one file.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={prepare} disabled={busy} variant="outline" className="rounded-none">
          {busy ? "Preparing..." : "Prepare backup"}
        </Button>
        {ready && (
          <Button onClick={() => downloadBlob(ready.blob, ready.name)} className="rounded-none">
            Download backup
          </Button>
        )}
      </div>
    </div>
  );
}
