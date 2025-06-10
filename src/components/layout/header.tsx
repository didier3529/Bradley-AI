"use client";

import { Button } from "@/components/ui/button";
import { WalletConnection } from "@/components/wallet-connection";
import { useAuth } from "@/lib/providers/auth-provider";
import { LogOut } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[var(--header-height)] items-center justify-end">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.address.slice(0, 6)}...{user.address.slice(-4)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <WalletConnection compact />
          )}
        </div>
      </div>
    </header>
  );
}
