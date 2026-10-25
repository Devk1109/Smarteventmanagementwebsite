import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../AuthContext';

interface QRCodeDialogProps {
  children: React.ReactNode;
  eventId: string;
  eventTitle: string;
}

export function QRCodeDialog({ children, eventId, eventTitle }: QRCodeDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // Generate unique QR code data
  const qrData = JSON.stringify({
    eventId,
    userId: user?.id,
    userName: user?.name,
    timestamp: Date.now(),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Event QR Code</DialogTitle>
          <DialogDescription>{eventTitle}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="bg-white p-6 rounded-lg">
            <QRCodeSVG
              value={qrData}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="text-center space-y-2">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">
              Show this QR code at the event entrance
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
