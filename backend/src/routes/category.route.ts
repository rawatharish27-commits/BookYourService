
import { Router } from "express";
import { 
    listCategories, 
    listSubCategories, 
    listAllCategoriesAdmin,
    listSubCategoriesBySlug,
    getSubCategoryDetailsBySlug,
    createCategory, 
    createSubCategory,
    toggleCategoryStatus
} from "../controllers/category.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

// PUBLIC ROUTES (SLUG BASED for SEO)
router.get("/", listCategories);
router.get("/:slug", listSubCategoriesBySlug);
router.get("/:catSlug/:subSlug/details", getSubCategoryDetailsBySlug);

// LEGACY/PROVIDER ROUTES (ID BASED)
router.get("/:categoryId/subcategories", listSubCategories);

// ADMIN ROUTES
router.get("/admin/all", authenticate, allowRoles("ADMIN"), listAllCategoriesAdmin);

router.post(
    "/",
    authenticate, 
    allowRoles("ADMIN"), 
    createCategory
);

router.patch(
    "/:id/status",
    authenticate,
    allowRoles("ADMIN"),
    toggleCategoryStatus
);

router.post(
    "/subcategories",
    authenticate, 
    allowRoles("ADMIN"), 
    createSubCategory
);

export default router;
