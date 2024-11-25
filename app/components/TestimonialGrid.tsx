import React from 'react';
import Image from 'next/image';
import { Quote } from 'lucide-react';

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Tarik Celik',
    role: 'Twitch Streamer',
    quote: "Tarik doesn't use tinypm... yet!",
    image: '/images/people/tarikcelik.jpeg',
  },
  {
    name: 'Zach Sims',
    role: 'Founder',
    quote:
      'I was tired of the complexity of other link-in-bio tools. tiny.pm is simple and powerful.',
    image: '/images/people/zsims.jpeg',
  },
  {
    name: 'ConnorJC',
    role: 'Beatsaber Mapper',
    quote: 'Clean design and powerful analytics. Exactly what I needed.',
    image: '/images/people/connorjc.jpg',
  },
  {
    name: 'You!',
    role: 'TinyPM User',
    quote: 'TinyPM is whatever you need it to be!',
    image: '/images/people/user.png',
  },
];

export default function TestimonialGrid() {
  return (
    <section className="bg-[#FFE566] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 inline-block rounded-full bg-black px-6 py-2 text-lg font-medium text-[#FFCC00]">
            Creator Stories
          </h2>
          <p className="mb-12 text-3xl font-bold text-black">
            Join thousands of creators who trust tiny.pm
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="group relative rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Decorative corner elements */}
              <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-black" />
              <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-black" />
              <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-black" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-black" />

              {/* Quote icon */}
              <div className="absolute -right-3 -top-3 rounded-full bg-[#FFCC00] p-2 shadow-lg transition-transform group-hover:rotate-12">
                <Quote className="h-4 w-4 text-black" />
              </div>

              <div className="mb-6 flex w-full items-center gap-4">
                <div className="relative h-16 w-16 transform overflow-hidden rounded-lg border-2 border-black transition-transform group-hover:rotate-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    layout="fill"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-black">{testimonial.name}</span>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/60">
                    {testimonial.role}
                  </span>
                </div>
              </div>

              <p className="text-left text-lg italic text-black/80">
                {'"'}
                {testimonial.quote}
                {'"'}
              </p>

              {/* Yellow accent bar */}
              <div className="absolute bottom-0 left-6 right-6 h-1 transform bg-[#FFCC00] transition-all group-hover:scale-x-110" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
