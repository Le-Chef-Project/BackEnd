const express = require('express');
const router=express.Router();

const { initiatePayment } = require('../../Controllers/Admin/PaymentManager/PaymentController'); 
const { initiateCreditCardPayment } = require('../../Controllers/Admin/PaymentManager/PaymentController'); 





router.route('/paymob/payment').post(initiatePayment);
router.route('/paymob/creditCard').post(initiateCreditCardPayment);


module.exports=router;