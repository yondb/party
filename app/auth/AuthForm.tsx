"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  attributionToUserMetadata,
  readAttributionFromCookies,
} from "@/lib/growth/attribution";

type Props = {
  nextPath?: string;
};

export function AuthForm({ nextPath }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function redirectAfterAuth() {
    const attr = readAttributionFromCookies();
    if (nextPath) {
      window.location.href = nextPath;
      return;
    }
    if (attr.referred_by_slot_id) {
      window.location.href = `/slots/${attr.referred_by_slot_id}`;
      return;
    }
    window.location.href = "/feed";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const cleanEmail = email.trim().toLowerCase();
      let err: Error | null = null;
      const attr = readAttributionFromCookies();
      const attrMeta = attributionToUserMetadata(attr);

      if (mode === "signin") {
        const result = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        err = result.error;
      } else {
        const result = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              ...attrMeta,
            },
          },
        });
        err = result.error;
        if (!err) {
          setInfo("Account created. If email confirmation is enabled, check your inbox.");
          if (Object.keys(attrMeta).length > 0) {
            void fetch("/api/growth/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event_name: "signup_with_attribution",
                slot_id: attr.referred_by_slot_id ?? null,
                properties: attrMeta,
              }),
            });
          }
        }
      }

      if (err) {
        setError(err.message);
        return;
      }
      redirectAfterAuth();
    } finally {
      setLoading(false);
    }
  }

  return (<form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={mode === "signin" ? "primary" : "secondary"}
          onClick={() => setMode("signin")}
        >
          Sign in
        </Button>
        <Button
          type="button"
          variant={mode === "signup" ? "primary" : "secondary"}
          onClick={() => setMode("signup")}
        >
          Create account
        </Button>
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error ? <p className="text-sm text-[var(--status-full)]">{error}</p> : null}
      {info ? <p className="text-sm text-[var(--status-open)]">{info}</p> : null}
      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading
          ? mode === "signin"
            ? "Signing in..."
            : "Creating account..."
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  );
}
