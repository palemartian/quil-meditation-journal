const express = require('express');
const router = express.Router();
const { verifyUser, refreshTokens, createUser, updateUser, deleteUser } = require('../controllers/userController');

/**
 * Login user
 *
 * @param {Object} req.body
 * @param {String} req.body.username
 * @param {String} req.body.password
 *
 */
//
router.post('/login', verifyUser);

/**
 * Logout user
 *
 * @param {Object} req.body
 * @param {String} req.body.username
 * @param {String} req.body.password
 *
 */
//
router.delete('/logout', refreshTokens);

/**
 * Signup user
 *
 * @param {Object} req.body
 * @param {String} req.body.username
 * @param {String} req.body.password
 *
 */
router.post('/signup', createUser);

/**
 * Update user
 *
 * @param {Int} req.params.userId
 *
 */
router.put('/update/:userId', updateUser);

/**
 * Delete user
 *
 * @param {Int} req.params.userId
 *
 */
router.delete('/delete/:userId', deleteUser);

module.exports = router;
