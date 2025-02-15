from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import nltk
from nltk.stem import WordNetLemmatizer
import string
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

nltk.download('punkt')
nltk.download('wordnet')

with open('chatbot.txt', 'r', encoding='utf8', errors='ignore') as fin:
    raw = fin.read().lower()

sent_tokens = nltk.sent_tokenize(raw)
word_tokens = nltk.word_tokenize(raw)

lemmer = WordNetLemmatizer()
def LemTokens(tokens):
    return [lemmer.lemmatize(token) for token in tokens]

remove_punct_dict = dict((ord(punct), None) for punct in string.punctuation)
def LemNormalize(text):
    return LemTokens(nltk.word_tokenize(text.lower().translate(remove_punct_dict)))

GREETING_INPUTS = ("hello", "hi", "greetings", "sup", "what's up", "hey")
GREETING_RESPONSES = ["hi", "hey", "*nods*", "hi there", "hello"]

def greeting(sentence):
    for word in sentence.split():
        if word.lower() in GREETING_INPUTS:
            return random.choice(GREETING_RESPONSES)

def chatbot_response(user_input):
    sent_tokens.append(user_input)
    TfidfVec = TfidfVectorizer(tokenizer=LemNormalize, stop_words='english')
    tfidf = TfidfVec.fit_transform(sent_tokens)
    vals = cosine_similarity(tfidf[-1], tfidf)
    idx = vals.argsort()[0][-2]
    flat = vals.flatten()
    flat.sort()
    req_tfidf = flat[-2]

    if req_tfidf == 0:
        response = "I am sorry, I don't understand you."
    else:
        response = sent_tokens[idx]

    sent_tokens.pop(-1)
    return response

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get("message")
    if greeting(user_input):
        response = greeting(user_input)
    else:
        response = chatbot_response(user_input)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
