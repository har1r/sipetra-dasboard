"use client";

import * as React from "react";
import { z } from "zod";
import { FileText, User, LinkIcon } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createTask } from "@/lib/actions/task-actions";
import { taskSchema } from "./task-table";

export default function TableCellViewer({
  item,
  open: controlledOpen,
  onOpenChange,
}: {
  item: Partial<z.infer<typeof taskSchema>>;
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    "info" | "base" | "new_base" | "docs"
  >("info");

  const [form, setForm] = React.useState<Partial<z.infer<typeof taskSchema>>>(
    item || {},
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    setForm(item || {});
  }, [item]);

  if (!isHydrated) return null;

  const handleChange = (path: string, value: any) => {
    setForm((prev) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let obj: any = updated;

      keys.slice(0, -1).forEach((key) => {
        if (!obj[key]) obj[key] = {};
        obj = obj[key];
      });

      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addRequestedChange = () => {
    setForm((prev) => ({
      ...prev,
      requestedChanges: [
        ...(prev.requestedChanges || []),
        {
          taxpayerName: "",
          taxpayerAddress: "",
          taxpayerVillage: "",
          taxpayerSubdistrict: "",
          landArea: 0,
          buildingArea: 0,
          certificate: "",
          status: "in_progress",
          note: "",
        },
      ],
    }));
  };

  const removeRequestedChange = (index: number) => {
    setForm((prev) => {
      const updated = { ...prev };
      const arr = [...(updated.requestedChanges || [])];
      arr.splice(index, 1);
      updated.requestedChanges = arr;
      return updated;
    });
  };

  const removeAttachment = (index: number) => {
  setForm((prev) => {
    const updated = { ...prev };
    const arr = [...(updated.attachments || [])];
    arr.splice(index, 1);
    updated.attachments = arr;
    return updated;
  });
};

  const addAttachment = () => {
    setForm((prev) => ({
      ...prev,
      attachments: [
        ...(prev.attachments || []),
        { driveLink: "", linkName: "" },
      ],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createTask(form);
      if (result.success) {
        setOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const TABS = [
    { id: "info", label: "Informasi", icon: FileText },
    { id: "base", label: "WP Lama", icon: User },
    { id: "new_base", label: "WP Baru", icon: User },
    { id: "docs", label: "Lampiran", icon: LinkIcon },
  ] as const;

  const currentOpen = controlledOpen ?? open;

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    onOpenChange?.(val);
  };

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={currentOpen}
      onOpenChange={handleOpenChange}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item?.baseData?.taxpayerName || "-"}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col h-full max-h-[100vh]">
        <DrawerHeader className="px-4 pb-2">
          <DrawerTitle className="truncate text-base">
            {form?.baseData?.taxpayerName || "Detail Data"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-3">
          <div className="grid grid-cols-4 gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] transition-all
                ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4 mb-1" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

<div className="flex-1 overflow-y-auto px-4 pb-5">
  <div key={activeTab} className="space-y-6">

    {activeTab === "info" && (
      <div className="border rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold">Informasi Umum</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["Jenis Layanan", "serviceType"],
            ["NOP", "nop"],
            ["NOPEL", "nopel"],
            ["Stage", "currentStage"],
          ].map(([label, key]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                className="h-9"
                value={(form as any)?.[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    )}

    {activeTab === "base" && (
      <div className="border rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold">Data Wajib Pajak</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["Nama Wajib Pajak", "taxpayerName"],
            ["Alamat Wajib Pajak", "taxpayerAddress"],
            ["Desa", "taxpayerVillage"],
            ["Kecamatan", "taxpayerSubdistrict"],
            ["Alamat Objek Pajak", "taxObjectAddress"],
            ["Desa Objek", "taxObjectVillage"],
            ["Kecamatan Objek", "taxObjectSubdistrict"],
          ].map(([label, key]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                className="h-9"
                value={(form?.baseData as any)?.[key] || ""}
                onChange={(e) =>
                  handleChange(`baseData.${key}`, e.target.value)
                }
              />
            </div>
          ))}

          {[
            ["Luas Tanah", "landArea"],
            ["Luas Bangunan", "buildingArea"],
          ].map(([label, key]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                type="number"
                className="h-9"
                value={(form?.baseData as any)?.[key] || ""}
                onChange={(e) =>
                  handleChange(`baseData.${key}`, Number(e.target.value))
                }
              />
            </div>
          ))}
        </div>
      </div>
    )}

    {activeTab === "new_base" && (
      <div className="space-y-5">

        <div className="border rounded-xl p-4 space-y-4">
          <p className="text-sm font-semibold">Data Objek Baru</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Alamat Objek Baru", "taxObjectAddress"],
              ["Desa Baru", "taxObjectVillage"],
              ["Kecamatan Baru", "taxObjectSubdistrict"],
            ].map(([label, key]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  className="h-9"
                  value={(form?.requestedData as any)?.[key] || ""}
                  onChange={(e) =>
                    handleChange(`requestedData.${key}`, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Button size="sm" onClick={addRequestedChange}>
          Tambah Perubahan
        </Button>

        {(form?.requestedChanges || []).map((item, index) => (
          <div
            key={index}
            className="border rounded-xl p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">
                Perubahan #{index + 1}
              </p>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeRequestedChange(index)}
              >
                Hapus
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["Nama WP Baru", "taxpayerName"],
                ["Alamat Baru", "taxpayerAddress"],
                ["Desa", "taxpayerVillage"],
                ["Kecamatan", "taxpayerSubdistrict"],
                ["Sertifikat", "certificate"],
                ["Status", "status"],
              ].map(([label, key]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    className="h-9"
                    value={(item as any)?.[key] || ""}
                    onChange={(e) =>
                      handleChange(
                        `requestedChanges.${index}.${key}`,
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}

              {["landArea", "buildingArea"].map((key) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {key === "landArea"
                      ? "Luas Tanah"
                      : "Luas Bangunan"}
                  </Label>
                  <Input
                    type="number"
                    className="h-9"
                    value={(item as any)?.[key] || ""}
                    onChange={(e) =>
                      handleChange(
                        `requestedChanges.${index}.${key}`,
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              ))}

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Catatan
                </Label>
                <Input
                  className="h-9"
                  value={item?.note || ""}
                  onChange={(e) =>
                    handleChange(
                      `requestedChanges.${index}.note`,
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

{activeTab === "docs" && (
  <div className="border rounded-xl p-4 space-y-4">
    <div className="flex justify-between items-center">
      <p className="text-sm font-semibold">Lampiran</p>
      <Button size="sm" onClick={addAttachment}>
        Tambah
      </Button>
    </div>

    {(form?.attachments || []).map((att, index) => (
      <div
        key={index}
        className="border rounded-lg p-3 space-y-3"
      >
        <div className="flex justify-between items-center">
          <p className="text-xs font-medium text-muted-foreground">
            Lampiran #{index + 1}
          </p>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => removeAttachment(index)}
          >
            Hapus
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Nama Berkas
          </Label>
          <Input
            className="h-9"
            value={att?.linkName || ""}
            onChange={(e) =>
              handleChange(
                `attachments.${index}.linkName`,
                e.target.value
              )
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Link Drive
          </Label>
          <Input
            className="h-9"
            value={att?.driveLink || ""}
            onChange={(e) =>
              handleChange(
                `attachments.${index}.driveLink`,
                e.target.value
              )
            }
          />
        </div>
      </div>
    ))}
  </div>
)}

  </div>
</div>

        <DrawerFooter className="border-t px-4">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Submit"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}