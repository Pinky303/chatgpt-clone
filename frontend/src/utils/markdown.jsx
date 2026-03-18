import React from "react";

export function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={i} className="code-block">
          {lang && <div className="code-lang">{lang}</div>}
          <pre><code>{codeLines.join("\n")}</code></pre>
        </div>
      );
    }
    // H1-H3
    else if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{inlineFormat(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{inlineFormat(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i}>{inlineFormat(line.slice(2))}</h1>);
    }
    // Unordered list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(<li key={i}>{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`}>{items}</ul>);
      continue;
    }
    // Ordered list
    else if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^\d+\.\s/, ""))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`}>{items}</ol>);
      continue;
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(<blockquote key={i}>{inlineFormat(line.slice(2))}</blockquote>);
    }
    // Horizontal rule
    else if (line === "---" || line === "***") {
      elements.push(<hr key={i} />);
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<br key={i} />);
    }
    // Paragraph
    else {
      elements.push(<p key={i}>{inlineFormat(line)}</p>);
    }
    i++;
  }

  return elements;
}

function inlineFormat(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__")))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_")))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}
