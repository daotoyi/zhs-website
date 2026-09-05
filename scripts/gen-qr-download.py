#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
道元易学APP 下载二维码生成 (内容: https://club.zhenhesheng.cn/h5/download)
- ERROR_CORRECT_H (30% 容错) 保证中心嵌 logo 仍可扫
- APP 图标嵌入中心: 白色圆角底 + logo 缩放至约 24% 遮挡率
输出: zhenhesheng.cn/images/qr-download.png
"""
import os
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # zhenhesheng.cn/
URL = "https://club.zhenhesheng.cn/h5/download"
LOGO = os.path.join(BASE, "images", "app-icon.jpg")
OUT = os.path.join(BASE, "images", "qr-download.png")
SIZE = 450          # 输出尺寸 450x450
LOGO_RATIO = 0.24   # logo 占用整图比例 (遮挡率约 24%, H级纠错30%内安全)

# 1) 生成二维码 (version 由内容自适应, 预留更高 version 保证密度)
qr = qrcode.QRCode(
    version=None,
    error_correction=ERROR_CORRECT_H,
    box_size=10,
    border=2,
)
qr.add_data(URL)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

# 2) 打开 logo 并准备圆角白色底
logo = Image.open(LOGO).convert("RGB")

# 3) 缩放 logo 至遮挡比例
target = int(qr_img.size[0] * LOGO_RATIO)
logo = logo.resize((target, target), Image.LANCZOS)

# 4) 白色圆角底 (比 logo 大 ~12%, 白底 + 柔和边距, 圆角半径为 12%)
pad = int(target * 0.12)
plate_size = target + pad * 2
plate = Image.new("RGB", (plate_size, plate_size), "white")
mask = Image.new("L", (plate_size, plate_size), 0)
d = ImageDraw.Draw(mask)
radius = int(plate_size * 0.12)
d.rounded_rectangle([0, 0, plate_size, plate_size], radius=radius, fill=255)
plate.putalpha(mask)

# 5) logo 贴到白底中央
plate.paste(logo, (pad, pad), logo if logo.mode == "RGBA" else None)
plate = plate.convert("RGBA")

# 6) 居中嵌入二维码 (白底块覆盖的码区本就该留白, 直接贴即可)
qr_rgba = qr_img.convert("RGBA")
pos = ((qr_rgba.size[0] - plate_size) // 2, (qr_rgba.size[1] - plate_size) // 2)
qr_rgba.paste(plate, pos, plate)

# 7) 放大到 450x450 输出
final = qr_rgba.resize((SIZE, SIZE), Image.LANCZOS).convert("RGB")
final.save(OUT, "PNG")
print("OK ->", OUT, final.size)
