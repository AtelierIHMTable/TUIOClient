/**
 * @author Christian Brel <ch.brel@gmail.com>
 */

/**
 * Main class to manage TUIOObject.
 *
 * @class TUIOObject
 */
class TUIOObject {

  /**
   * TUIOObject constructor.
   *
   * @constructor
   * @param {string/number} id - TUIOObject's id.
   * @param {string/number} x - TUIOObject's abscissa.
   * @param {string/number} y - TUIOObject's ordinate.
   */
  constructor(id, x, y) {
    this._id = id;
    this._x = x;
    this._y = y;
  }

  /**
   * TUIOObject's id getter.
   *
   * @returns {string|number} TUIOObject's id.
   */
  get id() { return this._id; }

  /**
   * Give the TUIOObject's JSON representation.
   *
   * @method toJSON
   */
  toJSON() {
    return {
      id: this._id,
      x: this._x,
      y: this._y,
    };
  }
}

export default TUIOObject;
