import React from 'react';
import Image from 'next/image';

const WelcomeSection = () => {
  return (
    <div className="relative hidden lg:block bg-gradient-to-br from-[#146C94] to-[#AFD3E2] h-screen">
      <div className="absolute inset-0 bg-[#146C94]/50">
        <Image
          src="/images/mockup/1.jpg" 
          alt="Background"
          className="w-full h-full object-cover opacity-50"
          width={1920}
          height={1080}
        />
      </div>
      
      <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-16">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Join Our Community  
          </h1>
          <p className="text-lg text-[#F6F1F1]">
            Create an account to start receiving better mental healthcare
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;