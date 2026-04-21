"use client";

import * as React from "react";
import { z } from "zod";
import { FileText, User, LinkIcon, Layers } from "lucide-react";

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
    "info" | "base" | "requested" | "changes" | "docs" | "dynamic"
  >("info");

  const [form, setForm] = React.useState<Partial<z.infer<typeof taskSchema>>>(
    item || {},
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => setIsHydrated(true), []);
  React.useEffect(() => setForm(item || {}), [item]);

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

  const addAttachment = () => {
    setForm((prev) => ({
      ...prev,
      attachments: [
        ...(prev.attachments || []),
        { driveLink: "", linkName: "" },
      ],
    }));
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

  const addDynamicField = () => {
    setForm((prev) => ({
      ...prev,
      dynamicFields: {
        ...(prev.dynamicFields || {}),
        [""]: "",
      },
    }));
  };

  const handleDynamicChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      dynamicFields: {
        ...(prev.dynamicFields || {}),
        [key]: value,
      },
    }));
  };

  const removeDynamicField = (key: string) => {
    setForm((prev) => {
      const updated = { ...(prev.dynamicFields || {}) };
      delete updated[key];
      return { ...prev, dynamicFields: updated };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createTask(form);
      if (result.success) setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const TABS = [
    { id: "info", label: "Info", icon: FileText },
    { id: "base", label: "WP Lama", icon: User },
    { id: "requested", label: "Objek Baru", icon: Layers },
    { id: "changes", label: "Perubahan", icon: Layers },
    { id: "docs", label: "Lampiran", icon: LinkIcon },
    { id: "dynamic", label: "Dynamic", icon: FileText },
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
        <Button variant="link" className="px-0">
          {item?.baseData?.taxpayerName || "-"}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col h-full max-h-screen">
        <DrawerHeader className="px-4 border-b">
          <DrawerTitle>
            {form?.baseData?.taxpayerName || "Detail Task"}
          </DrawerTitle>
        </DrawerHeader>

        {/* MAIN LAYOUT */}
        <div className="flex flex-1 overflow-hidden">

          {/* NAV ICON ONLY */}
          <div className="w-16 border-r bg-muted/30 flex flex-col items-center py-2 gap-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`relative group p-2 rounded-lg transition ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                }`}
              >
                <tab.icon className="w-5 h-5" />

                {/* hover label */}
                <span className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* INFO */}
            {activeTab === "info" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Service Type</Label>
                  <Input
                    value={form.serviceType || ""}
                    onChange={(e) =>
                      handleChange("serviceType", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>NOP</Label>
                    <Input
                      value={form.nop || ""}
                      onChange={(e) => handleChange("nop", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>NOPEL</Label>
                    <Input
                      value={form.nopel || ""}
                      onChange={(e) => handleChange("nopel", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BASE */}
            {activeTab === "base" && (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(form.baseData || {}).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{key}</Label>
                    <Input
                      value={val as any}
                      onChange={(e) =>
                        handleChange(`baseData.${key}`, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* REQUESTED */}
            {activeTab === "requested" && (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(form.requestedData || {}).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{key}</Label>
                    <Input
                      value={val as any}
                      onChange={(e) =>
                        handleChange(`requestedData.${key}`, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* CHANGES */}
            {activeTab === "changes" && (
              <div className="space-y-4">
                <Button size="sm" onClick={addRequestedChange}>
                  Tambah
                </Button>

                {(form.requestedChanges || []).map((item, i) => (
                  <div
                    key={i}
                    className="border rounded-xl p-4 space-y-3 bg-muted/20"
                  >
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeRequestedChange(i)}
                    >
                      Hapus
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(item || {}).map(([key, val]) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs">{key}</Label>
                          <Input
                            value={val as any}
                            onChange={(e) =>
                              handleChange(
                                `requestedChanges.${i}.${key}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DOCS */}
            {activeTab === "docs" && (
              <div className="space-y-4">
                <Button size="sm" onClick={addAttachment}>
                  Tambah
                </Button>

                {(form.attachments || []).map((att, i) => (
                  <div key={i} className="space-y-3 border p-3 rounded-xl">
                    <Input
                      placeholder="Nama"
                      value={att.linkName || ""}
                      onChange={(e) =>
                        handleChange(
                          `attachments.${i}.linkName`,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Link"
                      value={att.driveLink || ""}
                      onChange={(e) =>
                        handleChange(
                          `attachments.${i}.driveLink`,
                          e.target.value,
                        )
                      }
                    />
                    <Button onClick={() => removeAttachment(i)}>
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* DYNAMIC */}
            {activeTab === "dynamic" && (
              <div className="space-y-4">
                <Button size="sm" onClick={addDynamicField}>
                  Tambah
                </Button>

                {Object.entries(form.dynamicFields || {}).map(([key, val]) => (
                  <div key={key} className="flex gap-2">
                    <Input
                      value={key}
                      onChange={(e) =>
                        handleDynamicChange(e.target.value, val)
                      }
                    />
                    <Input
                      value={val as any}
                      onChange={(e) =>
                        handleDynamicChange(key, e.target.value)
                      }
                    />
                    <Button onClick={() => removeDynamicField(key)}>
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        <DrawerFooter className="border-t">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Loading..." : "Submit"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}