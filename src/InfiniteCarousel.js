import React from "react";
import ReactDOM from "react-dom";

const defaultData = {
  data: [
    {
      id: 1,
      name: "John Doe",
      image: "https://picsum.photos/800/400?random=1",
      description:
        "this is a great app that is very useful, and i love using it. i would recommend this to anyone who wants to be more productive.",
      jobTitle: "Senior Developer",
      company: "Google",
    },
    // ... rest of your data array
  ],
  style: {
    primaryText: "#000000",
    secondaryText: "#161616",
    slideWidth: 320,
    paddingsBetweenSlides: 16,
    borderRadius: 16,
  },
};

const InfiniteCarousel = ({ data = defaultData }) => {
  if (!data || data.data.length === 0) return null;

  const containerRef = (React.useRef < HTMLElement) | (null > null);
  const [mounted, setMounted] = React.useState(false);
  const [style, setStyle] = React.useState(data.style);
  React.useEffect(() => {
    containerRef.current = document.getElementById("slidecontainer");
    setMounted(true);
    setStyle(data.style);
    return () => setMounted(false);
  }, []);

  const [currentIndex, setCurrentIndex] = React.useState(data.data.length);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Create array with duplicated items for infinite effect
  const extendedData = [...data.data, ...data.data, ...data.data];

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  React.useEffect(() => {
    const nextButton = document.getElementById("nextslide");
    const prevButton = document.getElementById("previousslide");

    nextButton?.addEventListener("click", handleNext);
    prevButton?.addEventListener("click", handlePrev);

    return () => {
      nextButton?.removeEventListener("click", handleNext);
      prevButton?.removeEventListener("click", handlePrev);
    };
  }, [isTransitioning]); // Include isTransitioning in dependencies since handlers use it

  React.useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);
      // Reset position without animation when reaching the boundaries
      if (currentIndex >= data.data.length * 2) {
        setCurrentIndex(data.data.length);
      } else if (currentIndex < data.data.length) {
        setCurrentIndex(data.data.length * 2 - 1);
      }
    }, 500); // Match this with transition duration

    return () => clearTimeout(timer);
  }, [currentIndex, data.data.length, isTransitioning]);

  const carouselContent = (
    <div className="flex flex-col items-center gap-4">
      <div className={`flex w-full h-fit overflow-visible`}>
        <div
          className={`flex h-full gap-4 ${
            isTransitioning
              ? "transition-transform duration-500 ease-in-out"
              : ""
          }`}
          style={{
            transform: `translateX(-${
              currentIndex * (style.slideWidth + style.paddingsBetweenSlides)
            }px)`,
          }}
        >
          {extendedData.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              style={{
                minWidth: style?.slideWidth ? `${style.slideWidth}px` : "500px",
              }}
              className={`flex flex-col gap-4 justify-between min-h-full p-6 border-2 border-red-500 rounded-lg bg-white ${
                !style?.slideWidth ? "min-w-[500px]" : ""
              }`}
            >
              <p>{item.description}</p>
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col">
                  <p>{item.name}</p>
                  <p>{item.jobTitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return mounted && containerRef.current && style
    ? ReactDOM.createPortal(carouselContent, containerRef.current)
    : null;
};

if (typeof window !== "undefined") {
  window.initInfiniteCarousel = (containerId, customData) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const root = ReactDOM.createRoot(container);
    root.render(
      React.createElement(InfiniteCarousel, { data: customData || defaultData })
    );
  };
}

export default InfiniteCarousel;
