import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function LoginBumdes() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = () => {
    // Call Laravel backend API here
    console.log("Logging in with:", { email, password, remember });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4383FF] bg-[url('/background-waves.svg')] bg-cover bg-center">
      <div className="w-full max-w-md shadow-xl rounded-xl bg-white">
        <div className="p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-4 items-center justify-center">
              <img src="/assets/images/Bumdes Logo.png" alt="Logo 1" width={100} height={40} />
              <img src="/assets/images/SumberJaya Logo.png" alt="Logo 2" width={80} height={40} />
            </div>
            <h2 className="text-lg font-semibold mt-4">Masuk ke akun</h2>
            <p className="text-sm text-center text-gray-500">
              Tolong masukkan email dan password yang sesuai untuk masuk kedalam aplikasi
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="esteban_schiller@gmail.com"
                className="text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={() => setRemember(!remember)}
              />
              <Label htmlFor="remember" className="text-sm text-black">Ingat password</Label>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-[#4383FF] text-white hover:bg-[#3569cc]"
            >
              Masuk
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            Lupa password? hubungi admin bumdes untuk merubah password anda
          </p>
        </div>
      </div>
    </div>
  );
}
