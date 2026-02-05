
export interface SubCategoryData {
  id: number;
  catSlug: string;
  name: string;
  slug: string;
  startingPrice: number;
  description: string;
}

export const SUBCATEGORIES: SubCategoryData[] = [
  // 1. AC REPAIR
  { id: 101, catSlug: 'ac-repair', name: 'Split AC Service', slug: 'split-ac-service', startingPrice: 499, description: 'Deep cleaning with jet pump technology.' },
  { id: 102, catSlug: 'ac-repair', name: 'Window AC Service', slug: 'window-ac-service', startingPrice: 399, description: 'Complete coil and filter cleaning.' },
  { id: 103, catSlug: 'ac-repair', name: 'AC Installation', slug: 'ac-installation', startingPrice: 1199, description: 'Precision mounting and pipe layout.' },
  { id: 104, catSlug: 'ac-repair', name: 'AC Uninstallation', slug: 'ac-uninstallation', startingPrice: 599, description: 'Safe removal and packing.' },
  { id: 105, catSlug: 'ac-repair', name: 'Gas Charging', slug: 'ac-gas-charge', startingPrice: 2499, description: 'Eco-friendly refrigerant refill.' },

  // 2. APPLIANCES
  { id: 201, catSlug: 'appliances', name: 'Refrigerator Repair', slug: 'fridge-repair', startingPrice: 299, description: 'Cooling issues, gas refill, and compressor repair.' },
  { id: 202, catSlug: 'appliances', name: 'Washing Machine Repair', slug: 'washing-machine-repair', startingPrice: 349, description: 'Fix for automatic and semi-automatic machines.' },
  { id: 203, catSlug: 'appliances', name: 'Water Purifier Service', slug: 'ro-service', startingPrice: 499, description: 'Filter replacement and TDS calibration.' },
  { id: 204, catSlug: 'appliances', name: 'Microwave Repair', slug: 'microwave-repair', startingPrice: 249, description: 'Heating and circuit board repairs.' },
  { id: 205, catSlug: 'appliances', name: 'Geyser Service', slug: 'geyser-service', startingPrice: 199, description: 'Heating element and safety valve check.' },

  // 3. PLUMBING
  { id: 301, catSlug: 'plumbing', name: 'Tap & Mixer Repair', slug: 'tap-repair', startingPrice: 99, description: 'Fixing leaks and replacing old taps.' },
  { id: 302, catSlug: 'plumbing', name: 'Toilet Fix', slug: 'toilet-repair', startingPrice: 199, description: 'Flush repair and seat replacement.' },
  { id: 303, catSlug: 'plumbing', name: 'Water Tank Cleaning', slug: 'tank-clean', startingPrice: 599, description: 'Multi-stage mechanical and chemical cleaning.' },
  { id: 304, catSlug: 'plumbing', name: 'Pipe Blockage Removal', slug: 'drainage-fix', startingPrice: 299, description: 'Clearing sink and toilet blocks.' },
  { id: 305, catSlug: 'plumbing', name: 'Whole House Plumbing', slug: 'full-plumbing', startingPrice: 4999, description: 'New piping and renovation work.' },

  // 4. ELECTRICIANS
  { id: 401, catSlug: 'electricians', name: 'Fan Repair', slug: 'fan-repair', startingPrice: 199, description: 'Motor, coil, or regulator issues.' },
  { id: 402, catSlug: 'electricians', name: 'Switch/Socket Fix', slug: 'switch-socket', startingPrice: 99, description: 'Repairing burnt or loose sockets.' },
  { id: 403, catSlug: 'electricians', name: 'Light Installation', slug: 'light-install', startingPrice: 149, description: 'Mounting chandeliers, LEDs, or tubes.' },
  { id: 404, catSlug: 'electricians', name: 'MCB & Fuse Box', slug: 'mcb-fix', startingPrice: 299, description: 'Tripping issues and rewiring.' },
  { id: 405, catSlug: 'electricians', name: 'Full House Wiring', slug: 'house-wiring', startingPrice: 15000, description: 'New house concealed or open wiring.' },

  // 5. CLEANING
  { id: 501, catSlug: 'cleaning', name: 'Full Home Deep Clean', slug: 'home-deep-clean', startingPrice: 3499, description: 'Corner-to-corner sanitization.' },
  { id: 502, catSlug: 'cleaning', name: 'Bathroom Cleaning', slug: 'bathroom-clean', startingPrice: 499, description: 'Tile scrubbing and stain removal.' },
  { id: 503, catSlug: 'cleaning', name: 'Kitchen Deep Clean', slug: 'kitchen-clean', startingPrice: 1299, description: 'Degreasing of cabinets and appliances.' },
  { id: 504, catSlug: 'cleaning', name: 'Sofa Cleaning', slug: 'sofa-shampoo', startingPrice: 249, description: 'Per seat shampoo and vacuuming.' },
  { id: 505, catSlug: 'cleaning', name: 'Pest Control', slug: 'pest-control', startingPrice: 899, description: 'Protection against roaches, ants, and bugs.' },

  // 6. PAINTING
  { id: 601, catSlug: 'painting', name: 'Interior Painting', slug: 'interior-paint', startingPrice: 2999, description: 'Fresh coat or repainting for rooms.' },
  { id: 602, catSlug: 'painting', name: 'Exterior Painting', slug: 'exterior-paint', startingPrice: 9999, description: 'Weatherproof coating for outer walls.' },
  { id: 603, catSlug: 'painting', name: 'Waterproofing', slug: 'waterproof-wall', startingPrice: 4999, description: 'Sealing terrace and wall leakages.' },

  // 7. CARPENTERS
  { id: 701, catSlug: 'carpenters', name: 'Furniture Repair', slug: 'furniture-fix', startingPrice: 199, description: 'Fixing hinges, locks, and broken parts.' },
  { id: 702, catSlug: 'carpenters', name: 'New Woodwork', slug: 'custom-wood', startingPrice: 5000, description: 'Making new cupboards or tables.' },

  // 8. MOVING
  { id: 801, catSlug: 'moving', name: 'Local Shifting', slug: 'local-moving', startingPrice: 3000, description: 'Move items within the same city.' },
  { id: 802, catSlug: 'moving', name: 'Interstate Moving', slug: 'long-distance-move', startingPrice: 15000, description: 'Safe long-distance relocation.' },

  // 9. VEHICLE CARE
  { id: 901, catSlug: 'vehicle-care', name: 'Car Wash at Home', slug: 'car-wash', startingPrice: 499, description: 'Exterior wash and interior vacuuming.' },
  { id: 902, catSlug: 'vehicle-care', name: 'Bike Service', slug: 'bike-repair', startingPrice: 599, description: 'Oil change and mechanical checkup.' },

  // 10. BEAUTY WOMEN
  { id: 1001, catSlug: 'beauty-women', name: 'Salon at Home', slug: 'salon-women', startingPrice: 599, description: 'Threading, waxing, and facials.' },
  { id: 1002, catSlug: 'beauty-women', name: 'Bridal Makeup', slug: 'bridal-makeup', startingPrice: 5000, description: 'Professional makeup for your big day.' },

  // 11. BEAUTY MEN
  { id: 1101, catSlug: 'beauty-men', name: 'Haircut & Beard', slug: 'men-grooming', startingPrice: 249, description: 'Professional barber service at home.' },
  { id: 1102, catSlug: 'beauty-men', name: 'Mens Massage', slug: 'men-massage', startingPrice: 899, description: 'Stress relief body massage.' },

  // 12. MASSAGE
  { id: 1201, catSlug: 'massage', name: 'Swedish Massage', slug: 'swedish-massage', startingPrice: 1299, description: 'Relaxing full body oil massage.' },
  { id: 1202, catSlug: 'massage', name: 'Pain Relief Therapy', slug: 'deep-tissue', startingPrice: 1599, description: 'Targeting muscle tension and knots.' },

  // 13. FITNESS
  { id: 1301, catSlug: 'fitness', name: 'Personal Trainer', slug: 'fitness-coach', startingPrice: 1000, description: 'One-on-one home workout sessions.' },
  { id: 1302, catSlug: 'fitness', name: 'Yoga Instructor', slug: 'yoga-teacher', startingPrice: 800, description: 'Personalized yoga for health.' },

  // 14. HEALTH
  { id: 1401, catSlug: 'health', name: 'Nurse at Home', slug: 'home-nurse', startingPrice: 1200, description: 'Patient care and medical assistance.' },
  { id: 1402, catSlug: 'health', name: 'Physiotherapy', slug: 'physio-session', startingPrice: 600, description: 'Rehabilitation and exercise therapy.' },

  // 15. EDUCATION
  { id: 1501, catSlug: 'education', name: 'School Tutor', slug: 'k12-tutor', startingPrice: 500, description: 'Math, Science, and English for kids.' },
  { id: 1502, catSlug: 'education', name: 'Music Lessons', slug: 'music-teacher', startingPrice: 700, description: 'Guitar, Piano, or Vocal training.' },

  // 16. IT REPAIR
  { id: 1601, catSlug: 'it-repair', name: 'Laptop Repair', slug: 'laptop-fix', startingPrice: 499, description: 'Hardware and software troubleshooting.' },
  { id: 1602, catSlug: 'it-repair', name: 'Mobile Screen Fix', slug: 'phone-repair', startingPrice: 999, description: 'Quick screen and battery replacement.' },

  // 17. LEGAL
  { id: 1701, catSlug: 'legal', name: 'Document Notary', slug: 'notary-service', startingPrice: 300, description: 'Legal verification and stamping.' },
  { id: 1702, catSlug: 'legal', name: 'Lawyer Consultation', slug: 'legal-advice', startingPrice: 1000, description: 'Talk to experts on legal matters.' },

  // 18. FINANCE
  { id: 1801, catSlug: 'finance', name: 'Tax Filing (ITR)', slug: 'itr-filing', startingPrice: 999, description: 'Professional help for income tax.' },
  { id: 1802, catSlug: 'finance', name: 'GST Registration', slug: 'gst-service', startingPrice: 1500, description: 'Business tax setup and filings.' },

  // 19. EVENTS
  { id: 1901, catSlug: 'events', name: 'Birthday Planner', slug: 'party-decor', startingPrice: 4999, description: 'Decoration and event management.' },
  { id: 1902, catSlug: 'events', name: 'Event Photographer', slug: 'photography', startingPrice: 3000, description: 'Candid and traditional event coverage.' },

  // 20. TAILORING
  { id: 2001, catSlug: 'tailoring', name: 'Dress Alteration', slug: 'dress-fix', startingPrice: 150, description: 'Fitting and minor adjustments.' },
  { id: 2002, catSlug: 'tailoring', name: 'Custom Stitching', slug: 'tailor-stitch', startingPrice: 600, description: 'New blouses, suits, and dresses.' },

  // 21. GARDENING
  { id: 2101, catSlug: 'gardening', name: 'Lawn Mowing', slug: 'grass-cutting', startingPrice: 300, description: 'Regular maintenance of your lawn.' },
  { id: 2102, catSlug: 'gardening', name: 'Plantation Service', slug: 'home-garden', startingPrice: 800, description: 'New plants and garden setup.' },

  // 22. PET CARE
  { id: 2201, catSlug: 'pet-care', name: 'Pet Grooming', slug: 'dog-wash', startingPrice: 999, description: 'Bath, hair trimming, and nail clip.' },
  { id: 2202, catSlug: 'pet-care', name: 'Vet Home Visit', slug: 'pet-doctor', startingPrice: 500, description: 'Checkup and vaccination at home.' },

  // 23. INTERIOR
  { id: 2301, catSlug: 'interior', name: 'Modular Kitchen', slug: 'kitchen-design', startingPrice: 50000, description: 'Full kitchen renovation and setup.' },
  { id: 2302, catSlug: 'interior', name: 'False Ceiling', slug: 'ceiling-design', startingPrice: 5000, description: 'Modern POP or Gypsum designs.' },

  // 24. SECURITY
  { id: 2401, catSlug: 'security', name: 'CCTV Installation', slug: 'cctv-setup', startingPrice: 1999, description: 'Home and office security camera setup.' },
  { id: 2402, catSlug: 'security', name: 'Smart Lock Setup', slug: 'door-lock', startingPrice: 1499, description: 'Installation of biometric locks.' },

  // 25. LAUNDRY
  { id: 2501, catSlug: 'laundry', name: 'Wash & Fold', slug: 'wash-fold', startingPrice: 20, description: 'Regular laundry by weight.' },
  { id: 2502, catSlug: 'laundry', name: 'Steam Iron', slug: 'ironing', startingPrice: 10, description: 'Wrinkle-free pressing for clothes.' },

  // 26. CAREGIVING
  { id: 2601, catSlug: 'caregiving', name: 'Elderly Care', slug: 'senior-care', startingPrice: 1500, description: 'Assistance for seniors at home.' },
  { id: 2602, catSlug: 'caregiving', name: 'Baby Sitting', slug: 'nanny-service', startingPrice: 1200, description: 'Reliable caretakers for your kids.' },
];
