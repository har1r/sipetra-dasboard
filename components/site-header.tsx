"use client";

import React from "react";
import { UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSelector } from "./theme-selector";
import { ModeSwitcher } from "./mode-switcher";
import PlaylistToday from "./playlistToday";

export function SiteHeader() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <PlaylistToday />
        <div className="ml-auto flex items-center gap-2">
          <ThemeSelector />
          <ModeSwitcher />
          {isMounted ? (
            <>
              <ClerkLoading>
                <div className="size-8 animate-pulse rounded-full bg-muted" />
              </ClerkLoading>
              <ClerkLoaded>
                <UserButton />
              </ClerkLoaded>
            </>
          ) : (
            /* Render placeholder yang sama antara server & client */
            <div className="size-8 rounded-full bg-muted" />
          )}
        </div>
      </div>
    </header>
  );
}
