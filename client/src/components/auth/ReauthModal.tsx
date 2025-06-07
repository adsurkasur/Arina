import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ReauthModalProps {
  open: boolean;
  method: "password" | "google";
  email?: string;
  onReauth: (data: { email?: string; password?: string }) => Promise<void>;
  onClose: () => void;
  error?: string | null;
}

export const ReauthModal: React.FC<ReauthModalProps> = ({
  open,
  method,
  email = "",
  onReauth,
  onClose,
  error,
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      await onReauth({ email, password });
      setPassword("");
    } catch (err: any) {
      setLocalError(err.message || t("auth.reauthFailed", "Re-authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("auth.reauthTitle", "Re-authenticate to Continue")}</DialogTitle>
        </DialogHeader>
        {method === "password" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              value={email}
              disabled
              className="w-full"
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder={t("auth.passwordPlaceholder", "Password")}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full"
              autoComplete="current-password"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {t("auth.reauthButton", "Re-authenticate")}
            </Button>
            {(localError || error) && (
              <div className="text-red-500 text-xs text-center mt-2">{localError || error}</div>
            )}
          </form>
        ) : (
          <Button
            className="w-full"
            onClick={() => onReauth({})}
            disabled={loading}
          >
            {t("auth.reauthWithGoogle", "Re-authenticate with Google")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
