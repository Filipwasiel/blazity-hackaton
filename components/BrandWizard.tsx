"use client";

import { useEffect, useState } from "react";
import { BrandKit, hasBrandContent } from "@/lib/types";

interface Props {
  kit: BrandKit;
  onSave: (kit: BrandKit) => void;
  folderName: string | null;
  folderError: string | null;
  onConnectFolder: () => void;
  isFSAPISupported: boolean;
}

export default function BrandWizard({
  kit,
  onSave,
  folderName,
  folderError,
  onConnectFolder,
  isFSAPISupported,
}: Props) {
  const [draft, setDraft] = useState<BrandKit>(kit);

  useEffect(() => {
    setDraft(kit);
  }, [kit]);

  function update(partial: Partial<BrandKit>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function addColor() {
    if ((draft.colors ?? []).length >= 3) return;
    update({ colors: [...(draft.colors ?? []), "#3b82f6"] });
  }

  function removeColor(i: number) {
    update({ colors: (draft.colors ?? []).filter((_, idx) => idx !== i) });
  }

  function updateColor(i: number, hex: string) {
    const colors = [...(draft.colors ?? [])];
    colors[i] = hex;
    update({ colors });
  }

  const active = hasBrandContent(kit);

  return (
    <details className="brand-wizard">
      <summary className="brand-wizard-summary">
        <span>Brand settings</span>
        {active && <span className="brand-badge">Active</span>}
      </summary>

      <div className="brand-fields">
        <div className="brand-field">
          <label>Brand voice</label>
          <textarea
            placeholder="e.g. Bold and direct. We speak to builders, not suits."
            value={draft.brandVoice ?? ""}
            onChange={(e) => update({ brandVoice: e.target.value })}
            rows={2}
          />
        </div>

        <div className="brand-field">
          <label>Target audience</label>
          <input
            type="text"
            placeholder="e.g. Early-stage startup founders"
            value={draft.audience ?? ""}
            onChange={(e) => update({ audience: e.target.value })}
          />
        </div>

        <div className="brand-field">
          <label>Brand colors</label>
          <div className="color-row">
            {(draft.colors ?? []).map((hex, i) => (
              <div key={i} className="color-swatch">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => updateColor(i, e.target.value)}
                  title={hex}
                />
                <button
                  type="button"
                  className="color-remove"
                  onClick={() => removeColor(i)}
                  aria-label="Remove color"
                >
                  ×
                </button>
              </div>
            ))}
            {(draft.colors ?? []).length < 3 && (
              <button type="button" className="link color-add" onClick={addColor}>
                + Add color
              </button>
            )}
          </div>
        </div>

        <div className="brand-field">
          <label>Visual reference</label>
          <textarea
            placeholder="e.g. Clean, minimal tech aesthetic — dark backgrounds, blue accents, no stock photos"
            value={draft.referenceImage ?? ""}
            onChange={(e) => update({ referenceImage: e.target.value })}
            rows={2}
          />
        </div>

        <div className="brand-actions">
          <button type="button" className="primary" onClick={() => onSave(draft)}>
            Save brand
          </button>
          {active && (
            <button type="button" className="link" onClick={() => onSave({})}>
              Clear brand
            </button>
          )}
        </div>

        <div className="folder-section">
          <span className="folder-label">Folder sync</span>
          {folderName ? (
            <span className="folder-status">
              <span className="folder-dot" />
              {folderName}
            </span>
          ) : (
            <button
              type="button"
              className="folder-btn link"
              onClick={onConnectFolder}
              disabled={!isFSAPISupported}
              title={
                isFSAPISupported
                  ? "Connect a local folder to save brand config and project files"
                  : "Requires Chrome or Edge"
              }
            >
              {isFSAPISupported ? "Connect folder…" : "Not supported in this browser"}
            </button>
          )}
          {folderError && <span className="folder-error">{folderError}</span>}
        </div>
      </div>
    </details>
  );
}
