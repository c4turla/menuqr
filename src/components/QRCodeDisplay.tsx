"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function QRCodeDisplay({ text, size = 256 }: { text: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(text, { width: size, margin: 2 }).then(setDataUrl);
    QRCode.toString(text, { type: "svg", width: size, margin: 2 }).then(setSvgString);
  }, [text, size]);

  const downloadPNG = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "menu-qr.png";
    a.click();
  };

  const downloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu-qr.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="rounded-xl border bg-white p-4">
        {dataUrl ? (
          <img src={dataUrl} alt="QR Code" width={size} height={size} className="rounded-lg" />
        ) : (
          <div
            className="animate-pulse rounded-lg bg-muted"
            style={{ width: size, height: size }}
          />
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={downloadPNG} disabled={!dataUrl}>
          <Download className="mr-2 h-4 w-4" />
          PNG
        </Button>
        <Button variant="outline" onClick={downloadSVG} disabled={!svgString}>
          <Download className="mr-2 h-4 w-4" />
          SVG
        </Button>
      </div>
    </div>
  );
}
