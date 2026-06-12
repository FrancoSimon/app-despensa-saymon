"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type BarcodeValueScannerProps = {
  onCodeScanned: (code: string) => void;
};

export function BarcodeValueScanner({
  onCodeScanned,
}: BarcodeValueScannerProps) {
  const scannerId = useId().replaceAll(":", "-");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // The browser may already have closed the stream.
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
    }
  }

  async function startScanner() {
    setMessage(null);

    try {
      await stopScanner();

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      setIsScanning(true);

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 160 },
        },
        async (decodedText) => {
          const code = decodedText.trim();

          if (!code) {
            return;
          }

          onCodeScanned(code);
          setMessage(`Codigo detectado: ${code}`);
          await stopScanner();
        },
        () => {
          // html5-qrcode calls this frequently while scanning; no UI update needed.
        },
      );
    } catch (error) {
      setIsScanning(false);
      scannerRef.current = null;
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo abrir la camara.",
      );
    }
  }

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <div className="mt-3 rounded-md border border-white/10 bg-zinc-950 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">Lector de codigo</p>
          <p className="mt-1 text-xs text-zinc-500">
            Usa la camara o un lector compatible para completar el campo.
          </p>
        </div>
        <div className="flex gap-2">
          {isScanning ? (
            <button
              type="button"
              onClick={() => void stopScanner()}
              className="rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-zinc-200 transition hover:border-lime-300"
            >
              Cerrar
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void startScanner()}
            disabled={isScanning}
            className="rounded-md bg-lime-300 px-3 py-2 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Leer codigo
          </button>
        </div>
      </div>

      <div
        id={scannerId}
        className={
          isScanning
            ? "mt-3 overflow-hidden rounded-md border border-lime-300/40 bg-black"
            : "hidden"
        }
      />

      {message ? (
        <p className="mt-3 rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-zinc-300">
          {message}
        </p>
      ) : null}
    </div>
  );
}
