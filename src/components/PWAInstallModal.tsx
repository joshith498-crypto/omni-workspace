import React from 'react';
import { Download, Smartphone, Monitor, CheckCircle2, X, Share, PlusSquare, Layers } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isInstallable: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
}) => {
  if (!isOpen) return null;

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base tracking-tight">
              Install OmniWorkspace Native PWA
            </h3>
            <p className="text-xs text-zinc-400">
              Cross-Platform Hub for iOS, Android, macOS &amp; Windows
            </p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2 py-2 border-y border-zinc-800/80 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Runs 100% offline with zero latency and local persistence</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Standalone windowing without browser address bars</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Direct access to local device camera, photos, and high-res video imports</span>
          </div>
        </div>

        {/* Platform-Specific Instructions */}
        {isIOS ? (
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs text-zinc-300">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <Smartphone className="w-4 h-4 text-zinc-400" />
              <span>Mobile Safari Installation Steps:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-300 leading-relaxed pl-1">
              <li>
                Tap the Safari <strong className="text-white font-medium">Share</strong> button{' '}
                <Share className="w-3.5 h-3.5 inline mx-0.5 text-zinc-300" /> at bottom of screen.
              </li>
              <li>
                Scroll down and select{' '}
                <strong className="text-white font-medium">Add to Home Screen</strong>{' '}
                <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-zinc-300" />.
              </li>
              <li>
                Tap <strong className="text-white font-medium">Add</strong> in the top right corner.
              </li>
            </ol>
          </div>
        ) : isInstallable ? (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">
              Click below to install directly to your device applications menu and desktop dock.
            </p>
            <button
              onClick={() => {
                onInstall();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install to Device</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <Monitor className="w-4 h-4 text-zinc-400" />
              <span>Browser Installation:</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              In Chrome, Edge, or Brave: Click the <strong>Install</strong> icon in the address bar (or menu <span className="font-mono text-zinc-300">⋮ &gt; Save and Share &gt; Install OmniWorkspace</span>).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
