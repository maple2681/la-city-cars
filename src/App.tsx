import React, { useState, useMemo, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  Key,
  Search,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Check,
  Info,
  Calendar,
  Compass,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  SlidersHorizontal,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit,
  LogOut,
  Lock,
  User,
  X,
  Globe,
} from "lucide-react";
import { CARS, Car } from "./data/cars";
import { ADMIN_SECRET_PATH } from "./config/security";
import { sanitizeInput } from "./utils/security";
import ThreeDPlaceholder from "./components/ThreeDPlaceholder";
import BookingModal from "./components/BookingModal";
import VehicleDetailView from "./components/VehicleDetailView";
import { useLanguage } from "./contexts/LanguageContext";
import AdminLogin from "./components/AdminLogin";



const safeSessionStorage = {
  getItem: (key: string) => { try { return sessionStorage.getItem(key); } catch(e) { return null; } },
  setItem: (key: string, val: string) => { try { sessionStorage.setItem(key, val); } catch(e) {} },
  removeItem: (key: string) => { try { sessionStorage.removeItem(key); } catch(e) {} }
};

const compressImageFile = (file: File, maxWidth: number = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Compress using standard jpeg format with 0.7 quality
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Sedan" | "SUV" | "Coupe" | "Electric" | "Sports"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(
    undefined,
  );

  // Multi-page routing / View States
  const [currentView, setCurrentView] = useState<"home" | "catalog" | "admin">(
    () => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
        if (path === "/admin") return "admin";
        if (path === "/catalog") return "catalog";
      }
      return "home";
    },
  );

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
      if (path === "/admin") setCurrentView("admin");
      else if (path === "/catalog") setCurrentView("catalog");
      else setCurrentView("home");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, "") || "/";
    const expectedPath = currentView === "home" ? "/" : `/${currentView}`;
    if (path !== expectedPath) {
      window.history.pushState({}, "", expectedPath);
    }
  }, [currentView]);

  const [priceSort, setPriceSort] = useState<
    "none" | "low-to-high" | "high-to-low"
  >("none");
  const [currentPage, setCurrentPage] = useState(1);

  // Vehicle Detail View State
  const [selectedDetailCar, setSelectedDetailCar] = useState<Car | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  const handleOpenVehicleDetail = (car: Car) => {
    setSelectedDetailCar(car);
    setIsDetailViewOpen(true);
  };

  const handleCloseVehicleDetail = () => {
    setIsDetailViewOpen(false);
  };

  const handleOverridePrice = (car: Car, newPrice: number) => {
    const updated = cars.map((c) => {
      if (c.id === car.id) {
        const oldRatio = c.estMonthly / c.price;
        const newMonthly = Math.round(newPrice * (oldRatio || 0.012));
        return {
          ...c,
          price: newPrice,
          estMonthly: newMonthly || Math.round(newPrice / 80),
        };
      }
      return c;
    });
    setCars(updated);
    if (selectedDetailCar && selectedDetailCar.id === car.id) {
      setSelectedDetailCar({
        ...selectedDetailCar,
        price: newPrice,
        estMonthly:
          Math.round(
            newPrice *
              (selectedDetailCar.estMonthly / selectedDetailCar.price || 0.012),
          ) || Math.round(newPrice / 80),
      });
    }
    showToast(
      `Successfully overrode price of ${car.brand} ${car.model} to $${newPrice.toLocaleString()}.`,
    );
  };

  const handleViewActiveBookings = (car: Car) => {
    const charCodeSum = car.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bookingsCount = (charCodeSum % 3) + 1;

    const potentialBookings = [
      {
        name: "Sir Johnathan S. Kensington",
        time: "Monday at 10:30 AM",
        type: "Executive Test Drive",
      },
      {
        name: "Lady Beatrice Vance",
        time: "Thursday at 2:00 PM",
        type: "VIP Showroom Inspection",
      },
      {
        name: "Captain Elena Rostova",
        time: "Saturday at 4:15 PM",
        type: "Finance Checkout",
      },
    ];

    const activeOnes = potentialBookings.slice(0, bookingsCount);
    const bookingDetails = activeOnes
      .map((b) => `${b.name} - ${b.time} (${b.type})`)
      .join("  ||  ");

    showToast(`Active Bookings: ${bookingDetails}`);
  };

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  const [cars, setCars] = useState<Car[]>([]);
  const [isFleetLoaded, setIsFleetLoaded] = useState(false);

  const loadFleet = async () => {
    try {
      const res = await fetch("/api/cars", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCars(data);
      } else {
        setCars([]);
      }
    } catch (e) {
      console.error("Error fetching fleet from API", e);
      setCars([]);
    } finally {
      setIsFleetLoaded(true);
    }
  };

  useEffect(() => {
    loadFleet();
  }, []);

  // Admin routing & authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Persistent Authentication Enforcement on mount/refresh
  useEffect(() => {
    try {
      const activeSession = safeSessionStorage.getItem("la_admin_session") === "true";
      if (activeSession) {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    } catch (e) {
      setIsAdminLoggedIn(false);
    }
  }, []);
  const handleAdminLogout = () => {
    try {
      safeSessionStorage.removeItem("la_admin_session");
    } catch (err) {}
    setIsAdminLoggedIn(false);
    showToast("Successfully logged out of Admin Portal.");
  };


  // Keep admin login across views or not? 
  // Let's keep it until they log out.


  // Hero Image State
  const [heroImage, setHeroImage] = useState<string>(() => {
    return localStorage.getItem("la_city_cars_hero_img") || "";
  });

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImageFile(file, 1200);
        setHeroImage(compressedBase64);
        try {
          localStorage.setItem("la_city_cars_hero_img", compressedBase64);
          showToast("Hero image updated successfully.");
        } catch (storageErr) {
          showToast("Storage limit exceeded. Try a smaller image.", "error");
        }
      } catch (err) {
        showToast("Failed to process image.", "error");
      }
    }
  };



  // CRUD Actions State
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null); // null means "Add New Car"

  // CRUD inputs
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formYear, setFormYear] = useState(2023);
  const [formCategory, setFormCategory] = useState<
    "Sedan" | "SUV" | "Coupe" | "Electric" | "Sports"
  >("Sedan");
  const [formPrice, setFormPrice] = useState(60000);
  const [formEstMonthly, setFormEstMonthly] = useState(800);
  const [formImage, setFormImage] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formMileage, setFormMileage] = useState("5,000 mi");
  const [formFuelType, setFormFuelType] = useState("Petrol");
  const [formTransmission, setFormTransmission] = useState("Auto");

  // Advanced CRUD states
  const [formMsrp, setFormMsrp] = useState(0);
  const [formDriveType, setFormDriveType] = useState("");
  const [formExteriorColor, setFormExteriorColor] = useState("");
  const [formInteriorColor, setFormInteriorColor] = useState("");
  const [formVin, setFormVin] = useState("");
  const [formStockNumber, setFormStockNumber] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formHasAudioPackage, setFormHasAudioPackage] = useState(true);
  const [formHasDrivingAssists, setFormHasDrivingAssists] = useState(true);
  const [formHasClimateControl, setFormHasClimateControl] = useState(true);
  const [formHasSafetySuite, setFormHasSafetySuite] = useState(true);
  const [formSpinImages, setFormSpinImages] = useState<string[]>([]);
  
  // Drag & Drop reordering states
  const [draggedImgIdx, setDraggedImgIdx] = useState<number | null>(null);
  const [draggedSpinImgIdx, setDraggedSpinImgIdx] = useState<number | null>(null);
  
  // New Ev and Legal fields
  const [formEvRebateAmount, setFormEvRebateAmount] = useState(0);
  const [formNetCost, setFormNetCost] = useState(0);
  const [formIsEvEligible, setFormIsEvEligible] = useState(false);
  const [formLocation, setFormLocation] = useState("");
  const [formLegalDisclaimer, setFormLegalDisclaimer] = useState("");
  const [formStandardEquipment, setFormStandardEquipment] = useState("");

  // Spin Image File Picker Base64 conversion handler
  const handleSpinImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Sort files alphabetically so sequence works nicely
      const fileArray = (Array.from(files) as File[]).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      try {
        const newImages: string[] = [];
        for (const file of fileArray) {
          const compressed = await compressImageFile(file, 800);
          newImages.push(compressed);
        }
        setFormSpinImages((prev) => [...prev, ...newImages]);
      } catch (err) {
        showToast("Failed to compress some spin images.", "error");
      }
    }
  };
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const fileArray = (Array.from(files) as File[]).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        const newImages: string[] = [];
        for (const file of fileArray) {
          const compressed = await compressImageFile(file, 800);
          newImages.push(compressed);
        }
        setFormImages((prev) => [...prev, ...newImages]);
        if (!formImage && newImages.length > 0) {
          setFormImage(newImages[0]);
        }
        showToast(`${files.length} local file(s) uploaded and converted successfully!`);
      } catch (err) {
        showToast("Failed to process images.", "error");
      }
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "car"; id: string; title?: string } | null>(null);

  const confirmDeleteAction = async () => {
    if (!deleteConfirm) return;
    const { type, id, title } = deleteConfirm;
    
    // Instant removal UI
    setDeleteConfirm(null);

    if (type === "car") {
      setCars((prevCars) => prevCars.filter((c) => c.id !== id));
      showToast(`Removed vehicle from active fleet.`);
      
      try {
        const res = await fetch(`/api/cars/${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) {
          showToast("Failed to delete vehicle on server.", "error");
          loadFleet();
        }
      } catch (e) {
        showToast("Network error while deleting.", "error");
        loadFleet();
      }
    }
  };

  // Trigger add form
  const handleOpenAddCar = () => {
    setEditingCar(null);
    setFormBrand("");
    setFormModel("");
    setFormYear(2024);
    setFormCategory("Coupe");
    setFormPrice(85000);
    setFormEstMonthly(1100);
    setFormImage("");
    setFormImages([]);
    setFormMileage("1,200 mi");
    setFormFuelType("Petrol");
    setFormTransmission("Auto");

    // Reset extended fields
    setFormMsrp(94500);
    setFormDriveType("Rear-Wheel Drive (RWD)");
    setFormExteriorColor("Obsidian Metallic");
    setFormInteriorColor("Ebony Premium Leather");
    setFormVin("");
    setFormStockNumber("");
    setFormDescription("");
    setFormHasAudioPackage(true);
    setFormHasDrivingAssists(true);
    setFormHasClimateControl(true);
    setFormHasSafetySuite(true);
    setFormSpinImages([]);
    
    // EV & Legal fields
    setFormEvRebateAmount(0);
    setFormNetCost(0);
    setFormIsEvEligible(false);
    setFormLocation("");
    setFormLegalDisclaimer("");
    setFormStandardEquipment("");

    setIsCrudModalOpen(true);
  };

  // Trigger edit form
  const handleOpenEditCar = (car: Car) => {
    setEditingCar(car);
    setFormBrand(car.brand);
    setFormModel(car.model);
    setFormYear(car.year);
    setFormCategory(car.category);
    setFormPrice(car.price);
    setFormEstMonthly(car.estMonthly);
    setFormImage(car.image);
    setFormImages(car.images || (car.image ? [car.image] : []));
    setFormMileage(car.mileage);
    setFormFuelType(car.fuelType);
    setFormTransmission(car.transmission);

    // Populate extended fields
    setFormMsrp(car.msrp || Math.round(car.price * 1.112));
    setFormDriveType(
      car.driveType ||
        (car.category === "SUV"
          ? "AWD System"
          : car.category === "Coupe" || car.category === "Sports"
            ? "Rear-Wheel Drive (RWD)"
            : "Front-Wheel Drive (FWD)"),
    );
    setFormExteriorColor(
      car.exteriorColor ||
        (car.id === "lexus-ct-200h" ? "Silver Metallic" : "Obsidian Metallic"),
    );
    setFormInteriorColor(
      car.interiorColor ||
        (car.id === "lexus-ct-200h"
          ? "Ebony Premium Leather"
          : "Alcantara Gray"),
    );
    setFormVin(
      car.vin || "JTDKNRAU4H21" + (14432 + Math.floor(car.price / 10)),
    );
    setFormStockNumber(
      car.stockNumber ||
        "LA-" +
          (car.brand ? car.brand.slice(0, 3).toUpperCase() : "UNK") +
          "-" +
          ((car.year || 0) % 100) +
          "A",
    );
    setFormDescription(car.description || "");
    setFormHasAudioPackage(car.hasAudioPackage !== false);
    setFormHasDrivingAssists(car.hasDrivingAssists !== false);
    setFormHasClimateControl(car.hasClimateControl !== false);
    setFormHasSafetySuite(car.hasSafetySuite !== false);
    setFormSpinImages(car.spinImages || []);

    // EV & Legal fields
    setFormEvRebateAmount(car.evRebateAmount || 0);
    setFormNetCost(car.netCost || car.price);
    setFormIsEvEligible(car.isEvEligible || false);
    setFormLocation(car.location || "Inglewood");
    setFormLegalDisclaimer(car.legalDisclaimer || "");
    setFormStandardEquipment(car.standardEquipment || "");

    setIsCrudModalOpen(true);
  };

  // Save new/edited car
  const handleSaveCar = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const bPart = (formBrand || "unnamed").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const mPart = (formModel || "car").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const generatedId = editingCar ? editingCar.id : `car-${bPart}-${mPart}-${Date.now()}`;

    const defaultImg = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800";
    const sanitizedImage = formImages.length > 0 ? formImages[0] : (formImage || defaultImg);

    const carPayload: Car = {
      id: generatedId,
      brand: formBrand || "Unnamed",
      model: formModel || "Vehicle",
      year: Number(formYear) || 2026,
      category: formCategory || "Sedan",
      price: Number(formPrice) || 0,
      estMonthly: Number(formEstMonthly) || 0,
      image: sanitizedImage,
      images: formImages.length > 0 ? formImages : [sanitizedImage],
      mileage: formMileage || "0",
      fuelType: formFuelType || "Gasoline",
      transmission: formTransmission || "Automatic",
      msrp: Number(formMsrp) || 0,
      driveType: formDriveType || "",
      exteriorColor: formExteriorColor || "",
      interiorColor: formInteriorColor || "",
      vin: formVin || "",
      stockNumber: formStockNumber || "",
      description: formDescription || "",
      hasAudioPackage: !!formHasAudioPackage,
      hasDrivingAssists: !!formHasDrivingAssists,
      hasClimateControl: !!formHasClimateControl,
      hasSafetySuite: !!formHasSafetySuite,
      spinImages: formSpinImages || [],
      evRebateAmount: Number(formEvRebateAmount) || 0,
      netCost: Number(formNetCost) || 0,
      isEvEligible: !!formIsEvEligible,
      location: formLocation || "Inglewood",
      legalDisclaimer: formLegalDisclaimer || "",
      standardEquipment: formStandardEquipment || "",
    };

    // Update frontend state directly for optimistic UI
    if (editingCar) {
      setCars((prev) => prev.map((c) => (c.id === generatedId ? carPayload : c)));
    } else {
      setCars((prev) => [carPayload, ...prev]);
    }

    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carPayload),
        credentials: "include"
      });
      
      if (res.ok) {
        showToast("Successfully saved vehicle globally.");
        await loadFleet();
      } else {
        showToast("Failed to save vehicle on server.", "error");
      }
    } catch (err) {
      console.error("Optimistic mode: backend update was not completed but local state is preserved", err);
      showToast("Network error while saving.", "error");
    }

    setIsCrudModalOpen(false);
    setIsSaving(false);
  };

  // Delete Operation
  const handleDeleteCar = (carId: string, carTitle: string) => {
    setDeleteConfirm({ type: "car", id: carId, title: carTitle });
  };

  // Sync hash routing so back/forward works flawlessly with security redirection
  useEffect(() => {
    const checkSecurityAndRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      // Catch common path attempts and redirect silently
      const forbiddenPaths = [
        "/admin-portal",
        "/dashboard",
        "/login",
        "/portal",
        "/secret",
        "/credentials",
      ];
      const isPathForbidden = forbiddenPaths.some(
        (p) =>
          pathname === p ||
          pathname.startsWith(p + "/") ||
          pathname.includes(p),
      );

      // Catch common hash attempts and redirect silently
      const forbiddenHashes = [
        "#admin-portal",
        "#dashboard",
        "#login",
        "#admin-portal-xyz",
        "#portal",
        "#secret",
      ];
      const isHashForbidden = forbiddenHashes.some(
        (h) => hash === h || hash.startsWith(h + "-") || hash.includes(h),
      );

      if (isPathForbidden || isHashForbidden) {
        // Silently replace history state and clear hash without traces
        window.history.replaceState({}, "", "/");
        window.location.hash = "";
        setCurrentView("home");
        return;
      }

      // Handle direct path match for /admin
      if (pathname === "/admin" || pathname === "/admin/") {
        setCurrentView("admin");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Normal hash routing
      const normalHash = window.location.hash;
      if (normalHash === "#catalog") {
        setCurrentView("catalog");
        setTimeout(() => {
          document
            .getElementById("catalog-section-anchor")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else if (normalHash === `#${ADMIN_SECRET_PATH}`) {
        setCurrentView("admin");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (normalHash === "#home" || normalHash === "") {
        setCurrentView("home");
      } else {
        // Fallback for random/invalid hashes like #admin, #login
        window.history.replaceState(null, "", "/");
        setCurrentView("home");
      }
    };

    window.addEventListener("hashchange", checkSecurityAndRoute);
    checkSecurityAndRoute(); // Run once at mount
    return () =>
      window.removeEventListener("hashchange", checkSecurityAndRoute);
  }, []);

  // Footer Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");

  // Contact Message form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  // Filter pills list
  const filterPills: (
    "All" | "Sedan" | "SUV" | "Coupe" | "Electric" | "Sports"
  )[] = ["All", "Sedan", "SUV", "Coupe", "Electric", "Sports"];

  // Dynamically filter inventory based on category filter & search query
  const processedCars = useMemo(() => {
    // 1. Apply category filter & search queries
    const filtered = cars.filter((car) => {
      const matchesCategory =
        activeFilter === "All" || car.category === activeFilter;
      const matchesSearch =
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // 2. Apply advanced sorting options
    if (priceSort === "low-to-high") {
      return [...filtered].sort((a, b) => a.price - b.price);
    } else if (priceSort === "high-to-low") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [cars, activeFilter, searchQuery, priceSort]);

  // Handle auto-resetting page index when any search or sort settings update
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, priceSort]);

  // Paginated chunk calculation
  const itemsPerPage = 9;
  const totalPages = Math.ceil(processedCars.length / itemsPerPage);

  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedCars.slice(startIndex, startIndex + itemsPerPage);
  }, [processedCars, currentPage, itemsPerPage]);

  // Open booking form prefilled with a specific vehicle
  const handleOpenBooking = (carId?: string) => {
    setSelectedCarId(carId);
    setIsBookingModalOpen(true);
  };

  // Newsletter form submission
  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const sanitizedEmail = sanitizeInput(newsletterEmail);
    if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      setNewsletterError("Please provide a valid email address");
      return;
    }
    setNewsletterError("");
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  // Direct concierge contact form submission
  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    const sanitizedName = sanitizeInput(contactName);
    const sanitizedEmail = sanitizeInput(contactEmail);
    const sanitizedMsg = sanitizeInput(contactMsg);

    if (!sanitizedName || !sanitizedEmail || !sanitizedMsg) {
      alert("Please fill in all contact fields with valid content.");
      return;
    }
    setContactSuccess(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMsg("");
    }, 2000);
  };

  // Render a beautifully styled Luxury Car Card
  const renderCarCard = (car: Car, index: number = 0) => (
    <motion.div
      layout
      key={car.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      onClick={() => handleOpenVehicleDetail(car)}
      transition={{
        type: "spring",
        stiffness: 85,
        damping: 18,
        delay: (index % 3) * 0.08,
      }}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/40 shadow-xs hover:shadow-3xl hover:bg-stone-50/20 hover:border-stone-300 transition-all duration-500 flex flex-col justify-between cursor-pointer"
    >
      {/* Visual Card Image Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.08]"
          referrerPolicy="no-referrer"
        />
        {/* Premium spec tags overlay */}
        <div className="absolute top-4 left-4 flex gap-1.5">
          <span className="bg-stone-950/80 backdrop-blur-xs text-[9px] font-mono tracking-widest text-white uppercase px-2.5 py-1 rounded-md">
            {t(`cat.${car.category}`)}
          </span>
          {car.price < 40000 && (
            <span className="bg-emerald-600/90 backdrop-blur-xs text-[9px] font-mono tracking-widest text-white uppercase px-2.5 py-1 rounded-md">
              {t("car.deal")}
            </span>
          )}
        </div>
      </div>

      {/* Card details body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Title block */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-stone-950 tracking-tight group-hover:text-stone-800 transition-colors">
              {car.brand} {car.model}
            </h3>
            <p className="text-stone-400 text-xs font-medium font-mono mt-0.5">
              {car.year} · {t(`cat.${car.category}`)}
            </p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-stone-100 text-[11px] text-stone-500 font-mono mb-6">
            <div className="flex flex-col">
              <span className="text-[9px] text-stone-400 uppercase">
                {t("car.mileage")}
              </span>
              <span className="font-bold text-stone-700 mt-0.5">
                {car.mileage}
              </span>
            </div>
            <div className="flex flex-col border-l border-r border-stone-100 px-2">
              <span className="text-[9px] text-stone-400 uppercase">
                {t("car.fuel")}
              </span>
              <span className="font-bold text-stone-700 mt-0.5 truncate">
                {car.fuelType}
              </span>
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-[9px] text-stone-400 uppercase">
                {t("car.gear")}
              </span>
              <span className="font-bold text-stone-700 mt-0.5">
                {car.transmission}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer pricing & Action triggers */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-2xl font-black text-stone-950 tracking-tight">
              ${car.price.toLocaleString("en-US")}
            </div>
            <div className="text-[10px] text-stone-400 font-mono">
              {t("car.est")} ${car.estMonthly}
              {t("car.mo")}
            </div>
          </div>

          {/* Request Viewing / Book Test drive */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenVehicleDetail(car);
            }}
            className="bg-stone-950 hover:bg-stone-800 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title={`View details for ${car.brand} ${car.model}`}
          >
            <span>{t("car.reserve")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div
      className="min-h-screen text-stone-800 font-sans selection:bg-stone-900 selection:text-white"
      id="main-app-container"
    >
      {/* HEADER NAVBAR */}
      <header
        className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-stone-200/40 transition-all"
        id="app-header"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <motion.a
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = "";
              setCurrentView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 focus:outline-none"
            id="navbar-logo-link"
          >
            <span className="text-2xl font-black tracking-tighter text-stone-950 uppercase font-sans">
              LA CITY CARS
            </span>
          </motion.a>

          {/* Core Navigation Items */}
          <motion.nav
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            className="hidden md:flex items-center gap-10 text-sm font-medium text-stone-600"
            id="navbar-links"
          >
            <motion.a
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "#catalog";
              }}
              className={`hover:text-stone-950 transition-colors ${currentView === "catalog" ? "text-stone-950 font-semibold" : ""}`}
            >
              {t("nav.inventory")}
            </motion.a>
            <motion.a
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              href="#why-us"
              className="hover:text-stone-950 transition-colors"
            >
              {t("nav.why_us")}
            </motion.a>
            <motion.a
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              href="#about"
              className="hover:text-stone-950 transition-colors"
            >
              {t("nav.about")}
            </motion.a>
          </motion.nav>

          {/* CTA Buttons Row */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1,
              }}
              onClick={() => setLanguage(language === "en" ? "es" : "en")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-stone-100 transition-colors text-sm font-semibold text-stone-700"
            >
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </motion.button>
            {/* CTA contact Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }}
              onClick={() => handleOpenBooking()}
              className="bg-stone-950 hover:bg-stone-800 text-[#FAF9F6] text-sm font-semibold py-2.5 px-6 rounded-full transition-all active:scale-[0.98] shadow-xs cursor-pointer hover:scale-[1.03]"
              id="navbar-contact-button"
            >
              {t("nav.contact")}
            </motion.button>
          </div>
        </div>
      </header>

      {/* HOME PAGE SPECIFIC VIEW */}
      {currentView === "home" && (
        <>
          {/* HERO SECTION */}
          <section
            className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center animate-fade-in"
            id="hero-section"
          >
            <div className="max-w-4xl mx-auto">
              {/* Top Label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-[11px] font-bold tracking-[0.25em] text-stone-500 uppercase mb-4"
              >
                {t("hero.label")}
              </motion.div>

              {/* Hero Main Heading with premium mask reveals */}
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-stone-950 leading-[0.95] uppercase font-sans mb-6">
                <div className="overflow-hidden py-1">
                  <motion.span
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 1.1,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.08,
                    }}
                    className="block"
                  >
                    {t("hero.title.1")}
                  </motion.span>
                </div>
                <div className="overflow-hidden py-1">
                  <motion.span
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 1.1,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.22,
                    }}
                    className="block text-stone-900"
                  >
                    {t("hero.title.2")}
                  </motion.span>
                </div>
              </h1>

              {/* Hero Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1.0,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.4,
                }}
                className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8"
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* CTA Buttons Grid */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1.0,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.55,
                }}
                className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12"
              >
                <a
                  href="#catalog"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = "#catalog";
                  }}
                  className="w-full sm:w-auto bg-stone-950 hover:bg-stone-800 text-white font-semibold py-4 px-8 rounded-full shadow-md flex items-center justify-center gap-2.5 transition-all hover:translate-y-[-2px] active:scale-[0.99] hover:scale-[1.02] duration-300"
                  id="hero-browse-button"
                >
                  <span>{t("hero.btn.browse")}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleOpenBooking()}
                  className="w-full sm:w-auto bg-white hover:bg-stone-50 border border-stone-200 text-stone-900 font-semibold py-4 px-8 rounded-full transition-all active:scale-[0.99] flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:scale-[1.02] duration-300 cursor-pointer"
                  id="hero-book-button"
                >
                  <span>{t("hero.btn.book")}</span>
                </button>
              </motion.div>
            </div>

            {/* 3D ROTATION PLACEHOLDER IFRAME/PREVIEW CONTAINER */}
            <div className="mt-4 max-w-5xl mx-auto overflow-hidden rounded-3xl">
              <motion.div
                initial={{
                  clipPath: "inset(100% 0% 0% 0%)",
                  opacity: 0,
                  y: 100,
                }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0 }}
                transition={{
                  duration: 1.4,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.35,
                }}
              >
                <ThreeDPlaceholder heroImage={heroImage || undefined} />
              </motion.div>
            </div>
          </section>

          {/* INVENTORY / SHOWROOM SECTION */}
          <section
            className="bg-stone-100/50 border-t border-b border-stone-200/30 py-24 px-6"
            id="inventory"
          >
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 overflow-hidden">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block text-[10px] font-bold tracking-[0.25em] text-stone-500 uppercase"
                >
                  {t("hero.label")}
                </motion.span>
                <div className="overflow-hidden py-1">
                  <motion.h2
                    initial={{ clipPath: "inset(100% 0% 0% 0%)", y: "100%" }}
                    whileInView={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 1.0,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.1,
                    }}
                    className="text-4xl sm:text-5xl font-black tracking-tight text-stone-950 uppercase mt-2"
                  >
                    {t("catalog.title")}
                  </motion.h2>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.2,
                  }}
                  className="text-stone-500 text-xs mt-2 max-w-md mx-auto"
                >
                  {t("catalog.subtitle")}
                </motion.p>
              </div>

              {/* Car Grid Showroom (Displaying Top 3 Curated Luxury Cars) */}
              {processedCars.length > 0 ? (
                <div>
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    id="showroom-cars-grid"
                  >
                    <AnimatePresence mode="popLayout">
                      {processedCars.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-stone-500">
                          {t("search.no_results")}
                        </div>
                      ) : (
                        processedCars
                          .slice(0, 3)
                          .map((car, idx) => renderCarCard(car, idx))
                      )}
                    </AnimatePresence>
                  </div>

                  {/* View Full Inventory Button */}
                  <div className="mt-16 text-center">
                    <motion.a
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                      href="#catalog"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = "#catalog";
                      }}
                      className="inline-flex items-center gap-3 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-widest px-10 py-5 rounded-full shadow-lg cursor-pointer"
                      id="view-full-inventory-btn"
                    >
                      <span>{t("nav.inventory")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.a>
                  </div>
                </div>
              ) : (
                /* Empty results screen */
                <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 max-w-xl mx-auto px-6">
                  <div className="text-stone-400 font-mono text-sm mb-3">
                    {t("catalog.no_results")}
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* DEDICATED FULL CATALOG VIEW */}
      {currentView === "catalog" && (
        <section
          className="bg-stone-50 border-t border-b border-stone-200/30 py-16 px-6"
          id="catalog-section-anchor"
        >
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb & Elegant Catalog Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 border-b border-stone-200/60 pb-6">
              <div>
                <nav
                  className="flex items-center gap-2 text-xs text-stone-400 font-mono mb-2"
                  id="catalog-breadcrumb"
                >
                  <span
                    className="hover:text-stone-700 cursor-pointer"
                    onClick={() => {
                      setCurrentView("home");
                      window.location.hash = "";
                    }}
                  >
                    HOME
                  </span>
                  <span>/</span>
                  <span className="text-stone-700">CATALOG</span>
                </nav>
                <div className="overflow-hidden py-1">
                  <motion.h2
                    initial={{ clipPath: "inset(100% 0% 0% 0%)", y: "100%" }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-3xl sm:text-4xl font-black tracking-tight text-stone-950 uppercase"
                    id="catalog-header-title"
                  >
                    {t("catalog.title")}
                  </motion.h2>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.15,
                  }}
                  className="text-stone-500 text-xs mt-1"
                >
                  {t("catalog.subtitle")}
                </motion.p>
              </div>

              <button
                onClick={() => {
                  setCurrentView("home");
                  window.location.hash = "";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 hover:bg-stone-100 rounded-full text-xs font-semibold text-stone-700 transition-all cursor-pointer"
                id="catalog-back-to-showroom"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Showroom</span>
              </button>
            </div>

            {/* Catalog Split Layout */}
            <div
              className="flex flex-col lg:flex-row gap-10"
              id="catalog-split-container"
            >
              {/* Left Sidebar sticky configurer */}
              <aside
                className="w-full lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-24 h-fit"
                id="catalog-sidebar"
              >
                {/* Search box card */}
                <div
                  className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-xs space-y-3"
                  id="catalog-search-card"
                >
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-stone-500" />
                    <span>Search Collection</span>
                  </h4>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("catalog.search")}
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.trim() === "/admin") {
                          window.history.pushState({}, "", "/admin");
                          setCurrentView("admin");
                          setSearchQuery("");
                        } else {
                          setSearchQuery(val);
                        }
                      }}
                      className="w-full pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-950 focus:border-stone-950 transition-all placeholder-stone-400"
                      id="catalog-search-input"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-400 hover:text-stone-900"
                        id="catalog-clear-search"
                      >
                        {t("catalog.clear_search")}
                      </button>
                    )}
                  </div>
                </div>{" "}
                {/* Categories filter list */}
                <div
                  className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-xs space-y-3.5"
                  id="catalog-categories-card"
                >
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                    <span>Select Curation</span>
                  </h4>
                  <div
                    className="flex flex-wrap gap-2"
                    id="catalog-categories-row"
                  >
                    {filterPills.map((category) => {
                      const isActive = activeFilter === category;
                      const count = cars.filter(
                        (c) => category === "All" || c.category === category,
                      ).length;
                      return (
                        <button
                          key={category}
                          onClick={() => setActiveFilter(category)}
                          className={`relative px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border transition-all duration-300 cursor-pointer overflow-hidden ${
                            isActive
                              ? "border-transparent text-white animate-fade-in"
                              : "border-stone-200/60 text-stone-600 hover:text-stone-950 hover:border-stone-300"
                          }`}
                          id={`catalog-category-btn-${category.toLowerCase()}`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="activeCategoryPill"
                              className="absolute inset-0 bg-stone-950"
                              transition={{
                                type: "spring",
                                stiffness: 420,
                                damping: 30,
                              }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            <span>{t(`cat.${category}`)}</span>
                            <span
                              className={`text-[9px] font-mono px-1 rounded ${isActive ? "text-stone-300 bg-white/10" : "text-stone-400 bg-stone-100"}`}
                            >
                              {count}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Price Advanced Sorting card */}
                <div
                  className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-xs space-y-3"
                  id="catalog-sorting-card"
                >
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                    <span>Sort Vehicles</span>
                  </h4>
                  <select
                    value={priceSort}
                    onChange={(e: any) => setPriceSort(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 px-3 py-2.5 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-950 focus:border-stone-950 cursor-pointer"
                    id="catalog-sort-select"
                  >
                    <option value="none">{t("catalog.sort.none")}</option>
                    <option value="low-to-high">{t("catalog.sort.low")}</option>
                    <option value="high-to-low">
                      {t("catalog.sort.high")}
                    </option>
                  </select>
                </div>
              </aside>

              {/* Right main grid & results */}
              <div className="flex-1 space-y-6" id="catalog-results-area">
                {/* Grid result displayer */}
                {paginatedCars.length > 0 ? (
                  <div className="space-y-8">
                    {/* Grid results stats label */}
                    <div
                      className="text-xs text-stone-500 font-mono flex items-center justify-between border-b border-stone-200/50 pb-3"
                      id="catalog-result-stats"
                    >
                      <span>
                        SHOWING {(currentPage - 1) * itemsPerPage + 1} –{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          processedCars.length,
                        )}{" "}
                        OF {processedCars.length} VEHICLES
                      </span>
                      <span className="uppercase">
                        {activeFilter} SELECTION
                      </span>
                    </div>

                    <div
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      id="catalog-cars-grid"
                    >
                      <AnimatePresence mode="popLayout">
                        {paginatedCars.length === 0 ? (
                          <div className="col-span-full py-24 flex flex-col items-center justify-center text-stone-400">
                            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p>{t("search.no_results")}</p>
                          </div>
                        ) : (
                          paginatedCars.map((car, idx) =>
                            renderCarCard(car, idx),
                          )
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Pagination Control buttons block */}
                      {totalPages > 1 && (
                        <div
                          className="flex items-center justify-between border-t border-stone-200/60 pt-6 mt-8"
                          id="catalog-pagination"
                        >
                          <motion.button
                            whileHover={
                              currentPage !== 1 ? { scale: 1.03 } : {}
                            }
                            whileTap={currentPage !== 1 ? { scale: 0.97 } : {}}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                            }}
                            onClick={() =>
                              setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
                            id="catalog-pag-prev"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>{t("catalog.prev")}</span>
                          </motion.button>

                          <div className="hidden sm:flex items-center gap-1.5">
                            {Array.from({ length: totalPages }).map(
                              (_, idx) => {
                                const pageNum = idx + 1;
                                const isCurrent = currentPage === pageNum;
                                return (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 15,
                                    }}
                                    key={`page-btn-${pageNum}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      isCurrent
                                        ? "bg-stone-950 text-[#FAF9F6] shadow-sm"
                                        : "hover:bg-stone-100 text-stone-600 border border-transparent hover:border-stone-200"
                                    }`}
                                  >
                                    {pageNum}
                                  </motion.button>
                                );
                              },
                            )}
                          </div>

                          <motion.button
                            whileHover={
                              currentPage !== totalPages ? { scale: 1.03 } : {}
                            }
                            whileTap={
                              currentPage !== totalPages ? { scale: 0.97 } : {}
                            }
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                            }}
                            onClick={() =>
                              setCurrentPage((p) => Math.min(p + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
                            id="catalog-pag-next"
                          >
                            <span>{t("catalog.next")}</span>
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Zero results matching state */
                    <div
                      className="py-20 text-center bg-white rounded-3xl border border-stone-200/60 max-w-xl mx-auto px-6"
                      id="catalog-no-results"
                    >
                      <div className="text-stone-400 font-mono text-xs mb-3">
                        {t("catalog.no_results")}
                      </div>
                      <button
                        onClick={() => {
                          setActiveFilter("All");
                          setSearchQuery("");
                          setPriceSort("none");
                        }}
                        className="mt-6 bg-stone-950 text-[#FAF9F6] text-xs uppercase tracking-widest font-semibold px-6 py-2.5 rounded-xl hover:bg-stone-800 transition-colors"
                      >
                        {t("catalog.clear_search")}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DEDICATED ADMIN PORTAL VIEW */}
      {currentView === "admin" && (
        <section
          className="bg-stone-50 min-h-[calc(100vh-5rem)] py-12 px-6 animate-fade-in"
          id="admin-portal-section"
        >
          <div className="max-w-7xl mx-auto">
            {!isAdminLoggedIn ? (
              <AdminLogin
                setIsAdminLoggedIn={setIsAdminLoggedIn}
                showToast={showToast}
              />
            ) : (
              /* DYNAMIC INTERACTIVE ADMIN DASHBOARD PANEL */
              <div className="space-y-8" id="admin-dashboard-panel">
                {/* Dashboard Control Header bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/60 pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mb-2">
                      <span
                        className="hover:text-stone-700 cursor-pointer"
                        onClick={() => {
                          setCurrentView("home");
                          window.location.hash = "";
                        }}
                      >
                        HOME
                      </span>
                      <span>/</span>
                      <span className="text-stone-700">
                        {t("admin.portal")}
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-950 uppercase">
                      {t("admin.portal")}
                    </h2>
                    <p className="text-stone-500 text-xs mt-1">
                      Configure active showroom catalog, adjust financing
                      variables, or add high-end automobiles instantly.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleOpenAddCar}
                      className="px-5 py-3 bg-stone-950 hover:bg-stone-800 text-[#FAF9F6] text-xs font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 shadow-md cursor-pointer"
                      id="admin-add-car-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t("admin.add_car")}</span>
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="px-4 py-3 border border-stone-200 bg-white hover:bg-stone-50 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                      id="admin-logout-btn"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("admin.logout")}</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Tabs content area */}
                <>
                    {/* Hero Image Settings */}
                    <div className="bg-white p-6 rounded-3xl border border-stone-200/50 shadow-xs mb-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-black text-stone-950 uppercase tracking-tight">
                            Hero Image Settings
                          </h3>
                          <p className="text-stone-500 text-xs mt-1">
                            Upload a custom hero image for the home page banner.
                          </p>
                        </div>
                        <label className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-6 py-2.5 rounded-xl cursor-pointer transition-colors border border-stone-200">
                          Upload New Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleHeroImageChange}
                          />
                        </label>
                      </div>
                      {heroImage && (
                        <div className="mt-4 aspect-[21/9] w-full max-w-lg rounded-xl overflow-hidden border border-stone-200 shadow-sm relative">
                          <img
                            src={heroImage}
                            alt="Hero Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Fleet Analytics cards grid */}
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                      id="admin-analytics-grid"
                    >
                      <div className="bg-white p-6 rounded-3xl border border-stone-200/50 shadow-xs">
                        <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                          {t("admin.analytics.size")}
                        </span>
                        <div className="text-3xl font-black text-stone-950 mt-1">
                          {cars.length} Vehicles
                        </div>
                        <p className="text-stone-500 text-[11px] mt-1">
                          {t("admin.analytics.size_desc")}
                        </p>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-stone-200/50 shadow-xs">
                        <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                          {t("admin.analytics.avg_price")}
                        </span>
                        <div className="text-3xl font-black text-stone-950 mt-1">
                          $
                          {cars.length
                            ? Math.round(
                                cars.reduce((sum, c) => sum + c.price, 0) /
                                  cars.length,
                              ).toLocaleString()
                            : 0}
                        </div>
                        <p className="text-stone-500 text-[11px] mt-1">
                          {t("admin.analytics.avg_desc")}
                        </p>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-stone-200/50 shadow-xs">
                        <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                          {t("admin.analytics.value")}
                        </span>
                        <div className="text-3xl font-black text-stone-950 mt-1">
                          $
                          {cars
                            .reduce((sum, c) => sum + c.price, 0)
                            .toLocaleString()}
                        </div>
                        <p className="text-stone-500 text-[11px] mt-1">
                          {t("admin.analytics.value_desc")}
                        </p>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-stone-200/50 shadow-xs">
                        <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                          {t("admin.analytics.filter")}
                        </span>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          <span className="bg-stone-100 text-stone-700 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            Sedans:{" "}
                            {cars.filter((c) => c.category === "Sedan").length}
                          </span>
                          <span className="bg-stone-100 text-stone-700 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            SUVs:{" "}
                            {cars.filter((c) => c.category === "SUV").length}
                          </span>
                          <span className="bg-stone-100 text-stone-700 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            Coupes:{" "}
                            {cars.filter((c) => c.category === "Coupe").length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main CRUD Table Container */}
                    <div
                      className="bg-white rounded-3xl border border-stone-200/60 shadow-xs overflow-hidden"
                      id="admin-crud-table-container"
                    >
                      <div className="px-6 py-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-lg font-black text-stone-950 uppercase tracking-tight">
                          {t("admin.crud.title")}
                        </h3>

                        {/* Tiny search/reset box for the table */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                        </div>
                      </div>

                      {cars.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table
                            className="w-full text-left border-collapse"
                            id="admin-crud-table"
                          >
                            <thead>
                              <tr className="bg-stone-50 border-b border-stone-100 text-[10px] font-mono uppercase tracking-widest text-stone-500">
                                <th className="py-4 px-6">
                                  {t("admin.crud.th.details")}
                                </th>
                                <th className="py-4 px-6">
                                  {t("admin.crud.th.cat")}
                                </th>
                                <th className="py-4 px-6 font-mono">
                                  {t("admin.crud.th.specs")}
                                </th>
                                <th className="py-4 px-6 text-right">
                                  {t("admin.crud.th.price")}
                                </th>
                                <th className="py-4 px-6 text-right">
                                  {t("admin.crud.th.finance")}
                                </th>
                                <th className="py-4 px-6 text-center">
                                  {t("admin.crud.th.actions")}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs">
                              {cars.map((car) => (
                                <tr
                                  key={car.id}
                                  onClick={() => handleOpenVehicleDetail(car)}
                                  className="hover:bg-stone-50/50 transition-colors cursor-pointer group/row"
                                >
                                  {/* Thumbnail and Brand/Model */}
                                  <td className="py-4 px-6 flex items-center gap-4">
                                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/50 shrink-0">
                                      <img
                                        src={car.image}
                                        alt={car.brand}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div>
                                      <span className="font-bold text-stone-950 text-sm block group-hover/row:text-amber-700 transition-colors">
                                        {car.brand} {car.model}
                                      </span>
                                      <span className="text-stone-400 font-mono text-[10px]">
                                        {car.year} · ID: {car.id}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Category tag */}
                                  <td className="py-4 px-6">
                                    <span className="bg-stone-100 text-stone-800 font-bold font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md">
                                      {car.category}
                                    </span>
                                  </td>

                                  {/* Specs detail columns */}
                                  <td className="py-4 px-6 font-mono text-stone-500 text-[11px]">
                                    <div>{car.mileage}</div>
                                    <div className="text-[10px] text-stone-400">
                                      {car.fuelType} · {car.transmission}
                                    </div>
                                  </td>

                                  {/* Pricing */}
                                  <td className="py-4 px-6 text-right font-bold text-stone-950 text-sm">
                                    ${car.price.toLocaleString()}
                                  </td>

                                  {/* Finance Estimate monthly */}
                                  <td className="py-4 px-6 text-right text-stone-600 font-semibold font-mono">
                                    ${car.estMonthly}/mo
                                  </td>

                                  {/* CRUD Action controls buttons row */}
                                  <td
                                    className="py-4 px-6 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => handleOpenEditCar(car)}
                                        className="p-2 border border-stone-200 hover:border-stone-950 bg-white hover:bg-stone-50 rounded-xl text-stone-600 hover:text-stone-950 transition-all cursor-pointer"
                                        title="Edit Automobile"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteCar(
                                            car.id,
                                            `${car.brand} ${car.model}`,
                                          )
                                        }
                                        className="p-2 border border-red-200 hover:border-red-650 bg-white hover:bg-red-50 text-red-600 transition-all rounded-xl cursor-pointer"
                                        title="Delete Automobile"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        /* Zero results inside table */
                        <div className="py-20 text-center px-6">
                          <div className="text-stone-400 font-mono text-xs mb-3">
                            NO AUTOMOBILES IN LIVE CATALOG
                          </div>
                        </div>
                      )}
                    </div>
                  </>
              </div>
            )}
          </div>
        </section>
      )}

      {/* WHY US SECTION - "A standard worth driving" */}
      <section
        className="py-24 px-6 max-w-7xl mx-auto overflow-hidden"
        id="why-us"
      >
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[10px] font-bold tracking-[0.25em] text-stone-500 uppercase">
            {t("nav.why_us")}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-stone-950 uppercase mt-2">
            {t("why.title")}
          </h2>
          <p className="text-stone-500 text-sm mt-3 max-w-md mx-auto">
            {t("why.subtitle")}
          </p>
        </motion.div>

        {/* Feature Grid with staggered items on viewport entry */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 35 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="bg-[#FAF9F6] border border-stone-200/50 p-8 rounded-3xl hover:border-stone-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-350 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-stone-950 text-white flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-950 tracking-tight mb-3">
                {t("why.feature1.title")}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {t("why.feature1.desc")}
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 35 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="bg-[#FAF9F6] border border-stone-200/50 p-8 rounded-3xl hover:border-stone-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-350 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-stone-950 text-white flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-950 tracking-tight mb-3">
                {t("why.feature3.title")}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {t("why.feature3.desc")}
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 35 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="bg-[#FAF9F6] border border-stone-200/50 p-8 rounded-3xl hover:border-stone-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-350 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-stone-950 text-white flex items-center justify-center mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-950 tracking-tight mb-3">
                {t("why.feature2.title")}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {t("why.feature2.desc")}
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 35 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="bg-[#FAF9F6] border border-stone-200/50 p-8 rounded-3xl hover:border-stone-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-350 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-stone-950 text-white flex items-center justify-center mb-6">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-950 tracking-tight mb-3">
                {t("why.feature4.title")}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {t("why.feature4.desc")}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER & CONTACT SECTION */}
      <footer
        className="bg-stone-950 text-stone-400 border-t border-stone-800/40 pt-20 pb-12 px-6"
        id="about"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">
            {/* Left Column: Brand Info */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                LA CITY CARS
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed max-w-md">
                {t("footer.brand.desc")}
              </p>
            </div>

            {/* Right Column: Coordinates & Visit Info */}
            <div className="md:col-span-5 md:pl-12 space-y-8">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 block mb-4">
                  {t("footer.inglewood")}
                </span>
                <ul className="space-y-3.5 text-sm text-stone-300">
                  <li className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>
                      817 N La Brea Ave
                      <br />
                      Inglewood, CA 90302
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>Sales: (213) 335-2323</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>Service: (626) 640-5005</span>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 block mb-4">
                  {t("footer.lapuente")}
                </span>
                <ul className="space-y-3.5 text-sm text-stone-300">
                  <li className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>
                      1515 N Hacienda Blvd
                      <br />
                      La Puente, CA 91744
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>Sales: (626) 624-4014</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>Service: (626) 640-5005</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sub Footer Legal Credits */}
          <div className="pt-8 border-t border-stone-900 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
            <div>{t("footer.rights")}</div>
            <div className="flex gap-6 text-stone-400 font-medium">
              <a
                href="https://www.instagram.com/lacitycars/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@lacitycars"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://x.com/lacitycars"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                X
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* GLOBAL TOAST NOTIFICATION SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
              toast.type === "error"
                ? "bg-stone-950 border-red-500/30 text-red-400"
                : "bg-stone-950 border-emerald-500/30 text-emerald-400"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 animate-pulse" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN CRUD MODAL OVERLAY */}
      <AnimatePresence>
        {isCrudModalOpen && isAdminLoggedIn && (
          <div className="fixed inset-0 bg-stone-950/45 backdrop-blur-xs z-50 flex items-start justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-stone-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
              style={{ maxHeight: "90vh", margin: "5vh auto", borderRadius: "16px" }}
              id="admin-crud-modal"
            >
              <div className="bg-stone-950 text-white p-6 flex-shrink-0 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    {editingCar ? t("crud.edit") : t("crud.add")}
                  </h3>
                  <p className="text-stone-400 text-[10px] mt-0.5">
                    {editingCar
                      ? "Modify specifications for this showroom model"
                      : "Enter specification details for the new model"}
                  </p>
                </div>
                <button
                  onClick={() => setIsCrudModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSaveCar}
                className="flex flex-col flex-1 overflow-hidden"
                noValidate
              >
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.brand")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Porsche, Ferrari"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.model")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 911 Carrera GTS"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.year")}
                    </label>
                    <input
                      type="number"
                      value={formYear}
                      onChange={(e) => setFormYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.category")}
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e: any) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Electric">Electric</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      Transmission
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Auto, Manual"
                      value={formTransmission}
                      onChange={(e) => setFormTransmission(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.price")}
                    </label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.est_monthly")}
                    </label>
                    <input
                      type="number"
                      value={formEstMonthly}
                      onChange={(e) =>
                        setFormEstMonthly(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.mileage")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4,200 mi"
                      value={formMileage}
                      onChange={(e) => setFormMileage(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.fuel")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Petrol"
                      value={formFuelType}
                      onChange={(e) => setFormFuelType(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.transmission")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Auto"
                      value={formTransmission}
                      onChange={(e) => setFormTransmission(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.drive_type")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AWD System"
                      value={formDriveType}
                      onChange={(e) => setFormDriveType(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.ext_color")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Obsidian Metallic"
                      value={formExteriorColor}
                      onChange={(e) => setFormExteriorColor(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.int_color")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ebony Leather"
                      value={formInteriorColor}
                      onChange={(e) => setFormInteriorColor(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.msrp")}
                    </label>
                    <input
                      type="number"
                      value={formMsrp}
                      onChange={(e) => setFormMsrp(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.stock")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LA-POR-21A"
                      value={formStockNumber}
                      onChange={(e) => setFormStockNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div className="sm:col-span-1 col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      {t("crud.vin")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JTDKNRAU4H21..."
                      value={formVin}
                      onChange={(e) => setFormVin(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      EV Rebate ($)
                    </label>
                    <input
                      type="number"
                      value={formEvRebateAmount}
                      onChange={(e) => setFormEvRebateAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      Net Cost ($)
                    </label>
                    <input
                      type="number"
                      value={formNetCost}
                      onChange={(e) => setFormNetCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsEvEligible}
                        onChange={(e) => setFormIsEvEligible(e.target.checked)}
                        className="w-4 h-4 rounded text-stone-900 focus:ring-stone-950 border-stone-300"
                      />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-700">EV Eligible</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inglewood"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900"
                    />
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                    Manager's Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a detailed luxury description..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900 resize-none"
                  />
                </div>
                
                <div className="border-t border-stone-100 pt-4">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                    Standard Equipment (Paste full list)
                  </label>
                  <textarea
                    rows={5}
                    placeholder="e.g. Audio, Safety, Climate Control..."
                    value={formStandardEquipment}
                    onChange={(e) => setFormStandardEquipment(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900 resize-none"
                  />
                </div>
                
                <div className="border-t border-stone-100 pt-4">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                    Legal Disclaimer / Fine Print
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Standard legal text, tax eligibility rules, and warranty terms..."
                    value={formLegalDisclaimer}
                    onChange={(e) => setFormLegalDisclaimer(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900 resize-none"
                  />
                </div>

                <div className="border-t border-stone-100 pt-4">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                    Local Image Upload (Multiple)
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                    />
                  </div>
                  {(formImages.length > 0 || formImage) && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {(formImages.length > 0
                        ? formImages
                        : formImage
                          ? [formImage]
                          : []
                      ).map((img, i) => (
                        <div
                          key={i}
                          draggable
                          onDragStart={() => setDraggedImgIdx(i)}
                          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedImgIdx === null || draggedImgIdx === i) return;
                            const currentImages = formImages.length > 0 ? formImages : (formImage ? [formImage] : []);
                            const newImages = [...currentImages];
                            const draggedImg = newImages[draggedImgIdx];
                            newImages.splice(draggedImgIdx, 1);
                            newImages.splice(i, 0, draggedImg);
                            setFormImages(newImages);
                            if (newImages.length > 0) setFormImage(newImages[0]);
                            setDraggedImgIdx(null);
                          }}
                          className={`relative aspect-square border border-stone-200 rounded-lg overflow-hidden bg-stone-50 group cursor-move ${draggedImgIdx === i ? 'opacity-50' : 'opacity-100'}`}
                        >
                          <img
                            src={img}
                            alt={`Preview ${i}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (formImages.length > 0) {
                                const newImages = formImages.filter(
                                  (_, idx) => idx !== i,
                                );
                                setFormImages(newImages);
                                if (newImages.length === 0) setFormImage("");
                                else if (i === 0) setFormImage(newImages[0]);
                              } else {
                                setFormImage("");
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete Image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4 border-t border-stone-200 pt-4">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                    360° Photo-Spin Sequence
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleSpinImageFileChange}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-stone-950 text-stone-900 bg-white cursor-pointer"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Upload a sequence of images (e.g. 36 frames) to create a
                    draggable 360° view.
                  </p>

                  {formSpinImages.length > 0 && (
                    <div className="mt-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-stone-700">
                          {formSpinImages.length} frames uploaded
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormSpinImages([])}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                        >
                          Clear Sequence
                        </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                        {formSpinImages.map((img, i) => (
                          <div
                            key={i}
                            draggable
                            onDragStart={() => setDraggedSpinImgIdx(i)}
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedSpinImgIdx === null || draggedSpinImgIdx === i) return;
                              const newImages = [...formSpinImages];
                              const draggedImg = newImages[draggedSpinImgIdx];
                              newImages.splice(draggedSpinImgIdx, 1);
                              newImages.splice(i, 0, draggedImg);
                              setFormSpinImages(newImages);
                              setDraggedSpinImgIdx(null);
                            }}
                            className={`flex-shrink-0 w-16 h-16 border border-stone-200 rounded overflow-hidden snap-center cursor-move ${draggedSpinImgIdx === i ? 'opacity-50' : 'opacity-100'}`}
                          >
                            <img
                              src={img}
                              alt={`frame ${i}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
                <div className="p-6 pt-4 flex items-center justify-end gap-2.5 border-t border-stone-100 bg-stone-50 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCrudModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
                  >
                    {t("crud.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-5 py-2 ${isSaving ? "bg-stone-500 cursor-not-allowed" : "bg-stone-950 hover:bg-stone-800"} text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2`}
                  >
                    {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {isSaving ? "Saving..." : t("crud.save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-stone-200"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-center text-stone-950 mb-2">
                Confirm Deletion
              </h3>
              <p className="text-stone-500 text-sm text-center mb-6">
                Are you sure you want to permanently delete {deleteConfirm.title ? <span className="font-bold text-stone-900">{deleteConfirm.title}</span> : "this item"}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteAction()}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURY TEST DRIVE BOOKING MODAL */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedCarId={selectedCarId}
        cars={cars}
      />

      {selectedDetailCar && (
        <VehicleDetailView
          car={selectedDetailCar}
          isOpen={isDetailViewOpen}
          onClose={handleCloseVehicleDetail}
          onEditSpecs={handleOpenEditCar}
          onOverridePrice={handleOverridePrice}
          onViewActiveBookings={handleViewActiveBookings}
          isAdmin={isAdminLoggedIn && currentView === "admin"}
          onReserve={(carId) => {
            setIsDetailViewOpen(false);
            handleOpenBooking(carId);
          }}
          onOpenChat={() => {
            try {
              if (typeof window !== "undefined" && (window as any).HelpCrunch) {
                (window as any).HelpCrunch('showChatWidget');
                (window as any).HelpCrunch('openChat');
              }
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}
    </div>
  );
}
