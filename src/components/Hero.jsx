import React from 'react';
import { Typewriter } from 'react-simple-typewriter';
import onlineTestImage from '../Assets/Online test-amico.png'

const Hero = () => {
  return (
    <div className="bg-[#DDE8F0] text-[#004581] py-16">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center px-6 gap-8">
        {/* Left Section: Text */}
        <div className="text-left flex-1 ">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Ace Your Exams with Adaptive MCQ Practice
          </h1>

          {/* Subheadline */}
          <p className="mt-4 text-lg md:text-xl leading-relaxed">
            Achieve top results with custom MCQs, real-time progress tracking,
            and tailored study plans for Sri Lanka’s most important exams such as,
          </p>

          {/* Animated Text */}
          <div className="text-[#018ABD] font-semibold text-xl md:text-2xl mt-4 ">
            <Typewriter
              words={['O/Ls', 'A/Ls', 'Grade 5 Scholarships']}
              loop={5}
              cursor
              cursorStyle="|"
              typeSpeed={100}
              deleteSpeed={70}
              delaySpeed={1000}
            />
          </div>

          {/* Button */}
          <button className="bg-[#018ABD] text-white font-semibold py-3 px-6 mt-6 rounded-full hover:bg-[#004581] transition duration-300">
            REGISTER
          </button>
        </div>

        {/* Right Section: Image */}
        <div className="hidden md:block flex-1  items-end ">
          <img
            src={onlineTestImage}
            alt="Illustration"
            className="w-auto h-auto max-w-[500px] object-contain pt-0 "
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;