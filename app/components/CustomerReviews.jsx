"use client";

import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rating } from "@mui/material";
import { Heart, Share2, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

const list = [
  {
    name: "Nguyễn Long",
    message: "Bao đựng thẻ sinh viên nhìn ngoài đẹp hơn mong đợi, chất liệu chắc chắn và cầm rất thích.",
    rating: 5,
    badge: "Verified Buyer",
    imageLink: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    verified: true,
    company: "Tech Startup",
  },
  {
    name: "Khánh An",
    message: "Màu sắc đúng như mô tả, bề mặt không bị xước hay nhăn.",
    rating: 5,
    badge: "Top Reviewer",
    imageLink: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    verified: true,
    company: "Fashion Designer",
  },
  {
    name: "Đình Liêm",
    message: "Shop giao hàng rất nhanh, đóng gói cẩn thận và còn hỗ trợ tư vấn nhiệt tình.",
    rating: 5,
    badge: "Trusted Member",
    imageLink: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    verified: true,
    company: "Creative Director",
  },
  {
    name: "Minh Trí",
    message: "Hậu mãi cũng tốt, hỏi gì shop trả lời ngay.",
    rating: 5,
    badge: "VIP Customer",
    imageLink: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    verified: true,
    company: "Marketing Manager",
  },
  {
    name: "Trọng Phúc",
    message: "Sản phẩm tốt, đáng tiền. Mình hài lòng với trải nghiệm mua hàng.",
    rating: 5,
    badge: "Loyal Member",
    imageLink: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    verified: true,
    company: "Product Manager",
  },
];

// Smooth gradient background
const GradientBg = memo(() => (
  <div className="absolute inset-0 -z-20 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-purple-50" />
    <motion.div
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply blur-3xl opacity-20"
      animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply blur-3xl opacity-20"
      animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
));

GradientBg.displayName = "GradientBg";

// ...existing code...
const ReviewCard = memo(({ item, isActive, direction }) => {
  const [liked, setLiked] = useState(false);

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence initial={false} custom={direction} mode="wait">
      {isActive && (
        <motion.div
          key={item.name}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 backdrop-blur-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Left: Avatar and info */}
              <div className="flex flex-col items-center gap-4 flex-shrink-0">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <img
                    src={item.imageLink}
                    alt={item.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-center"
                >
                  <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                </motion.div>
              </div>

              {/* Right: Review content */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-2 mb-4"
                >
                  <Rating value={item.rating} precision={0.5} readOnly size="small" />
                  <span className="text-sm font-semibold text-gray-700">{item.rating}</span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-gray-700 leading-relaxed mb-6 text-lg"
                >
                  "{item.message}"
                </motion.p>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 flex-wrap"
                >
                  <button
                    onClick={() => setLiked(!liked)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 font-medium transition-colors"
                  >
                    <Heart
                      size={16}
                      fill={liked ? "currentColor" : "none"}
                      className="transition-all"
                    />
                    {liked ? "Liked" : "Like"}
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium transition-colors">
                    <MessageCircle size={16} />
                    Reply
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors">
                    <Share2 size={16} />
                    Share
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ReviewCard.displayName = "ReviewCard";
// ...existing code...

// Navigation dots
const NavigationDots = memo(({ currentIdx, total, onSelect }) => (
  <div className="flex gap-1.5 justify-center">
    {[...Array(total)].map((_, idx) => (
      <motion.button
        key={idx}
        onClick={() => onSelect(idx)}
        animate={{
          width: idx === currentIdx ? 32 : 8,
          backgroundColor: idx === currentIdx ? "#3b82f6" : "#d1d5db",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-2 rounded-full transition-all"
      />
    ))}
  </div>
));

NavigationDots.displayName = "NavigationDots";

// Main component
export default function CustomerReviews() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIdx((prev) => (prev + 1) % list.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIdx((prev) => (prev - 1 + list.length) % list.length);
  }, []);

  const handleDot = useCallback((idx) => {
    setDirection(idx > currentIdx ? 1 : -1);
    setCurrentIdx(idx);
  }, [currentIdx]);

  // Auto-advance carousel (optional)
  useEffect(() => {
    const timer = setTimeout(handleNext, 8000);
    return () => clearTimeout(timer);
  }, [currentIdx, handleNext]);

  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden">
      <GradientBg />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Khách hàng hài lòng
          </h2>
          <p className="text-gray-600 text-lg">
            Những đánh giá thực tế từ khách hàng đã sử dụng dịch vụ
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative h-80 md:h-96 mb-12"
        >
          <ReviewCard
            item={list[currentIdx]}
            isActive={true}
            direction={direction}
          />
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-6 md:gap-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div className="flex-1">
            <NavigationDots
              currentIdx={currentIdx}
              total={list.length}
              onSelect={handleDot}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10 text-gray-600 text-sm"
        >
          <span className="font-semibold text-blue-600">{currentIdx + 1}</span>
          <span> / {list.length}</span>
        </motion.div>
      </div>
    </section>
  );
}