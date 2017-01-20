/**
 * @author Christian Brel <ch.brel@gmail.com>
 */

import { Server } from 'node-osc';
import http from 'http';
import express from 'express';
import sio from 'socket.io';

import TUIOTouch from './TUIOTouch';
import TUIOTag from './TUIOTag';

import {
  TOUCH_TUIO_TYPE, TAG_TUIO_TYPE,
  ALIVE_TUIO_ACTION, SET_TUIO_ACTION,
  CREATE_SOCKETIO_ACTION, UPDATE_SOCKETIO_ACTION, DELETE_SOCKETIO_ACTION,
} from './constants';

/**
 * Main class to manage TUIOClient.
 *
 * @class TUIOClient
 */
class TUIOClient {

  /**
   * TUIOClient constructor.
   *
   * @constructor
   */
  constructor() {
    this._touches = {};
    this._tags = {};
    this._socketIOClients = {};
  }

  /**
   * Init and start TUIOClient.
   *
   * @method start
   * @param {number} listenedOSCPort - OSC's port. Default : 3333
   * @param {number} socketIOPort - Socket IO Server's port. Default : 9000
   */
  start(listenedOSCPort = 3333, socketIOPort = 9000) {
    this._oscServer = new Server(listenedOSCPort);

    this._oscServer.on('message', (msg) => {
      this.handleTUIOMessage(msg);
    });

    this._app = express();
    this._httpServer = http.createServer(this._app);
    this._ioServer = sio(this._httpServer);
    this.handleSocketIOClient();

    this._httpServer.listen(socketIOPort, () => {
      console.info('TUIO Client is ready.');
      console.info('Listened OSC\'s port is ', listenedOSCPort);
      console.info('Socket.IO\'s port is ', socketIOPort);
    });
  }

  /**
   * Handle new Socket.IO 's client connection.
   *
   * @method handleSocketIOClient
   */
  handleSocketIOClient() {
    this._ioServer.on('connection', (socket) => {
      console.info('New Socket.IO Client Connection : ', socket.id);
      this._socketIOClients[socket.id] = true;

      socket.on('disconnect', () => {
        console.info('Socket.IO Client disconnected : ', socket.id);
        delete this._socketIOClients[socket.id];
      });

      socket.on('error', (errorData) => {
        console.info('An error occurred during Socket.IO Client connection : ', socket.id);
        console.debug(errorData);
        delete this._socketIOClients[socket.id];
      });

      socket.on('reconnect', (attemptNumber) => {
        console.info('Socket.io Client Connection : ', socket.id, ' after ', attemptNumber, ' attempts.');
        this._socketIOClients[socket.id] = true;
      });

      socket.on('reconnect_attempt', () => {
        console.info('Socket.io Client reconnect attempt : ', socket.id);
      });

      socket.on('reconnecting', (attemptNumber) => {
        console.info('Socket.io Client Reconnection : ', socket.id, ' - Attempt number ', attemptNumber);
        delete this._socketIOClients[socket.id];
      });

      socket.on('reconnect_error', (errorData) => {
        console.info('An error occurred during Socket.io Client reconnection for Root namespace : ', socket.id);
        console.debug(errorData);
        delete this._socketIOClients[socket.id];
      });

      socket.on('reconnect_failed', () => {
        console.info('Failed to reconnect Socket.io Client for Root namespace : ', socket.id, '. No new attempt will be done.');
        delete this._socketIOClients[socket.id];
      });
    });
  }

  /**
   * Handle TUIO Message, process it and send result to Socket.IO channel.
   *
   * @method handleTUIOMessage
   * @param {string} message - Message from OSC.
   */
  handleTUIOMessage(message) {
    if (Array.isArray(message)) {
      message.forEach((messElem) => {
        if (Array.isArray(messElem) && messElem.length > 1) {
          const messType = messElem[0];
          switch (messType) {
            case TOUCH_TUIO_TYPE:
              this.handleTouch(messElem);
              break;
            case TAG_TUIO_TYPE:
              this.handleTag(messElem);
              break;
            default:
          }
        }
      });
    }
  }

  /**
   * Handle TUIO TOUCH Message, process it and send result to Socket.IO channel.
   *
   * @method handleTouch
   * @param {Array} message - Touch Message from OSC.
   */
  handleTouch(message) {
    const messAction = message[1];

    switch (messAction) {
      case ALIVE_TUIO_ACTION : {
        const touchesIds = Object.keys(this._touches);
        if (touchesIds.length > 0) {
          if (message.length > 2) {
            const aliveTouches = message.slice(2, message.length);
            touchesIds.forEach((touchKey) => {
              const touchId = this._touches[touchKey].id;
              if (aliveTouches.indexOf(touchId) !== -1) {
                this._ioServer.emit(DELETE_SOCKETIO_ACTION, this._touches[touchId].toJSON());
                delete this._touches[touchId];
              }
            });
          } else {
            touchesIds.forEach((touchId) => {
              this._ioServer.emit(DELETE_SOCKETIO_ACTION, this._touches[touchId].toJSON());
              delete this._touches[touchId];
            });
          }
        }
        break;
      }
      case SET_TUIO_ACTION : {
        if (message.length > 4) {
          const tuioTouch = new TUIOTouch(message[2], message[3], message[4]);
          if (typeof (this._touches[tuioTouch.id]) !== 'undefined') {
            this._ioServer.emit(UPDATE_SOCKETIO_ACTION, tuioTouch.toJSON());
          } else {
            this._ioServer.emit(CREATE_SOCKETIO_ACTION, tuioTouch.toJSON());
          }
          this._touches[tuioTouch.id] = tuioTouch;
        }
        break;
      }
      default:
    }
  }

  /**
   * Handle TUIO TAG Message, process it and send result to Socket.IO channel.
   *
   * @method handleTag
   * @param {Array} message - TAG Message from OSC.
   */
  handleTag(message) {
    const messAction = message[1];

    switch (messAction) {
      case ALIVE_TUIO_ACTION : {
        const tagsIds = Object.keys(this._tags);
        if (tagsIds.length > 0) {
          if (message.length > 2) {
            const aliveTags = message.slice(2, message.length);
            tagsIds.forEach((tagKey) => {
              const tagId = this._tags[tagKey].id;
              if (aliveTags.indexOf(tagId) !== -1) {
                this._ioServer.emit(DELETE_SOCKETIO_ACTION, this._tags[tagId].toJSON());
                delete this._tags[tagId];
              }
            });
          } else {
            tagsIds.forEach((tagId) => {
              this._ioServer.emit(DELETE_SOCKETIO_ACTION, this._tags[tagId].toJSON());
              delete this._tags[tagId];
            });
          }
        }
        break;
      }
      case SET_TUIO_ACTION : {
        if (message.length > 6) {
          const tuioTag = new TUIOTag(message[2], message[3], message[4], message[5], message[6]);
          if (typeof (this._tags[tuioTag.id]) !== 'undefined') {
            this._ioServer.emit(UPDATE_SOCKETIO_ACTION, tuioTag.toJSON());
          } else {
            this._ioServer.emit(CREATE_SOCKETIO_ACTION, tuioTag.toJSON());
          }
          this._tags[tuioTag.id] = tuioTag;
        }
        break;
      }
      default:
    }
  }
}

export default TUIOClient;
