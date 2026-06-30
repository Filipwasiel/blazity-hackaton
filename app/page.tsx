"use client";

import { useEffect, useState } from "react";
import FormatCard from "@/components/FormatCard";
import BrandWizard from "@/components/BrandWizard";
import { FORMAT_META } from "@/lib/formats";
import { addHistory, clearHistory, loadHistory } from "@/lib/history";
import { loadBrandKit, saveBrandKit } from "@/lib/brand";
import {
  isFSAPISupported,
  pickFolder,
  saveBrandKitToFolder,
  saveProjectToFolder,
} from "@/lib/folder";
import {
  BrandKit,
  FormatKey,
  Formats,
  hasBrandContent,
  HistoryItem,
  Tone,
  TONES,
} from "@/lib/types";

export default function Page() {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [formats, setFormats] = useState<Formats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Brand & folder state
  const [brandKit, setBrandKit] = useState<BrandKit>({});
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [reuseNotice, setReuseNotice] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    setBrandKit(loadBrandKit());
  }, []);

  function handleSaveBrand(kit: BrandKit) {
    setBrandKit(kit);
    saveBrandKit(kit);
    if (folderHandle) {
      saveBrandKitToFolder(folderHandle, tone, kit).catch(() => {});
    }
  }

  async function connectFolder() {
    try {
      const handle = await pickFolder();
      setFolderHandle(handle);
      setFolderName(handle.name);
      setFolderError(null);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setFolderError("Could not access folder.");
      }
    }
  }

  async function generate() {
    const trimmed = idea.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setReuseNotice(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: trimmed,
          tone,
          brandKit: hasBrandContent(brandKit) ? brandKit : undefined,
        }),
      });
      const data = (await res.json()) as { formats?: Formats; error?: string };
      if (!res.ok || !data.formats) {
        throw new Error(data.error ?? "Generation failed.");
      }
      setFormats(data.formats);
      const item: HistoryItem = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now()),
        idea: trimmed,
        tone,
        brandKit: hasBrandContent(brandKit) ? { ...brandKit } : undefined,
        formats: data.formats,
        createdAt: Date.now(),
      };
      setHistory(addHistory(item));
      if (folderHandle) {
        saveProjectToFolder(folderHandle, item).catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function updateFormat(key: FormatKey, value: string) {
    setFormats((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function restore(item: HistoryItem) {
    setIdea(item.idea);
    setTone(item.tone);
    setFormats(item.formats);
    setError(null);
    setReuseNotice(null);
  }

  function loadBrandFromItem(item: HistoryItem) {
    if (!item.brandKit) return;
    const kit = item.brandKit;
    setBrandKit(kit);
    saveBrandKit(kit);
    setTone(item.tone);
    if (folderHandle) {
      saveBrandKitToFolder(folderHandle, item.tone, kit).catch(() => {});
    }
    const preview = item.idea.length > 55 ? item.idea.slice(0, 55) + "…" : item.idea;
    setReuseNotice(`Brand loaded from: "${preview}"`);
  }

  return (
    <main className="wrap">
      <header className="app-header">
        <div className="brand-badge">
          <span className="brand-badge-dot" />
          by Blazity
        </div>
        <h1>
          <span className="gradient-text">One Idea,</span> Every Format
        </h1>
        <p>
          Turn a single idea into six platform-ready pieces — tweet, LinkedIn
          post, newsletter, article outline, video script, and image prompt.
        </p>
      </header>

      <section className="panel">
        <label className="field-label" htmlFor="idea">
          Your idea
        </label>
        <textarea
          id="idea"
          className="idea-input"
          placeholder="e.g. Why small teams ship faster than big ones"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
          }}
        />

        <div className="controls">
          <div className="tones" role="group" aria-label="Tone">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tone === t}
                onClick={() => setTone(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="primary"
            onClick={generate}
            disabled={loading || idea.trim().length === 0}
          >
            {loading ? "Generating…" : "Generate all six"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <BrandWizard
          kit={brandKit}
          onSave={handleSaveBrand}
          folderName={folderName}
          folderError={folderError}
          onConnectFolder={connectFolder}
          isFSAPISupported={isFSAPISupported()}
        />
      </section>

      {reuseNotice && (
        <div className="reuse-notice">
          <span>{reuseNotice}</span>
          <button
            type="button"
            className="link"
            onClick={() => setReuseNotice(null)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {formats && (
        <section className="grid">
          {FORMAT_META.map((meta) => (
            <FormatCard
              key={meta.key}
              meta={meta}
              value={formats[meta.key]}
              onChange={(value) => updateFormat(meta.key, value)}
            />
          ))}
        </section>
      )}

      <section className="history">
        <div className="history-head">
          <h2>Recent ideas</h2>
          {history.length > 0 && (
            <button
              type="button"
              className="link"
              onClick={() => setHistory(clearHistory())}
            >
              Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="empty">
            Your last 10 ideas will appear here, saved in this browser.
          </p>
        ) : (
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id} className="history-item">
                <button
                  type="button"
                  className="history-item-btn"
                  onClick={() => restore(item)}
                >
                  <span className="idea-text">{item.idea}</span>
                  <span className="tag">{item.tone}</span>
                </button>
                {item.brandKit && (
                  <button
                    type="button"
                    className="reuse-brand-btn"
                    onClick={() => loadBrandFromItem(item)}
                    title="Load this project's brand settings"
                  >
                    Use brand
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
