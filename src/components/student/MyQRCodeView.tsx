import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../AuthContext';
import { User, Mail, Hash } from 'lucide-react';

export function MyQRCodeView() {
  const { user } = useAuth();

  // Generate unique student QR code
  const qrData = JSON.stringify({
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    role: user?.role,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-cyan-500/30 shadow-xl shadow-cyan-500/10">
        <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-blue-500/10">
          <CardTitle className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Your Student QR Code</CardTitle>
          <CardDescription>
            Use this QR code for event check-ins and verification
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 rounded-2xl blur-xl opacity-30"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl border-4 border-gradient-to-r from-cyan-500 to-teal-500">
                <QRCodeSVG
                  value={qrData}
                  size={300}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border-2 border-blue-500/20">
              <div className="bg-blue-500 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border-2 border-purple-500/20">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-lg border-2 border-teal-500/20">
              <div className="bg-teal-500 p-2 rounded-lg">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-semibold">{user?.id}</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>This QR code is unique to your account.</p>
            <p>Organizers will scan this code to mark your attendance at events.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
