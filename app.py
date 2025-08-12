import os
import json
from datetime import datetime
from flask import Flask, render_template, redirect, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# === CONFIGURATION ===
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///feedback_orders.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# === MODELS ===
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    table_number = db.Column(db.Integer, nullable=False)
    items = db.Column(db.Text, nullable=False)  # JSON string
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Order {self.id} table {self.table_number}>"

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Feedback {self.id} from {self.name}>"

with app.app_context():
    db.create_all()

# === PAGES ===
@app.route('/')
def home():
    return redirect(url_for('menu', table_id=1))

@app.route('/menu/<int:table_id>')
def menu(table_id):
    if table_id < 1 or table_id > 10:
        table_id = 1
    return render_template('menu.html', table_id=table_id)

@app.route('/admin')
def admin_panel():
    return render_template('admin.html')

@app.route('/orders')
def view_orders_page():
    # Optionally pass orders to template; admin has dedicated API/JS
    return render_template('orders.html')

# === API ===
@app.route('/checkout', methods=['POST'])
def checkout():
    try:
        data = request.get_json()
        if not data or 'user_name' not in data or 'table_number' not in data or 'items' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        items_json = json.dumps(data['items'])
        new_order = Order(
            user_name=data['user_name'],
            table_number=int(data['table_number']),
            items=items_json,
            status='pending'
        )
        db.session.add(new_order)
        db.session.commit()

        return jsonify({
            'message': 'Order placed successfully',
            'order_id': new_order.id,
            'table_number': new_order.table_number
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['GET'])
def api_orders():
    # Return all orders as JSON (for admin)
    orders = Order.query.order_by(Order.created_at.desc()).all()
    out = []
    for o in orders:
        try:
            items = json.loads(o.items)
        except:
            items = []
        out.append({
            'id': o.id,
            'user_name': o.user_name,
            'table_number': o.table_number,
            'items': items,
            'status': o.status,
            'created_at': o.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(out), 200

@app.route('/api/update_status', methods=['POST'])
def api_update_status():
    data = request.get_json()
    order_id = data.get('order_id')
    status = data.get('status')
    if not order_id or not status:
        return jsonify({'error': 'Missing fields'}), 400
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    order.status = status
    db.session.commit()
    return jsonify({'message': 'Status updated'}), 200

# === FEEDBACK pages (basic placeholders) ===
@app.route('/feedback')
def feedback_page():
    return render_template('feedback.html')  # keep simple; you can add a feedback.html later

# === HEALTH CHECK ===
@app.route('/health')
def health_check():
    try:
        db.session.execute('SELECT 1')
        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500
    

feedback_list = []

@app.route("/feedback")
def feedback_form():
    return render_template("feedback.html")

@app.route("/submit_feedback", methods=["POST"])
def submit_feedback():
    name = request.form["name"]
    email = request.form["email"]
    rating = int(request.form["rating"])
    comments = request.form.get("comments", "").strip()

    feedback_list.append({
        "name": name,
        "email": email,
        "rating": rating,
        "comments": comments,
        "date": datetime.now().strftime("%Y-%m-%d")
    })

    return redirect(url_for("reviews"))

@app.route("/reviews")
def reviews():
    return render_template("reviews.html", feedbacks=feedback_list)
# === ENTRY POINT ===
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
