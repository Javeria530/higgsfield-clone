import pytest
import sys
import os

# Ensure backend package modules are importable when running tests from the backend directory
ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from controllers.feedback_controller import analyze_sentiment


@pytest.mark.parametrize("text,expected_label,expected_score", [
    ("I love this product, it's amazing and helpful", "positive", pytest.approx(3)),
    ("This is bad and terrible, I hate it", "negative", pytest.approx(-3)),
    ("It's ok, nothing special", "neutral", pytest.approx(0.0)),
    ("", "neutral", pytest.approx(0.0)),
    (None, "neutral", pytest.approx(0.0)),
])
def test_analyze_sentiment_basic(text, expected_label, expected_score):
    label, score = analyze_sentiment(text)
    assert label == expected_label
    assert score == expected_score


def test_analyze_sentiment_mixed_counts():
    # Analyzer counts unique word presence; 'good' present (1) and 'bug' present (1) -> score 0 -> neutral
    label, score = analyze_sentiment("good good but also a bug")
    assert label == "neutral"
    assert score == 0
