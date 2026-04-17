import { AppSidebar } from "@/components/app-sidebar";
import { UserTable } from "@/components/user-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { getUserData } from "../actions/user-actions";

export default async function Page() {
  const userData = await getUserData();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <UserTable data={userData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
