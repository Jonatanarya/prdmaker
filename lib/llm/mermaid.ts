const MERMAID_FENCE = /```mermaid\s*([\s\S]*?)```/gi;

export type MermaidValidation = {
  ok: boolean;
  reasons: string[];
  blocks: string[];
};

/**
 * Extracts ```mermaid ... ``` blocks and applies lightweight structural checks.
 * Full Mermaid parsing is deferred to the client renderer; this catches common LLM mistakes.
 */
export function validatePrdMermaid(markdown: string): MermaidValidation {
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(MERMAID_FENCE.source, MERMAID_FENCE.flags);
  while ((match = re.exec(markdown)) !== null) {
    blocks.push(match[1].trim());
  }

  const reasons: string[] = [];

  if (blocks.length === 0) {
    reasons.push("No ```mermaid``` blocks found (need ERD and sequence diagram).");
  }

  const hasEr = blocks.some((b) => /^\s*erDiagram\b/m.test(b));
  const hasSeq = blocks.some((b) => /^\s*sequenceDiagram\b/m.test(b));

  if (!hasEr) {
    reasons.push("Missing erDiagram block for ERD.");
  }
  if (!hasSeq) {
    reasons.push("Missing sequenceDiagram block.");
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.length < 12) {
      reasons.push(`Mermaid block ${i + 1} is too short or empty.`);
    }
    const open = (b.match(/```/g) || []).length;
    if (open > 0) {
      reasons.push(`Mermaid block ${i + 1} contains nested fences.`);
    }
  }

  return {
    ok: reasons.length === 0,
    reasons,
    blocks,
  };
}

export function formatValidationReasons(v: MermaidValidation): string {
  return v.reasons.join(" ");
}
