import os
import qrcode
from flask import Flask, render_template

app = Flask(__name__)

def generate_qr(table_id: str):
    url = f"http://192.168.1.8:5000/menu/{table_id}"

    img = qrcode.make(url)

    qr_dir = os.path.join(app.root_path, "static", "qrcodes")
    os.makedirs(qr_dir, exist_ok=True)      # <‑‑ creates folder chain if absent

    path = os.path.join(qr_dir, f"table_{table_id}.png")
    img.save(path)
    print("QR saved →", path)

generate_qr("1")

@app.route("/menu/<table_id>")
def menu(table_id):
    return render_template("menu.html", table_id=table_id)

if __name__ == "__main__":
    app.run(debug=True)
