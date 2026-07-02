import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, User, Mail, Phone, Car as CarIcon, CheckCircle, Calculator } from "lucide-react";
import { CARS, Car } from "../data/cars";
import { sanitizeInput } from "../utils/security";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCarId?: string;
  cars?: Car[];
}

export default function BookingModal({ isOpen, onClose, selectedCarId, cars = CARS }: BookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [chosenCarId, setChosenCarId] = useState(selectedCarId || "");
  const [date, setDate] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Dynamic state updates when selectedCarId changes
  useEffect(() => {
    if (selectedCarId) {
      setChosenCarId(selectedCarId);
    }
  }, [selectedCarId]);

  // Handle modal body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset state on close
      setTimeout(() => {
        setName("");
        setEmail("");
        setPhone("");
        setDate("");
        setIsSubmitted(false);
        setErrors({});
      }, 300);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const selectedCar = cars.find((c) => c.id === chosenCarId);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    else if (name.trim().length < 2) newErrors.name = "Please enter your full name";

    if (!email.trim()) newErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";

    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (phone.replace(/\D/g, "").length < 10) newErrors.phone = "Please enter a valid 10-digit phone number";

    if (!chosenCarId) newErrors.chosenCarId = "Please select a vehicle";
    if (!date) newErrors.date = "Please select a convenient date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setName(sanitizeInput(name));
      setEmail(sanitizeInput(email));
      setPhone(sanitizeInput(phone));
      setDate(sanitizeInput(date));
      setIsSubmitted(true);
    }
  };

  // Generate a mock confirmation ID
  const confId = `LAC-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            id="modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#FAF9F6] text-stone-900 shadow-2xl border border-stone-200/50"
            id="booking-modal-container"
          >
            {/* Header decor */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-stone-950" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-200/50 text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition-colors z-10"
              aria-label="Close modal"
              id="close-modal-button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              {!isSubmitted ? (
                <div>
                  <div className="mb-6">
                    <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">Luxury Experience</span>
                    <h3 className="text-2xl font-bold tracking-tight text-stone-950 mt-1 font-sans">
                      Schedule a Private Viewing
                    </h3>
                    <p className="text-stone-500 text-sm mt-1">
                      Submit your preferences, and an LA City Cars concierge will prepare the vehicle for your exclusive demonstration.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4" id="booking-form">
                    {/* Vehicle Selection dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">
                        Select Automobile
                      </label>
                      <div className="relative">
                        <CarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <select
                          value={chosenCarId}
                          onChange={(e) => setChosenCarId(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 bg-white border ${
                            errors.chosenCarId ? "border-red-500" : "border-stone-200"
                          } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-stone-950 focus:border-stone-950 transition-shadow appearance-none`}
                          id="form-car-select"
                        >
                          <option value="">Choose a curated model...</option>
                          {cars.map((car) => (
                            <option key={car.id} value={car.id}>
                              {car.year} {car.brand} {car.model} — ${car.price.toLocaleString("en-US")}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                          <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.chosenCarId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.chosenCarId}</p>}
                    </div>

                    {/* Active Selected Car Info Preview */}
                    {selectedCar && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-stone-100 p-3 rounded-xl flex items-center gap-3 border border-stone-200/30"
                      >
                        <img
                          src={selectedCar.image}
                          alt={selectedCar.model}
                          className="w-16 h-11 object-cover rounded-lg border border-stone-200 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-stone-950 truncate">
                            {selectedCar.brand} {selectedCar.model}
                          </h4>
                          <div className="flex gap-2 text-[10px] text-stone-500 font-mono mt-0.5">
                            <span>{selectedCar.mileage}</span>
                            <span>•</span>
                            <span>{selectedCar.transmission}</span>
                            <span>•</span>
                            <span>{selectedCar.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-stone-950">${selectedCar.price.toLocaleString("en-US")}</div>
                          <div className="text-[9px] text-stone-500 font-mono">Est. ${selectedCar.estMonthly}/mo</div>
                        </div>
                      </motion.div>
                    )}

                    {/* Name input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your luxurious name"
                          className={`w-full pl-10 pr-4 py-3 bg-white border ${
                            errors.name ? "border-red-500" : "border-stone-200"
                          } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-stone-950 focus:border-stone-950 transition-shadow`}
                          id="form-name-input"
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                    </div>

                    {/* Email and Phone Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@domain.com"
                            className={`w-full pl-10 pr-4 py-3 bg-white border ${
                              errors.email ? "border-red-500" : "border-stone-200"
                            } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-stone-950 focus:border-stone-950 transition-shadow`}
                            id="form-email-input"
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(310) 555-0199"
                            className={`w-full pl-10 pr-4 py-3 bg-white border ${
                              errors.phone ? "border-red-500" : "border-stone-200"
                            } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-stone-950 focus:border-stone-950 transition-shadow`}
                            id="form-phone-input"
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Preferred Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">
                        Preferred Demonstration Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 bg-white border ${
                            errors.date ? "border-red-500" : "border-stone-200"
                          } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-stone-950 focus:border-stone-950 transition-shadow`}
                          id="form-date-input"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-stone-950 hover:bg-stone-800 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mt-2 font-sans text-sm tracking-wide"
                      id="form-submit-button"
                    >
                      Confirm Booking Request
                    </button>
                  </form>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center flex flex-col items-center justify-center"
                  id="booking-success-container"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="p-4 bg-stone-900 rounded-full text-[#FAF9F6] mb-6"
                  >
                    <CheckCircle className="w-12 h-12 stroke-[1.5]" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-stone-950 mb-2 font-sans">
                    Request Confirmed
                  </h3>
                  <p className="text-stone-600 text-sm max-w-sm mb-6 leading-relaxed">
                    Success! We will contact you shortly. A Private Concierge has been assigned to prepare your chosen automobile.
                  </p>

                  {/* Summary of Reservation details */}
                  <div className="w-full bg-stone-100 p-5 rounded-2xl border border-stone-200 text-left mb-6 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-500 font-mono">CONFIRMATION ID</span>
                      <span className="font-bold text-stone-950 font-mono" id="success-confirmation-id">{confId}</span>
                    </div>
                    <hr className="border-stone-200/50" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-500 font-mono">AUTOMOBILE</span>
                      <span className="font-bold text-stone-950">
                        {selectedCar ? `${selectedCar.year} ${selectedCar.brand} ${selectedCar.model}` : "Selected Luxury Model"}
                      </span>
                    </div>
                    <hr className="border-stone-200/50" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-500 font-mono">GUEST</span>
                      <span className="font-bold text-stone-950">{name}</span>
                    </div>
                    <hr className="border-stone-200/50" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-500 font-mono">SCHEDULED DATE</span>
                      <span className="font-bold text-stone-950">{date}</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="bg-stone-950 hover:bg-stone-800 text-[#FAF9F6] px-8 py-3 rounded-xl transition-all font-medium text-xs uppercase tracking-widest"
                    id="success-done-button"
                  >
                    Return To Showroom
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
