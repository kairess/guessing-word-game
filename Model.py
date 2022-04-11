from sentence_transformers import SentenceTransformer

class Model():
    def __init__(self):
        self.model =  SentenceTransformer('jhgan/ko-sroberta-multitask')

    def encode(self, word):
        return self.model.encode(word)
