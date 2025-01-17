//** ENTRY CONTROLLER */

/* Includes: 
    1. getAllEntries (GET /users) - Retrieves all entries for a user
    2. addEntry (POST /users) - Encrypts and adds an entry to the database, then decrypts the created entry and sends it to the client
    3. updateEntry (PATCH /users) - Re-encrypts and updates an entry in the database and sends 200 OK status to client
    4. deleteEntry (DELETE /users) - Deletes an entry from the database and sends 200 OK status to the client
*/

// Imports
import { Entry } from '../db/models.js';
const entryController = {};
import { encrypt, decrypt } from '../utils/encrypt-decrypt-utils.js';

/**
 * @route GET /api/entries
 * @description Retrieves all entries for a user
 * @param {Object} req.params - userId
 * @returns {Object} - JSON response containing an array of all entries objects for the user or an error response
 */
entryController.getAllEntries = async (req, res) => {
  console.log('entries controller');
  try {
    // Store userId in variable
    const userId = req.params.id;
    console.log('allEntries userId: ', userId);
    // Call database to request all entries from user
    const allEntries = await Entry.find({ userId });
    console.log('allEntries: ', allEntries);
    // If nothing is returned, log an error
    if (!allEntries) {
      return res.status(404).json({
        log: 'entryController.getAllEntries: No entries found for the user',
        status: 404,
        message: 'Your entries could not be found.',
      });
    }
    // Decrypt the body of each entry
    const decryptedEntries = allEntries.map(entry => {
      const decryptedBody = decrypt(entry.body, entry.iv);
      if (entry.iv) {
        return {
          _id: entry._id,
          body: decryptedBody,
          userId: entry.userId,
          createdAt: entry.createdAt,
        };
      } else {
        return {
          _id: entry._id,
          body: entry.body,
          userId: entry.userId,
          createdAt: entry.createdAt,
        };
      }
    });
    // If result is returned, store in locals object
    res.locals.allEntries = decryptedEntries;
    console.log('res.locals.allEntries: ', res.locals.allEntries);
    // Create a response object with allEntries and authData
    const responseObj = {
      allEntries: res.locals.allEntries,
      authData: res.locals.authData,
    };
    console.log('all entries return');
    // Return the combined response object
    return res.status(200).json(responseObj);
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({
      log: `entryController.getAllEntries: ERROR ${error}`,
      status: 500,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

/**
 * @route POST /api/entries/
 * @description Adds a user's new entry to the database
 * @param {Object} req - The request object
 *  - body (content of meditation journal entry): String
 *  - userId: Integer
 * @param {Object} res - The response object
 * @returns {Object} - JSON response containing the new entry or an error response.
 */
entryController.addEntry = async (req, res) => {
  try {
    // Extract the entry body and userId from the request body
    const { body } = req.body;
    const { id } = req.params;
    const userId = id;
    // Encrypt the entry body using the common key and IV
    const { iv, encryptedData } = encrypt(body);
    // Store the encrypted entry in the database
    const encryptedEntry = await Entry.create({ body: encryptedData, userId, iv });
    // Handle error if no encrypted entry
    if (!encryptedEntry) {
      console.error(error.stack);
      return res.status(404).json({
        log: `entryController.addEntry: ERROR ${error}`,
        status: 404,
        message: 'There was an issue adding your entry.',
      });
    }
    // Decrypt encrypted body
    const decryptedBody = decrypt(encryptedEntry.body, iv);
    // Create newEntry object to send to the client
    const newEntry = {
      body: decryptedBody,
      userId: encryptedEntry.userId,
      _id: encryptedEntry._id,
      createdAt: encryptedEntry.createdAt,
    };
    // Create response object
    const responseObj = {
      newEntry,
      authData: res.locals.authData,
    };
    console.log('add entry');
    // Return the newEntry and authData to the client
    return res.status(201).json(responseObj);
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({
      log: `entryController.addEntry: ERROR ${error}`,
      status: 500,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

/**
 * @route PATCH /api/entries/:id
 * @description Updates an entry by ID
 * @param req.params _id of the entry to be updated
 * @param {Object} req - The request object
 *  - body (content of meditation journal entry): String
 *  - userID: Integer
 * @param {Object} res - The response object
 * @returns {Object} - JSON response containing the updated entry or an error response
 */
entryController.updateEntry = async (req, res) => {
  try {
    // Store request parameter in a variable
    const { _id } = req.body;
    console.log('updateEntry _id: ', _id);
    // Extract the entry body and userId from the request body
    const { body } = req.body;
    console.log('updateEntry body: ', body);
    // Encrypt the entry body using the common key and IV
    const { iv, encryptedData } = encrypt(body);
    // Find and update the encrypted entry in database and store updated entry in a variable
    const updatedEntry = await Entry.findOneAndUpdate({ _id }, { body: encryptedData, iv }, { new: true });
    // Determine if updated entry is returned from database
    if (!updatedEntry || updatedEntry.length === 0) {
      return res.status(404).json({
        log: 'entryController.updatedEntry: updatedEntry not found.',
        status: 404,
        message: 'Your entry could not be updated.',
      });
    }
    // Create response object
    const responseObj = {
      body,
      authData: res.locals.authData,
    };
    // Return 200 status and response object
    return res.status(200).json(responseObj);
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({
      log: `entryController.updateEntry: ERROR ${error}`,
      status: 500,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

/**
 * @route /api/entries/:id
 * @description Deletes an entry by ID.
 * @param req.params - _id of the entry to be deleted
 * @param {Object} res - The response object
 * @returns {Object} - JSON response containing the deleted entry or an error response
 */
entryController.deleteEntry = async (req, res) => {
  try {
    // Store parameter as a variable
    const { entryId } = req.body;
    // Find and delete entry and store response in a variable
    const deletedEntry = await Entry.findOneAndDelete({ _id: entryId });
    // If response returns false, throw an error
    if (!deletedEntry || deletedEntry.length === 0) {
      return res.status(404).json({
        log: 'entryController.deleteEntry: deletedEntry not found.',
        status: 404,
        message: 'Your entry could not be deleted.',
      });
    }
    // Create response object
    const responseObj = {
      deletedId: entryId,
      authData: res.locals.authData,
    };
    // Return 200 status
    return res.status(200).json(responseObj);
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({
      log: `entryController.deleteEntry: ERROR ${error}`,
      status: 500,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

export default entryController;
