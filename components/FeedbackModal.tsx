'use client';

import React, { useState } from 'react';
import { X, Send, Star } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
  partyId?: string;
}

const CATEGORIES = ['UX', 'Wallet', 'Contract', 'Privacy', 'Docs', 'Feature'];

/**
 * FeedbackModal — Collects structured user feedback and submits to /api/feedback.
 * Addresses Level 5 requirement: Collecting structured user feedback.
 */
export default function FeedbackModal({
  isOpen,
  onClose,
  walletAddress,
  partyId,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !category || message.trim().length < 10) {
      setError('Please fill in all fields. Message must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          partyId,
          rating,
          category,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Submission failed');
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setCategory('');
    setMessage('');
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div
      className="feedback-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Feedback modal"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="feedback-modal">
        <button
          className="feedback-modal-close"
          onClick={handleClose}
          aria-label="Close feedback modal"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="feedback-success">
            <div className="feedback-success-icon">🎉</div>
            <h3>Thank you for your feedback!</h3>
            <p>Your input helps us improve NightPass for everyone.</p>
            <button className="feedback-btn-primary" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="feedback-header">
              <h2>Share Your Feedback</h2>
              <p>Help us improve NightPass — your input shapes the product.</p>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
              {/* Star Rating */}
              <div className="feedback-field">
                <label>Overall Rating</label>
                <div className="feedback-stars" role="group" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`feedback-star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                    >
                      <Star size={28} fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="feedback-field">
                <label htmlFor="feedback-category">Category</label>
                <div className="feedback-category-grid">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      id={`feedback-cat-${cat.toLowerCase()}`}
                      className={`feedback-category-btn ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="feedback-field">
                <label htmlFor="feedback-message">
                  Your Feedback
                  <span className="feedback-char-count">
                    {message.length}/500
                  </span>
                </label>
                <textarea
                  id="feedback-message"
                  className="feedback-textarea"
                  placeholder="Tell us about your experience with NightPass..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  rows={4}
                />
              </div>

              {error && (
                <div className="feedback-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="feedback-btn-primary"
                disabled={submitting || rating === 0 || !category}
                id="feedback-submit"
              >
                {submitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send size={16} />
                    Submit Feedback
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .feedback-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .feedback-modal {
          background: linear-gradient(135deg, #1a0a2e 0%, #160825 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 1.5rem;
          padding: 2rem;
          width: 100%;
          max-width: 480px;
          position: relative;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1);
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .feedback-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          padding: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .feedback-modal-close:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .feedback-header h2 {
          color: white;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
        }
        .feedback-header p {
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem;
          margin: 0 0 1.5rem;
        }
        .feedback-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .feedback-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .feedback-field label {
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .feedback-char-count {
          color: rgba(255,255,255,0.3);
          font-size: 0.75rem;
        }
        .feedback-stars {
          display: flex;
          gap: 0.25rem;
        }
        .feedback-star {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.2);
          padding: 0.2rem;
          transition: color 0.15s, transform 0.15s;
          display: flex;
        }
        .feedback-star:hover,
        .feedback-star.active {
          color: #f59e0b;
          transform: scale(1.1);
        }
        .feedback-category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .feedback-category-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          padding: 0.5rem;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        .feedback-category-btn:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
          color: white;
        }
        .feedback-category-btn.active {
          background: rgba(139, 92, 246, 0.25);
          border-color: rgba(139, 92, 246, 0.7);
          color: #a78bfa;
          font-weight: 600;
        }
        .feedback-textarea {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          color: white;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          resize: vertical;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .feedback-textarea:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.5);
        }
        .feedback-textarea::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .feedback-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.5rem;
          color: #fca5a5;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
        }
        .feedback-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border: none;
          border-radius: 0.75rem;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.875rem 1.5rem;
          transition: all 0.2s;
        }
        .feedback-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
        }
        .feedback-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .feedback-success {
          text-align: center;
          padding: 1.5rem 0;
        }
        .feedback-success-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .feedback-success h3 {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }
        .feedback-success p {
          color: rgba(255,255,255,0.5);
          margin: 0 0 1.5rem;
        }
      `}</style>
    </div>
  );
}
