"use client";

import { useState } from "react";
import { FormatMeta } from "@/lib/formats";

interface FormatCardProps {
  meta: FormatMeta;
  value: string;
  onChange: (value: string) => void;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  onGenerateImage?: () => void;
  onPreview?: () => void;
}

export default function FormatCard({
  meta,
  value,
  onChange,
  imageUrl,
  isGeneratingImage,
  onGenerateImage,
  onPreview,
}: FormatCardProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; ignore.
    }
  }

  return (
    <div
      className="card"
      style={{ "--card-accent": meta.color } as React.CSSProperties}
    >
      <div className="card-head">
        <div className="card-identity">
          <div className="card-icon">{meta.icon}</div>
          <div className="meta">
            <h3>{meta.label}</h3>
            <div className="hint">{meta.hint}</div>
          </div>
        </div>
        <div className="card-actions">
          {onPreview && (
            <button type="button" className="copy" onClick={onPreview}>
              Preview
            </button>
          )}
          <button
            type="button"
            className={copied ? "copy copied" : "copy"}
            onClick={copy}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      <textarea
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />

      {imageUrl ? (
        <div className="card-image">
          <img src={imageUrl} alt={`Generated image for ${meta.label}`} />
        </div>
      ) : onGenerateImage ? (
        <button
          type="button"
          className="card-gen-image"
          onClick={onGenerateImage}
          disabled={isGeneratingImage}
        >
          {isGeneratingImage ? "Generating image…" : "+ Generate image"}
        </button>
      ) : null}
    </div>
  );
}
