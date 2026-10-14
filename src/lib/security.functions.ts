import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const EMAIL_DOMAIN = "parinayam.local";

const toEmail = (username: string) => `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;

async function verifyCurrentPassword(email: string, password: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  return !error;
}

export const changeUsername = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { newUsername: string; currentPassword: string }) =>
    z
      .object({
        newUsername: z.string().trim().min(3).max(40).regex(/^[\w.\-]+$/, "Letters, numbers, . _ - only"),
        currentPassword: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userData, error: getErr } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    if (getErr || !userData.user?.email) throw new Error("Account not found");

    const ok = await verifyCurrentPassword(userData.user.email, data.currentPassword);
    if (!ok) throw new Error("Current password is wrong");

    const newEmail = toEmail(data.newUsername);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      email: newEmail,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    return { ok: true, username: data.newUsername.trim() };
  });

export const changePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { currentPassword: string; newPassword: string }) =>
    z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(72),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userData, error: getErr } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    if (getErr || !userData.user?.email) throw new Error("Account not found");

    const ok = await verifyCurrentPassword(userData.user.email, data.currentPassword);
    if (!ok) throw new Error("Current password is wrong");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
