#!/usr/bin/env python3
"""Build parchment-toned, trimmed, capped floor-plan web assets for Embassy ONE.
Reads rasterized pages from _raw/, writes themed PNGs + manifest.json into the
floorplans/ folder. Uses PIL only (no Ghostscript)."""
from PIL import Image, ImageChops, ImageMath
import os, json

RAW = "/Users/mi1k/Documents/Projects/embassy one/sales-suite/app/assets/floorplans/_raw"
OUT = "/Users/mi1k/Documents/Projects/embassy one/sales-suite/app/assets/floorplans"
PARCH = (0xf1, 0xe9, 0xd8)
CAP = 1600

# (config, raw_page, output_file, label, sqft, source_page)
PLANS = [
    ("2br-duplex",       "page-03.png", "2br-duplex.png",       "2-Bedroom Duplex",                 "4,149.03 sq ft", 3),
    ("3br",              "page-05.png", "3br.png",              "3-Bedroom",                        "5,423.83 sq ft", 5),
    ("3br-study",        "page-08.png", "3br-study.png",        "3-Bedroom + Study",                "5,856.56 sq ft", 8),
    ("3br-study-media",  "page-11.png", "3br-study-media.png",  "3-Bedroom + Study + Media",        "7,454.35 sq ft", 11),
    ("4br",              "page-13.png", "4br.png",              "4-Bedroom",                        "6,272.46 sq ft", 13),
    ("4br-recessed",     "page-14.png", "4br-recessed.png",     "4-Bedroom Recessed",               "6,280.21 sq ft", 14),
    ("4br-study",        "page-19.png", "4br-study.png",        "4-Bedroom + Study",                "7,537.14 sq ft", 19),
    ("5br-penthouse",    "page-23.png", "5br-penthouse.png",    "5-Bedroom Penthouse Duplex",       "6,326.81 sq ft (lower) + 6,649.80 sq ft (upper)", 23),
    ("typical-floor",    "page-28.png", "typical-floor.png",    "Masterplan / Amenities Key Plan",  None, 28),
]


def autotrim(im, bg_thresh=18, pad=24):
    rgb = im.convert("RGB")
    bg = rgb.getpixel((2, 2))
    bgim = Image.new("RGB", rgb.size, bg)
    diff = ImageChops.difference(rgb, bgim).convert("L")
    mask = diff.point(lambda p: 255 if p > bg_thresh else 0)
    bbox = mask.getbbox()
    if not bbox:
        return rgb
    l, t, r, b = bbox
    l = max(0, l - pad); t = max(0, t - pad)
    r = min(rgb.width, r + pad); b = min(rgb.height, b + pad)
    return rgb.crop((l, t, r, b))


def tone(im):
    """Multiply the drawing onto parchment so white areas take the warm cream
    tone while dark/purple linework stays dark and legible."""
    base = Image.new("RGB", im.size, PARCH)
    r, g, b = im.split()
    pr, pg, pb = base.split()
    def mult(a, bb):
        return ImageMath.eval("convert(a*bb/255,'L')", a=a, bb=bb)
    return Image.merge("RGB", (mult(r, pr), mult(g, pg), mult(b, pb)))


def cap(im):
    w, h = im.size
    s = CAP / max(w, h)
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    return im


def main():
    manifest = []
    for cfg, raw, fn, label, sqft, page in PLANS:
        im = Image.open(os.path.join(RAW, raw))
        im = autotrim(im)
        im = tone(im)
        im = cap(im)
        im.save(os.path.join(OUT, fn), "PNG", optimize=True)
        print("%-24s %dx%d  <- %s" % (fn, im.size[0], im.size[1], raw))
        entry = {"config": cfg, "label": label, "sqft": sqft, "file": fn, "sourcePage": page}
        manifest.append(entry)
    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print("wrote manifest.json (%d entries)" % len(manifest))


if __name__ == "__main__":
    main()
