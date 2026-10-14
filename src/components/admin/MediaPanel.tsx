import { useQueryClient } from "@tanstack/react-query";
import { Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SmartImage } from "@/components/site/SmartImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, useMedia, youtubeEmbed } from "@/lib/studio";
import { cn } from "@/lib/utils";

export function MediaPanel() {
  const { media, data } = useMedia();
  const qc = useQueryClient();
  const rows = data ?? [];

  const [category, setCategory] = useState<string>("Weddings");
  const [title, setTitle] = useState("");
  const [isHero, setIsHero] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["portfolio_media"] });

  const uploadFiles = async (files: FileList | File[]) => {
    setBusy(true);
    for (const file of Array.from(files)) {
      const path = `gallery/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from("portfolio").upload(path, file);
      if (error) {
        toast.error(`${file.name}: ${error.message}`);
        continue;
      }
      const { error: insertError } = await supabase.from("portfolio_media").insert({
        title: title || file.name.replace(/\.[^.]+$/, ""),
        category,
        media_url: path,
        media_type: "image",
        is_hero: isHero,
        display_order: rows.length + 1,
      });
      if (insertError) toast.error(insertError.message);
    }
    setBusy(false);
    setTitle("");
    await refresh();
    toast.success("Upload complete.");
  };

  const addVideo = async () => {
    if (!youtubeEmbed(videoUrl)) {
      toast.error("Paste a YouTube or Vimeo link.");
      return;
    }
    const { error } = await supabase.from("portfolio_media").insert({
      title: title || "Wedding film",
      category: "Films",
      media_url: videoUrl,
      media_type: "video",
      is_hero: false,
      display_order: rows.length + 1,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setVideoUrl("");
    setTitle("");
    await refresh();
    toast.success("Film added.");
  };

  const patch = async (
    id: string,
    values: Partial<{
      title: string;
      category: string;
      is_hero: boolean;
      display_order: number;
    }>,
  ) => {
    const { error } = await supabase.from("portfolio_media").update(values).eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  };

  const remove = async (id: string, url: string) => {
    if (!/^https?:/.test(url)) await supabase.storage.from("portfolio").remove([url]);
    const { error } = await supabase.from("portfolio_media").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      await refresh();
      toast.success("Removed.");
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <Label className="eyebrow">Title (optional)</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <div>
          <Label className="eyebrow">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-2 rounded-none border-border bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-3 pb-2">
          <Switch checked={isHero} onCheckedChange={setIsHero} id="hero" />
          <Label htmlFor="hero" className="eyebrow">
            Feature on hero
          </Label>
        </div>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-border py-14 text-center transition-colors",
          dragging && "border-primary bg-surface",
        )}
      >
        <UploadCloud className="size-6 text-primary" />
        <p className="text-sm text-muted-foreground">
          {busy ? "Uploading…" : "Drag photos here, or click to choose files"}
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
          }}
        />
      </label>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-64 flex-1">
          <Label className="eyebrow">YouTube / Vimeo film URL</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtu.be/…"
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <Button onClick={addVideo} className="rounded-none text-[11px] tracking-[0.2em]">
          ADD FILM
        </Button>
      </div>

      <div>
        <p className="eyebrow mb-4">Library ({rows.length})</p>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing uploaded yet — the public site is showing sample imagery.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((m) => (
              <div key={m.id} className="border border-border/70 bg-surface">
                {m.media_type === "video" ? (
                  <div className="flex aspect-video items-center justify-center bg-surface-2 text-xs text-muted-foreground">
                    Film embed
                  </div>
                ) : (
                  <SmartImage
                    reference={m.media_url}
                    alt={m.title}
                    className="aspect-4/3 w-full object-cover"
                  />
                )}
                <div className="space-y-3 p-4">
                  <Input
                    defaultValue={m.title}
                    onBlur={(e) => patch(m.id, { title: e.target.value })}
                    className="rounded-none border-border bg-transparent text-sm"
                  />
                  <div className="flex items-center gap-3">
                    <Select
                      defaultValue={m.category}
                      onValueChange={(v) => patch(m.id, { category: v })}
                    >
                      <SelectTrigger className="rounded-none border-border bg-transparent text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      defaultValue={m.display_order}
                      onBlur={(e) => patch(m.id, { display_order: Number(e.target.value) })}
                      className="w-20 rounded-none border-border bg-transparent text-xs"
                      aria-label="Order"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={m.is_hero}
                        onCheckedChange={(v) => patch(m.id, { is_hero: v })}
                      />
                      <span className="text-xs text-muted-foreground">Hero</span>
                    </div>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => remove(m.id, m.storage_path ?? m.media_url)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
