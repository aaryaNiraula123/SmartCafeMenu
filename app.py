import os
import qrcode
from flask import Flask, render_template, redirect
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)

# Your public URL (update if different)
BASE_URL = "https://smartcafemenu-1.onrender.com"

def generate_qr(table_id: str):
    url = f"{BASE_URL}/menu/{table_id}"
    qr_img = qrcode.make(url)

    title_text = "BIC Café"
    font_size = 28

    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    dummy_img = Image.new("RGB", (1, 1))
    dummy_draw = ImageDraw.Draw(dummy_img)
    bbox = dummy_draw.textbbox((0, 0), title_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    new_width = qr_img.size[0]
    new_height = qr_img.size[1] + text_height + 20
    combined = Image.new("RGB", (new_width, new_height), "white")
    draw = ImageDraw.Draw(combined)

    draw.text(
        ((new_width - text_width) / 2, 10),
        title_text,
        font=font,
        fill="black"
    )

    # Fix: Convert qr_img to RGB before pasting
    combined.paste(qr_img.convert("RGB"), (0, text_height + 20))

    qr_dir = os.path.join(app.root_path, "static", "qrcodes")
    os.makedirs(qr_dir, exist_ok=True)
    path = os.path.join(qr_dir, f"table_{table_id}.png")
    combined.save(path)

    print(f"✅ QR code with title saved → {path}")
    print(f"📎 QR links to: {url}")

    combined.show()

generate_qr("1")

@app.route("/")
def home():
    return redirect("/menu/1")

@app.route("/menu/<table_id>")
def menu(table_id):
    return render_template("menu.html", table_id=table_id)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
