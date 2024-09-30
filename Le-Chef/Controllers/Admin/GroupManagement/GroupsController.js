const Group = require('../../../modules/GroupModule');
const GroupChatMessage = require('../../../modules/GroupChatModule');

const jwt = require('jsonwebtoken');
const User = require('../../../modules/UsersModule');



//CREATE GROUPS
exports.createGroup = async (req, res) => {
    try {
      // Extract and verify token
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
      
      const decoded = jwt.verify(token, 'your_secret_key');
      const adminId = decoded.userId;
  
      const { title, description } = req.body;
  
      const newGroup = new Group({
        title,
        description,
        members: [adminId], // Admin is the first member
        createdBy: adminId,
      });
  
      await newGroup.save();
  
      res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  //GET ADMIN GROUPS
  
  exports.getAdminGroups = async (req, res) => {
    try {
      // Extract and verify token
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
      
      const decoded = jwt.verify(token, 'your_secret_key');
      const adminId = decoded.userId;
  
      // Find all groups where the admin is a member
      const groups = await Group.find({ members: adminId });
  
      res.status(200).json({ message: 'Groups retrieved successfully', groups });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  // UPDATE GROUP
  exports.updateGroup = async (req, res) => {
    try {
      // Extract and verify token
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
      
      const decoded = jwt.verify(token, 'your_secret_key');
      const adminId = decoded.userId;
  
      const { groupId } = req.params;
      const { title, description } = req.body;
  
      // Find the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      // Check if the user is the admin who created the group
      if (group.createdBy.toString() !== adminId) {
        return res.status(403).json({ message: 'You are not authorized to update this group' });
      }
  
      // Update group details
      if (title) group.title = title;
      if (description) group.description = description;
  
      // Save the updated group
      await group.save();
  
      res.status(200).json({ message: 'Group updated successfully', group });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  
  // DELETE GROUP
  exports.deleteGroup = async (req, res) => {
    try {
      // Extract and verify token
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
      
      const decoded = jwt.verify(token, 'your_secret_key');
      const adminId = decoded.userId;
  
      const { groupId } = req.params;
  
      // Find the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      // Check if the user is the admin who created the group
      if (group.createdBy.toString() !== adminId) {
        return res.status(403).json({ message: 'You are not authorized to delete this group' });
      }
  
      // Delete the group
      await Group.findByIdAndDelete(groupId);  
    
  
      res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  
  //ADD STUDENTS TO GROUPS
  
  exports.addStudentToGroup = async (req, res) => {
    try {
      // Extract and verify token
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
  
      // Extract user ID from token
      const decoded = jwt.verify(token, 'your_secret_key');
      const adminId = decoded.userId;
  
      const { groupId } = req.params;
      const { studentId } = req.body;
  
      // Find the group to add the student to
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      // Check if the student is already a member of another group
      const existingGroup = await Group.findOne({ members: studentId });
      if (existingGroup) {
        return res.status(400).json({ message: 'Student is already a member of another group' });
      }
  
      // Check if the user is already a member of this group
      if (group.members.includes(studentId)) {
        return res.status(400).json({ message: 'User already a member of this group' });
      }
  
      // Add student to the group
      group.members.push(studentId);
      await group.save();
  
      res.status(200).json({ message: 'Student added to group successfully', group });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
    
  //REMOVE STUDENTS FROM GROUPS
  exports.removeStudentFromGroup = async (req, res) => {
    try {
      // Extract and verify token
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
  
      const { groupId } = req.params;
      const { studentId } = req.body;
  
      // Find the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      // Check if the user is a member of the group
      if (!group.members.includes(studentId)) {
        return res.status(400).json({ message: 'User is not a member of the group' });
      }
  
      // Remove student from the group
      group.members = group.members.filter(member => member.toString() !== studentId);
  
      await group.save();
  
      res.status(200).json({ message: 'Student removed from group successfully', group });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };


  //GET ALL STUDENTS OF A GROUP
exports.getGroupMembers = async (req, res) => {
    try {
      // Extract and verify token (if needed for authentication)
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
      
      const { groupId } = req.params;
  
      // Find the group and populate the members' details
      const group = await Group.findById(groupId).populate('members', 'username');
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      // Return the members with selected attributes
      res.status(200).json({
        message: 'Group members retrieved successfully',
        members: group.members
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };