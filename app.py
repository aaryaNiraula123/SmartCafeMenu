import os
import json
from datetime import datetime
from flask import Flask, render_template, redirect, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# === CONFIGURATION ===
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///orders.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# === DATABASE MODELS ===
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    table_number = db.Column(db.Integer, nullable=False)
    items = db.Column(db.Text, nullable=False)  # Stores JSON string of items
    status = db.Column(db.String(20), default='pending')  # Order status
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Order {self.id} for Table {self.table_number}>"

# Initialize database tables
with app.app_context():
    db.create_all()

# === ROUTES ===
@app.route('/')
def home():
    return redirect('/menu/1')

@app.route('/menu/<int:table_id>')
def menu(table_id):
    # Validate table number
    if table_id < 1 or table_id > 4:
        return redirect('/menu/1')
    return render_template('menu.html', table_id=table_id)

@app.route('/checkout', methods=['POST'])
def checkout():
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'user_name' not in data or 'table_number' not in data or 'items' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate items
        try:
            items_json = json.dumps(data['items'])
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid items format'}), 400

        # Create new order
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
    # Get filter parameters
    table_filter = request.args.get('table', 'all')
    status_filter = request.args.get('status', 'all')

    # Build query
    query = Order.query.order_by(Order.created_at.desc())

    if table_filter != 'all':
        query = query.filter(Order.table_number == int(table_filter))
    
    if status_filter != 'all':
        query = query.filter(Order.status == status_filter)

    # Format orders for display
    orders = []
    for order in query.all():
        orders.append({
            'id': order.id,
            'user_name': order.user_name,
            'table_number': order.table_number,
            'items': json.loads(order.items),
            'status': order.status,
            'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return render_template('orders.html', orders=orders)

# === ORDER MANAGEMENT ENDPOINTS ===
@app.route('/update_status/<int:table_number>', methods=['POST'])
def update_order_status(table_number):
    try:
        data = request.get_json()
        valid_statuses = ['pending', 'preparing', 'ready', 'delivered']
        
        if 'status' not in data or data['status'] not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400

        order = Order.query.filter_by(
            table_number=table_number,
            user_name=data['user_name']
        ).first()
        
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
        order = Order.query.filter_by(
            table_number=table_number,
            user_name=data['user_name']
        ).first()
        
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
        order = Order.query.filter_by(
            table_number=data['table_number'],
            user_name=data['user_name']
        ).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        items = json.loads(order.items)
        for item in items:
            if item['name'] == data['item_name']:
                if data['action'] == 'add':
                    item['quantity'] += 1
                elif data['action'] == 'remove':
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
        order = Order.query.filter_by(
            table_number=data['table_number'],
            user_name=data['user_name']
        ).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        items = json.loads(order.items)
        items = [item for item in items if item['name'] != data['item_name']]

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


@app.route('/order')
def order():
    return render_template('orders.html')
# === APPLICATION ENTRY POINT ===
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)