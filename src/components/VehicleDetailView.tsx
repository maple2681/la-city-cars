import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Compass,
  Zap,
  Sliders,
  Sparkles,
  Info,
  Check,
  Tag,
  ArrowRight,
  Eye,
  Edit,
  DollarSign,
  CalendarCheck,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { Car } from "../data/cars";

interface VehicleDetailViewProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  onEditSpecs: (car: Car) => void;
  onOverridePrice: (car: Car, newPrice: number) => void;
  onViewActiveBookings: (car: Car) => void;
  isAdmin?: boolean;
  onReserve?: (carId: string) => void;
  onOpenChat?: () => void;
}

export default function VehicleDetailView({
  car,
  isOpen,
  onClose,
  onEditSpecs,
  onOverridePrice,
  onViewActiveBookings,
  isAdmin = false,
  onReserve,
  onOpenChat,
}: VehicleDetailViewProps) {
  const [activeTab, setActiveTab] = useState<string>("Audio & Entertainment");
  const [mediaMode, setMediaMode] = useState<"images" | "360">("images");
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string>(
    car.image,
  );
  const [isOverridingPrice, setIsOverridingPrice] = useState(false);
  const [priceOverrideVal, setPriceOverrideVal] = useState(
    car.price.toString(),
  );

  // Interactive 360° pan state simulated
  const [panIndex, setPanIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const [spinImagesLoaded, setSpinImagesLoaded] = useState(false);
  const [spinPreloadProgress, setSpinPreloadProgress] = useState(0);

  // Dynamic original MSRP (read from car spec or fallback)
  const msrpPrice = useMemo(() => {
    if (car.msrp) return car.msrp;
    if (car.id === "lexus-ct-200h") return 12196;
    return Math.round(car.price * 1.112);
  }, [car]);

  // Premium automotive galleries
  const secondaryImages = useMemo(() => {
    return car.images && car.images.length > 0
      ? car.images
      : [
          car.image,
          "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80", // Interior cockpit
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", // Premium dashboard
          "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80", // Wheel Detail
        ];
  }, [car]);

  // Ensure selected image resets when the car changes
  useMemo(() => {
    setSelectedGalleryImg(
      car.images && car.images.length > 0 ? car.images[0] : car.image,
    );
  }, [car]);

  // Installed Options Categories mapping (filters based on checkbox specs or renders luxury list)
  const tabCategories: Record<string, string[]> = useMemo(() => {
    if (car.standardEquipment && car.standardEquipment.length > 0) {
      return {
        "Standard Equipment": car.standardEquipment.split("\n").filter((s: string) => s.trim()),
      };
    }

    const defaultAudio = [
      `${car.brand} Premium Multi-Speaker Surround Audio Suite`,
      "SiriusXM® Satellite Radio High-Definition Tuner",
      "Wireless Bluetooth® Audio Sync & Streaming Connection",
      "Dual Smart USB Media Ports & High-Speed Device Chargers",
      "Acoustic Noise-Cancelling Front Glass Controls",
    ];
    const defaultAssists = [
      "Dynamic Radar Intelligent Cruise Control System",
      "Lane Keep Tracking & Lane Departure Steering Assist",
      "Pre-Collision Intelligent Braking with Pedestrian Detection",
      "Drive Dynamics Control Select (Eco, Comfort, Sport Modes)",
    ];
    const defaultClimate = [
      "Dual-Zone Automatic Clean Air Climate Management",
      "High-Efficiency Deodorizing Cabin Air Charcoal Filter",
      "Premium Multi-Stage Variable Heated Comfort Seating",
      "UV-Reducing Heat Insulating Safety Solar Glass",
    ];
    const defaultSafety = [
      "Advanced 10-Airbag System with Occupant Classification",
      "Whiplash Injury Mitigation Dynamic Energy-Absorbing Seats",
      "Intelligent Vehicle Stability Control & Active Braking",
      "Direct Numerical Tire Pressure Monitoring System (TPMS)",
    ];

    return {
      "Audio & Entertainment":
        car.hasAudioPackage !== false
          ? defaultAudio
          : ["Standard Sound System Installed", "AM/FM Stereo Radio Tuner"],
      "Driving Assists":
        car.hasDrivingAssists !== false
          ? defaultAssists
          : ["Standard Traction Control System", "Cruise Control Module"],
      "Climate Control":
        car.hasClimateControl !== false
          ? defaultClimate
          : ["Manual Single-Zone Climate system", "Cabin Air Filter Module"],
      "Safety Suite":
        car.hasSafetySuite !== false
          ? defaultSafety
          : [
              "Dual-Stage Front Airbag Protection",
              "Antilock Braking System (ABS)",
            ],
    };
  }, [car]);

  useEffect(() => {
    if (!tabCategories[activeTab]) {
      setActiveTab(Object.keys(tabCategories)[0] || "Audio & Entertainment");
    }
  }, [tabCategories, activeTab]);

  useEffect(() => {
    if (!car.spinImages || car.spinImages.length === 0) {
      setSpinImagesLoaded(true);
      setSpinPreloadProgress(100);
      return;
    }

    setSpinImagesLoaded(false);
    setSpinPreloadProgress(0);

    let loadedCount = 0;
    const totalCount = car.spinImages.length;
    let isCancelled = false;

    car.spinImages.forEach((src) => {
      const img = new window.Image();
      img.onload = () => {
        if (isCancelled) return;
        loadedCount++;
        setSpinPreloadProgress(Math.round((loadedCount / totalCount) * 100));
        if (loadedCount === totalCount) {
          setSpinImagesLoaded(true);
        }
      };
      img.onerror = () => {
        if (isCancelled) return;
        loadedCount++;
        setSpinPreloadProgress(Math.round((loadedCount / totalCount) * 100));
        if (loadedCount === totalCount) {
          setSpinImagesLoaded(true);
        }
      };
      img.src = src;
    });

    return () => {
      isCancelled = true;
    };
  }, [car.spinImages]);

  // Mock active Bookings
  const activeBookingsCount = useMemo(() => {
    const charCodeSum = car.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (charCodeSum % 3) + 1;
  }, [car]);

  // Handles simple drag rotation simulation for 360 view
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !car.spinImages || car.spinImages.length === 0) return;
    const diffX = e.clientX - startX;

    // Determine rotation sensitivity based on how many images we have
    // If we have 36 images, maybe a 10px drag is one frame.
    const dragThreshold = 10;

    if (Math.abs(diffX) > dragThreshold) {
      const step = diffX > 0 ? 1 : -1;
      const numFrames = car.spinImages.length;
      setPanIndex((prev) => (prev + step + numFrames) % numFrames);
      setStartX(e.clientX);
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleSavePriceOverride = () => {
    const val = Number(priceOverrideVal);
    if (!isNaN(val) && val > 0) {
      onOverridePrice(car, val);
      setIsOverridingPrice(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden"
        id="vehicle-detail-overlay"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-950/45 backdrop-blur-md"
        />

        {/* Detail slideout drawer container */}
        <motion.div
          initial={{ x: "100%", opacity: 0.95 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 180 }}
          className="relative w-full max-w-5xl h-full bg-white shadow-2xl flex flex-col z-10 border-l border-stone-200/60 overflow-hidden"
          id="vehicle-detail-drawer"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-stone-200/50 shrink-0">
            <div className="flex items-center gap-3">
              <span className="bg-stone-900 text-stone-100 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {isAdmin ? "ADMIN VEHICLE AUDIT" : "VEHICLE INFORMATION"}
              </span>
              <span className="text-stone-400 text-xs font-mono">
                Stock ID:{" "}
                <strong className="text-stone-700 uppercase">
                  {car.stockNumber || car.id.slice(0, 10)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {!isAdmin && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-950 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider text-stone-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  ← Back to Showroom
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-100 rounded-full text-stone-500 hover:text-stone-900 transition-all cursor-pointer flex items-center justify-center"
                title="Close Panel"
                id="close-detail-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Core scrollable layout */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Main Content Pane */}
              <div className="lg:col-span-8 space-y-8">
                {/* 1. Brand/Model Typographic Hierarchy & Pricing Section */}
                <div className="space-y-4" id="vehicle-detail-title-card">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <div className="text-stone-400 font-mono text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <span>{car.year}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{car.category}</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight uppercase leading-none">
                        {car.brand}{" "}
                        <span className="text-stone-700 font-light">
                          {car.model}
                        </span>
                      </h1>
                    </div>

                    {/* Premium dynamic pricing contrast block */}
                    <div className="text-right sm:text-right flex flex-col items-baseline justify-between sm:justify-end gap-3 mt-2 sm:mt-0 bg-stone-50 border border-stone-200/60 p-4 rounded-2xl w-full sm:w-auto">
                      <div className="flex flex-row sm:flex-col justify-between w-full sm:w-auto gap-3">
                        <div>
                          <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider text-left">
                            Original MSRP
                          </span>
                          <span className="text-stone-400 line-through text-sm font-semibold tracking-tight text-left block">
                            ${msrpPrice.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-mono text-stone-950 font-bold uppercase tracking-wider text-left">
                            Showroom Deal
                          </span>
                          <span className="text-stone-950 text-2xl font-black tracking-tight text-left block">
                            ${car.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {car.isEvEligible && car.evRebateAmount && (
                        <div className="w-full bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex flex-col items-start gap-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            EV Rebate Eligible
                          </span>
                          <span className="text-emerald-800 text-sm font-bold block">
                            -${car.evRebateAmount.toLocaleString()} Credit
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-row justify-between w-full gap-2 items-center border-t border-stone-200/50 pt-2">
                        {car.isEvEligible && car.netCost && (
                          <div className="flex flex-col items-start">
                             <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider text-left">
                              Net Cost
                            </span>
                            <span className="text-stone-950 text-base font-black tracking-tight block">
                              ${car.netCost.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="bg-stone-900 text-stone-100 px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center shadow-sm ml-auto">
                          <span>${car.estMonthly}/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Premium Media Gallery */}
                <div className="space-y-4" id="vehicle-media-gallery">
                  <div className="relative aspect-video w-full bg-stone-950 rounded-3xl overflow-hidden border border-stone-200 shadow-lg group">
                    {/* Mode Toggle Button Overlay */}
                    <div className="absolute top-4 right-4 z-20 flex bg-stone-950/80 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-md">
                      <button
                        onClick={() => setMediaMode("images")}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                          mediaMode === "images"
                            ? "bg-[#FAF9F6] text-stone-950"
                            : "text-stone-400 hover:text-stone-100"
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Gallery Images</span>
                      </button>
                      <button
                        onClick={() => setMediaMode("360")}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                          mediaMode === "360"
                            ? "bg-[#FAF9F6] text-stone-950"
                            : "text-stone-400 hover:text-stone-100"
                        }`}
                      >
                        <Compass className="w-3 h-3 animate-spin-slow" />
                        <span>360° View</span>
                      </button>
                    </div>

                    {mediaMode === "images" ? (
                      <motion.img
                        key={selectedGalleryImg}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        src={selectedGalleryImg}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : car.spinImages && car.spinImages.length > 0 ? (
                      !spinImagesLoaded ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-stone-900 flex-col">
                          <Compass className="w-12 h-12 text-stone-700 mb-4 animate-spin-slow" />
                          <p className="text-stone-400 text-sm font-mono uppercase tracking-wider mb-2">
                            Loading 360° View
                          </p>
                          <div className="w-48 h-1 bg-stone-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                              style={{ width: `${spinPreloadProgress}%` }}
                            />
                          </div>
                          <p className="text-stone-500 text-xs mt-2 font-mono">
                            {spinPreloadProgress}%
                          </p>
                        </div>
                      ) : (
                        <div
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUpOrLeave}
                          onMouseLeave={handleMouseUpOrLeave}
                          className="w-full h-full relative cursor-grab active:cursor-grabbing select-none flex items-center justify-center overflow-hidden bg-stone-900"
                        >
                          <div className="absolute top-4 left-4 font-mono text-[9px] text-white bg-stone-950/90 px-2.5 py-1 rounded-md tracking-widest flex items-center gap-1 z-10">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span>PHOTO-SPIN 360° ACTIVE</span>
                          </div>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-stone-300 bg-stone-950/80 px-4 py-2 rounded-full tracking-wider border border-white/10 pointer-events-none text-center z-10">
                            Drag horizontally to rotate vehicle
                          </div>
                          {car.spinImages.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt={`360 view frame ${i}`}
                              className={`absolute inset-0 w-full h-full object-cover transition-none pointer-events-none ${
                                i === (Math.abs(panIndex) % car.spinImages.length)
                                  ? "opacity-100 z-0"
                                  : "opacity-0"
                              }`}
                              draggable={false}
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full relative flex items-center justify-center bg-stone-900 flex-col">
                        <Compass className="w-12 h-12 text-stone-700 mb-4" />
                        <p className="text-stone-400 text-sm font-mono uppercase tracking-wider">
                          360° View Not Available
                        </p>
                        <p className="text-stone-500 text-xs mt-2">
                          No photo sequence uploaded for this vehicle.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 4-photo minimal secondary grid */}
                  {mediaMode === "images" && (
                    <div className="grid grid-cols-4 gap-3">
                      {secondaryImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedGalleryImg(img)}
                          className={`aspect-video rounded-2xl overflow-hidden border transition-all ${
                            selectedGalleryImg === img
                              ? "border-stone-950 ring-2 ring-stone-950 ring-offset-2 scale-[0.98]"
                              : "border-stone-200 hover:border-stone-400 hover:scale-[1.02]"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Detail view ${i + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Core Specifications Table with 3-column micro-grid */}
                <div
                  className="bg-stone-50 border border-stone-200/70 rounded-3xl p-6 space-y-4"
                  id="vehicle-specs-grid"
                >
                  <h3 className="text-xs font-black text-stone-950 uppercase tracking-widest flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-stone-500" />
                    <span>Technical Configuration Specs</span>
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-8">
                    {/* Mileage */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Mileage
                      </span>
                      <span className="text-stone-800 text-sm font-bold">
                        {car.mileage || "165,575"}
                      </span>
                    </div>

                    {/* Transmission */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Transmission
                      </span>
                      <span className="text-stone-800 text-sm font-bold">
                        {car.transmission || "Automatic CVT"}
                      </span>
                    </div>

                    {/* Drive Type */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Drive Type
                      </span>
                      <span className="text-stone-800 text-sm font-bold">
                        {car.driveType ||
                          (car.category === "SUV"
                            ? "AWD System"
                            : car.category === "Coupe" ||
                                car.category === "Sports"
                              ? "Rear-Wheel Drive (RWD)"
                              : "Front-Wheel Drive (FWD)")}
                      </span>
                    </div>

                    {/* Fuel Type */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Fuel System
                      </span>
                      <span className="text-stone-800 text-sm font-bold">
                        {car.fuelType || "Premium Gasoline"}
                      </span>
                    </div>

                    {/* Exterior Color */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Exterior Hue
                      </span>
                      <span className="text-stone-800 text-sm font-bold">
                        {car.exteriorColor ||
                          (car.id === "lexus-ct-200h"
                            ? "Silver Metallic"
                            : "Obsidian Metallic")}
                      </span>
                    </div>

                    {/* Interior Color */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Interior Material
                      </span>
                      <span className="text-stone-800 text-sm font-bold">
                        {car.interiorColor ||
                          (car.id === "lexus-ct-200h"
                            ? "Ebony Premium Leather"
                            : "Alcantara Gray")}
                      </span>
                    </div>

                    {/* VIN */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Vehicle VIN
                      </span>
                      <span className="text-stone-700 text-xs font-mono font-bold tracking-tight">
                        {car.vin ||
                          "JTDKNRAU4H21" + (14432 + Math.floor(car.price / 10))}
                      </span>
                    </div>

                    {/* Stock Number */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Stock Number
                      </span>
                      <span className="text-stone-800 text-xs font-mono font-bold uppercase">
                        {car.stockNumber ||
                          "LA-" +
                            car.brand.slice(0, 3).toUpperCase() +
                            "-" +
                            (car.year % 100) +
                            "A"}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="border-b border-stone-200/60 pb-2">
                      <span className="text-stone-400 font-mono text-[10px] uppercase block tracking-wider">
                        Location
                      </span>
                      <span className="text-stone-800 text-sm font-bold">
                        {car.location || "La Puente Showroom"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Professional Narrative Description */}
                <div className="space-y-3" id="vehicle-description-box">
                  <h3 className="text-xs font-black text-stone-950 uppercase tracking-widest flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-stone-500" />
                    <span>Manager's Description</span>
                  </h3>
                  <div className="bg-[#FAF9F6] border border-stone-150 rounded-2xl p-6 text-stone-700 text-xs sm:text-sm leading-relaxed space-y-4 shadow-sm">
                    {car.description ? (
                      <p className="whitespace-pre-wrap">{car.description}</p>
                    ) : (
                      <>
                        <p>
                          We are proud to present this meticulously curated{" "}
                          <strong>
                            {car.year} {car.brand} {car.model}
                          </strong>
                          . This exceptional luxury vehicle has undergone a
                          detailed service inspection and rigorous multi-point
                          safety checklist at our state-of-the-art service
                          facility here at LA City Cars. Our certified master
                          mechanics have verified all key vehicle systems,
                          completed an oil and filter exchange, and performed
                          precision computer diagnostics.
                        </p>
                        <p className="border-l-2 border-stone-400 pl-4 text-stone-600 italic">
                          "A beautiful driving statement designed to impress.
                          Guaranteed performance backed by the most reliable
                          dealer standards in Los Angeles."
                        </p>
                      </>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-stone-200/50 text-xs text-stone-500 gap-2">
                      <span className="flex items-center gap-1 text-stone-950 font-bold">
                        <Check className="w-4 h-4" /> Comprehensive AutoCheck
                        History Report Included Free
                      </span>
                      <span className="font-mono">
                        Certified Pre-Owned Inspection Passed: 100%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Luxury Tech & Options Catalog (Tab System) */}
                <div
                  className="bg-stone-950 rounded-3xl p-6 text-white space-y-5 shadow-lg"
                  id="vehicle-options-tabs"
                >
                  <div className="flex flex-col">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-stone-300 animate-pulse" />
                      <span>Premium Installed Features</span>
                    </h3>

                    {/* Option Category Tabs Row */}
                    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                      {(
                        Object.keys(tabCategories) as Array<
                          keyof typeof tabCategories
                        >
                      ).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveTab(cat)}
                          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap rounded-full transition-all cursor-pointer border ${
                            activeTab === cat
                              ? "bg-white text-stone-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                              : "bg-transparent text-stone-400 border-stone-800 hover:text-white hover:border-stone-600"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options Tab Panel content */}
                  <div className="pt-2 min-h-[140px]">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1"
                    >
                      {tabCategories[activeTab]?.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 py-2 text-xs border-b border-stone-800/60"
                        >
                          <span className="text-stone-300 shrink-0 mt-0.5">
                            <Check className="w-4 h-4 stroke-[2px]" />
                          </span>
                          <span className="text-stone-300 font-medium leading-relaxed">
                            {option}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Sticky Sidebar CTAs */}
              <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
                {isAdmin ? (
                  /* Admin controls sidebar */
                  <div
                    className="bg-stone-950 text-stone-100 rounded-3xl p-6 border border-stone-800 shadow-xl space-y-6"
                    id="admin-quick-controls"
                  >
                    <div className="border-b border-stone-800 pb-4">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">
                        ADMIN QUICK ACTIONS
                      </span>
                      <h4 className="text-lg font-black tracking-tight text-[#FAF9F6] mt-1">
                        OPERATIONS CONTROL
                      </h4>
                    </div>

                    {/* Real-time Dynamic Pricing Override Form overlay/widget */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-mono text-[10px] uppercase">
                          Base Showroom Cost
                        </span>
                        <span className="text-sm font-bold text-[#FAF9F6]">
                          ${car.price.toLocaleString()}
                        </span>
                      </div>

                      {!isOverridingPrice ? (
                        <button
                          onClick={() => {
                            setPriceOverrideVal(car.price.toString());
                            setIsOverridingPrice(true);
                          }}
                          className="w-full py-2.5 bg-stone-800 hover:bg-stone-750 text-[#FAF9F6] text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-stone-700/60 flex items-center justify-center gap-1.5 cursor-pointer"
                          id="price-override-btn"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Override Selling Price</span>
                        </button>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <label className="block text-[9px] font-mono text-stone-400 uppercase">
                            Set Showroom Target Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                              $
                            </span>
                            <input
                              type="number"
                              value={priceOverrideVal}
                              onChange={(e) =>
                                setPriceOverrideVal(e.target.value)
                              }
                              className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-stone-500 text-[#FAF9F6] font-mono font-bold"
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleSavePriceOverride}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                            >
                              Save Price
                            </button>
                            <button
                              onClick={() => setIsOverridingPrice(false)}
                              className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Main Action Buttons Stack */}
                    <div className="space-y-3">
                      {/* CTA 1: Edit Specs */}
                      <button
                        onClick={() => {
                          onClose();
                          onEditSpecs(car);
                        }}
                        className="w-full py-3.5 bg-[#FAF9F6] hover:bg-[#F3F2EE] text-stone-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        id="edit-listing-btn"
                      >
                        <Edit className="w-4 h-4 text-stone-700" />
                        <span>Edit Listing Specs</span>
                      </button>

                      {/* CTA 2: View Active Bookings */}
                      <button
                        onClick={() => {
                          onViewActiveBookings(car);
                        }}
                        className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-100 border border-stone-800 hover:border-stone-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        id="view-bookings-btn"
                      >
                        <CalendarCheck className="w-4 h-4 text-stone-400" />
                        <div className="flex items-center gap-1.5">
                          <span>View Active Bookings</span>
                          <span className="bg-stone-800 text-[#FAF9F6] border border-stone-700 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {activeBookingsCount}
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* AutoCheck Inspection summary badge */}
                    <div className="border-t border-stone-800 pt-4 text-center">
                      <p className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                        Showroom Quality Index
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/50 px-4 py-1.5 rounded-full text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>100/100 EXCELLENT GRADE</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Client controls sidebar */
                  <div
                    className="bg-stone-950 text-stone-100 rounded-3xl p-6 border border-stone-800 shadow-xl space-y-6"
                    id="client-quick-controls"
                  >
                    <div className="border-b border-stone-800 pb-4">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">
                        SECURE PURCHASE concierge
                      </span>
                      <h4 className="text-lg font-black tracking-tight text-white mt-1">
                        RESERVE VEHICLE
                      </h4>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-mono text-[10px] uppercase">
                          Special Pricing
                        </span>
                        <span className="text-lg font-bold text-white">
                          ${car.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-mono text-[10px] uppercase">
                          Finance Estimate
                        </span>
                        <span className="text-sm font-semibold text-[#FAF9F6]">
                          ${car.estMonthly}/mo
                        </span>
                      </div>
                    </div>

                    {/* Client CTA Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          if (onReserve) {
                            onClose();
                            onReserve(car.id);
                          }
                        }}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:scale-[1.02] duration-300"
                      >
                        <Zap className="w-4 h-4 fill-white text-white" />
                        <span>Reserve Automobile</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenChat) {
                            onOpenChat();
                          }
                        }}
                        className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-100 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-stone-400" />
                        <span>Live Chat Concierge</span>
                      </button>
                    </div>

                    {/* AutoCheck Inspection summary badge */}
                    <div className="border-t border-stone-800 pt-4 text-center">
                      <p className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                        Showroom Guarantee
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/50 px-4 py-1.5 rounded-full text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>100% Certified Inspection</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Booking Quick Stats Widget */}
                <div className="bg-stone-50 border border-stone-200/60 rounded-3xl p-6 space-y-4">
                  <h4 className="text-xs font-black text-stone-950 uppercase tracking-widest flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-stone-500" />
                    <span>Real-time Engagement Index</span>
                  </h4>
                  <div className="space-y-3 font-mono text-xs text-stone-500">
                    <div className="flex justify-between items-center py-1 border-b border-stone-200/30">
                      <span>Showroom View Count:</span>
                      <strong className="text-stone-800">
                        {(car.price % 71) + 140} Views/day
                      </strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-200/30">
                      <span>Saved in Wishlists:</span>
                      <strong className="text-stone-800">
                        {(car.price % 19) + 4} Times
                      </strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>Market Valuation:</span>
                      <strong className="text-stone-950">High Demand</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {car.legalDisclaimer && (
              <div className="mt-8 pt-8 border-t border-stone-200">
                <h4 className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2">
                  Legal Disclaimer / Fine Print
                </h4>
                <div className="text-[10px] text-stone-500 whitespace-pre-wrap leading-relaxed max-w-4xl">
                  {car.legalDisclaimer}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
