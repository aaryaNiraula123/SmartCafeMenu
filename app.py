import os
import json
from flask import Flask, render_template, redirect, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# === CONFIG ===
BASE_URL = "https://smartcafemenu-1.onrender.com"

# SQLite database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///orders.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# === DB MODEL ===
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    items = db.Column(db.Text, nullable=False)  # store JSON string of items

    def __repr__(self):
        return f"<Order {self.id} by {self.user_name}>"

# Create DB tables if they don't exist
with app.app_context():
    db.create_all()

# === ROUTES ===
@app.route("/")
def home():
    return redirect("/menu/1")

@app.route("/menu/<table_id>")
def menu(table_id):
    return render_template("menu.html", table_id=table_id)

@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    if request.method == 'POST':
        data = request.get_json()
        user_name = data.get('user_name')
        items = data.get('items')

        if not user_name or not items:
            return jsonify({"error": "Invalid data"}), 400

        # Save order to DB
        order = Order(user_name=user_name, items=json.dumps(items))
        db.session.add(order)
        db.session.commit()

        return jsonify({"message": f"Thank you for your order, {user_name}!"})

    else:
        # GET request to show checkout page
        return render_template('checkout.html')

@app.route('/orders')
def orders():
    all_orders = Order.query.all()
    orders_list = []
    for order in all_orders:
        orders_list.append({
            "user_name": order.user_name,
            "items": json.loads(order.items)  # convert JSON string to list/dict
        })
    return render_template('orders.html', orders=orders_list)

# === RUN SERVER ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
