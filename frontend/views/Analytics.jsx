import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { BarChart3, TrendingUp, Users, DollarSign, Smile, Frown, Meh, MessageSquare } from "lucide-react";

const Analytics = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const { colors, mode } = useTheme();

  const [formData, setFormData] = useState({
    logoQuality: "",
    videoQuality: "",
    generationTime: "",
    schedulingExperience: "",
    comments: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [sentimentStats, setSentimentStats] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    total: 0
  });

  const fetchSentimentStats = async () => {
    try {
      const resp = await fetch("http://localhost:5000/api/sentiment-stats");
      if (resp.ok) {
        const data = await resp.json();
        setSentimentStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch sentiment stats", e);
    }
  };

  useEffect(() => {
    fetchSentimentStats();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackResponse(null);

    try {
      const response = await fetch("http://localhost:5000/api/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFeedbackResponse({ type: "success", message: data.message, sentiment: data.sentiment });
        setFormData({
          logoQuality: "",
          videoQuality: "",
          generationTime: "",
          schedulingExperience: "",
          comments: ""
        });
        // Refresh metrics after a successful submit
        fetchSentimentStats();
      } else {
        setFeedbackResponse({ type: "error", message: data.error || "Failed to submit feedback" });
      }
    } catch (error) {
      setFeedbackResponse({ type: "error", message: "Server error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const stats = [
    { icon: MessageSquare, label: "Total Feedback", value: sentimentStats.total.toString(), color: "#3B82F6" },
    { icon: Smile, label: "Positive Feedback", value: `${getPercentage(sentimentStats.positive, sentimentStats.total)}%`, color: "#10B981" },
    { icon: Frown, label: "Negative Feedback", value: `${getPercentage(sentimentStats.negative, sentimentStats.total)}%`, color: "#EF4444" },
    { icon: Meh, label: "Neutral Feedback", value: `${getPercentage(sentimentStats.neutral, sentimentStats.total)}%`, color: "#F59E0B" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg1,
      color: colors.text1,
      display: "flex",
      flexDirection: "column"
    }}>
      <Navbar onNavigate={onNavigate} />

      <div style={{
        flex: 1,
        maxWidth: 1200,
        width: "100%",
        margin: "0 auto",
        padding: "60px 20px",
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 40 }}>
          Analytics Dashboard
        </h1>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 24,
          marginBottom: 40,
        }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  background: mode === "dark" 
                    ? "rgba(255, 255, 255, 0.05)" 
                    : "rgba(0, 0, 0, 0.02)",
                  border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 16,
                  gap: 12,
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: stat.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Icon size={24} color="white" />
                  </div>
                  <span style={{ fontSize: 14, opacity: 0.7 }}>{stat.label}</span>
                </div>
                <p style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Visual Sentiment Chart Bar */}
        {sentimentStats.total > 0 && (
          <div style={{
            background: mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#fff",
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            borderRadius: 16,
            padding: 32,
            marginBottom: 40,
            boxShadow: mode === "dark" ? "none" : "0 4px 6px rgba(0,0,0,0.02)"
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Overall Sentiment Distribution</h3>
            
            {/* The Stacked Bar */}
            <div style={{ 
              width: "100%", height: 36, borderRadius: 18, 
              display: "flex", overflow: "hidden", marginBottom: 16 
            }}>
              <div style={{ width: `${getPercentage(sentimentStats.positive, sentimentStats.total)}%`, background: "#10B981", transition: "width 0.5s ease" }} />
              <div style={{ width: `${getPercentage(sentimentStats.neutral, sentimentStats.total)}%`, background: "#F59E0B", transition: "width 0.5s ease" }} />
              <div style={{ width: `${getPercentage(sentimentStats.negative, sentimentStats.total)}%`, background: "#EF4444", transition: "width 0.5s ease" }} />
            </div>

            {/* Scale legend */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, opacity: 0.8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981" }} /> Positive ({sentimentStats.positive})
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} /> Neutral ({sentimentStats.neutral})
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} /> Negative ({sentimentStats.negative})
              </div>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        <div style={{
          background: mode === "dark"
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 16,
          padding: 40,
        }}>
          <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Platform Feedback</h3>
          <p style={{ opacity: 0.8, marginBottom: 32 }}>
            We would love to hear about your experience with SmartAds to help us improve our services.
          </p>

          <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {feedbackResponse && (
              <div style={{
                padding: 16,
                borderRadius: 8,
                background: feedbackResponse.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: feedbackResponse.type === "success" ? "#10B981" : "#EF4444",
                border: `1px solid ${feedbackResponse.type === "success" ? "#10B981" : "#EF4444"}`
              }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{feedbackResponse.message}</p>
                {feedbackResponse.sentiment && (
                  <p style={{ margin: "4px 0 0", fontSize: "14px", opacity: 0.9 }}>
                    Sentiment analysis result: <strong>{feedbackResponse.sentiment}</strong>
                  </p>
                )}
              </div>
            )}
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
              {/* Logo Quality */}
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Logo Generation Quality</label>
                <select 
                  name="logoQuality"
                  value={formData.logoQuality}
                  onChange={handleInputChange}
                  style={{ 
                  width: "100%", padding: "12px", borderRadius: 8, 
                  background: mode === "dark" ? "rgba(0,0,0,0.2)" : "#fff", 
                  border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`, 
                  color: colors.text1 
                }}>
                  <option value="">Select rating</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              
              {/* Video Quality */}
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Video Generation Quality</label>
                <select 
                  name="videoQuality"
                  value={formData.videoQuality}
                  onChange={handleInputChange}
                  style={{ 
                  width: "100%", padding: "12px", borderRadius: 8, 
                  background: mode === "dark" ? "rgba(0,0,0,0.2)" : "#fff", 
                  border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`, 
                  color: colors.text1 
                }}>
                  <option value="">Select rating</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              {/* Time Generation */}
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Generation Time (Speed)</label>
                <select 
                  name="generationTime"
                  value={formData.generationTime}
                  onChange={handleInputChange}
                  style={{ 
                  width: "100%", padding: "12px", borderRadius: 8, 
                  background: mode === "dark" ? "rgba(0,0,0,0.2)" : "#fff", 
                  border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`, 
                  color: colors.text1 
                }}>
                  <option value="">Select rating</option>
                  <option value="very_fast">Very Fast</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="slow">Slow</option>
                  <option value="too_slow">Too Slow</option>
                </select>
              </div>

              {/* Scheduling */}
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Scheduling Experience</label>
                <select 
                  name="schedulingExperience"
                  value={formData.schedulingExperience}
                  onChange={handleInputChange}
                  style={{ 
                  width: "100%", padding: "12px", borderRadius: 8, 
                  background: mode === "dark" ? "rgba(0,0,0,0.2)" : "#fff", 
                  border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`, 
                  color: colors.text1 
                }}>
                  <option value="">Select rating</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            {/* Additional Comments */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Additional Comments & Suggestions</label>
              <textarea 
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows="4" 
                placeholder="Tell us what you liked or how we can improve..."
                style={{ 
                  width: "100%", padding: "12px", borderRadius: 8, 
                  background: mode === "dark" ? "rgba(0,0,0,0.2)" : "#fff", 
                  border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`, 
                  color: colors.text1, resize: "vertical", fontFamily: "inherit"
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: 8,
                padding: "14px 32px",
                background: isSubmitting ? "#a78bfa" : "#7C3AED",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                width: "fit-content"
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Analytics;
