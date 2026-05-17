import { XMLParser } from "fast-xml-parser";

export interface ParsedFile {
  name: string;
  content: string;
}

export interface ParsedArtifact {
  type: string;
  title?: string;
  files: ParsedFile[];
  rawContent: string;
}

export interface ParseResult {
  contentWithoutArtifacts: string;
  artifacts: ParsedArtifact[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPONSE SHAPING ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function optimizeResponse(text: string) {
  return text
    .replace(/\n{3,}/g, "\n\n") // Collapse excessive newlines
    .replace(/\*\*(.*?)\*\*/g, "**$1**") // Enforce bold formatting
    .trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARTIFACT PARSER ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function validateArtifact(content: string): boolean {
  const openTags = (content.match(/<artifact/g) || []).length;
  const closeTags = (content.match(/<\/artifact>/g) || []).length;
  return openTags === closeTags;
}

export function parseArtifacts(markdown: string): ParseResult {
  const artifacts: ParsedArtifact[] = [];
  let contentWithoutArtifacts = markdown;

  // If streaming is still building the artifact and it's incomplete, we shouldn't destructively parse it yet.
  if (!validateArtifact(markdown)) {
    // Return early or let it render raw until complete. For now, we just don't parse incomplete artifacts.
    return {
      contentWithoutArtifacts: optimizeResponse(markdown),
      artifacts: []
    };
  }

  // Regex to match the entire artifact block including <artifact> tags
  // Because the entire document is markdown + XML.
  const artifactRegex = /<artifact\s+type="([^"]+)"(?:\s+title="([^"]+)")?>([\s\S]*?)<\/artifact>/g;

  let match;
  while ((match = artifactRegex.exec(markdown)) !== null) {
    const [fullMatch, type, title] = match;

    // Use fast-xml-parser to parse the specific block cleanly to avoid regex fragility on nested files
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      trimValues: true,
      cdataPropName: "__cdata" // in case model uses CDATA
    });

    try {
      // Parse the full match
      const jsonObj = parser.parse(fullMatch);
      const artifactObj = jsonObj.artifact;

      if (artifactObj) {
        const parsedType = artifactObj["@_type"] || type;
        const parsedTitle = artifactObj["@_title"] || title || `Generated ${type}`;
        const files: ParsedFile[] = [];

        // Support both single <file> and multiple <file> tags
        let fileNodes = artifactObj.file;
        if (fileNodes) {
          if (!Array.isArray(fileNodes)) {
            fileNodes = [fileNodes];
          }

          for (const f of fileNodes) {
            files.push({
              name: f["@_name"] || "content.txt",
              content: String(f["#text"] || f["__cdata"] || "")
            });
          }
        }

        // Fallback if the AI just dumped code without <file> tag inside <artifact>
        if (files.length === 0 && artifactObj["#text"]) {
          let defaultName = "content.md";
          if (parsedType === "react") defaultName = "App.tsx";
          if (parsedType === "html") defaultName = "index.html";
          if (parsedType === "diagram" || parsedType === "mermaid") defaultName = "diagram.mmd";
          
          files.push({
            name: defaultName,
            content: String(artifactObj["#text"]).trim()
          });
        }

        artifacts.push({
          type: parsedType,
          title: parsedTitle,
          files,
          rawContent: fullMatch
        });
      }
    } catch (e) {
      console.warn("Failed to parse XML artifact gracefully, fallback to regex.", e);
      // ... we could fallback to the old regex here if necessary, but fast-xml-parser is robust.
    }

    contentWithoutArtifacts = contentWithoutArtifacts.replace(fullMatch, "\n\n> *View artifact in the side panel.*\n\n");
  }

  // 2nd Pass: Fallback for raw fenced blocks
  const fencedRegex = /```(tsx|jsx|html|mermaid)\n([\s\S]*?)```/g;
  let codeMatch;
  while ((codeMatch = fencedRegex.exec(contentWithoutArtifacts)) !== null) {
    const [fullMatch, lang, code] = codeMatch;
    
    // Only extract if it is a complete file, not just a small snippet or a fix
    const isFullReact = (lang === "tsx" || lang === "jsx") && code.includes('import ') && code.includes('export ');
    const isFullHtml = lang === "html" && (code.includes('<!DOCTYPE html>') || code.includes('<html'));
    
    if (isFullReact || isFullHtml || lang === 'mermaid') {
      let type = "code";
      let name = "snippet.ts";
      if (lang === "html") { type = "html"; name = "index.html"; }
      else if (lang === "tsx" || lang === "jsx") { type = "react"; name = `App.${lang}`; }
      else if (lang === "mermaid") { type = "mermaid"; name = "diagram.mmd"; }
      
      artifacts.push({
        type,
        title: `Generated ${lang.toUpperCase()} snippet`,
        files: [{ name, content: code.trim() }],
        rawContent: fullMatch
      });
      contentWithoutArtifacts = contentWithoutArtifacts.replace(fullMatch, "\n\n> *View generated code in the side panel.*\n\n");
    }
  }

  // Clean reasoning tags out
  contentWithoutArtifacts = contentWithoutArtifacts
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/```thinking[\s\S]*?```/g, "");

  return {
    contentWithoutArtifacts: optimizeResponse(contentWithoutArtifacts),
    artifacts
  };
}
