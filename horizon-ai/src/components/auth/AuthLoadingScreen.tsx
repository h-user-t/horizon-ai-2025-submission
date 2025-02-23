// components/auth/AuthLoadingScreen.tsx
import { Loader2 } from "lucide-react";

export const AuthLoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#146C94]" />
    </div>
  );
};