import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, User, Briefcase, DollarSign, Hash } from "lucide-react";
import { type Employee } from "@workspace/api-client-react";

const schema = z.object({
  employeeNo: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  salary: z.coerce.number().min(1, "Salary must be greater than 0"),
});

type FormData = z.infer<typeof schema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSave: (data: FormData) => void;
  isPending: boolean;
}

const DESIGNATIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "QA Engineer",
  "DevOps Engineer",
  "HR Manager",
  "Data Analyst",
  "Business Analyst",
  "Team Lead",
  "CTO",
];

function FieldWrapper({ label, icon, error, children }: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest flex items-center gap-1.5">
        <span className="text-primary/80">{icon}</span>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-destructive text-xs flex items-center gap-1.5 mt-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function EmployeeDialog({ open, onOpenChange, employee, onSave, isPending }: EmployeeDialogProps) {
  const isEdit = !!employee;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { employeeNo: "", name: "", designation: "", salary: 0 },
  });

  React.useEffect(() => {
    if (open) {
      if (employee) {
        form.reset({ employeeNo: employee.employeeNo, name: employee.name, designation: employee.designation, salary: employee.salary });
      } else {
        form.reset({ employeeNo: "", name: "", designation: "", salary: 0 });
      }
    }
  }, [open, employee, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (isEdit) {
      onSave({ name: data.name, designation: data.designation, salary: data.salary });
    } else {
      onSave(data);
    }
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] neu-extruded rounded-2xl shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  {isEdit ? "Edit Employee" : "Add New Employee"}
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground">
                  {isEdit ? `Editing ${employee?.name}` : "Fill in the details below"}
                </p>
              </div>
            </div>
            <DialogPrimitive.Close className="w-8 h-8 rounded-lg neu-button flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X size={16} />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
            {!isEdit && (
              <FieldWrapper label="Employee No" icon={<Hash size={11} />}>
                <input
                  {...form.register("employeeNo")}
                  placeholder="Leave blank to auto-generate (EMP001, EMP002…)"
                  className="w-full neu-input h-11 text-sm"
                />
              </FieldWrapper>
            )}

            <FieldWrapper label="Full Name" icon={<User size={11} />} error={form.formState.errors.name?.message}>
              <input
                {...form.register("name")}
                placeholder="e.g. Arjun Mehta"
                className="w-full neu-input h-11 text-sm"
              />
            </FieldWrapper>

            <FieldWrapper label="Designation" icon={<Briefcase size={11} />} error={form.formState.errors.designation?.message}>
              <div className="relative">
                <input
                  {...form.register("designation")}
                  placeholder="e.g. Software Engineer"
                  list="designations-list"
                  className="w-full neu-input h-11 text-sm"
                />
                <datalist id="designations-list">
                  {DESIGNATIONS.map((d) => <option key={d} value={d} />)}
                </datalist>
              </div>
              <p className="text-[10px] text-muted-foreground">Type or pick from common roles</p>
            </FieldWrapper>

            <FieldWrapper label="Annual Salary (USD)" icon={<DollarSign size={11} />} error={form.formState.errors.salary?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  {...form.register("salary")}
                  placeholder="85000"
                  className="w-full neu-input h-11 text-sm pl-7"
                />
              </div>
            </FieldWrapper>

            <div className="flex justify-end gap-3 pt-2">
              <DialogPrimitive.Close
                type="button"
                className="px-5 py-2 rounded-xl neu-button font-medium text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </DialogPrimitive.Close>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2 rounded-xl neu-button-primary font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  isEdit ? "Save Changes" : "Add Employee"
                )}
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
