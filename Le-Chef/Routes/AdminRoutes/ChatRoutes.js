const express = require('express');
const router = express.Router();


const { adminMiddleware } = require('../../Middleware/Admin');
const { userMiddleware } = require('../../Middleware/User');
const { createGroup } = require('../../Controllers/Admin/GroupManagement/GroupsController');
const { getAdminGroups } = require('../../Controllers/Admin/GroupManagement/GroupsController');
const { updateGroup } = require('../../Controllers/Admin/GroupManagement/GroupsController');
const { deleteGroup } = require('../../Controllers/Admin/GroupManagement/GroupsController');
const { addStudentToGroup } = require('../../Controllers/Admin/GroupManagement/GroupsController');
const { removeStudentFromGroup } = require('../../Controllers/Admin/GroupManagement/GroupsController');
const { getStudentGroups  } = require('../../Controllers/User/UserGroups/UserGroupController');
const { getGroupMembers } = require('../../Controllers/Admin/GroupManagement/GroupsController');
const { sendGroupMessage } = require('../../Controllers/Admin/ChatManagement/GroupChatController');
const { sendDirectMessage } = require('../../Controllers/Admin/ChatManagement/DirectChatController');






router.route('/CreateGroup').post(adminMiddleware,createGroup);
router.route('/GetAdminGroups').get(adminMiddleware,getAdminGroups);
router.route('/UpdateGroup/:groupId').put(adminMiddleware,updateGroup);
router.route('/DeleteGroup/:groupId').delete(adminMiddleware,deleteGroup);
router.route('/AddStudentToGroup/:groupId').post(adminMiddleware,addStudentToGroup);
router.route('/RemoveStudent/:groupId').delete(adminMiddleware,removeStudentFromGroup);
router.route('/GetStudentGroups').get(userMiddleware,getStudentGroups);
router.route('/GetGroupMembers/:groupId').get(getGroupMembers);
router.route('/SendGroupMessage/:groupId').post(sendGroupMessage);
router.route('/SendDirectMessage/:receiverId').post(sendDirectMessage);



module.exports=router;