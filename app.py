from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from datetime import datetime
from Model import Model
from DB import query_db

app = Flask(__name__)
CORS(app, resources={r'/*': {'origins': '*'}})

df = pd.read_csv('data/kr_korean_nouns.csv')

model = Model()

secret_word = '친구'

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/guess', methods=['POST'])
def guess():
    global secret_word

    post_data = request.get_json()
    guess_word = post_data['guess_word'].strip()

    if not guess_word:
        return jsonify({
            'status': 'failed',
            'message': '단어를 입력해주세요.'
        })

    lastest = query_db('select * from hall_of_fame order by datetime desc limit 1', one=True)
    latest_datetime = datetime.strptime(lastest['datetime'], '%Y-%m-%d %H:%M:%S')

    if latest_datetime.date() == datetime.today().date():
        return jsonify({
            'status': 'failed',
            'result': False,
            'message': '오늘 문제는 끝났습니다. 내일 아침 9시에 접속해주세요!'
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

        response = {
            'status': 'success',
            'result': False,
            'post_data': post_data,
            'similarity': similarity,
        }

    return jsonify(response)

@app.route('/set_secret', methods=['POST'])
def set_secret():
    global secret_word

    post_data = request.get_json()
    user_secret_word = post_data['secret_word'].strip()
    username = post_data['secret_user'].strip()

    if username == '':
        username = '(이름없음)'

    if len(df[df['단어'] == user_secret_word]) <= 0:
        return jsonify({
            'status': 'failed',
            'message': '[%s] 이 단어는 다른 사람이 맞추기 어렵습니다. 다른 단어를 입력해주세요!' % user_secret_word
        })

    if secret_word == user_secret_word:
        return jsonify({
            'status': 'failed',
            'message': '똑같은 단어를 입력할 수 없습니다!'
        })

    secret_word = user_secret_word
    message = '새로운 단어 [%s] 설정 완료! 친구에게 공유해서 단어를 맞추게 해보세요!' % secret_word

    print(message)

    query_db('insert into hall_of_fame (username, word) values (?, ?)', [username, secret_word])

    return jsonify({
        'status': 'success',
        'message': message
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5555)
