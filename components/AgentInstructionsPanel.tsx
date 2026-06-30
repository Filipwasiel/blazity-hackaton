"use client";

import { useEffect, useState } from "react";
import { AgentInstructions, AgentRole } from "@/lib/types";

const AGENTS: { role: AgentRole; label: string; hint: string }[] = [
  {
    role: "copywriter",
    label: "Copywriter",
    hint: "LinkedIn post, newsletter, article outline",
  },
  {
    role: "social",
    label: "Social Media Manager",
    hint: "Tweet, video script",
  },
  {
    role: "art",
    label: "Art Director",
    hint: "Image prompt",
  },
  {
    role: "lead",
    label: "Editor-in-Chief",
    hint: "Reviews and unifies all six formats",
  },
];

interface Props {
  instructions: AgentInstructions;
  onSave: (instructions: AgentInstructions) => void;
}

export default function AgentInstructionsPanel({ instructions, onSave }: Props) {
  const [draft, setDraft] = useState<AgentInstructions>(instructions);

  useEffect(() => {
    setDraft(instructions);
  }, [instructions]);

  function update(role: AgentRole, value: string) {
    setDraft((prev) => ({ ...prev, [role]: value }));
  }

  const hasAny = AGENTS.some((a) => instructions[a.role]?.trim());

  return (
    <details className="brand-wizard agent-instructions-panel">
      <summary className="brand-wizard-summary">
        <span>Agent instructions</span>
        {hasAny && <span className="agent-instructions-badge">Active</span>}
      </summary>

      <div className="brand-fields">
        {AGENTS.map(({ role, label, hint }) => (
          <div key={role} className="brand-field">
            <label>
              {label}
              <span className="agent-role-hint"> — {hint}</span>
            </label>
            <textarea
              placeholder={`e.g. Always use bullet points. Avoid passive voice.`}
              value={draft[role] ?? ""}
              onChange={(e) => update(role, e.target.value)}
              rows={2}
            />
          </div>
        ))}

        <div className="brand-actions">
          <button type="button" className="primary" onClick={() => onSave(draft)}>
            Save instructions
          </button>
          {hasAny && (
            <button type="button" className="link" onClick={() => onSave({})}>
              Clear all
            </button>
          )}
        </div>
      </div>
    </details>
  );
}
