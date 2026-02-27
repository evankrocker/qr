(() => {
  const $ = (id) => document.getElementById(id);

  const qrText = $("qrText");
  const size = $("size");
  const margin = $("margin");
  const ecLevel = $("ecLevel");
  const generateBtn = $("generateBtn");
  const downloadBtn = $("downloadBtn");
  const clearBtn = $("clearBtn");
  const status = $("status");
  const canvas = $("qrCanvas");

  const setStatus = (msg) => {
    status.textContent = msg || "";
  };

  function getSafeFilename(text) {
    const base = (text || "qr")
      .trim()
      .slice(0, 40)
      .replace(/https?:\/\/i, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    return \
`${base || "qr"}-${Date.now()}.png`;
  }

  async function renderQR() {
    const value = qrText.value.trim();
    if (!value) {
      setStatus("Enter some text to generate a QR code.");
      downloadBtn.disabled = true;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // If the CDN script failed to load, QRCode will be undefined.
    if (typeof window.QRCode === "undefined") {
      downloadBtn.disabled = true;
      setStatus("QR library failed to load. If you are offline, connect to the internet and reload.");
      return;
    }

    const px = Math.max(128, Math.min(1024, Number(size.value) || 320));
    const m = Math.max(0, Math.min(10, Number(margin.value) || 2));
    const ec = ecLevel.value || "M";

    canvas.width = px;
    canvas.height = px;

    try {
      await window.QRCode.toCanvas(canvas, value, {
        errorCorrectionLevel: ec,
        margin: m,
        width: px,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      downloadBtn.disabled = false;
      setStatus("QR generated.");
    } catch (err) {
      console.error(err);
      downloadBtn.disabled = true;
      setStatus("Could not generate QR code. Open DevTools Console to see the error.");
    }
  }

  function downloadPNG() {
    const value = qrText.value.trim();
    if (!value) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = getSafeFilename(value);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function clearAll() {
    qrText.value = "";
    setStatus("");
    downloadBtn.disabled = true;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  generateBtn.addEventListener("click", renderQR);
  downloadBtn.addEventListener("click", downloadPNG);
  clearBtn.addEventListener("click", clearAll);

  // Convenience: Ctrl/Cmd+Enter generates
  qrText.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") renderQR();
  });
})();
