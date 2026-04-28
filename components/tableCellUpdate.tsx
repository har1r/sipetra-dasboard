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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createTask } from "@/lib/actions/task-actions";
import {
  createTaskSchema,
  initialTaskForm,
  serviceTypeOptions,
  baseDataFieldMeta,
  requestedDataFieldMeta,
  addRequestedDataFieldMeta,
  taskAttachmentFieldMeta,
} from "@/lib/constants/constant-task";
import {
  LIST_KECAMATAN,
  KECAMATAN_DATA,
} from "@/lib/constants/constant-region";
import { toast } from "sonner";

type UpdateTaskInput = z.infer<typeof createTaskSchema>;

type Task = UpdateTaskInput & {
  _id: string;
  approvals: any[];
  currentStage: string;
  overallStatus: string;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const TABS = [
  { id: "info", label: "Info", icon: FileText },
  { id: "base", label: "WP Lama", icon: User },
  { id: "requested", label: "Objek Baru", icon: Layers },
  { id: "docs", label: "Lampiran", icon: LinkIcon },
] as const;

export default function TableCellUpdate({
  item,
  open: controlledOpen,
  onOpenChange,
}: {
  item: Task;
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
}) {
  const isMobile = useIsMobile();

  const [open, setOpen] = React.useState(false);
  const currentOpen = controlledOpen ?? open;

  const [activeTab, setActiveTab] =
    React.useState<(typeof TABS)[number]["id"]>("info");

  const safeInitial = React.useMemo(() => {
    return {
      ...item,
      baseData: {
        ...item.baseData,
      },
      requestedData: {
        ...item.requestedData,
      },
      requestedChanges: item.requestedChanges ?? [],
      attachments: item.attachments ?? [],
      dynamicFields: item.dynamicFields ?? {},
    };
  }, [item]);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const parsed = createTaskSchema.safeParse(form);

      if (!parsed.success) {
        toast.error("Form tidak valid");
        return;
      }

      const result = await createTask(parsed.data);

      if (result?.success) {
        toast.success("Task berhasil dibuat");
        handleOpenChange(false);
      } else {
        toast.error("Gagal membuat task");
      }
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
          {item?.nopel || "-"}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col h-full max-h-screen">
        <DrawerHeader className="px-4 border-b">
          <DrawerTitle>Create Task</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-1 min-h-0">
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

                  <Select
                    value={form.serviceType ?? ""}
                    onValueChange={(value) =>
                      handleChange("serviceType", value)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Pilih jenis layanan" />
                    </SelectTrigger>

                    <SelectContent>
                      {serviceTypeOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          const meta =
                            baseDataFieldMeta[
                              key as keyof typeof baseDataFieldMeta
                            ];
                          const val =
                            form.baseData?.[key as keyof typeof form.baseData];

                          if (key === "taxObjectSubdistrict") {
                            return (
                              <div
                                key={key}
                                className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
                              >
                                <Label className="text-xs text-muted-foreground md:col-span-1">
                                  {meta.label}
                                </Label>

                                <Select
                                  value={String(val ?? "")}
                                  onValueChange={(value) => {
                                    handleChange(`baseData.${key}`, value);
                                    handleChange(
                                      `baseData.taxObjectVillage`,
                                      "",
                                    );
                                  }}
                                >
                                  <SelectTrigger className="h-9 md:col-span-2">
                                    <SelectValue placeholder="Pilih Kecamatan" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {LIST_KECAMATAN.map((kec) => (
                                      <SelectItem key={kec} value={kec}>
                                        {kec}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          }

                          if (key === "taxObjectVillage") {
                            const selectedKecamatan = form.baseData
                              ?.taxObjectSubdistrict as keyof typeof KECAMATAN_DATA;

                            const desaList =
                              (selectedKecamatan &&
                                KECAMATAN_DATA[selectedKecamatan]) ||
                              [];

                            return (
                              <div
                                key={key}
                                className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
                              >
                                <Label className="text-xs text-muted-foreground md:col-span-1">
                                  {meta.label}
                                </Label>

                                <Select
                                  value={String(val ?? "")}
                                  onValueChange={(value) =>
                                    handleChange(`baseData.${key}`, value)
                                  }
                                  disabled={!selectedKecamatan}
                                >
                                  <SelectTrigger className="h-9 md:col-span-2">
                                    <SelectValue placeholder="Pilih Desa" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {desaList.map((desa) => (
                                      <SelectItem key={desa} value={desa}>
                                        {desa}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          }

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

                      if (key === "taxObjectSubdistrict") {
                        return (
                          <div
                            key={key}
                            className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
                          >
                            <Label className="text-xs text-muted-foreground md:col-span-1">
                              {meta.label}
                            </Label>

                            <Select
                              value={String(val ?? "")}
                              onValueChange={(value) => {
                                handleChange(`requestedData.${key}`, value);
                                handleChange(
                                  `requestedData.taxObjectVillage`,
                                  "",
                                );
                              }}
                            >
                              <SelectTrigger className="h-9 md:col-span-2">
                                <SelectValue placeholder="Pilih Kecamatan" />
                              </SelectTrigger>

                              <SelectContent>
                                {LIST_KECAMATAN.map((kec) => (
                                  <SelectItem key={kec} value={kec}>
                                    {kec}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      }

                      if (key === "taxObjectVillage") {
                        const selectedKecamatan = form.requestedData
                          ?.taxObjectSubdistrict as keyof typeof KECAMATAN_DATA;

                        const desaList =
                          (selectedKecamatan &&
                            KECAMATAN_DATA[selectedKecamatan]) ||
                          [];

                        return (
                          <div
                            key={key}
                            className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
                          >
                            <Label className="text-xs text-muted-foreground md:col-span-1">
                              {meta.label}
                            </Label>

                            <Select
                              value={String(val ?? "")}
                              onValueChange={(value) =>
                                handleChange(`requestedData.${key}`, value)
                              }
                              disabled={!selectedKecamatan}
                            >
                              <SelectTrigger className="h-9 md:col-span-2">
                                <SelectValue placeholder="Pilih Desa" />
                              </SelectTrigger>

                              <SelectContent>
                                {desaList.map((desa) => (
                                  <SelectItem key={desa} value={desa}>
                                    {desa}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      }

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

                <div className="space-y-6">
                  <Button size="sm" onClick={addRequestedChange}>
                    Tambah
                  </Button>

                  <div className="space-y-6">
                    {(form.requestedChanges ?? []).map((item, i) => (
                      <div
                        key={i}
                        className="border rounded-xl p-5 space-y-6 bg-muted/20"
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

                        {["wp", "size", "info"].map((section) => {
                          const fields = Object.keys(
                            addRequestedDataFieldMeta,
                          ).filter(
                            (key) =>
                              addRequestedDataFieldMeta[
                                key as keyof typeof addRequestedDataFieldMeta
                              ].section === section,
                          );

                          return (
                            <div key={section} className="space-y-4">
                              <div className="space-y-4">
                                {fields.map((key) => {
                                  const meta =
                                    addRequestedDataFieldMeta[
                                      key as keyof typeof addRequestedDataFieldMeta
                                    ];

                                  const val = item?.[key as keyof typeof item];

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
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "docs" && (
              <div className="space-y-8">
                <Button size="sm" onClick={addAttachment}>
                  Tambah
                </Button>

                <div className="space-y-6">
                  {(form.attachments ?? []).map((att, i) => (
                    <div
                      key={i}
                      className="border rounded-xl p-5 space-y-6 bg-muted/20"
                    >
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAttachment(i)}
                        >
                          Hapus
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {Object.keys(taskAttachmentFieldMeta).map((key) => {
                          const meta =
                            taskAttachmentFieldMeta[
                              key as keyof typeof taskAttachmentFieldMeta
                            ];

                          const val = att?.[key as keyof typeof att];

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
                                    `attachments.${i}.${key}`,
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
            )}
          </div>
        </div>

        <DrawerFooter className="border-t shrink-0 bg-background z-10">
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
