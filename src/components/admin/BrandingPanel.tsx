import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SmartImage } from "@/components/site/SmartImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSettings, type SiteSettings } from "@/lib/studio";

const FIELDS: { key: keyof SiteSettings; label: string; textarea?: boolean }[] = [
  { key: "studio_name", label: "Studio name" },
  { key: "tagline", label: "Tagline" },
  { key: "bio", label: "Brand philosophy", textarea: true },
  { key: "whatsapp_number", label: "WhatsApp number (with country code, digits only)" },
  { key: "phone_number", label: "Calling phone number" },
  { key: "studio_address", label: "Studio address" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "youtube_url", label: "YouTube URL" },
];

export function BrandingPanel() {
  const { settings, data } = useSettings();
  const qc = useQueryClient();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSaving(true);
    const payload = {
      studio_name: form.studio_name,
      tagline: form.tagline,
      bio: form.bio,
      logo_url: form.logo_url,
      whatsapp_number: form.whatsapp_number,
      phone_number: form.phone_number,
      instagram_url: form.instagram_url,
      youtube_url: form.youtube_url,
      studio_address: form.studio_address,
      updated_at: new Date().toISOString(),
    };
    const { error } = data?.id
      ? await supabase.from("site_settings").update(payload).eq("id", data.id)
      : await supabase.from("site_settings").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Studio details updated across the site.");
  };

  const uploadLogo = async (file: File) => {
    const path = `logo/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm((f) => ({ ...f, logo_url: path }));
    toast.success("Logo uploaded — remember to save.");
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className={field.textarea ? "md:col-span-2" : ""}>
            <Label className="eyebrow">{field.label}</Label>
            {field.textarea ? (
              <Textarea
                rows={4}
                className="mt-2 rounded-none border-border bg-transparent"
                value={(form[field.key] as string) ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
              />
            ) : (
              <Input
                className="mt-2 rounded-none border-border bg-transparent"
                value={(form[field.key] as string) ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Label className="eyebrow">Studio logo</Label>
        <div className="flex items-center gap-5">
          {form.logo_url ? (
            <SmartImage
              reference={form.logo_url}
              alt="Logo"
              className="h-14 w-auto border border-border bg-ink object-contain p-2"
            />
          ) : null}
          <Input
            type="file"
            accept="image/*"
            className="max-w-xs rounded-none border-border bg-transparent"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadLogo(file);
            }}
          />
        </div>
      </div>

      <Button
        onClick={save}
        disabled={saving}
        className="rounded-none px-8 text-[11px] tracking-[0.22em]"
      >
        {saving ? "SAVING…" : "SAVE SETTINGS"}
      </Button>
    </div>
  );
}
