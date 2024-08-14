const express = require('express');
const router=express.Router();

const { loginUser } = require('../../Controllers/User/UserAuth'); 


router.route('/login').post(loginUser);

module.exports=router;