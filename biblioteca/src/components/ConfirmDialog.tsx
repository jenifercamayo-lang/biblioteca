import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Spinner,
  Typography,
} from '@material-tailwind/react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleDialogToggle = (): void => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} handler={handleDialogToggle} size="sm">
      <DialogHeader className="text-blue-gray-900">{title}</DialogHeader>
      <DialogBody>
        <Typography variant="paragraph" color="blue-gray" className="font-normal">
          {description}
        </Typography>
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button
          variant="text"
          color="blue-gray"
          onClick={onCancel}
          disabled={loading}
          type="button"
        >
          {cancelText}
        </Button>
        <Button
          variant="filled"
          color="red"
          onClick={onConfirm}
          disabled={loading}
          type="button"
          className="inline-flex items-center gap-2"
        >
          {loading && <Spinner className="h-4 w-4" />}
          <span>{confirmText}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
