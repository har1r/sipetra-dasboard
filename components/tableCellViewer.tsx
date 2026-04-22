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
import {
  taskSchema,
  initialTaskForm,
  serviceTypeEnum,
  stageEnum,
  statusEnum,
  baseDataFieldMeta,
  requestedDataFieldMeta,
  addRequestedDataFieldMeta,
} from "@/lib/constants/initialTask";

type Task = z.infer<typeof taskSchema>;

const TABS = [
  { id: "info", label: "Info", icon: FileText },
  { id: "base", label: "WP Lama", icon: User },
  { id: "requested", label: "Objek Baru", icon: Layers },
  { id: "docs", label: "Lampiran", icon: LinkIcon },
] as const;

export default function TableCellViewer({
  item,
  open: controlledOpen,
  onOpenChange,
}: {
  item: Partial<Task>;
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
}) {
  const isMobile = useIsMobile();

  const [open, setOpen] = React.useState(false);
  const currentOpen = controlledOpen ?? open;

  const [activeTab, setActiveTab] =
    React.useState<(typeof TABS)[number]["id"]>("info");

  const safeInitial = React.useMemo(
    () => ({
      ...initialTaskForm,
      ...item,
      baseData: {
        ...initialTaskForm.baseData,
        ...(item.baseData ?? {}),
      },
      requestedData: {
        ...initialTaskForm.requestedData,
        ...(item.requestedData ?? {}),
      },
      requestedChanges: item.requestedChanges ?? [],
      attachments: item.attachments ?? [],
      approvals: item.approvals ?? [],
      dynamicFields: item.dynamicFields ?? {},
      revisedHistories: item.revisedHistories ?? [],
    }),
    [item],
  );

  const [form, setForm] = React.useState<Partial<Task>>(safeInitial);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setForm(safeInitial);
  }, [safeInitial]);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    onOpenChange?.(val);
  };

  const handleChange = (path: string, value: any) => {
    setForm((prev) => {
      const updated: any = structuredClone(prev);
      const keys = path.split(".");
      let obj = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }

      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addRequestedChange = () => {
    setForm((prev) => ({
      ...prev,
      requestedChanges: [
        ...(prev.requestedChanges ?? []),
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
      const arr = [...(prev.requestedChanges ?? [])];
      arr.splice(index, 1);
      return { ...prev, requestedChanges: arr };
    });
  };

  const addAttachment = () => {
    setForm((prev) => ({
      ...prev,
      attachments: [
        ...(prev.attachments ?? []),
        { driveLink: "", linkName: "" },
      ],
    }));
  };

  const removeAttachment = (index: number) => {
    setForm((prev) => {
      const arr = [...(prev.attachments ?? [])];
      arr.splice(index, 1);
      return { ...prev, attachments: arr };
    });
  };

  const addDynamicField = () => {
    setForm((prev) => ({
      ...prev,
      dynamicFields: {
        ...(prev.dynamicFields ?? {}),
        [""]: "",
      },
    }));
  };

  const handleDynamicChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      dynamicFields: {
        ...(prev.dynamicFields ?? {}),
        [key]: value,
      },
    }));
  };

  const removeDynamicField = (key: string) => {
    setForm((prev) => {
      const copy = { ...(prev.dynamicFields ?? {}) };
      delete copy[key];
      return { ...prev, dynamicFields: copy };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const parsed = taskSchema.safeParse(form);
      if (!parsed.success) return;

      const result = await createTask(parsed.data);
      if (result?.success) handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) return null;

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
            {form.baseData?.taxpayerName || "Detail Task"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-16 border-r bg-muted/30 flex flex-col items-center py-2 gap-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded-lg ${
                  activeTab === tab.id ? "bg-primary text-white" : ""
                }`}
              >
                <tab.icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === "info" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Jenis Layanan
                  </Label>
                  <Input
                    value={form.serviceType ?? ""}
                    onChange={(e) =>
                      handleChange("serviceType", e.target.value)
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Nomor Pelayanan
                  </Label>
                  <Input
                    value={form.nopel ?? ""}
                    onChange={(e) => handleChange("nopel", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Nomor Objek Pajak
                  </Label>
                  <Input
                    value={form.nop ?? ""}
                    onChange={(e) => handleChange("nop", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            )}

            {activeTab === "base" && (
              <div className="space-y-10">
                {["wp", "op", "size"].map((section) => {
                  const sectionTitle =
                    section === "wp"
                      ? "Data Wajib Pajak SPPT"
                      : section === "op"
                        ? "Data Objek Pajak SPPT"
                        : "Luas Bangunan & Tanah SPPT";

                  const fields = Object.keys(baseDataFieldMeta).filter(
                    (key) => baseDataFieldMeta[key].section === section,
                  );

                  return (
                    <div key={section} className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs font-medium text-muted-foreground tracking-wider">
                          {sectionTitle}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>

                      <div className="space-y-4">
                        {fields.map((key) => {
                          const typedKey =
                            key as keyof typeof baseDataFieldMeta;

                          const meta = baseDataFieldMeta[typedKey];
                          const val =
                            form.baseData?.[key as keyof typeof form.baseData];

                          return (
                            <div
                              key={key}
                              className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
                            >
                              <Label className="text-xs text-muted-foreground md:col-span-1">
                                {meta.label}
                              </Label>

                              <Input
                                className="h-9 md:col-span-2"
                                value={String(val ?? "")}
                                onChange={(e) =>
                                  handleChange(
                                    `baseData.${key}`,
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "requested" && (
              <div className="space-y-10">
                {/* ================= OP SECTION ================= */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-medium text-muted-foreground tracking-wider">
                      Data Objek Pajak Baru
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-4">
                    {Object.keys(requestedDataFieldMeta).map((key) => {
                      const meta =
                        requestedDataFieldMeta[
                          key as keyof typeof requestedDataFieldMeta
                        ];
                      const val =
                        form.requestedData?.[
                          key as keyof typeof form.requestedData
                        ];

                      return (
                        <div
                          key={key}
                          className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
                        >
                          <Label className="text-xs text-muted-foreground md:col-span-1">
                            {meta.label}
                          </Label>

                          <Input
                            className="h-9 md:col-span-2"
                            value={String(val ?? "")}
                            onChange={(e) =>
                              handleChange(
                                `requestedData.${key}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ================= CHANGES SECTION ================= */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-medium text-muted-foreground tracking-wider">
                        Perubahan Data WP & OP
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  </div>
                  <Button size="sm" onClick={addRequestedChange}>
                    Tambah
                  </Button>

                  <div className="space-y-6">
                    {(form.requestedChanges ?? []).map((item, i) => (
                      <div
                        key={i}
                        className="border rounded-xl p-5 space-y-4 bg-muted/20"
                      >
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeRequestedChange(i)}
                          >
                            Hapus
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {Object.keys(addRequestedDataFieldMeta).map((key) => {
                            const meta =
                              addRequestedDataFieldMeta[
                                key as keyof typeof addRequestedDataFieldMeta
                              ];

                            const val = item?.[key as keyof typeof item];

                            return (
                              <div key={key} className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  {meta.label}
                                </Label>

                                <Input
                                  className="h-9"
                                  value={String(val ?? "")}
                                  onChange={(e) =>
                                    handleChange(
                                      `requestedChanges.${i}.${key}`,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "docs" && (
              <div className="space-y-4">
                <Button onClick={addAttachment}>Tambah</Button>

                {(form.attachments ?? []).map((att, i) => (
                  <div key={i} className="space-y-2">
                    <Input
                      value={att.linkName ?? ""}
                      onChange={(e) =>
                        handleChange(
                          `attachments.${i}.linkName`,
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      value={att.driveLink ?? ""}
                      onChange={(e) =>
                        handleChange(
                          `attachments.${i}.driveLink`,
                          e.target.value,
                        )
                      }
                    />
                    <Button onClick={() => removeAttachment(i)}>Hapus</Button>
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
