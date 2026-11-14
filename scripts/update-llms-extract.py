#!/usr/bin/env python3
"""Refresh the retrieval extract from authored index.html (stdlib only)."""

from html.parser import HTMLParser
from pathlib import Path


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hidden = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.hidden += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, data):
        if not self.hidden and data.strip():
            self.parts.append(" ".join(data.split()))


root = Path(__file__).resolve().parents[1]
parser = VisibleText()
parser.feed((root / "index.html").read_text())
target = root / "llms-full.txt"
heading = "## Page text extract (for retrieval; may omit chrome)\n"
prefix, body = target.read_text().split(heading, 1)
_, suffix = body.split("\n## Related products", 1)
target.write_text(prefix + heading + " ".join(parser.parts) + "\n\n## Related products" + suffix)
