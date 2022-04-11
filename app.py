from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from Model import Model
from DB import query_db

app = Flask(__name__)
CORS(app, resources={r'/*': {'origins': '*'}})

model = Model()

secret_word = '친구'

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/guess', methods=['POST'])
def guess():
    post_data = request.get_json()
    guess_word = post_data['guess_word'].strip()

    if not guess_word:
        return jsonify({
            'status': 'failed',
            'message': '단어를 입력해주세요.'
        })

    if guess_word == secret_word:
        response = {
            'status': 'success',
            'result': True,
        }
    else:
        guess_embedding = model.encode(guess_word)
        secret_embedding = model.encode(secret_word)

        similarity = float(cosine_similarity([secret_embedding], [guess_embedding])[0, 0])
        print(similarity)

        response = {
            'status': 'success',
            'result': False,
            'post_data': post_data,
            'similarity': similarity,
        }

    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5555)
