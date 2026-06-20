import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  employeeName?: string;
}

export function DeleteDialog({ open, onOpenChange, onConfirm, isPending, employeeName }: DeleteDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-sm translate-x-[-50%] translate-y-[-50%] neu-extruded rounded-2xl shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          <div className="flex items-start justify-between px-6 pt-6 pb-0">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={22} className="text-destructive" />
            </div>
            <DialogPrimitive.Close className="w-8 h-8 rounded-lg neu-button flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X size={16} />
            </DialogPrimitive.Close>
          </div>

          <div className="px-6 py-4">
            <DialogPrimitive.Title className="text-base font-bold text-foreground mb-1">
              Remove Employee
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">{employeeName ?? "this employee"}</span>?
              This action cannot be undone.
            </DialogPrimitive.Description>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <DialogPrimitive.Close
              type="button"
              className="flex-1 py-2.5 rounded-xl neu-button font-medium text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </DialogPrimitive.Close>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-destructive hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              {isPending ? "Removing…" : "Yes, Remove"}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
