import { Router } from "express";
import * as s from "../controllers/salesPersons.controller.js";

const router = Router();

router.get("/", s.handleList);
router.get("/:code", s.handleGet); 
router.post("/", s.handleCreate); 
router.put("/:code", s.handleUpdate);
router.delete("/:code", s.handleDelete); 

// router.get("/:code", s.getSalesPerson);

export default router;