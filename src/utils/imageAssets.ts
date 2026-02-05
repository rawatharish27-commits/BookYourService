
// Centralized Image Assets for BookYourService
// Mapped from user-provided production assets

export const ASSETS = {
    // 1. APPLIANCES & REPAIR
    AC_SERVICE_REAL: "https://5.imimg.com/data5/SELLER/Default/2022/9/VK/OF/OA/26622329/ac-service-jet-pump.jpeg",
    AC_REPAIR_BANNER: "https://content.jdmagicbox.com/comp/def_content/ac_repair_and_services/default-ac-repair-and-services-2.jpg",
    FRIDGE_REPAIR: "https://5.imimg.com/data5/SELLER/Default/2021/2/MK/YP/ZQ/26622329/refrigerator-repair-service-500x500.jpg",
    WASHING_MACHINE: "https://5.imimg.com/data5/SELLER/Default/2022/3/XZ/JO/ZI/26622329/washing-machine-repair-service-500x500.jpeg",
    RO_SERVICE: "https://content3.jdmagicbox.com/comp/def_content/ro-repair-and-services/defualt-ro-repair-and-services-6.jpg",
    SEWING_MACHINE: "https://5.imimg.com/data5/SELLER/Default/2022/11/KY/ZI/YP/4130028/sewing-machine-repairing-service-500x500.jpg",

    // 2. HOME MAINTENANCE
    PLUMBING_MAIN: "https://5.imimg.com/data5/SELLER/Default/2023/9/344853037/QW/OC/EK/26622329/plumbing-service-500x500.jpg",
    PLUMBING_PUMPS: "https://5.imimg.com/data5/ANDROID/Default/2021/1/XG/XG/XG/122297803/product-jpeg-500x500.jpg",
    ELECTRICAL_PANEL: "https://5.imimg.com/data5/SELLER/Default/2023/9/344933935/HW/OX/ZQ/26622329/electrician-service-500x500.jpg",
    ELECTRICAL_WORKER: "https://media.istockphoto.com/id/1325345700/photo/electrician-engineer-working-on-electric-pole.jpg?s=612x612&w=0&k=20&c=X_7pPGLZgqQZzZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9q",
    HOME_CLEANING: "https://5.imimg.com/data5/SELLER/Default/2023/9/344847333/GX/QV/OZ/26622329/housekeeping-services-500x500.jpg",
    CCTV_SECURITY: "https://5.imimg.com/data5/SELLER/Default/2023/5/308636737/CX/UD/SQ/18953049/cctv-camera-installation-services-500x500.png",

    // 3. LIFESTYLE & OTHERS
    LAUNDRY: "https://5.imimg.com/data5/SELLER/Default/2022/9/XO/HI/KG/26622329/laundry-service-500x500.jpg",
    DRY_CLEANING: "https://media.istockphoto.com/id/1152402237/photo/young-woman-holding-hanger-with-orange-dress-at-dry-cleaners.jpg?s=612x612&w=0&k=20&c=X_7pPGLZgqQZzZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9q",
    MASSAGE_SPA: "https://5.imimg.com/data5/SELLER/Default/2023/1/VY/IO/XM/3686036/body-massage-services-500x500.jpg",
    TAILORING: "https://img.freepik.com/free-vector/tailor-working-sewing-machine_23-2148563333.jpg",
    CAR_REPAIR: "https://content.jdmagicbox.com/comp/def_content/car-repair-and-services/defualt-car-repair-and-services-5.jpg",
    TAXI_SERVICE: "https://bookmytaxy.com/assets/images/logo.png",
    
    // 4. FALLBACK
    DEFAULT: "https://images.unsplash.com/photo-1581578731117-104f2a8d46a8?auto=format&fit=crop&q=80&w=800"
};

export const getServiceImage = (slug: string, categorySlug?: string): string => {
    const s = slug.toLowerCase();
    const c = categorySlug?.toLowerCase() || '';

    // Precise Mapping
    if (s.includes('ac') || s.includes('air-conditioner')) return ASSETS.AC_SERVICE_REAL;
    if (s.includes('fridge') || s.includes('refrigerator')) return ASSETS.FRIDGE_REPAIR;
    if (s.includes('washing') || s.includes('laundry')) return ASSETS.WASHING_MACHINE; // Repair
    if (s.includes('ro') || s.includes('water') || s.includes('purifier')) return ASSETS.RO_SERVICE;
    if (s.includes('sewing') || s.includes('tailor')) return ASSETS.SEWING_MACHINE;
    
    if (s.includes('plumb')) return ASSETS.PLUMBING_MAIN;
    if (s.includes('pump') || s.includes('motor')) return ASSETS.PLUMBING_PUMPS;
    
    if (s.includes('electric') || s.includes('wire') || s.includes('fan')) return ASSETS.ELECTRICAL_PANEL;
    
    if (s.includes('cctv') || s.includes('security') || s.includes('camera')) return ASSETS.CCTV_SECURITY;
    
    if (s.includes('clean') || s.includes('housekeeping') || s.includes('maid')) return ASSETS.HOME_CLEANING;
    if (s.includes('dry') && s.includes('clean')) return ASSETS.DRY_CLEANING;
    
    if (s.includes('massage') || s.includes('spa') || s.includes('therapy')) return ASSETS.MASSAGE_SPA;
    if (s.includes('car') || s.includes('tyre') || s.includes('mechanic')) return ASSETS.CAR_REPAIR;
    if (s.includes('taxi') || s.includes('cab') || s.includes('drive')) return ASSETS.TAXI_SERVICE;

    // Category Fallbacks
    if (c.includes('appliance')) return ASSETS.WASHING_MACHINE;
    if (c.includes('cleaning')) return ASSETS.HOME_CLEANING;
    if (c.includes('repair')) return ASSETS.ELECTRICAL_WORKER;
    if (c.includes('beauty')) return ASSETS.MASSAGE_SPA;

    return ASSETS.DEFAULT;
};

export const getCategoryBanner = (slug: string): string => {
    const s = slug.toLowerCase();
    if (s.includes('appliance')) return ASSETS.AC_REPAIR_BANNER; // Wide image
    if (s.includes('clean')) return ASSETS.HOME_CLEANING;
    if (s.includes('plumb')) return ASSETS.PLUMBING_PUMPS; // Industrial look
    if (s.includes('electric')) return ASSETS.ELECTRICAL_WORKER;
    if (s.includes('beauty')) return ASSETS.MASSAGE_SPA;
    if (s.includes('car') || s.includes('auto')) return ASSETS.CAR_REPAIR;
    return ASSETS.DEFAULT;
};
