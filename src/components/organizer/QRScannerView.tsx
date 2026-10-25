import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { QrCode, Camera, CheckCircle2, User, Clock, Zap, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import jsQR from 'jsqr';
import { getAllEvents, Event } from '../../utils/eventStorage';
import { checkInStudent, getRegistrationsByEvent } from '../../utils/registrationStorage';
import { useAuth } from '../AuthContext';

interface StudentQrPayload {
  userId?: string;
  studentId?: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  eventId?: string;
}

interface RecentCheckIn {
  id: string;
  name: string;
  email: string;
  time: string;
}

export function QRScannerView() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [scanning, setScanning] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastScannedCodeRef = useRef<string | null>(null);

  // Get only events created by this organizer
  const myEvents = getAllEvents().filter(event => event.organizerId === user?.id);

  const handleStartScan = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('📷 Camera needs HTTPS or localhost.');
      return;
    }

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
      } catch (e: any) {
        if (e.name === 'OverconstrainedError') {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } else {
          throw e;
        }
      }
      setStream(mediaStream);
      setScanning(true); // video element renders now; effect below attaches the stream
    } catch (error: any) {
      let msg = `📷 Camera error: ${error.message || 'Unknown error'}`;
      if (error.name === 'NotAllowedError') msg = '📷 Camera permission denied. Allow it in browser settings.';
      else if (error.name === 'NotFoundError') msg = '📷 No camera found on this device.';
      else if (error.name === 'NotReadableError') msg = '📷 Camera is in use by another application.';
      setCameraError(msg);
      toast.error(msg, { duration: 6000 });
    }
  };

  const handleStopScan = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setScanning(false);
    lastScannedCodeRef.current = null;
  };

  const handleQRCodeDetected = (rawValue: string) => {
    if (lastScannedCodeRef.current === rawValue) return;
    lastScannedCodeRef.current = rawValue;

    let payload: StudentQrPayload;
    try {
      payload = JSON.parse(rawValue) as StudentQrPayload;
    } catch {
      toast.error('This QR code is not a valid ClubHub student code.');
      return;
    }

    const studentId = payload.userId || payload.studentId;
    if (!studentId || (payload.role && payload.role !== 'student')) {
      toast.error('This QR code does not contain a valid student ID.');
      return;
    }

    if (payload.eventId && payload.eventId !== selectedEvent) {
      toast.error('This QR code belongs to a different event.');
      return;
    }

    const registration = getRegistrationsByEvent(selectedEvent).find(
      item => item.studentId === studentId,
    );

    if (!registration) {
      toast.error('This student is not registered for the selected event.');
      return;
    }

    if (registration.checkedIn) {
      toast.info(`${registration.studentName} has already checked in.`);
      return;
    }

    checkInStudent(selectedEvent, studentId);
    setRecentCheckIns(current => [
      {
        id: registration.id,
        name: registration.studentName || payload.userName || 'Student',
        email: registration.studentEmail || payload.userEmail || '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...current,
    ]);
    toast.success(`${registration.studentName} checked in successfully.`);
    handleStopScan();
  };

  // Attach stream + run scan loop once <video> exists
  useEffect(() => {
    if (!scanning || !stream || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = stream;
    video.play().catch(err => console.error('Video play error:', err));

    let raf = 0;
    const tick = () => {
      const canvas = canvasRef.current;
      if (canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
          if (code) {
            handleQRCodeDetected(code.data);
          } else {
            lastScannedCodeRef.current = null;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [scanning, stream]);

  // Stop camera on unmount
  useEffect(() => {
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [stream]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {cameraError && (
        <Card className="border-2 border-orange-200/50 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm text-orange-800 dark:text-orange-200">{cameraError}</p>
                <div className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                  <p className="font-semibold">To enable camera access:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>Click the camera icon 📷 in your browser's address bar</li>
                    <li>Select "Allow" for camera permissions</li>
                    <li>Refresh the page and try again</li>
                  </ul>
                </div>
                <Button
                  size="sm"
                  onClick={() => setCameraError(null)}
                  variant="outline"
                  className="mt-2 border-orange-300 dark:border-orange-700"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="border-2 border-blue-200/50 dark:border-blue-800/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative">
          <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
            <QrCode className="h-6 w-6 text-blue-600" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>Scan student QR codes for event check-in</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 relative">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Event</label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent} disabled={scanning}>
              <SelectTrigger className="border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500">
                <SelectValue placeholder="Choose an event" />
              </SelectTrigger>
              <SelectContent>
                {myEvents.map((event: Event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex flex-col items-center justify-center rounded-xl overflow-hidden">
            {scanning ? (
              <div className="relative w-full min-h-[400px] bg-gray-900">
                {/* Camera view */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full min-h-[400px] object-cover"
                />
                
                {/* Hidden canvas for QR processing */}
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {/* Scanning frame */}
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 border-4 border-blue-500/50 rounded-xl"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan"></div>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                    Position QR code within frame
                  </p>
                </div>
                
                {/* Stop button */}
                <Button
                  onClick={handleStopScan}
                  variant="destructive"
                  size="sm"
                  className="absolute top-4 right-4 pointer-events-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30"></div>
                
                <div className="text-center space-y-4 relative z-10">
                  <div className="relative inline-block">
                    <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                    <Zap className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                  <p className="font-semibold">Ready to Scan</p>
                  <Button
                    onClick={handleStartScan}
                    disabled={!selectedEvent}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/50"
                  >
                    <Camera className="h-4 w-4" />
                    Start Scanning
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200/50 dark:border-green-800/50 hover:shadow-xl hover:shadow-green-500/10 transition-all">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Recent Check-ins
              </CardTitle>
              <CardDescription>
                {recentCheckIns.length} students checked in
              </CardDescription>
            </div>
            {recentCheckIns.length > 0 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {recentCheckIns.length} Total
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentCheckIns.length > 0 ? (
            <div className="space-y-3">
              {recentCheckIns.map((checkIn, index) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-4 border-2 rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50 hover:shadow-lg hover:shadow-green-500/20 transition-all animate-in fade-in slide-in-from-left-5 duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{checkIn.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span>📧</span>
                        {checkIn.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Checked In
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {checkIn.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-muted-foreground">No check-ins yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Start scanning to track attendance.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(256px);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
