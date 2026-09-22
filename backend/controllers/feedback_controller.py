import os
from flask import Blueprint, request, jsonify
from config.database import get_db

feedback_controller = Blueprint('feedback_controller', __name__)

def analyze_sentiment(text):
    """
    Very simplified rule-based sentiment analyzer.
    For demonstration purposes.
    """
    if not text:
        return "neutral", 0.0

    text = text.lower()
    
    positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome', 'fast', 'helpful', 'better', 'nice']
    negative_words = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'slow', 'useless', 'bug', 'crash', 'issue', 'hard']

    pos_count = sum(1 for word in positive_words if word in text)
    neg_count = sum(1 for word in negative_words if word in text)

    score = pos_count - neg_count
    
    if score > 0:
        return "positive", score
    elif score < 0:
        return "negative", score
    else:
        return "neutral", 0.0

@feedback_controller.route('/sentiment-stats', methods=['GET'])
def get_sentiment_stats():
    try:
        db = get_db()
        
        # Aggregate sentiment labels
        pipeline = [
            {"$group": {"_id": "$sentiment_label", "count": {"$sum": 1}}}
        ]
        
        results = list(db.sentiment_analysis.aggregate(pipeline))
        
        stats = {
            "positive": 0,
            "negative": 0,
            "neutral": 0,
            "total": 0
        }
        
        for r in results:
            label = r["_id"]
            if label in stats:
                stats[label] = r["count"]
            stats["total"] += r["count"]
            
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": "Failed to fetch stats", "details": str(e)}), 500

@feedback_controller.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    comments = data.get('comments', '')
    sentiment, score = analyze_sentiment(comments)

    db = get_db()
    
    # 1. Insert into feedbacks collection
    feedback_doc = {
        "logoQuality": data.get("logoQuality"),
        "videoQuality": data.get("videoQuality"),
        "generationTime": data.get("generationTime"),
        "scheduling": data.get("scheduling"),
        "comments": comments
    }
    
    try:
        feedback_result = db.feedbacks.insert_one(feedback_doc)
        
        # 2. Insert into sentiment_analysis collection with a reference to the feedback
        sentiment_doc = {
            "feedback_id": feedback_result.inserted_id,
            "comments": comments,
            "sentiment_label": sentiment,
            "sentiment_score": score
        }
        db.sentiment_analysis.insert_one(sentiment_doc)
        
    except Exception as e:
        return jsonify({"error": "Failed to save feedback to database", "details": str(e)}), 500
    
    return jsonify({
        "message": "Feedback submitted successfully!",
        "sentiment": sentiment,
        "score": score,
        "data": data
    }), 200