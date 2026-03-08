import { useState } from 'react';

const ImageCarousel = ({ images = [] }) => {
  if (!images.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 h-[380px] flex items-center justify-center text-slate-500">
        No images uploaded yet.
      </div>
    );
  }

  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white">
      <img
        src={images[index]}
        alt="Property"
        className="w-full h-[260px] sm:h-[320px] md:h-[380px] object-cover"
      />
      {images.length > 1 && (
        <>
          <button type="button" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-xl">{'<'}</button>
          <button type="button" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-xl">{'>'}</button>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;