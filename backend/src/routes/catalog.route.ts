
import { Router } from "express";
import { 
    getTemplatesBySubCategory, 
    createTemplate, 
    getAllTemplates 
} from "../controllers/catalog.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

// Public/Provider
router.get("/subcategory/:subCategoryId", getTemplatesBySubCategory);

// Admin
router.post("/", authenticate, allowRoles("ADMIN"), createTemplate);
router.get("/admin/all", authenticate, allowRoles("ADMIN"), getAllTemplates);

export default router;
