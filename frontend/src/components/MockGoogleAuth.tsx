"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MockGoogleAuth({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelect = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#202124] w-full max-w-[450px] rounded-xl overflow-hidden relative z-10 shadow-2xl flex flex-col font-sans border border-[#3c4043] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="pt-10 pb-2 px-10">
          <div className="flex gap-2 items-center mb-6">
            <svg viewBox="0 0 48 48" className="w-7 h-7">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span className="text-[#e8eaed] text-lg font-medium">Sign in with Google</span>
          </div>
          
          <h1 className="text-white text-3xl font-medium mb-2 tracking-tight">Choose an account</h1>
          <p className="text-[#e8eaed] text-[15px]">to continue to <span className="text-[#8ab4f8]">Elevora</span></p>
        </div>

        {/* Accounts List */}
        <div className="flex flex-col mt-4">
           {/* Row 1 */}
           <div className="flex items-center gap-4 px-10 py-3 border-b border-[#3c4043] hover:bg-[#3c4043]/50 cursor-pointer transition-colors" onClick={handleSelect}>
              <div className="w-9 h-9 rounded-full bg-[#8e24aa] text-white flex items-center justify-center text-sm font-bold">P</div>
              <div>
                 <p className="text-[#e8eaed] text-[15px] font-medium leading-tight">Pushkar Waykole</p>
                 <p className="text-[#9aa0a6] text-sm">pushkarwaykole73@gmail.com</p>
              </div>
           </div>
           
           {/* Row 2 */}
           <div className="flex items-center gap-4 px-10 py-3 border-b border-[#3c4043] hover:bg-[#3c4043]/50 cursor-pointer transition-colors" onClick={handleSelect}>
              <div className="w-9 h-9 rounded-full bg-[#1976d2] text-white flex items-center justify-center text-sm font-bold">P</div>
              <div>
                 <p className="text-[#e8eaed] text-[15px] font-medium leading-tight">Pushkar Waykole</p>
                 <p className="text-[#9aa0a6] text-sm">pushkarwaykole2006@gmail.com</p>
              </div>
           </div>

           {/* Row 3 */}
           <div className="flex items-center gap-4 px-10 py-3 border-b border-[#3c4043] hover:bg-[#3c4043]/50 cursor-pointer transition-colors" onClick={handleSelect}>
              <div className="w-9 h-9 rounded-full bg-[#d81b60] text-white flex items-center justify-center text-sm font-bold">S</div>
              <div>
                 <p className="text-[#e8eaed] text-[15px] font-medium leading-tight">Sopan Waykole</p>
                 <p className="text-[#9aa0a6] text-sm">sopanwaykole80@gmail.com</p>
              </div>
           </div>

           {/* Use another account */}
           <div className="flex items-center gap-4 px-10 py-4 hover:bg-[#3c4043]/50 cursor-pointer transition-colors" onClick={handleSelect}>
              <div className="w-9 h-9 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[#e8eaed]">account_circle</span>
              </div>
              <p className="text-[#e8eaed] text-sm font-medium">Use another account</p>
           </div>
        </div>
        
        {/* Footer */}
        <div className="px-10 pt-8 pb-6 text-[#9aa0a6] text-[13px] leading-relaxed">
           To continue, Google will share your name, email address, language preference, and profile picture with Elevora.
        </div>

        {loading && (
          <div className="absolute inset-0 bg-[#202124]/70 flex items-center justify-center backdrop-blur-sm shadow-inner">
             {/* Google-style loading spinner */}
             <div className="w-8 h-8 border-[3px] border-[#8ab4f8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
