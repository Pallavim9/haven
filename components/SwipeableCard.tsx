"use client";

import { motion, useMotionValue, useTransform, PanInfo, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ApartmentListing, Review } from "@/lib/data";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useUser } from "@/contexts/UserContext";
import { generateAnonymousNickname } from "@/lib/nicknames";

// Dynamically import the map component to avoid SSR issues
const MapView = dynamic(() => import("./MapView"), { ssr: false });

interface SwipeableCardProps {
  listing: ApartmentListing;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
  total: number;
  triggerSwipe?: "left" | "right" | null;
  isTriggeredCard?: boolean;
}

export default function SwipeableCard({
  listing,
  onSwipe,
  index,
  total,
  triggerSwipe,
  isTriggeredCard = false,
}: SwipeableCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [pendingSwipe, setPendingSwipe] = useState<"left" | "right" | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(() => {
    // Load reviews from localStorage
    const storedReviews = localStorage.getItem(`haven_listing_reviews_${listing.id}`);
    return storedReviews ? JSON.parse(storedReviews) : (listing.reviews || []);
  });
  const cardContentRef = useRef<HTMLDivElement>(null);
  const { hasReviewedListing, markListingAsReviewed, user } = useUser();
  const hasReviewed = hasReviewedListing(listing.id);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Swipe direction indicators
  const likeOpacity = useTransform(x, [0, 200], [0, 1]);
  const nopeOpacity = useTransform(x, [-200, 0], [1, 0]);

  // Trigger swipe animation when triggerSwipe prop changes
  useEffect(() => {
    if (triggerSwipe && isTriggeredCard && !hasTriggered && exitX === 0) {
      const direction = triggerSwipe === "right" ? 200 : -200;
      setHasTriggered(true);
      setExitX(direction);
      setPendingSwipe(triggerSwipe);
      // Animate the x motion value smoothly
      animate(x, direction, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
      // Call onSwipe early so state updates happen in parallel with animation
      // This allows the next card to start scaling up while current card animates out
      // Small delay ensures animation has started before state updates
      setTimeout(() => {
        onSwipe(triggerSwipe);
      }, 50); // Reduced delay for faster state updates
    }
  }, [triggerSwipe, isTriggeredCard, onSwipe, x, exitX, hasTriggered]);

  // Reset hasTriggered when card changes
  useEffect(() => {
    if (index !== 0) {
      setHasTriggered(false);
      setExitX(0);
      x.set(0);
      setImageIndex(0);
      setImageError(false);
      setPendingSwipe(null);
    }
  }, [index, x]);

  // Reset image error when image index changes
  useEffect(() => {
    setImageError(false);
  }, [imageIndex]);

  // Geocode address when card becomes visible (index === 0)
  useEffect(() => {
    if (index === 0 && !coordinates && !isGeocoding) {
      setIsGeocoding(true);
      // Geocode the address using Nominatim
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listing.address)}&limit=1`,
        {
          headers: {
            "User-Agent": "Haven App"
          }
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          }
        })
        .catch((error) => {
          console.error("Error geocoding address:", error);
        })
        .finally(() => {
          setIsGeocoding(false);
        });
    }
  }, [index, listing.address, coordinates, isGeocoding]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 200 : -200);
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  if (index >= total) return null;

  // Scale and offset for cards behind the top card
  const scale = index === 0 ? 1 : 0.95;
  const yOffset = index === 0 ? 0 : 8;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        x,
        rotate,
        opacity,
        zIndex: total - index,
        pointerEvents: index === 0 ? "auto" : "none",
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      dragDirectionLock
      onDragEnd={handleDragEnd}
      animate={{
        x: exitX,
        opacity: exitX !== 0 ? 0 : 1,
        scale: scale,
        y: yOffset,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      onAnimationComplete={() => {
        // Clear pending swipe after animation completes
        if (pendingSwipe) {
          setPendingSwipe(null);
        }
      }}
      initial={false}
    >
      <div className="w-full max-w-md mx-auto h-full">
        <div
          ref={cardContentRef}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-y-auto overscroll-contain h-full scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Image Carousel */}
          <div className="relative h-96 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            {!imageError && listing.images[imageIndex] ? (
              <Image
                src={listing.images[imageIndex]}
                alt={listing.title}
                fill
                className="object-cover"
                priority={index === 0}
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-indigo-400 dark:text-indigo-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    {listing.title}
                  </p>
                </div>
              </div>
            )}

            {/* Image Indicators */}
            {listing.images.length > 1 && (
              <>
                <div className="absolute top-4 left-4 right-4 flex gap-2">
                  {listing.images.map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full ${i === imageIndex ? "bg-white" : "bg-white/50"
                        }`}
                    />
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Swipe Direction Overlays */}
            {index === 0 && (
              <>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ opacity: likeOpacity }}
                >
                  <div className="px-8 py-4 bg-green-500/90 text-white rounded-full text-4xl font-bold border-4 border-white shadow-2xl">
                    LIKE
                  </div>
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ opacity: nopeOpacity }}
                >
                  <div className="px-8 py-4 bg-red-500/90 text-white rounded-full text-4xl font-bold border-4 border-white shadow-2xl">
                    NOPE
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{listing.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{listing.address}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${listing.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">/month</div>
              </div>
            </div>

            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
              <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{listing.sqft.toLocaleString()} sqft</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{listing.description}</p>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {listing.amenities.slice(0, 4).map((amenity, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
              {listing.amenities.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                  +{listing.amenities.length - 4} more
                </span>
              )}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Available from {new Date(listing.availableFrom).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            {/* Rating Section */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating</h3>
              <div className="flex items-center gap-4 mb-4">
                {user && !hasReviewed && (
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setUserRating(star);
                          // Save rating immediately
                          const ratingData = {
                            listingId: listing.id,
                            rating: star,
                            userId: user.username,
                            date: new Date().toISOString(),
                          };
                          localStorage.setItem(`haven_rating_${listing.id}_${user.username}`, JSON.stringify(ratingData));
                          markListingAsReviewed(listing.id);
                        }}
                        className="focus:outline-none"
                        aria-label={`Rate ${star} stars`}
                      >
                        <svg
                          className={`w-6 h-6 ${star <= userRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                            }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
                {listing.averageRating && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{listing.averageRating.toFixed(1)}</span>
                    {listing.totalRatings && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {" "}({listing.totalRatings} {listing.totalRatings === 1 ? "rating" : "ratings"})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h3>
                {user && !hasReviewed && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    {showReviewForm ? "Cancel" : "Write Review"}
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && user && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none"
                          aria-label={`Rate ${star} stars`}
                        >
                          <svg
                            className={`w-5 h-5 ${star <= userRating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                              }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Post as anonymous
                    </label>
                  </div>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                    rows={3}
                  />
                  <button
                    onClick={() => {
                      if (userRating > 0 && userReview.trim() && !hasReviewed) {
                        const newReview: Review = {
                          id: Date.now().toString(),
                          userName: isAnonymous ? generateAnonymousNickname() : user.username,
                          rating: userRating,
                          comment: userReview,
                          date: new Date().toISOString(),
                        };
                        const updatedReviews = [...reviews, newReview];
                        setReviews(updatedReviews);

                        // Store reviews in localStorage
                        const listingReviews = localStorage.getItem(`haven_listing_reviews_${listing.id}`);
                        const allReviews: Review[] = listingReviews ? JSON.parse(listingReviews) : [];
                        allReviews.push(newReview);
                        localStorage.setItem(`haven_listing_reviews_${listing.id}`, JSON.stringify(allReviews));

                        // Mark listing as reviewed
                        markListingAsReviewed(listing.id);

                        setUserReview("");
                        setUserRating(0);
                        setIsAnonymous(false);
                        setShowReviewForm(false);
                      }
                    }}
                    disabled={userRating === 0 || !userReview.trim() || hasReviewed}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{review.userName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${star <= review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
              )}
            </div>

            {/* Map Section */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h3>
              {isGeocoding ? (
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
                  </div>
                </div>
              ) : coordinates ? (
                <div className="h-64 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700">
                  <MapView
                    lat={coordinates.lat}
                    lng={coordinates.lng}
                    address={listing.address}
                  />
                </div>
              ) : (
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm">Unable to load map</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

