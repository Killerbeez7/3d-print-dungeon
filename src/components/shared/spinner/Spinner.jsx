import './spinner.css';  // Import the spinner's CSS file

const Spinner = () => {
  return (
    <div className="loader relative w-12 h-12 rounded-full bg-transparent text-white transform rotate-45">
      <div className="absolute inset-0 loader-before"></div>
      <div className="absolute inset-0 loader-after"></div>
    </div>
  );
};

export default Spinner;