const express = require('express');
const router=express.Router();

const { initiatePayment } = require('../../Controllers/Admin/PaymentManager/Credit_Card_Controller.js'); 
const { initiateCreditCardPayment } = require('../../Controllers/Admin/PaymentManager/Credit_Card_Controller.js'); 
const { handlePaymobCallback } = require('../../Controllers/Admin/PaymentManager/Credit_Card_Controller.js'); 


const { initiateEWalletPayment } = require('../../Controllers/Admin/PaymentManager/E_Wallet_Controller'); 
const { userMiddleware } = require('../../Middleware/User');


router.route('/paymob/payment').post(initiatePayment);
router.route('/paymob/creditCard').post(initiateCreditCardPayment);
router.route('/paymob/callback').post(handlePaymobCallback);
router.route('/paymob/callback').get(handlePaymobCallback);


router.route('/WalletRequest/:contentId').post(userMiddleware,initiateEWalletPayment);



module.exports=router;