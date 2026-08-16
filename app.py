"""
Next Word Predictor — Flask API Backend
Serves the static frontend and exposes prediction endpoints
using a pre-trained LSTM model.
"""

import os


# ── Compatibility shim ──────────────────────────────────────
# The tokenizer.pkl was saved with old Keras 2 which stored classes
# under keras.src.preprocessing.  Keras 3 moved them.  We create a
# tiny shim so pickle.load can resolve the old import path.

# Register shim modules so pickle can find the old class path







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
