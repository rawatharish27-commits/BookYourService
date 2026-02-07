// Production-grade database seeder for BookYourService
// 30+ Categories, 15+ Subcategories each, 200+ Services

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// COMPREHENSIVE SERVICE CATEGORIES
// ============================================

const categories = [
  // 1. HOME MAINTENANCE & REPAIRS
  {
    name: 'Home Maintenance & Repairs',
    slug: 'home-maintenance-repairs',
    description: 'Complete home repair, maintenance, and improvement services for every corner of your house',
    icon: '🔧',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    color: '#ef4444',
    order: 1,
    subcategories: [
      'Plumbing Services', 'Electrical Work', 'AC & HVAC Repair', 'Carpentry & Woodwork',
      'Painting & Decoration', 'Handyman Services', 'Masonry & Tiling', 'Pest Control',
      'Home Cleaning Services', 'Water Tank Cleaning', 'Roofing Services', 'Glass & Mirror',
      'Window & Door Repair', 'Solar Panel Installation', 'Insulation Services',
      'Geyser & Water Heater', 'Locksmith Services', 'Furniture Assembly',
      'Wallpaper Installation', 'Flooring Services'
    ]
  },

  // 2. APPLIANCES & ELECTRONICS
  {
    name: 'Appliances & Electronics',
    slug: 'appliances-electronics',
    description: 'Expert repair and maintenance for all home appliances and electronic devices',
    icon: '🔌',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
    color: '#f97316',
    order: 2,
    subcategories: [
      'Refrigerator Repair', 'Washing Machine Repair', 'AC Repair', 'Microwave Repair',
      'Television Repair', 'Laptop & Computer Repair', 'Mobile Phone Repair', 'Gadget Repair',
      'Kitchen Appliances', 'Small Appliances', 'Gaming Console Repair', 'Printer Repair',
      'Network Setup & WiFi', 'Smart Home Installation', 'Home Theater Setup',
      'Data Recovery Services', 'CCTV Installation', 'Intercom Systems',
      'Electrical Panel Installation', 'UPS & Inverter Services'
    ]
  },

  // 3. OUTDOOR & PROPERTY
  {
    name: 'Outdoor & Property',
    slug: 'outdoor-property',
    description: 'Complete outdoor maintenance, gardening, and property care services',
    icon: '🌳',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    color: '#22c55e',
    order: 3,
    subcategories: [
      'Lawn & Gardening', 'Landscaping Services', 'Tree Services', 'Exterior Cleaning',
      'Moving & Relocation', 'Storage Services', 'Pest Control Outdoor', 'Fence Repair',
      'Deck & Patio Maintenance', 'Swimming Pool Maintenance', 'Gazebo & Pergola', 'Outdoor Lighting',
      'Driveway Services', 'Parking Solutions', 'Carport Construction', 'Waterproofing',
      'Exterior Painting', 'Power Washing', 'Snow Removal', 'Gutter Cleaning'
    ]
  },

  // 4. BEAUTY & WELLNESS
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    description: 'Personal care, beauty treatments, and wellness services at your doorstep',
    icon: '💆',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800',
    color: '#ec4899',
    order: 4,
    subcategories: [
      'Salon for Women', 'Barber & Grooming for Men', 'Hair Styling & Coloring', 'Bridal Makeup',
      'Facial & Skincare', 'Spa & Body Treatments', 'Massage Therapy', 'Aromatherapy',
      'Nail Art & Manicure', 'Eyebrow & Lash Services', 'Waxing & Hair Removal', 'Mehndi & Tattoos',
      'Fitness Training', 'Yoga & Meditation', 'Personal Training', 'Diet & Nutrition',
      'Physiotherapy', 'Acupuncture', 'Chiropractic Services', 'Mental Health Counseling'
    ]
  },

  // 5. PROFESSIONAL & LIFESTYLE
  {
    name: 'Professional & Lifestyle',
    slug: 'professional-lifestyle',
    description: 'Professional services for business, education, and lifestyle assistance',
    icon: '🎯',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    color: '#8b5cf6',
    order: 5,
    subcategories: [
      'Home Tutoring', 'Language Learning', 'Music Lessons', 'Dance Classes',
      'Event Planning', 'Wedding Planning', 'Corporate Events', 'Birthday Party Planning',
      'Photography', 'Videography', 'Drone Services', 'Photo Editing',
      'Tailoring', 'Dress Designing', 'Embroidery', 'Fashion Styling',
      'Pet Care', 'Dog Training', 'Pet Grooming', 'Veterinary Services'
    ]
  },

  // 6. EDUCATION & LEARNING
  {
    name: 'Education & Learning',
    slug: 'education-learning',
    description: 'Comprehensive educational services and learning programs for all ages',
    icon: '📚',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    color: '#3b82f6',
    order: 6,
    subcategories: [
      'Mathematics Tutoring', 'Science Tutoring', 'English & Languages', 'Computer Skills',
      'Exam Preparation', 'Career Counseling', 'Personality Development', 'Public Speaking',
      'Art & Craft Classes', 'Music & Instruments', 'Dance & Performing Arts', 'Sports Coaching',
      'Online Learning', 'Study Abroad Counseling', 'Entrance Exam Coaching', 'Skill Development',
      'Career Training', 'Professional Courses', 'Corporate Training', 'Workshop Facilitation'
    ]
  },

  // 7. HEALTH & FITNESS
  {
    name: 'Health & Fitness',
    slug: 'health-fitness',
    description: 'Complete health, fitness, and wellness services for a better lifestyle',
    icon: '💪',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    color: '#10b981',
    order: 7,
    subcategories: [
      'Personal Training', 'Group Fitness', 'Yoga Classes', 'Pilates',
      'CrossFit Training', 'Martial Arts', 'Boxing', 'Zumba & Dance Fitness',
      'Nutrition Consultation', 'Diet Planning', 'Weight Management', 'Sports Training',
      'Physical Therapy', 'Massage Therapy', 'Chiropractic Care', 'Acupuncture',
      'Mental Health', 'Meditation', 'Stress Management', 'Sleep Coaching'
    ]
  },

  // 8. CLEANING SERVICES
  {
    name: 'Cleaning Services',
    slug: 'cleaning-services',
    description: 'Professional cleaning services for homes, offices, and commercial spaces',
    icon: '🧹',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    color: '#06b6d4',
    order: 8,
    subcategories: [
      'Home Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Move-in/Move-out Cleaning',
      'Carpet Cleaning', 'Upholstery Cleaning', 'Window Cleaning', 'Pressure Washing',
      'Post-Construction Cleaning', 'Disinfection Services', 'Green Cleaning', 'Eco-Friendly Cleaning',
      'Kitchen Cleaning', 'Bathroom Cleaning', 'Bedroom Cleaning', 'Full House Cleaning',
      'Appliance Cleaning', 'Gutter Cleaning', 'Pool Cleaning', 'Warehouse Cleaning'
    ]
  },

  // 9. AUTOMOTIVE SERVICES
  {
    name: 'Automotive Services',
    slug: 'automotive-services',
    description: 'Complete car care, repair, and maintenance services',
    icon: '🚗',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    color: '#dc2626',
    order: 9,
    subcategories: [
      'Car Washing & Detailing', 'Car Repair', 'Bike Repair', 'Oil Change',
      'Tire Services', 'Battery Services', 'AC Repair', 'Brake Services',
      'Engine Diagnostics', 'Transmission Repair', 'Car Painting', 'Dent Removal',
      'Windshield Repair', 'Car Inspection', 'Roadside Assistance', 'Car Rental',
      'Car Wrapping', 'Ceramic Coating', 'Interior Detailing', 'Engine Tuning'
    ]
  },

  // 10. LEGAL & FINANCIAL SERVICES
  {
    name: 'Legal & Financial',
    slug: 'legal-financial',
    description: 'Professional legal, accounting, and financial consulting services',
    icon: '⚖️',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    color: '#4f46e5',
    order: 10,
    subcategories: [
      'Legal Consultation', 'Document Verification', 'Notary Services', 'Contract Drafting',
      'Property Legal', 'Family Law', 'Business Registration', 'Tax Filing',
      'Accounting Services', 'Bookkeeping', 'Payroll Management', 'Financial Planning',
      'Investment Advisory', 'Insurance Services', 'Loan Assistance', 'Audit Services',
      'GST Registration', 'Company Formation', 'Trademark Registration', 'Intellectual Property'
    ]
  },

  // 11. IT & TECH SUPPORT
  {
    name: 'IT & Tech Support',
    slug: 'it-tech-support',
    description: 'Complete IT solutions, tech support, and digital services',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    color: '#2563eb',
    order: 11,
    subcategories: [
      'Computer Repair', 'Laptop Repair', 'Network Setup', 'WiFi Installation',
      'Data Recovery', 'Virus Removal', 'Software Installation', 'Hardware Upgrade',
      'Web Development', 'App Development', 'Database Management', 'Cloud Services',
      'Cyber Security', 'Server Maintenance', 'IT Consultation', 'Digital Marketing',
      'SEO Services', 'Social Media Management', 'Email Setup', 'Cloud Backup'
    ]
  },

  // 12. EVENTS & ENTERTAINMENT
  {
    name: 'Events & Entertainment',
    slug: 'events-entertainment',
    description: 'Complete event planning, entertainment, and celebration services',
    icon: '🎉',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    color: '#e11d48',
    order: 12,
    subcategories: [
      'Event Planning', 'Wedding Planning', 'Birthday Planning', 'Corporate Events',
      'Decor & Styling', 'Catering Services', 'Photography', 'Videography',
      'DJ & Sound System', 'Live Music', 'Dance Performance', 'Mascot Services',
      'Flower Decoration', 'Balloon Decoration', 'Lighting Setup', 'Stage Setup',
      'Event Security', 'Valet Parking', 'Invitation Design', 'Event Coordination'
    ]
  },

  // 13. FOOD & CATERING
  {
    name: 'Food & Catering',
    slug: 'food-catering',
    description: 'Professional food services, catering, and culinary expertise',
    icon: '🍽️',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    color: '#ea580c',
    order: 13,
    subcategories: [
      'Wedding Catering', 'Corporate Catering', 'Birthday Catering', 'Party Catering',
      'Home Chef', 'Meal Planning', 'Diet Meal Prep', 'Tiffin Services',
      'Cake & Bakery', 'Confectionery', 'Food Styling', 'Recipe Development',
      'Kitchen Setup', 'Menu Planning', 'Food Photography', 'Packaging Services',
      'Bulk Cooking', 'Special Dietary Meals', 'Organic Food Prep', 'Food Safety Training'
    ]
  },

  // 14. PETS & ANIMAL CARE
  {
    name: 'Pets & Animal Care',
    slug: 'pets-animal-care',
    description: 'Complete pet care, grooming, and veterinary services',
    icon: '🐾',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    color: '#0891b2',
    order: 14,
    subcategories: [
      'Dog Grooming', 'Cat Grooming', 'Pet Boarding', 'Pet Sitting',
      'Dog Training', 'Veterinary Services', 'Pet Walking', 'Pet Taxi',
      'Aquarium Services', 'Bird Care', 'Small Pet Care', 'Reptile Care',
      'Pet Photography', 'Pet Accessories', 'Pet Food Delivery', 'Pet Training',
      'Pet Insurance', 'Emergency Pet Care', 'Pet Adoption', 'Pet Memorial Services'
    ]
  },

  // 15. HOME INTERIOR & DESIGN
  {
    name: 'Home Interior & Design',
    slug: 'home-interior-design',
    description: 'Professional interior design, decoration, and home styling services',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41baea5b?w=800',
    color: '#7c3aed',
    order: 15,
    subcategories: [
      'Interior Design', 'Home Staging', 'Space Planning', 'Color Consultation',
      'Furniture Selection', 'Lighting Design', 'Window Treatments', 'Wall Decor',
      'Flooring Selection', 'Kitchen Design', 'Bathroom Design', 'Bedroom Design',
      'Art Selection', 'Plant Styling', 'Accessories', 'Smart Home Integration',
      '3D Visualization', 'Custom Furniture', 'Renovation Planning', 'Vastu Consultation'
    ]
  },

  // 16. CONSTRUCTION & RENOVATION
  {
    name: 'Construction & Renovation',
    slug: 'construction-renovation',
    description: 'Complete construction, renovation, and structural improvement services',
    icon: '🏗️',
    image: 'https://images.unsplash.com/photo-1504307654544-4eba20dab658?w=800',
    color: '#f59e0b',
    order: 16,
    subcategories: [
      'Home Construction', 'Office Construction', 'Renovation', 'Remodeling',
      'Extension Building', 'Basement Finishing', 'Attic Conversion', 'Wall Removal',
      'Kitchen Remodel', 'Bathroom Remodel', 'Floor Installation', 'Ceiling Work',
      'Structural Repair', 'Waterproofing', 'Insulation Installation', 'Soundproofing',
      'Demolition Services', 'Site Preparation', 'Material Supply', 'Project Management'
    ]
  },

  // 17. SECURITY & SAFETY
  {
    name: 'Security & Safety',
    slug: 'security-safety',
    description: 'Complete security systems, safety equipment, and protection services',
    icon: '🔒',
    image: 'https://images.unsplash.com/photo-1557597774-9d273405bcc9?w=800',
    color: '#374151',
    order: 17,
    subcategories: [
      'CCTV Installation', 'Alarm Systems', 'Access Control', 'Fire Alarm',
      'Security Guard', 'Patrol Services', 'Bodyguard Services', 'VIP Protection',
      'Locksmith', 'Safe Installation', 'Safe Opening', 'Key Duplication',
      'Fencing Installation', 'Gate Automation', 'Parking Security', 'Event Security',
      'Security Audit', 'Risk Assessment', 'Emergency Response', 'Safety Training'
    ]
  },

  // 18. TRANSPORTATION & LOGISTICS
  {
    name: 'Transportation & Logistics',
    slug: 'transportation-logistics',
    description: 'Complete transportation, delivery, and logistics services',
    icon: '🚚�',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    color: '#4b5563',
    order: 18,
    subcategories: [
      'Packers & Movers', 'Local Moving', 'Intercity Moving', 'Office Relocation',
      'Vehicle Transport', 'Courier Services', 'Logistics Management', 'Warehouse Services',
      'International Moving', 'Pet Transport', 'Art Transport', 'Furniture Moving',
      'Loading Services', 'Unloading Services', 'Storage Facilities', 'Inventory Management',
      'Fleet Management', 'Route Planning', 'Last Mile Delivery', 'Freight Services'
    ]
  },

  // 19. BUSINESS SERVICES
  {
    name: 'Business Services',
    slug: 'business-services',
    description: 'Professional business support, consulting, and B2B services',
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    color: '#6366f1',
    order: 19,
    subcategories: [
      'Business Consultation', 'Market Research', 'Business Plan Writing', 'Company Registration',
      'Trademark Registration', 'Patent Filing', 'Legal Documentation', 'Compliance Services',
      'Virtual Assistant', 'Data Entry', 'Content Writing', 'Translation Services',
      'Graphic Design', 'Brand Identity', 'Marketing Strategy', 'Lead Generation',
      'Recruitment', 'HR Consulting', 'Training Programs', 'Performance Management'
    ]
  },

  // 20. MEDIA & CREATIVE SERVICES
  {
    name: 'Media & Creative Services',
    slug: 'media-creative',
    description: 'Complete creative, design, and media production services',
    icon: '🎨',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
    color: '#db2777',
    order: 20,
    subcategories: [
      'Graphic Design', 'Logo Design', 'Brand Design', 'Web Design',
      'UI/UX Design', 'Video Production', 'Animation', 'Motion Graphics',
      'Voice Over', 'Script Writing', 'Copywriting', 'Translation',
      'Photo Editing', 'Video Editing', 'Sound Design', 'Color Grading',
      'Print Design', 'Packaging Design', '3D Modeling', 'Game Design'
    ]
  },

  // 21. REAL ESTATE
  {
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Complete real estate, property management, and housing services',
    icon: '🏢',
    image: 'https://images.unsplash.com/photo-1560518883-ce090d607e68?w=800',
    color: '#059669',
    order: 21,
    subcategories: [
      'Property Buying', 'Property Selling', 'Property Rental', 'Property Management',
      'Real Estate Consultation', 'Property Valuation', 'Legal Documentation', 'Title Search',
      'Home Inspection', 'Property Photography', 'Virtual Tours', 'Listing Services',
      'Rental Agreement', 'Tenant Screening', 'Rent Collection', 'Maintenance Coordination',
      'Commercial Leasing', 'Space Planning', 'Investment Advice', 'Property Tax'
    ]
  },

  // 22. TRAVEL & TOURISM
  {
    name: 'Travel & Tourism',
    slug: 'travel-tourism',
    description: 'Complete travel planning, tour services, and vacation assistance',
    icon: '✈️',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    color: '#0284c7',
    order: 22,
    subcategories: [
      'Travel Planning', 'Tour Packages', 'Domestic Tours', 'International Tours',
      'Hotel Booking', 'Flight Booking', 'Visa Assistance', 'Travel Insurance',
      'Adventure Tours', 'Cultural Tours', 'Pilgrimage Tours', 'Group Tours',
      'Corporate Travel', 'Student Travel', 'Senior Travel', 'Accessible Travel',
      'Travel Documentation', 'Currency Exchange', 'Local Guides', 'Emergency Travel Services'
    ]
  },

  // 23. EDUCATION & TUTORING
  {
    name: 'Education & Tutoring',
    slug: 'education-tutoring',
    description: 'Comprehensive tutoring and educational support services',
    icon: '📖',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    color: '#7e22ce',
    order: 23,
    subcategories: [
      'School Subjects', 'College Subjects', 'Exam Prep', 'Language Learning',
      'Coding Classes', 'Music Lessons', 'Art Classes', 'Sports Coaching',
      'Online Tutoring', 'Home Tutoring', 'Group Classes', 'One-on-One',
      'Special Education', 'Career Counseling', 'Study Skills', 'Time Management',
      'Homework Help', 'Project Guidance', 'Thesis Help', 'Resume Writing'
    ]
  },

  // 24. HEALTHCARE & MEDICAL
  {
    name: 'Healthcare & Medical',
    slug: 'healthcare-medical',
    description: 'Healthcare, medical services, and wellness support',
    icon: '🏥',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    color: '#dc2626',
    order: 24,
    subcategories: [
      'Nursing Care', 'Elderly Care', 'Child Care', 'Patient Care',
      'Physiotherapy', 'Occupational Therapy', 'Speech Therapy', 'Rehabilitation',
      'Medical Transport', 'Equipment Rental', 'Medicine Delivery', 'Lab Testing',
      'Health Monitoring', 'Vaccination', 'Health Checkup', 'Dental Care',
      'Vision Care', 'Hearing Care', 'Mental Health Support', 'Palliative Care'
    ]
  },

  // 25. PERSONAL CARE
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Personal grooming, styling, and self-care services',
    icon: '💄',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    color: '#be185d',
    order: 25,
    subcategories: [
      'Hair Styling', 'Hair Coloring', 'Hair Treatment', 'Hair Extensions',
      'Facial Treatments', 'Skin Care', 'Anti-Aging', 'Acne Treatment',
      'Makeup Services', 'Bridal Makeup', 'Party Makeup', 'Makeup Lessons',
      'Manicure', 'Pedicure', 'Nail Art', 'Nail Extensions',
      'Eyelash Services', 'Eyebrow Services', 'Waxing', 'Threading'
    ]
  },

  // 26. SPORTS & FITNESS
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Complete sports training, coaching, and fitness programs',
    icon: '⚽',
    image: 'https://images.unsplash.com/photo-1517836357463-dfafd3d6d691?w=800',
    color: '#16a34a',
    order: 26,
    subcategories: [
      'Gym Training', 'Personal Training', 'Yoga', 'Pilates',
      'CrossFit', 'Martial Arts', 'Boxing', 'Kickboxing',
      'Tennis Coaching', 'Badminton', 'Cricket Coaching', 'Football Training',
      'Swimming Lessons', 'Dance Classes', 'Zumba', 'Aerobics',
      'Sports Massage', 'Injury Prevention', 'Sports Nutrition', 'Mental Coaching'
    ]
  },

  // 27. HOME ORGANIZATION
  {
    name: 'Home Organization',
    slug: 'home-organization',
    description: 'Professional home organization, decluttering, and space management',
    icon: '📦',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    color: '#9333ea',
    order: 27,
    subcategories: [
      'Decluttering', 'Space Planning', 'Closet Organization', 'Kitchen Organization',
      'Garage Organization', 'Pantry Organization', 'Office Organization', 'Storage Solutions',
      'Labeling Systems', 'Custom Shelving', 'Packing Services', 'Unpacking Services',
      'Moving Coordination', 'Donation Management', 'Recycling Setup', 'Minimalist Living',
      'Eco-Friendly Solutions', 'Smart Storage', 'Vertical Solutions', 'Creative Organization'
    ]
  },

  // 28. EMERGENCY SERVICES
  {
    name: 'Emergency Services',
    slug: 'emergency-services',
    description: '24/7 emergency response and urgent assistance services',
    icon: '🚨',
    image: 'https://images.unsplash.com/photo-1584647373851-0d0d4353b24a?w=800',
    color: '#ef4444',
    order: 28,
    subcategories: [
      'Emergency Plumbing', 'Emergency Electrical', 'Emergency Locksmith', 'Emergency Glass',
      'Water Damage', 'Fire Damage', 'Storm Damage', 'Flood Response',
      'Roadside Assistance', 'Towing Services', 'Jump Start', 'Fuel Delivery',
      'Medical Emergency', 'Pet Emergency', 'Building Emergency', 'Utility Emergency',
      'Disaster Response', 'Emergency Cleaning', 'Emergency Security', '24/7 Support'
    ]
  },

  // 29. CHILD & ELDERLY CARE
  {
    name: 'Child & Elderly Care',
    slug: 'child-elderly-care',
    description: 'Comprehensive care services for children and seniors',
    icon: '👨‍👩‍👧‍👦',
    image: 'https://images.unsplash.com/photo-1584571235489-c868df19a9b8?w=800',
    color: '#f97316',
    order: 29,
    subcategories: [
      'Babysitting', 'Nanny Services', 'Childcare', 'After School Care',
      'Elderly Care', 'Companion Services', 'Home Nursing', 'Respite Care',
      'Special Needs Care', 'Transportation', 'Meal Services', 'Medication Reminder',
      'Activity Planning', 'Social Engagement', 'Medical Coordination', 'Emergency Contact',
      'Personal Care', 'Mobility Assistance', 'Shopping Assistance', 'Appointment Coordination'
    ]
  },

  // 30. GREEN & ECO SERVICES
  {
    name: 'Green & Eco Services',
    slug: 'green-eco-services',
    description: 'Sustainable, eco-friendly, and green living services',
    icon: '🌱',
    image: 'https://images.unsplash.com/photo-15308363695080-6f395dc9a406?w=800',
    color: '#22c55e',
    order: 30,
    subcategories: [
      'Solar Installation', 'Rainwater Harvesting', 'Composting', 'Waste Management',
      'Energy Audit', 'Green Building', 'Eco Renovation', 'Sustainable Materials',
      'Organic Gardening', 'Native Planting', 'Beekeeping', 'Urban Farming',
      'Green Cleaning', 'Zero Waste Consulting', 'Carbon Footprint', 'Eco Products',
      'Recycling Setup', 'Upcycling', 'Green Certification', 'Sustainable Living'
    ]
  },

  // 31. LUXURY SERVICES
  {
    name: 'Luxury Services',
    slug: 'luxury-services',
    description: 'Premium and luxury services for discerning clients',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1600607686527-6fb8860907fa?w=800',
    color: '#a855f7',
    order: 31,
    subcategories: [
      'Concierge Services', 'Personal Assistant', 'Luxury Travel', 'VIP Events',
      'Private Chef', 'Personal Shopper', 'Valet Services', 'Butler Services',
      'Yacht Services', 'Private Aviation', 'Exotic Car Rental', 'Luxury Home Care',
      'Fine Art Handling', 'Wine Cellar Management', 'Private Security', 'High-End Shopping',
      'Exclusive Experiences', 'Luxury Gifting', 'Premium Coordination', 'White Glove Service'
    ]
  },

  // 32. DIGITAL MARKETING
  {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Complete digital marketing, branding, and online presence services',
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827a52f?w=800',
    color: '#6366f1',
    order: 32,
    subcategories: [
      'SEO Services', 'PPC Management', 'Social Media Marketing', 'Content Marketing',
      'Email Marketing', 'Influencer Marketing', 'Video Marketing', 'Podcast Production',
      'App Marketing', 'E-commerce Marketing', 'Lead Generation', 'Conversion Optimization',
      'Brand Strategy', 'Market Research', 'Competitor Analysis', 'Growth Hacking',
      'Analytics Setup', 'Performance Tracking', 'Campaign Management', 'Digital Strategy'
    ]
  }
];

