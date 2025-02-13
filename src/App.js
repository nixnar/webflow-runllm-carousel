import React from "react";
import "./style.css";

const App = () => {
  // Initialize state to store testimonials
  const [testimonials, setTestimonials] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Calculate base width based on viewport
  const getBaseWidth = () => {
    if (typeof window === "undefined") return 28.5 * 16; // Default for SSR
    if (window.innerWidth <= 500) {
      return 20 * 16; // 22rem in pixels for mobile
    } else if (window.innerWidth <= 980) {
      return 25 * 16; // 25rem in pixels for tablet
    }
    return 28.5 * 16; // 28.5rem in pixels for desktop
  };

  const [baseWidth, setBaseWidth] = React.useState(getBaseWidth());

  // Load testimonials using MutationObserver
  React.useEffect(() => {
    const getTestimonials = () => {
      if (window.webflowCmsData?.testimonials) {
        const testimonialsData = window.webflowCmsData.testimonials;
        console.log("Found testimonials:", testimonialsData);
        setTestimonials(testimonialsData);
        setCurrentIndex(testimonialsData.length); // Start from middle set
        return true;
      }
      return false;
    };

    if (getTestimonials()) return;

    const observer = new MutationObserver(() => {
      if (getTestimonials()) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Update width on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setBaseWidth(getBaseWidth());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add effect to log state changes
  React.useEffect(() => {
    console.log("Current state:", {
      testimonials: testimonials,
      currentIndex: currentIndex,
      isAnimating: isAnimating,
    });
  }, [testimonials, currentIndex, isAnimating]);

  // Handle slide controls after testimonials are loaded
  React.useEffect(() => {
    if (!testimonials.length) return;

    const handleNext = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex((prev) => prev - 1);
    };

    const nextButton = document.getElementById("slideright");
    const prevButton = document.getElementById("slideleft");

    nextButton?.addEventListener("click", handleNext);
    prevButton?.addEventListener("click", handlePrev);

    return () => {
      nextButton?.removeEventListener("click", handleNext);
      prevButton?.removeEventListener("click", handlePrev);
    };
  }, [testimonials.length, isAnimating]);

  // Handle infinite scroll snap
  React.useEffect(() => {
    if (!isAnimating) return;

    const timer = setTimeout(() => {
      setIsAnimating(false);
      // Reset position without animation when reaching the boundaries
      if (currentIndex >= testimonials.length * 2) {
        setCurrentIndex(testimonials.length);
      } else if (currentIndex <= 0) {
        setCurrentIndex(testimonials.length);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex, testimonials.length, isAnimating]);

  if (!testimonials.length) {
    console.log("Waiting for testimonials to load...");
    return <div>Loading testimonials...</div>;
  }

  // Create array with three complete sets for infinite effect
  const extendedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  const gap = 40; // 40px gap
  const slideWidth = baseWidth + gap;
  const translateX = -(currentIndex * slideWidth);

  console.log("Slide calculations:", {
    baseWidth,
    gap,
    slideWidth,
    translateX,
    currentIndex,
    totalSlides: extendedTestimonials.length,
    visibleSlides: testimonials.length,
    viewport: window.innerWidth,
  });

  return (
    <div className="tailwind w-fit relative">
      <div
        id="testimonialContainer"
        className="flex w-fit gap-10 overflow-visible"
      >
        <div
          style={{
            transform: `translateX(${translateX}px)`,
            transition: isAnimating ? "transform 500ms ease-in-out" : "none",
            display: "flex",
            gap: "40px",
          }}
        >
          {extendedTestimonials.map((testimonial, index) => (
            <div
              key={`${index}-${testimonial.description.substring(0, 10)}`}
              className="bg-white rounded-2xl flex flex-col justify-between p-8 w-[28.5rem] max-h-[38rem] h-[28rem] max-[980px]:max-w-[25rem] max-[980px]:min-h-[30rem] max-[500px]:max-w-[20rem] max-[500px]:min-h-[35rem]"
            >
              <div className="flex flex-col gap-4">
                {testimonial.logoURL && (
                  <div className="h-8">
                    <img
                      src={testimonial.logoURL}
                      alt="Company Logo"
                      className="h-full w-auto"
                    />
                  </div>
                )}
                <p className="text-pretty">{testimonial.description}</p>
              </div>
              <div className="flex w-full items-center justify-start gap-4">
                {testimonial.photoURL && (
                  <div className="h-16 w-16 flex-shrink-0">
                    <img
                      src={testimonial.photoURL}
                      alt={testimonial.person}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h3 className="font-extrabold">{testimonial.person}</h3>
                  <div className="flex flex-wrap">
                    {testimonial.company && (
                      <p className="text-nowrap">{testimonial.company}</p>
                    )}
                    {testimonial.company && testimonial.jobTitle && (
                      <p>, &nbsp;</p>
                    )}
                    {testimonial.jobTitle && (
                      <p className="text-ellipsis">{testimonial.jobTitle}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
