"use client";

import { FormatKey, Formats } from "@/lib/types";
import { FORMAT_META } from "@/lib/formats";

interface Props {
  formats: Formats;
  activeKey: FormatKey;
  images: Partial<Record<FormatKey, string>>;
  onClose: () => void;
  onSwitchFormat: (key: FormatKey) => void;
  onGenerateImage: (key: FormatKey) => void;
  generatingImageKey: FormatKey | null;
}

function Avatar({ initials, style }: { initials: string; style?: React.CSSProperties }) {
  return (
    <div className="pv-avatar" style={style}>
      {initials}
    </div>
  );
}

function TweetPreview({ text, imageUrl }: { text: string; imageUrl?: string }) {
  return (
    <div className="pv-tweet">
      <div className="pv-tweet-header">
        <Avatar initials="YB" />
        <div>
          <div className="pv-tweet-name">Your Brand</div>
          <div className="pv-tweet-handle">@yourbrand</div>
        </div>
        <span className="pv-tweet-x">𝕏</span>
      </div>
      <p className="pv-tweet-text">{text}</p>
      {imageUrl && <img className="pv-tweet-img" src={imageUrl} alt="" />}
      <div className="pv-tweet-meta">9:41 AM · Jun 30, 2026</div>
      <div className="pv-tweet-stats">
        <span>💬 12</span><span>↺ 34</span><span>♥ 156</span><span>↗</span>
      </div>
    </div>
  );
}

