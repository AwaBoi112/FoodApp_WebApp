import { useState } from "react";
import { Star } from "lucide-react";
import { createReview } from "../services/api";

// star rating form for one delivered order
function ReviewForm({ orderId, onSaved }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // send the review
  async function handleSubmit(event) {
    event.preventDefault();

    if (rating === 0) {
      setError("Válassz csillagot.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createReview({ orderId, rating, comment: comment.trim() });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <strong>Hogy ízlett?</strong>

      <div className="star-row">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            key={value}
            className="star-button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${value} csillag`}
          >
            <Star
              size={26}
              fill={value <= (hover || rating) ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>

      <input
        className="review-input"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Megjegyzés (nem kötelező)"
        maxLength={250}
      />

      {error && <p className="auth-error">{error}</p>}

      <button className="primary-button" type="submit" disabled={saving}>
        {saving ? "Küldés..." : "Értékelés küldése"}
      </button>
    </form>
  );
}

export default ReviewForm;