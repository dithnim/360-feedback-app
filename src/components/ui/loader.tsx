import "./loader.scss";

const Loader = ({ text }: { text: string }) => (
  <div id="modern-loader">
    <div className="loader-container">
      <svg className="loader-svg" viewBox="0 0 120 120">
        <circle 
          className="loader-track"
          cx="60" 
          cy="60" 
          r="54"
        />
        <circle 
          className="loader-progress"
          cx="60" 
          cy="60" 
          r="54"
        />
      </svg>
      <div className="loader-center">
        <div className="loader-dot"></div>
      </div>
    </div>
    <div className="loader-text">{text}</div>
  </div>
);

export default Loader;