function LinkedInPreview({ text, imageUrl }: { text: string; imageUrl?: string }) {
  return (
    <div className="pv-linkedin">
      <div className="pv-linkedin-header">
        <Avatar initials="YB" style={{ background: "linear-gradient(135deg,#0a66c2,#006097)" }} />
        <div>
          <div className="pv-li-name">Your Brand</div>
          <div className="pv-li-sub">Content Creator · 1h · 🌐</div>
        </div>
      </div>
      <div className="pv-li-text">
        {text.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {imageUrl && <img className="pv-li-img" src={imageUrl} alt="" />}
      <div className="pv-li-stats">
        <span>👍 You and 284 others</span>
        <span>47 comments · 12 reposts</span>
      </div>
      <div className="pv-li-actions">
        <button>👍 Like</button>
        <button>💬 Comment</button>
        <button>↗ Repost</button>
        <button>✉ Send</button>
      </div>
    </div>
  );
}

function NewsletterPreview({ text, imageUrl }: { text: string; imageUrl?: string }) {
  const firstLine = text.split("\n")[0]?.slice(0, 60) || "Newsletter";
  return (
    <div className="pv-newsletter">
      <div className="pv-nl-header">
        <div className="pv-nl-row"><span className="pv-nl-label">From</span><span>Your Brand &lt;hello@yourbrand.com&gt;</span></div>
        <div className="pv-nl-row"><span className="pv-nl-label">To</span><span>Subscribers</span></div>
        <div className="pv-nl-row"><span className="pv-nl-label">Subject</span><strong>{firstLine}</strong></div>
      </div>
      {imageUrl && <img className="pv-nl-img" src={imageUrl} alt="" />}
      <div className="pv-nl-body">{text}</div>
    </div>
  );
}

function ArticlePreview({ text, imageUrl }: { text: string; imageUrl?: string }) {
  const lines = text.split("\n").filter(Boolean);
  const title = lines.find((l) => l.startsWith("Title:"))?.replace("Title:", "").trim() ?? "";
  const sections = lines
    .filter((l) => l.startsWith("Section:"))
    .map((l) => l.replace("Section:", "").trim());

  return (
    <div className="pv-article">
      {imageUrl && <img className="pv-article-img" src={imageUrl} alt="" />}
      <div className="pv-article-tag">Article Draft</div>
      <h1 className="pv-article-title">{title || text.split("\n")[0]}</h1>
      <div className="pv-article-sections">
        {sections.map((s, i) => (
          <div key={i} className="pv-article-section">
            <span className="pv-article-num">{i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoScriptPreview({ text, imageUrl }: { text: string; imageUrl?: string }) {
  const lines = text.split("\n").filter(Boolean);
  const hook = lines.find((l) => /^hook/i.test(l))?.replace(/^hook[^:]*:\s*/i, "").trim() ?? "";
  const body = lines.find((l) => /^body/i.test(l))?.replace(/^body[^:]*:\s*/i, "").trim() ?? "";
  const cta = lines.find((l) => /^cta/i.test(l))?.replace(/^cta[^:]*:\s*/i, "").trim() ?? "";

  return (
    <div className="pv-video">
      {imageUrl && (
        <div className="pv-video-thumb">
          <img src={imageUrl} alt="Thumbnail" />
          <div className="pv-video-play">▶</div>
        </div>
      )}
      <div className="pv-video-script">
        <div className="pv-beat pv-beat-hook">
          <span className="pv-beat-label">Hook <em>5s</em></span>
          <p>{hook || text}</p>
        </div>
        {body && (
          <div className="pv-beat pv-beat-body">
            <span className="pv-beat-label">Body <em>30–45s</em></span>
            <p>{body}</p>
          </div>
        )}
        {cta && (
          <div className="pv-beat pv-beat-cta">
            <span className="pv-beat-label">CTA <em>5s</em></span>
            <p>{cta}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ImagePromptPreview({ text, imageUrl }: { text: string; imageUrl?: string }) {
  return (
    <div className="pv-imageprompt">
      {imageUrl ? (
        <img className="pv-imageprompt-img" src={imageUrl} alt="Generated" />
      ) : (
        <div className="pv-imageprompt-placeholder">
          <span>🎨</span>
          <span>Generate an image to preview it here</span>
        </div>
      )}
      <div className="pv-imageprompt-prompt">
        <span className="pv-imageprompt-label">Prompt</span>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default function PostPreviewModal({
  formats,
  activeKey,
  images,
  onClose,
  onSwitchFormat,
  onGenerateImage,
  generatingImageKey,
}: Props) {
  const activeMeta = FORMAT_META.find((m) => m.key === activeKey)!;
  const imageUrl = images[activeKey];
  const isGenerating = generatingImageKey === activeKey;

  function renderPreview() {
    const text = formats[activeKey];
    switch (activeKey) {
      case "tweet":         return <TweetPreview text={text} imageUrl={imageUrl} />;
      case "linkedin":      return <LinkedInPreview text={text} imageUrl={imageUrl} />;
      case "newsletter":    return <NewsletterPreview text={text} imageUrl={imageUrl} />;
      case "articleOutline":return <ArticlePreview text={text} imageUrl={imageUrl} />;
      case "videoScript":   return <VideoScriptPreview text={text} imageUrl={imageUrl} />;
      case "imagePrompt":   return <ImagePromptPreview text={text} imageUrl={imageUrl} />;
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-panel">
        <div className="modal-header">
          <div className="modal-tabs">
            {FORMAT_META.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`modal-tab${activeKey === m.key ? " modal-tab-active" : ""}`}
                onClick={() => onSwitchFormat(m.key)}
                title={m.label}
                style={{ "--tab-accent": m.color } as React.CSSProperties}
              >
                {m.icon}
              </button>
            ))}
          </div>
          <div className="modal-header-right">
            <span className="modal-format-label"
              style={{ color: activeMeta.color }}>
              {activeMeta.label}
            </span>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="modal-content">
          {renderPreview()}
        </div>

        <div className="modal-footer">
          {imageUrl ? (
            <button
              type="button"
              className="link modal-regen"
              onClick={() => onGenerateImage(activeKey)}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating…" : "↺ Regenerate image"}
            </button>
          ) : (
            <button
              type="button"
              className="primary"
              onClick={() => onGenerateImage(activeKey)}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating image…" : "Generate image"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
