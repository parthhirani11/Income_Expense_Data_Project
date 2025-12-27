import Account from "../models/Account.js";
import Tag from  "../models/Tags.js";
import Msg from  "../models/Msg.js";
import twilio from "twilio";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
export const dashboardPage = async (req, res) => {
  
  try {
        const accounts = await Account.find({ userId:req.session.user._id }).sort({ date: -1 });

        const totalIncome = accounts
        .filter(a => a.type === "income")
        .reduce((sum, a) => sum + Number(a.amount), 0);

        const totalExpense = accounts
        .filter(a => a.type === "expense")
        .reduce((sum, a) => sum + Number(a.amount), 0);

        const balance = totalIncome - totalExpense;
         const records = await Account.find({  userId: req.session.user._id  });
       
      const allTags = records
      .flatMap(t => Array.isArray(t.tags) ? t.tags : [])  // get array
      .map(tag => typeof tag === "string" ? tag.trim() : "") // trim each string
      .filter(tag => tag.length > 0); // remove empty tags
      const suggestedTags = [...new Set(allTags)];

        res.render("dashboard", {  user: req.user,accounts, totalIncome, totalExpense, balance ,record: null,records, searchKeyword: req.query.keyword || "", keyword: "", suggestedTags });
    } catch (err) {
        console.error(err);
        res.redirect("/account/dashboard");
      }
};

export const showAddForm=  async (req, res)=> {
    if (!req.session.user) return res.redirect("/login");
try {
     const all = await Account.find({ userId: req.session.user._id }).lean();
      // collect unique tags
      const tags = [...new Set(all.flatMap(r => r.tags || []))];
      res.render('addtransaction', { suggestedTags: tags });
    } catch (err) {
        console.error(err);
        res.redirect("/account/dashboard");
    }

};

export const addTransaction  = async (req, res) => {
  try {
         const { type, description, amount,person, paymentMode, bankName, accountNumber, upiApp, upiId,} = req.body;
         let { tags } = req.body;
        let tagsArray = [];
        if (Array.isArray(tags)) tagsArray = tags;
        else if (typeof tags === 'string' && tags.trim()) {
        tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        }
    //   console.log("BODY =>", req.body);
    //   console.log("FILE =>", req.file);


    // console.log("FILENAME =>", req.file.filename);
    // console.log("ORIGINAL =>", req.file.originalname);

   
    
      const data= {
            type,
            paymentMode,
            userId: req.session.user._id, 
            amount: Number(amount),
            description,
            person: person || null,
            tags: tagsArray,
            attachment: req.file ? req.file.filename : null,
            originalName: req.file ? req.file.originalname : null
            
      };
           if (paymentMode === "Bank") {
            data.bankDetails = { bankName, accountNumber };
          }

          if (paymentMode === "UPI") {
            data.upiDetails = { appName: upiApp, upiId };
          }

    await Account.create(data);

        res.redirect("/account/dashboard");
      } catch (err) {
          console.error(err);
          res.redirect("/account/dashboard");
        }
};


