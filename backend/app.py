from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__, static_folder='../dist', static_url_path='/')
CORS(app) # Permite que o React em desenvolvimento fale com o Python

# Configuração do Banco de Dados (SQLite simples, cria um arquivo site.db)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODELOS (As Tabelas do Banco) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False) # Senha criptografada
    game_data = db.Column(db.Text, nullable=True) # O JSON inteiro do Player vai aqui

# Cria o banco se não existir
with app.app_context():
    db.create_all()

# --- ROTAS DA API ---

@app.route('/')
def index():
    # Serve o React (o arquivo index.html gerado pelo build)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Nome já existe!'})
    
    hashed_pw = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password=hashed_pw, game_data=None)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Conta criada com sucesso!'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password, data['password']):
        return jsonify({
            'success': True, 
            'message': 'Login realizado!', 
            'hasSave': user.game_data is not None
        })
    
    return jsonify({'success': False, 'message': 'Usuário ou senha inválidos.'})

@app.route('/api/save', methods=['POST'])
def save_game():
    data = request.json
    username = data['username']
    player_data = data['player_data'] # O objeto Player inteiro
    
    user = User.query.filter_by(username=username).first()
    if user:
        import json
        user.game_data = json.dumps(player_data) # Transforma em texto pra salvar
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'User not found'})

@app.route('/api/load', methods=['POST'])
def load_game():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and user.game_data:
        import json
        return jsonify({'success': True, 'player': json.loads(user.game_data)})
    return jsonify({'success': False, 'message': 'Save not found'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)