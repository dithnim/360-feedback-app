import React from "react";
import "./CompetencyRatingSection.scss";

interface RatingData {
  rater: string;
  rating: number;
  color: string;
}

interface CompetencyRatingSectionProps {
  category: string;
  rating: number;
  outOf: number;
  description: string;
  ratings: RatingData[];
}

const CompetencyRatingSection: React.FC<CompetencyRatingSectionProps> = ({
  category,
  rating,
  outOf,
  description,
  ratings,
}) => {
  return (
    <div className="competency-rating-section">
      {/* Header with title and overall score */}
      <div className="competency-rating-header">
        <h3 className="competency-rating-title">{category}</h3>
        <div className="competency-rating-score">
          <span className="score-value">{rating.toFixed(2)}</span>
          <span className="score-divider"> / </span>
          <span className="score-max">{outOf}</span>
        </div>
      </div>

      {/* Description */}
      <p className="competency-rating-description">{description}</p>

      {/* Individual ratings */}
      <div className="competency-rating-bars">
        {ratings.map((ratingItem, index) => (
          <div key={index} className="rating-bar-item">
            <span className="rater-label">{ratingItem.rater}</span>
            <div className="rating-bar-container">
              <div className="rating-bar-wrapper">
                <div
                  className="rating-bar-fill"
                  style={{
                    width: `${(ratingItem.rating / outOf) * 100}%`,
                    backgroundColor: ratingItem.color,
                  }}
                />
              </div>
              <span className="rating-value-number">
                {Number(ratingItem.rating).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetencyRatingSection;
