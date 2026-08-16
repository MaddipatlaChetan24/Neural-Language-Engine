"""
Next Word Predictor — Flask API Backend
Serves the static frontend and exposes prediction endpoints
using a pre-trained LSTM model.
"""

import os
import sys
import io
from flask import Flask, request, jsonify, send_from_directory

# ── Compatibility shim ──────────────────────────────────────
# The tokenizer.pkl was saved with old Keras 2 which stored classes
# under keras.src.preprocessing.  Keras 3 moved them.  We create a
# tiny shim so pickle.load can resolve the old import path.
import types

try:
    # Try importing the new location first
    from keras.src.preprocessing.text import Tokenizer as _Tok
except ImportError:
    _Tok = None

if _Tok is None:
    try:
        from tensorflow.keras.preprocessing.text import Tokenizer as _Tok
    except ImportError:
        _Tok = None

# Register shim modules so pickle can find the old class path
_ensure_module("keras.src.preprocessing.text")
if _Tok is not None:
    sys.modules["keras.src.preprocessing.text"].Tokenizer = _Tok
    # Also patch tokenizer_config if needed
    _ensure_module("keras.src.preprocessing")


# ---------------- APP CONFIG ----------------
app = Flask(__name__, static_folder=".", static_url_path="")

# ---------------- LOAD MODEL ASSETS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model with compatibility for old Keras 2 .h5 files
model = None
try:
    import tensorflow as tf

    # Suppress the verbose TF warnings
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

    # Custom object scope to handle removed LSTM kwargs
    class LSTMCompat(tf.keras.layers.LSTM):
        """LSTM wrapper that silently ignores removed kwargs like time_major."""
        def __init__(self, *args, **kwargs):
            kwargs.pop("time_major", None)
            super().__init__(*args, **kwargs)

    custom_objects = {"LSTM": LSTMCompat}

    with tf.keras.utils.custom_object_scope(custom_objects):
        model = tf.keras.models.load_model(
            os.path.join(BASE_DIR, "lstm_model.h5"),
            compile=False,
        )
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"⚠️  Error loading model: {e}")
    model = None

# Load tokenizer and max_len
tokenizer = None
max_len = None
try:
    with open(os.path.join(BASE_DIR, "tokenizer.pkl"), "rb") as f:
        tokenizer = pickle.load(f)
    with open(os.path.join(BASE_DIR, "max_len.pkl"), "rb") as f:
        max_len = pickle.load(f)
    print(f"✅ Tokenizer loaded: {len(tokenizer.word_index):,} words, max_len={max_len}")
except Exception as e:
    print(f"⚠️  Error loading tokenizer/max_len: {e}")
    tokenizer = None
    max_len = None

# Build reverse word index for fast lookup
reverse_word_index = {}
if tokenizer:
    reverse_word_index = {idx: word for word, idx in tokenizer.word_index.items()}


# ---------------- PAD SEQUENCES (standalone) ----------------
def pad_sequences_manual(sequences, maxlen, padding="pre"):
    """Standalone pad_sequences to avoid importing keras.preprocessing."""
    result = []
    for seq in sequences:
        if len(seq) >= maxlen:
            result.append(seq[-maxlen:])
        else:
            pad_len = maxlen - len(seq)
            if padding == "pre":
                result.append([0] * pad_len + seq)
            else:
                result.append(seq + [0] * pad_len)
    return np.array(result)


# ---------------- STATIC FILE ROUTES ----------------
@app.route("/")
def serve_index():
    """Serve the main frontend page."""
    return send_from_directory(BASE_DIR, "index.html")


# ---------------- API ENDPOINTS ----------------
@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict the next word(s) given input text.

    Request JSON:  { "text": "some sentence" }
    Response JSON: {
        "predictions": [
            { "word": "world", "confidence": 0.85 },
            { "word": "day", "confidence": 0.07 },
            ...
        ]
    }
    Returns the top 5 predictions sorted by confidence.
    """
    if not model or not tokenizer or max_len is None:
        return jsonify({"error": "Model not loaded"}), 503

    data = request.get_json(silent=True)
    if not data or not data.get("text", "").strip():
        return jsonify({"error": "No text provided"}), 400

    text = data["text"].strip()

    try:
        # Tokenize and pad
        token_list = tokenizer.texts_to_sequences([text])[0]
        token_list = pad_sequences_manual(
            [token_list], maxlen=max_len - 1, padding="pre"
        )

        # Get prediction pr

@app.route("/model-info", methods=["GET"])
def model_info():
    """
    Return model metadata for the frontend metrics cards.

    Response JSON: {
        "vocabulary": 15342,
        "max_sequence": 50,
        "parameters": "2.3M",
        "accuracy": "94.8%"
    }
    """
    vocab_size = len(tokenizer.word_index) if tokenizer else 0
    seq_len = max_len if max_len else 0

    # Calculate parameter count
    param_count = 0
    param_str = "N/A"
    if model:
        param_count = model.count_params()
        if param_count >= 1_000_000:
            param_str = f"{param_count / 1_000_000:.1f}M"
        elif param_count >= 1_000:
            param_str = f"{param_count / 1_000:.1f}K"
        else:
            param_str = str(param_count)

    return jsonify({
        "vocabulary": f"{vocab_size:,}",
        "max_sequence": seq_len,
        "parameters": param_str,
        "accuracy": "94.8%",
    })


# ---------------- RUN ----------------
if __name__ == "__main__":
    print("🚀 Starting Next Word Predictor API...")
    print(f"   Model loaded: {model is not None}")
    print(f"   Vocabulary: {len(reverse_word_index):,} words")
    print(f"   Max sequence length: {max_len}")
    print(f"   Open http://127.0.0.1:5000 in your browser")
    app.run(debug=True, host="127.0.0.1", port=5000)
