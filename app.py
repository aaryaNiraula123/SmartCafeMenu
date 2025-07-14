import os
import qrcode
from flask import Flask, render_template

app = Flask(__name__)

# Get the base URL from environment variable or fallback to localhost for dev
BASE_URL = os.environ.get("BASE_URL", "http://localhost:5000")

def generate_qr(table_id: str):
    url = f"{BASE_URL}/menu/{table_id}"

    img = qrcode.make(url)

    qr_dir = os.path.join(app.root_path, "static", "qrcodes")
    os.makedirs(qr_dir, exist_ok=True)  # create folder if doesn't exist

    path = os.path.join(qr_dir, f"table_{table_id}.png")
    img.save(path)
    print("QR saved →", path)

# Optional: generate QR for table 1 on startup or call from admin route later
generate_qr("1")

@app.route("/menu/<table_id>")
def menu(table_id):
    return render_template("menu.html", table_id=table_id)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Run on all IPs and on the port Render provides
    app.run(host="0.0.0.0", port=port, debug=True)
