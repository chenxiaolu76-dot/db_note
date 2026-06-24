document$.subscribe(() => {
  if (typeof mermaid === "undefined") {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "default"
  });

  const blocks = document.querySelectorAll("pre.mermaid");
  blocks.forEach((wrapper, index) => {
    if (wrapper.dataset.mermaidDone === "true") {
      return;
    }

    const block = wrapper.querySelector("code");
    if (!block) {
      return;
    }

    const source = block.textContent;
    const container = document.createElement("div");
    container.className = "mermaid";
    container.textContent = source;
    container.id = `mermaid-diagram-${index}-${Date.now()}`;
    wrapper.dataset.mermaidDone = "true";
    wrapper.replaceWith(container);
  });

  mermaid.run({
    querySelector: ".mermaid"
  });
});
