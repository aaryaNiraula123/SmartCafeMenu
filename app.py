import os
import json
from datetime import datetime
from flask import Flask, render_template, redirect, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Added for CORS support

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains, useful if frontend is separate

# === CONFIGURATION ===
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///feedback_orders.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# === DATABASE MODELS ===
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    table_number = db.Column(db.Integer, nullable=False)
    items = db.Column(db.Text, nullable=False)  # JSON string
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Order {self.id} for Table {self.table_number}>"

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Feedback {self.id} from {self.name}>"

# Create tables if not exist
with app.app_context():
    db.create_all()

# === ROUTES ===
@app.route('/')
def home():
    return redirect('/menu/1')

@app.route('/menu/<int:table_id>')
def menu(table_id):
    if table_id < 1 or table_id > 4:
        return redirect('/menu/1')
    return render_template('menu.html', table_id=table_id)

@app.route('/checkout', methods=['POST'])
def checkout():
    try:
        data = request.get_json()
        if not data or 'user_name' not in data or 'table_number' not in data or 'items' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        try:
            items_json = json.dumps(data['items'])
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid items format'}), 400

        new_order = Order(
            user_name=data['user_name'],
            table_number=data['table_number'],
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

@app.route('/orders')
def view_orders():
    table_filter = request.args.get('table', 'all')
    status_filter = request.args.get('status', 'all')

    query = Order.query.order_by(Order.created_at.desc())

    if table_filter != 'all':
        try:
            table_num = int(table_filter)
            query = query.filter(Order.table_number == table_num)
        except ValueError:
            pass  # ignore invalid table filter

    if status_filter != 'all':
        query = query.filter(Order.status == status_filter)

    orders = []
    for order in query.all():
        try:
            items = json.loads(order.items)
        except json.JSONDecodeError:
            items = []
        orders.append({
            'id': order.id,
            'user_name': order.user_name,
            'table_number': order.table_number,
            'items': items,
            'status': order.status,
            'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return render_template('orders.html', orders=orders)

# === FEEDBACK ROUTES ===
@app.route('/feedback')
def feedback():
    return render_template('feedback.html')

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form

        # Check required fields presence
        required_fields = ['name', 'email', 'rating']
        if not all(field in data and data[field] for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate rating as int and within 1-5 (optional)
        try:
            rating = int(data['rating'])
            if rating < 1 or rating > 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid rating value'}), 400

        new_feedback = Feedback(
            name=data['name'],
            email=data['email'],
            rating=rating,
            comments=data.get('comments', '')
        )
        db.session.add(new_feedback)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Feedback submitted successfully',
            'redirect': url_for('view_feedback')
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/reviews')
def view_feedback():
    feedback_list = Feedback.query.order_by(Feedback.created_at.desc()).all()
    feedback_data = []
    for fb in feedback_list:
        feedback_data.append({
            'id': fb.id,
            'name': fb.name,
            'email': fb.email,
            'rating': fb.rating,
            'comments': fb.comments,
            'date': fb.created_at.strftime('%Y-%m-%d %H:%M')
        })
    return render_template('reviews.html', feedbacks=feedback_data)

# === ORDER MANAGEMENT ENDPOINTS ===
@app.route('/update_status/<int:table_number>', methods=['POST'])
def update_order_status(table_number):
    try:
        data = request.get_json()
        valid_statuses = ['pending', 'preparing', 'ready', 'delivered']

        if 'status' not in data or data['status'] not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400

        order = Order.query.filter_by(table_number=table_number, user_name=data.get('user_name')).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        order.status = data['status']
        db.session.commit()
        return jsonify({'message': 'Status updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/delete_order/<int:table_number>', methods=['DELETE'])
def delete_order(table_number):
    try:
        data = request.get_json()
        order = Order.query.filter_by(table_number=table_number, user_name=data.get('user_name')).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Order deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/update_item', methods=['POST'])
def update_item():
    try:
        data = request.get_json()
        order = Order.query.filter_by(table_number=data.get('table_number'), user_name=data.get('user_name')).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        items = json.loads(order.items)
        for item in items:
            if item['name'] == data.get('item_name'):
                if data.get('action') == 'add':
                    item['quantity'] += 1
                elif data.get('action') == 'remove':
                    item['quantity'] -= 1
                    if item['quantity'] <= 0:
                        items.remove(item)
                break

        order.items = json.dumps(items)
        db.session.commit()
        return jsonify({'message': 'Item updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/delete_item', methods=['POST'])
def delete_item():
    try:
        data = request.get_json()
        order = Order.query.filter_by(table_number=data.get('table_number'), user_name=data.get('user_name')).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        items = json.loads(order.items)
        items = [item for item in items if item['name'] != data.get('item_name')]

        order.items = json.dumps(items)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === UTILITY ROUTES ===
@app.route('/health')
def health_check():
    try:
        db.session.execute('SELECT 1')
        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# === ERROR HANDLERS ===
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# === ENTRY POINT ===
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
