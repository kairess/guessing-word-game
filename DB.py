import sqlite3
from flask import g

DATABASE = 'database.db'

def make_dicts(cursor, row):
    return dict((cursor.description[idx][0], value) for idx, value in enumerate(row))

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = make_dicts
    return db

def query_db(query, args=(), one=False):
    result = False

    db = get_db()
    cur = db.execute(query, args)

    if 'update' in query.lower() or 'insert' in query.lower():
        db.commit()
        result = True
    else:
        rv = cur.fetchall()
        result = (rv[0] if rv else None) if one else rv

    cur.close()
    return result

def init_db(app):
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()
