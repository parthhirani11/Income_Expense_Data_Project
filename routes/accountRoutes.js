import express from "express";
import upload from "../middleware/upload.js";
import {
        dashboardPage,
        addTransaction,
        renderEdit,
        updateRecord,
        deleteRecord,
        showAddForm,
        magConteact,
        fetchTransactionsAPI 
   
     
    } from "../controllers/accountController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/about", (req, res) => {
    res.render("about");
});

router.get("/", (req, res) => res.redirect('/dashboard'));

router.get("/dashboard", authMiddleware, dashboardPage);

router.get("/add", authMiddleware,showAddForm);
router.post("/add", authMiddleware, upload.single("attachment"),  addTransaction );


// edit
router.get("/edit/:id", authMiddleware, renderEdit);
router.post("/edit/:id", authMiddleware, upload.single("attachment"), updateRecord);

// delete
router.post("/delete/:id", authMiddleware, deleteRecord);

//search

router.get("/data",authMiddleware,fetchTransactionsAPI)

router.post('/contact',authMiddleware, magConteact);


export default router;