// Service templates with variations
const serviceTemplates = {
  pricing: [
    { base: 299, duration: 30, name: 'Basic' },
    { base: 499, duration: 45, name: 'Standard' },
    { base: 799, duration: 60, name: 'Premium' },
    { base: 1499, duration: 90, name: 'Deluxe' },
    { base: 2499, duration: 120, name: 'Ultimate' }
  ],
  descriptions: [
    'Professional {service} with guaranteed quality and satisfaction. Experienced provider with verified credentials.',
    'Complete {service} including all necessary materials and equipment. Fully insured and licensed.',
    'Expert {service} with advanced techniques and modern equipment. Same-day service available.',
    'Premium {service} service with attention to detail and customer satisfaction guarantee.',
    'Comprehensive {service} covering all aspects of the job. Free consultation included.',
  ],
  cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata'],
  images: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=600',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
  ]
};

async function main() {
  console.log('🌱 Starting production-grade database seeding...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.service.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');

    // Create categories and subcategories
    console.log('📦 Creating 32+ categories with 15+ subcategories each...\n');

    const createdCategories = [];

    for (const cat of categories) {
      console.log(`Creating category: ${cat.name}`);

      const category = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          image: cat.image,
          isActive: true,
          order: cat.order,
        },
      });

      createdCategories.push(category);
      console.log(`  ✅ Category created: ${cat.name}`);

      // Create subcategories
      for (let i = 0; i < cat.subcategories.length; i++) {
        const subName = cat.subcategories[i];
        const slug = subName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        await prisma.subCategory.create({
          data: {
            categoryId: category.id,
            name: subName,
            slug: slug,
            isActive: true,
            order: i,
          },
        });

        console.log(`    ✅ Subcategory created: ${subName}`);
      }

      console.log('');
    }

    const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    console.log(`\n✅ Created ${categories.length} categories`);
    console.log(`✅ Created ${totalSubcategories} subcategories\n`);

    // Create users
    console.log('👤 Creating users...');

    const adminPassword = await hashPassword('Admin@123');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@bookyourservice.com',
        passwordHash: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        trustScore: 5.0,
      },
    });

    const providerPassword = await hashPassword('Provider@123');
    const providers = [];

    const providerCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata'];

    for (let p = 0; p < 10; p++) {
      const provider = await prisma.user.create({
        data: {
          email: `provider${p + 1}@bookyourservice.com`,
          passwordHash: providerPassword,
          name: `Expert Provider ${p + 1}`,
          phone: `987654321${p}`,
          role: 'PROVIDER',
          status: 'ACTIVE',
          emailVerified: true,
          trustScore: 4.5 + (p % 10) * 0.1,
          businessName: `Expert Services ${p + 1} Ltd.`,
          description: 'Professional service provider with 5+ years of experience and verified credentials.',
          experienceYears: 5 + p,
          city: providerCities[p % providerCities.length],
        },
      });
      providers.push(provider);
    }

    const clientPassword = await hashPassword('Client@123');
    await prisma.user.create({
      data: {
        email: 'client@bookyourservice.com',
        passwordHash: clientPassword,
        name: 'John Doe',
        phone: '9876543211',
        role: 'CLIENT',
        status: 'ACTIVE',
        emailVerified: true,
        trustScore: 5.0,
        city: 'Mumbai',
        address: '123 Main Street',
      },
    });

    console.log('✅ Users created\n');
    console.log('📧 Login Credentials:');
    console.log('   Admin: admin@bookyourservice.com / Admin@123');
    console.log('   Provider: provider1@bookyourservice.com / Provider@123 (10 providers)');
    console.log('   Client: client@bookyourservice.com / Client@123\n');

    // Create comprehensive services
    console.log('🛠️  Creating 200+ services...\n');

    let serviceCount = 0;

    for (const category of createdCategories) {
      const subcategories = await prisma.subCategory.findMany({
        where: { categoryId: category.id },
      });

      // Create 6-8 services per category
      const servicesPerCategory = 6 + Math.floor(Math.random() * 3);

      for (let s = 0; s < servicesPerCategory; s++) {
        const subCategory = subcategories[s % subcategories.length];
        const template = serviceTemplates.pricing[s % serviceTemplates.pricing.length];
        const descTemplate = serviceTemplates.descriptions[s % serviceTemplates.descriptions.length];
        const city = serviceTemplates.cities[Math.floor(Math.random() * serviceTemplates.cities.length)];
        const images = [
          serviceTemplates.images[Math.floor(Math.random() * serviceTemplates.images.length)],
          serviceTemplates.images[Math.floor(Math.random() * serviceTemplates.images.length)],
        ];
        const provider = providers[Math.floor(Math.random() * providers.length)];

        const serviceName = subCategory
          ? `${subCategory.name} - ${template.name}`
          : `${category.name} - ${template.name}`;

        const slug = `${serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await prisma.service.create({
          data: {
            providerId: provider.id,
            categoryId: category.id,
            subCategoryId: subCategory?.id,
            title: serviceName,
            slug: slug,
            description: descTemplate.replace('{service}', subCategory?.name || category.name),
            basePrice: template.base,
            durationMinutes: template.duration,
            isAvailable: true,
            location: null,
            city: city,
            images: JSON.stringify(images),
            status: 'ACTIVE',
            featured: Math.random() > 0.7,
            verified: true,
            providerName: provider.name,
            providerAvatar: provider.avatar,
            providerRating: provider.trustScore,
          },
        });

        serviceCount++;
        console.log(`  ✅ Service created: ${serviceName} (${city})`);
      }

      console.log(`  ✅ Created ${servicesPerCategory} services for ${category.name}\n`);
    }

    console.log(`\n✅ Created ${serviceCount} total services\n`);

    console.log('========================================');
    console.log('✅ PRODUCTION-GRADE SEEDING COMPLETED');
    console.log('========================================\n');

    console.log('📊 SEEDING SUMMARY:');
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Subcategories: ${totalSubcategories}`);
    console.log(`   Users: 12 (1 Admin, 10 Providers, 1 Client)`);
    console.log(`   Services: ${serviceCount}`);

    console.log('\n🎨 UI ENHANCEMENTS:');
    console.log(`   ✓ 32+ Categories with custom icons and colors`);
    console.log(`   ✓ 480+ Subcategories (15+ per category)`);
    console.log(`   ✓ 200+ Sample services with images`);
    console.log(`   ✓ Multi-city provider network`);
    console.log(`   ✓ Verified and featured service flags`);

    console.log('\n🔑 Login Credentials for Testing:');
    console.log('\n   👑 ADMIN:');
    console.log('      Email: admin@bookyourservice.com');
    console.log('      Password: Admin@123');
    console.log('\n   👑 PROVIDER (10 available):');
    console.log('      Email: provider1@bookyourservice.com');
    console.log('      Password: Provider@123');
    console.log('\n   👑 CLIENT:');
    console.log('      Email: client@bookyourservice.com');
    console.log('      Password: Client@123');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

import { createHash, randomBytes } from 'crypto';

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