export const renderEdit = async (req, res) => {
  try {
        const { id } = req.params;

        const suggestedTags = await Tag.find({});

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.redirect("/dashboard");
        }
        //  console.log("EDIT ID:", req.params.id);
        const record = await Account.findOne({ _id: id, userId:req.session.user._id });
        if (!record) return res.redirect("/account/dashboard");
        res.render("edit", { record,suggestedTags });
      } catch (err) {
          console.error(err);
          res.redirect("/account/dashboard");
        }
};
export const updateRecord = async (req, res) => {
  try {
    const {
      amount,
      type,
      category,
      paymentMode,
      bankName,
      accountNumber,
      upiApp,
      upiId,
      tags,
      recipient
    } = req.body;

    const transaction = await Account.findById(req.params.id);
    if (!transaction) return res.send("Transaction not found");

    /* ---------- BASIC FIELDS ---------- */
    transaction.amount = Number(amount);
    transaction.type = type;
    transaction.category = category;
    transaction.paymentMode = paymentMode;
    transaction.tags = tags;
    transaction.recipient = recipient;

    /* ---------- RESET PAYMENT DETAILS ---------- */
    transaction.bankDetails = undefined;
    transaction.upiDetails = undefined;

    /* ---------- APPLY PAYMENT MODE ---------- */
    if (paymentMode === "Bank") {
      transaction.bankDetails = {
        bankName,
        accountNumber
      };
    }

    if (paymentMode === "UPI") {
      transaction.upiDetails = {
        appName: upiApp,
        upiId
      };
    }

    /* ---------- FILE UPDATE ---------- */
    if (req.file) {
      // delete old file if exists
      if (transaction.attachment) {
        const oldPath = path.join("uploads", transaction.attachment);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      transaction.attachment = req.file.filename;
      transaction.originalName = req.file.originalname;
    }

    // 🚫 DO NOT update transaction.date
    await transaction.save();

    res.redirect("/account/dashboard");

  } catch (err) {
    console.error("Update Transaction Error:", err);
    res.redirect("/account/dashboard");
  }
};


// export const updateRecord = async (req, res) => {
//   try {
       
//     const transaction = await Account.findById(req.params.id);
//     if (!transaction) return res.send("Transaction not found");

//     transaction.amount = req.body.amount;
//     transaction.type = req.body.type;
//     transaction.category = req.body.category;
//     transaction.paymentMode=req.body.paymentMode;
//     transaction.bankName=req.body.bankName;
//     transaction.accountNumber=req.body.accountNumber;
//     transaction.upiApp=req.body.upiApp;
//     transaction.upiId=req.body.upiId;
//     transaction.tags = req.body.tags;
//     transaction.recipient = req.body.recipient;
// const data ={
//    bankDetails: {},
//     upiDetails: {}
// }
//  transaction.data = req.file.data;
//     // 🚫 DO NOT update transaction.date
//       if (paymentMode === "Bank") {
//         data.bankDetails = { bankName, accountNumber };
//       }

//       if (paymentMode === "UPI") {
//         data.upiDetails = { appName: upiApp, upiId };
//       }
//     if (req.file) {
//       // ✅ Delete OLD file
//         if (transaction.attachment) {
//           const oldPath = path.join("uploads", transaction.attachment);
//           if (fs.existsSync(oldPath)) {
//             fs.unlinkSync(oldPath);
//           }
//         }
//       transaction.attachment = req.file.filename;
//       transaction.originalName = req.file.originalname;

//     }  await transaction.save();

//         res.redirect("/account/dashboard");
//       } catch (err) {
//           console.error(err);
//           res.redirect("/account/dashboard");
//         }
// };

export const deleteRecord = async (req, res) => {
  try {
        const { id } = req.params;
        await Account.deleteOne({ _id: id, userId: req.session.user._id });
        res.redirect("/account/dashboard");
      } catch (err) {
          console.error(err);
          res.redirect("/account/dashboard");
        }
};

export const fetchTransactionsAPI = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const data = await Account.find({ userId: req.session.user._id })
            .sort({ date: -1 });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const magConteact = async (req, res) => {
const { nname, email, message } = req.body;

  try {
    await Msg.create({ nname, email, message });
    await client.messages.create({
      body: `📩 NEW CONTACT MESSAGE:\n\nName: ${nname}\nEmail: ${email}\nMessage: ${message}`,
      from: process.env.TWILIO_PHONE,
      to: process.env.MY_PHONE,
    });

   res.redirect("/account/dashboard");
  } catch (error) {
    console.error(error);
    res.send(`<h2 style="color:red;">Failed to Send SMS ❌</h2>`);
  }
   
};

// Pass on JSON formet

// export const searchRecords  = async (req, res) => {

//   const keyword = req.query.keyword || "";

//     const records = await Account.find({
//         $or: [
//             { type: { $regex: keyword, $options: "i" }},
//             { person: { $regex: keyword, $options: "i" }},
//             { description: { $regex: keyword, $options: "i" }},
//             { tags: { $regex: keyword, $options: "i" }}
//         ]
//     }).sort({ date: -1 });

//     res.json(records);
    
// };
