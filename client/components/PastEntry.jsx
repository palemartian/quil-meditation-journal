//** PAST ENTRY COMPONENT */

import React, { useState } from 'react';

// Import useEntriesContext and useAuthContext to manage state
import { useEntriesContext } from '../hooks/useEntriesContext.js';
import { useAuthContext } from '../hooks/useAuthContext.js';

// Import date-fns to format entry dates
import format from 'date-fns/format';

// Import axios to handle server requests for entries data
import axios from '../axiosConfig.js';

// Import props validation
import PropTypes from 'prop-types';

/**
 * PastEntry component renders an individual past journal entry.
 * It allows the user to toggle the display, delete the entry, and edit the entry.
 *
 * @param {Object} entry - The individual entry to be rendered.
 */
const PastEntry = ({ entry }) => {
  // Destructure entry properties
  const { _id, createdAt, body } = entry;

  // Retrieve dispatch and user information from contexts
  const { dispatch } = useEntriesContext();
  const { user } = useAuthContext();

  // useState hooks for managing component state
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(body);

  // Function to toggle the entry open and closed and manage editing state
  const toggle = () => {
    setOpen(!open);
    setIsEditing(false);
  };

  // Create formatted date
  const formattedDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Function to handle editing an entry
  const handleEdit = async () => {
    try {
      const response = await axios.patch(
        `/api/entries/${_id}`,
        { body: editedBody, userId: user.userId },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      if (response.status === 200) {
        // Update the local state immediately
        dispatch({ type: 'EDIT_ENTRY', payload: { _id, body: response.data.body } });
        // Update tokens and user state
        dispatch({ type: 'LOGIN', payload: response.data.authData });
        dispatch({ type: 'ACCESS_TOKEN', payload: response.data.authData.accessToken });
      }
      // Toggle the entry closed
      toggle();
    } catch (error) {
      console.error('Error editing entry:', error.stack);
    }
  };

  // Function to handle deleting an entry
  const handleDelete = async () => {
    try {
      // Send DELETE request to the server to delete the entry
      const response = await axios.delete(`/api/entries/${_id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      const deletedId = response.data.deletedId;

      if (response.status === 200) {
        // Optimistic update: Remove the entry from the local state immediately
        dispatch({ type: 'DELETE_ENTRY', payload: { _id: deletedId } });
        // Update tokens and user state
        dispatch({ type: 'LOGIN', payload: response.data.authData });
        dispatch({ type: 'ACCESS_TOKEN', payload: response.data.authData.accessToken });
      }
    } catch (error) {
      console.error('Error deleting entry:', error.stack);
    }
  };

  // Render the PastEntry component
  return (
    <div key={_id} className='toggle-entry'>
      {/* Header with button and formatted date */}
      <div className='toggle-header'>
        <button className='toggle-btn' onClick={toggle}>
          +
        </button>
        <h4 className='toggle-title'>{formattedDate}</h4>
      </div>
      <div>
        {open && (
          <div className='toggle-container'>
            {/* Render either a textarea for editing or a paragraph for displaying the entry body */}
            {isEditing ? <textarea className='toggle-edit-text' value={editedBody} onChange={e => setEditedBody(e.target.value)} /> : <p className='toggle-text'>{body}</p>}
            {/* Buttons for delete and edit actions */}
            <div className='entry-btns'>
              <input className='entry-cancel-delete-btn' type='submit' onClick={handleDelete} value='Delete' />
              {isEditing ? <input className='entry-save-edit-btn' type='submit' onClick={handleEdit} value='Save' /> : <input className='entry-save-edit-btn' type='submit' onClick={() => setIsEditing(true)} value='Edit' />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes for the PastEntry component
PastEntry.propTypes = {
  entry: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default PastEntry;
