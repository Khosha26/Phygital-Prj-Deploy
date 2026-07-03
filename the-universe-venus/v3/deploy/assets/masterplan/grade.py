#!/usr/bin/env python3
"""Safe cinematic color-grade of the master plan. Pixel-for-pixel geometry preserved.
Operations: S-curve contrast, saturation boost, warm golden tone, radial vignette,
warm top light gradient, clarity (unsharp local-contrast), final upscale to ~2400px wide."""
import numpy as np
from PIL import Image, ImageFilter

SRC = "/Users/mi1k/universe-work/assets/masterplan/master-plan-src.png"
OUT = "/Users/mi1k/universe-work/assets/masterplan/master-plan-graded.jpg"
OUT_W = 2400

img = Image.open(SRC).convert("RGB")
W, H = img.size
a = np.asarray(img).astype(np.float32) / 255.0  # HxWx3 in 0..1

# ---------- 1. Sigmoidal S-curve contrast (gentle) ----------
# emulate magick -sigmoidal-contrast 3,50%
contrast = 3.0
mid = 0.5
def sigmoid(x, c, m):
    num = 1.0/(1.0+np.exp(c*(m-x))) - 1.0/(1.0+np.exp(c*m))
    den = 1.0/(1.0+np.exp(c*(m-1.0))) - 1.0/(1.0+np.exp(c*m))
    return num/den
a = sigmoid(a, contrast, mid)
a = np.clip(a, 0, 1)

# ---------- 2. Saturation boost (+~18%) ----------
lum = (0.299*a[...,0] + 0.587*a[...,1] + 0.114*a[...,2])[...,None]
sat = 1.18
a = lum + (a - lum) * sat
a = np.clip(a, 0, 1)

# ---------- 3. Warm golden-hour tone (subtle colorize toward #ffe6b0 ~6%) ----------
warm = np.array([255, 230, 176], dtype=np.float32)/255.0
mix = 0.06
a = a*(1-mix) + warm[None,None,:]*mix
# slight extra warmth: lift R, gently pull B
a[...,0] = np.clip(a[...,0]*1.015, 0, 1)
a[...,2] = np.clip(a[...,2]*0.985, 0, 1)

# ---------- 4. Radial vignette (soft, multiply) ----------
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy = W/2.0, H/2.0
# normalized elliptical radius
r = np.sqrt(((xx-cx)/(W*0.62))**2 + ((yy-cy)/(H*0.62))**2)
vig = 1.0 - 0.30*np.clip(r-0.45, 0, 1)**1.6   # full bright center, darken outer ~30%
vig = np.clip(vig, 0.62, 1.0)[...,None]
a = a * vig

# ---------- 5. Warm top light gradient (softlight-ish, faint) ----------
grad = np.clip(1.0 - (yy/H)/0.85, 0, 1)[...,None]   # 1 at top -> 0 lower
top_warm = np.array([255, 217, 140], dtype=np.float32)/255.0
strength = 0.10
# screen-style blend weighted by gradient so it only warms/lifts the top
a = a + (1-a) * (top_warm[None,None,:]) * (grad*strength)
a = np.clip(a, 0, 1)

out = Image.fromarray((a*255.0+0.5).astype(np.uint8), "RGB")

# ---------- 6. Clarity / local-contrast (unsharp 0x1+0.6) ----------
blur = out.filter(ImageFilter.GaussianBlur(radius=1.0))
ob = np.asarray(out).astype(np.float32)
bb = np.asarray(blur).astype(np.float32)
amount = 0.6
sharp = ob + amount*(ob-bb)
out = Image.fromarray(np.clip(sharp,0,255).astype(np.uint8), "RGB")

# ---------- 7. Upscale to ~2400px wide ----------
new_h = int(round(H * OUT_W / W))
out = out.resize((OUT_W, new_h), Image.LANCZOS)

out.save(OUT, "JPEG", quality=90)
print("WROTE", OUT, out.size)
