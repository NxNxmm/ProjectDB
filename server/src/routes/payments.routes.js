// const express = require('express');
// const router = express.Router();
// const paymentController = require('../controllers/paymentController');

// router.get('/', paymentController.getPayments);
// router.post('/', paymentController.addPayment);

// module.exports = router;

import { Router } from "express";
import * as c from "../controllers/payments.controller.js";

const r = Router();

// List payments with pagination
r.get("/", c.listPayments);
r.post("/", c.createPayment);
r.get("/:id", c.getPayment);

export default r;