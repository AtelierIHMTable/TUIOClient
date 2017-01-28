/**
 * @author Christian Brel <ch.brel@gmail.com>
 */

import TUIOObject from './TUIOObject';

import { TOUCH_SOCKETIO_TYPE } from './constants';

/**
 * Main class to manage TUIOTouch.
 *
 * @class TUIOTouch
 * @extends TUIOObject
 */
class TUIOTouch extends TUIOObject {
  /**
   * Give the TUIOTouch's JSON representation.
   *
   * @method toJSON
   */
  toJSON() {
    const objJSON = super.toJSON();
    return {
      ...objJSON,
      type: TOUCH_SOCKETIO_TYPE,
    };
  }
}

export default TUIOTouch;
