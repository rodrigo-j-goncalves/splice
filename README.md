# quarto-splice

A Quarto extension to chain presentations into a single flow of slides.

**Primary use case:** integrate [manim-slides](https://github.com/jeertmans/manim-slides)
(as HTML) — or any other Reveal.js presentation — into a your Quarto Revealjs presentation.

Then navigate all the slides in a single linear sequence, just advancing the slides with the usual keys.

- The included presentations require **zero modification**.
- No click around to transfer focus from one presentation to the other.

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
title: "My Lecture"
format: revealjs
---

# Topic 1

Some text…

{{< splice "animation1.html" >}}

# Topic 2

{{< splice "animation2.html" >}}
```

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
my-lecture.html
my-lecture_files/
animation1.html
animation2.html
```

---

## Example

See [`example.qmd`](example.qmd) and the example secondaries in [`splice-these/`](splice-these/).

Rendered here: [splice-example](https://rodrigo-j-goncalves.github.io/quarto-extensions/splice/splice-example.html)

---

## Known limitations

- Vertical slides in secondaries are not tracked (keep secondaries flat)
- You will discover more.

For now it works for me (my purpose is to use manim-slides in my classes without worrying about the focus), but I'm sure I made mistakes and it can be improved. Just let me know and we'll try to improve it step by step 🐢

---

## License & credits

I _claudeveloped_ this extension.

MIT © Rodrigo J. Gonçalves
