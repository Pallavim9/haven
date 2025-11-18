"use client";

import { ApartmentListing, Review } from "@/lib/data";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import DarkModeToggle from "./DarkModeToggle";
import HavenLogo from "./HavenLogo";
import { useUser } from "@/contexts/UserContext";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapView = dynamic(() => import("./MapView"), { ssr: false });

interface LikedListingsProps {
  likedListings: ApartmentListing[];
  onBack: () => void;
  onRemoveLike: (listingId: string) => void;
}

export default function LikedListings({ likedListings, onBack, onRemoveLike }: LikedListingsProps) {
  const { logOut } = useUser();
  const [selectedListing, setSelectedListing] = useState<ApartmentListing | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const cardContentRef = useRef<HTMLDivElement>(null);

  // Geocode address when listing is selected
  useEffect(() => {
    if (selectedListing && !coordinates && !isGeocoding) {
      setIsGeocoding(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(selectedListing.address)}&limit=1`,
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
  }, [selectedListing, coordinates, isGeocoding]);

  // Reset coordinates and load reviews when listing changes
  useEffect(() => {
    if (selectedListing) {
      setCoordinates(null);
      setImageIndex(0);
      setImageError(false);
      // Load reviews from localStorage
      const storedReviews = localStorage.getItem(`haven_listing_reviews_${selectedListing.id}`);
      setReviews(storedReviews ? JSON.parse(storedReviews) : []);
    }
  }, [selectedListing?.id]);

  if (likedListings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <HavenLogo size="sm" showAnimation={false} />
              <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Haven</h1>
            </div>
            <div className="flex gap-4 items-center">
              <DarkModeToggle />
              <button
                onClick={onBack}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Back to Swiping
              </button>
              <button
                onClick={() => {
                  logOut();
                  onBack();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              No liked listings yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start swiping to like apartments you&apos;re interested in!
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start Swiping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedListing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedListing(null)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
            <div className="flex items-center gap-3">
              <HavenLogo size="sm" showAnimation={false} />
              <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Haven</h1>
            </div>
            <div className="flex gap-4 items-center">
              <DarkModeToggle />
              <button
                onClick={() => {
                  logOut();
                  setSelectedListing(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>

          <div 
            ref={cardContentRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-y-auto overscroll-contain scrollbar-hide h-[calc(100vh-8rem)]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Image Carousel */}
            <div className="relative h-96 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {!imageError && selectedListing.images[imageIndex] ? (
                <Image
                  src={selectedListing.images[imageIndex]}
                  alt={selectedListing.title}
                  fill
                  className="object-cover"
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
                      {selectedListing.title}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedListing.images.length > 1 && (
                <>
                  <div className="absolute top-4 left-4 right-4 flex gap-2">
                    {selectedListing.images.map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full ${
                          i === imageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => {
                      setImageIndex((prev) => (prev - 1 + selectedListing.images.length) % selectedListing.images.length);
                      setImageError(false);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setImageIndex((prev) => (prev + 1) % selectedListing.images.length);
                      setImageError(false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Details */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedListing.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{selectedListing.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${selectedListing.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">/month</div>
                </div>
              </div>

              <div className="flex gap-4 text-lg text-gray-600 dark:text-gray-300 mb-6">
                <span>{selectedListing.bedrooms} bed{selectedListing.bedrooms !== 1 ? "s" : ""}</span>
                <span>•</span>
                <span>{selectedListing.bathrooms} bath{selectedListing.bathrooms !== 1 ? "s" : ""}</span>
                <span>•</span>
                <span>{selectedListing.sqft.toLocaleString()} sqft</span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">{selectedListing.description}</p>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedListing.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  <span className="font-semibold">Available from:</span>{" "}
                  {new Date(selectedListing.availableFrom).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <button
                  onClick={() => {
                    onRemoveLike(selectedListing.id);
                    setSelectedListing(null);
                  }}
                  className="w-full px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove from Liked
                </button>
              </div>

              {/* Rating Section */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating</h3>
                <div className="flex items-center gap-4 mb-4">
                  {/* Calculate average rating from reviews */}
                  {reviews.length > 0 ? (
                    <>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                          return (
                            <svg
                              key={star}
                              className={`w-6 h-6 ${
                                star <= Math.round(avgRating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          );
                        })}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">{(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {" "}({reviews.length} {reviews.length === 1 ? "rating" : "ratings"})
                        </span>
                      </div>
                    </>
                  ) : selectedListing.averageRating ? (
                    <>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-6 h-6 ${
                              star <= Math.round(selectedListing.averageRating || 0)
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
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">{selectedListing.averageRating.toFixed(1)}</span>
                        {selectedListing.totalRatings && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}({selectedListing.totalRatings} {selectedListing.totalRatings === 1 ? "rating" : "ratings"})
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No ratings yet.</p>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h3>
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
                                    className={`w-4 h-4 ${
                                      star <= review.rating
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
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet.</p>
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
                      address={selectedListing.address}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <HavenLogo size="sm" showAnimation={false} />
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Haven</h1>
          </div>
          <div className="flex gap-4 items-center">
            <DarkModeToggle />
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Back to Swiping
            </button>
            <button
              onClick={() => {
                logOut();
                onBack();
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Liked Listings ({likedListings.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Apartments you&apos;ve swiped right on</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likedListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative group"
            >
              <div
                onClick={() => {
                  setSelectedListing(listing);
                  setImageIndex(0);
                  setImageError(false);
                }}
                className="cursor-pointer"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                      <svg
                        className="w-8 h-8 text-indigo-400 dark:text-indigo-300"
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
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{listing.title}</h3>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${listing.price.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-1">{listing.address}</p>
                  <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>{listing.bedrooms} bed</span>
                    <span>•</span>
                    <span>{listing.bathrooms} bath</span>
                    <span>•</span>
                    <span>{listing.sqft.toLocaleString()} sqft</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {listing.amenities.slice(0, 2).map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                    {listing.amenities.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        +{listing.amenities.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLike(listing.id);
                }}
                className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove from liked"
                title="Remove from liked"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

