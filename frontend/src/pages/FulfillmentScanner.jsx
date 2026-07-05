import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";

export default function FulfillmentScanner() {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });
  const scannerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize the Hardware Camera Scanner Object
    const scanner = new Html5QrcodeScanner(
      "reader-canvas-boundary", // Target element ID matching container below
      {
        fps: 10, // Frame scanning frequency processing speed
        qrbox: { width: 250, height: 250 }, // Central targeting viewfinder dimensions
        rememberLastUsedCamera: true,
        supportedScanTypes: [0], // Restricts lookup strictly to camera video streams (no static image files)
      },
      /* verbose= */ false,
    );

    // 2. Continuous Telemetry Match Success Handler
    const onScanSuccess = async (decodedText) => {
      // Avoid parsing duplicate triggers if token is already registered
      if (scanResult === decodedText) return;

      setScanResult(decodedText);
      scanner.clear(); // Instantly spin down the camera sensor loop to save battery power

      // 3. Fire Fulfillment Transaction Protocol directly to Express backend
      setVerificationStatus({ loading: true, success: false, error: "" });
      try {
        await API.post("/requests/verify", {
          secure_token: decodedText,
          donor_id: user.user_id,
        });

        setVerificationStatus({ loading: false, success: true, error: "" });
      } catch (err) {
        setVerificationStatus({
          loading: false,
          success: false,
          error:
            err.response?.data?.error ||
            "Verification handshake rejected by database rules.",
        });
      }
    };

    const onScanFailure = (error) => {
      // Debug matrix warning catch (suppressed to keep browser console from flooding)
    };

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    // Cleanup hook: Ensure the camera sensor releases safely if the user changes screens
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) =>
            console.error("Failed to clear camera hook allocation:", err),
          );
      }
    };
  }, [user.user_id, scanResult]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Branding Target Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-red-500">
            Operation Handshake
          </span>
          <h2 className="text-xl font-black mt-1">Bedside Fulfillment Scan</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Point camera view screen directly at Requester QR Code
          </p>
        </div>

        {/* Dynamic Telemetry Status Interceptor Display Cards */}
        {verificationStatus.success && (
          <div className="mb-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 p-5 text-center space-y-2 animate-fade-in">
            <span className="text-3xl block">🎉</span>
            <h3 className="font-black text-emerald-400 text-sm uppercase tracking-wider">
              Fulfillment Confirmed
            </h3>
            <p className="text-xs text-slate-300">
              The verification payload cleared. Database incremental counters
              updated successfully in real time.
            </p>
            <button
              onClick={() => {
                setScanResult(null);
                setVerificationStatus({
                  loading: false,
                  success: false,
                  error: "",
                });
              }}
              className="mt-3 text-xs bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl"
            >
              Scan Another Unit Token
            </button>
          </div>
        )}

        {verificationStatus.error && (
          <div className="mb-6 rounded-2xl bg-red-950/80 border border-red-500/30 p-5 text-center space-y-2 animate-fade-in">
            <span className="text-3xl block">⚠️</span>
            <h3 className="font-black text-red-400 text-sm uppercase tracking-wider">
              Transaction Denied
            </h3>
            <p className="text-xs text-red-300 font-medium">
              {verificationStatus.error}
            </p>
            <button
              onClick={() => {
                setScanResult(null);
                setVerificationStatus({
                  loading: false,
                  success: false,
                  error: "",
                });
              }}
              className="mt-3 text-xs bg-slate-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-slate-700"
            >
              Retry Camera System Scan
            </button>
          </div>
        )}

        {verificationStatus.loading && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-red-600"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Syncing Transaction Matrix...
            </p>
          </div>
        )}

        {/* NATIVE HTML5 HARDWARE CAMERA VIEWPORT CANVAS ANCHOR CONTAINER */}
        {!scanResult && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <div
              id="reader-canvas-boundary"
              className="w-full font-sans text-xs text-slate-400"
            />
          </div>
        )}

        {/* Back and Exit Control Buttons */}
        {!verificationStatus.loading && (
          <div className="mt-6 text-center">
            <a
              href="/dashboard"
              className="text-xs font-bold text-slate-500 hover:text-slate-400 tracking-wide transition-colors uppercase"
            >
              Cancel & Abort Scan System
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
