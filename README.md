# quarto-splice

A Quarto extension to chain presentations into a single flow of slides.

**Primary use case:** integrate [manim-slides](https://github.com/jeertmans/manim-slides)
HTML exports — or any other Reveal.js presentation — into a Quarto class,
navigated as a single linear sequence with `←` / `→`.

The secondary presentations require **zero modification**.

---

## How it looks

```
→  your slide (text, equations…)
→  animation frame 1        ┐
→  animation frame 2        │  secondary Reveal.js HTML (unmodified)
→  animation frame 3        ┘
→  next slide (text…)
→  …
```

The audience navigates with arrow keys only. The iframes are invisible as such.

---

## Installation

```bash
quarto add rodrigo-j-goncalves/splice
```

---

## Usage

Place the shortcode on the slide where the secondary should appear:

```markdown
---
title: "My Class"
format:
  revealjs:
    theme: white
---

# Topic 1

Some text…

{{< splice "animation1.html" >}}

# Topic 2

{{< splice "animation2.html" >}}
```

No extra YAML keys needed (`keyboard`, `include-in-header`, `filters` — all handled
by the extension).

### Shortcode parameters

```
{{< splice "file.html" [width="100%"] [height="600"] [id="my-id"] >}}
```

| Parameter | Position | Default | Description |
|---|---|---|---|
| filename | 1st (positional) | *(required)* | Path to the secondary HTML file |
| `width` | keyword | `100%` | iframe width |
| `height` | keyword | `600` | iframe height in pixels (auto-fit when content precedes the iframe) |
| `id` | keyword | auto-generated | iframe id attribute |

---

## Requirements

- **Quarto ≥ 1.3**
- **Same-origin serving**: primary and all secondaries must be served from the
  same domain (e.g. `https://university.edu/~prof/presentations/`).
  This is automatic when all files are in the same server directory.
- **HTTP server**: `file://` URLs do not allow iframe cross-document access.
  Use `python3 -m http.server` for local testing.

---

## Secondary presentations

Any Reveal.js presentation works as a secondary without modification:

- manim-slides HTML exports (use `--one-file` for self-contained output)
- Quarto revealjs presentations
- Any standard Reveal.js HTML file

The controller connects to `iframe.contentWindow.Reveal` directly via same-origin
DOM access after the iframe loads. No postMessage scripts are required in the secondary.

---

## Local testing

```bash
quarto render example.qmd
python3 -m http.server 8765
# open http://localhost:8765/example.html
```

---

## Deployment

Upload to the same directory on your server:

```
my-class.html
my-class_files/
animation1.html
animation2.html
```

---

## Example

See [`example.qmd`](example.qmd) and the example secondaries in [`splice-these/`](splice-these/).

---

## Known limitations

- Vertical slides in secondaries are not tracked (keep secondaries flat)
- Secondary state is preserved when navigating back (not reset to first slide)
- Same-origin only — cross-origin secondaries are not supported

---

## License

MIT © Rodrigo J. Gonçalves
