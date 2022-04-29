/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as solThumbsUp, faThumbsDown as solThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as regThumbsUp, faThumbsDown as regThumbsDown } from '@fortawesome/free-regular-svg-icons';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment';
import './form.css';

export default function Form() {
  const [updateMode, setUpdateMode] = useState(!!sessionStorage.id);
  const [wasHelpful, setWasHelpful] = useState(updateMode ? JSON.parse(sessionStorage.wasHelpful) : '');
  const [comment, setComment] = useState(updateMode ? sessionStorage.comment : '');

  useEffect(() => {
    if (updateMode) {
      toast(`Welcome back! Feel free to modify your feedback from ${moment(sessionStorage.time).fromNow()} `);
    }
  }, []);

  const saveToSeesionStorage = (data) => {
    if (data.id) {
      sessionStorage.id = data.id;
      sessionStorage.from = data.createdAt;
    }
    sessionStorage.wasHelpful = data.wasHelpful;
    sessionStorage.comment = data.comment;
  };

  const handleSubmit = async () => {
    try {
      // vote validation
      if (typeof wasHelpful !== 'boolean') {
        toast('You have to vote in order to submit');
        return;
      }

      // send feedback to the server
      const res = await fetch('https://6239be97bbe20c3f66c93c18.mockapi.io/api/v1/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ wasHelpful, comment }),
      });

      const data = await res.json();

      saveToSeesionStorage(data);

      setUpdateMode(true);

      toast('Feedback submitted, Thanks for your time and feel free to change your mind!');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  const handleUpdate = async () => {
    try {
      // send the new details to the server
      await fetch(`https://6239be97bbe20c3f66c93c18.mockapi.io/api/v1/feedback/${sessionStorage.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ wasHelpful, comment }),
      });

      saveToSeesionStorage({ wasHelpful, comment });

      toast('We all change our minds sometimes, no judgment here :)');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  const cancel = () => {
    // if there's a change
    if (comment !== sessionStorage.comment
            || wasHelpful !== JSON.parse(sessionStorage.wasHelpful)) {
      setWasHelpful(JSON.parse(sessionStorage.wasHelpful));
      setComment(sessionStorage.comment);
      toast('Look over there! A bird! Nothing changed at all! Did you see something?');
    }
  };

  const skip = () => {
    setWasHelpful('');
    setComment('');
    toast('I\'ll cry in the corner while you think about what you did.');
  };

  return (

    <div className="form-comp">

      <h1 className="title">Is this page helpul?</h1>

      <div className="thumbs">

        <div className="up" onClick={() => setWasHelpful(true)}>
          <FontAwesomeIcon icon={typeof wasHelpful === 'boolean' && wasHelpful ? solThumbsUp : regThumbsUp} />
          <p>Yes</p>
        </div>

        <div className="down" onClick={() => setWasHelpful(false)}>
          <FontAwesomeIcon icon={typeof wasHelpful === 'boolean' && !wasHelpful ? solThumbsDown : regThumbsDown} />
          <p>No</p>
        </div>

      </div>

      <span className="spacer" />

      {
                typeof wasHelpful === 'boolean' && (
                <textarea
                  className="ta"
                  placeholder="Any additional feedback?"
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                />
                )
            }

      <div className="actions">

        {
                    !(updateMode
                        && (comment === sessionStorage.comment
                            && wasHelpful === JSON.parse(sessionStorage.wasHelpful))) && (
                            <button
                              className="skip-btn"
                              onClick={updateMode ? cancel : skip}
                            >
                              {updateMode ? 'Cancel' : 'Skip'}
                            </button>
                    )

                }

        <button
          className="sbmt-btn"
          onClick={sessionStorage.id ? handleUpdate : handleSubmit}
        >
          {sessionStorage.id ? 'Update' : 'Submit'}
        </button>

      </div>

      <Toaster
        toastOptions={{
          duration: 5000,
        }}
      />
    </div>
  );
}
