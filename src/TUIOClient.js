/**
 * @author Christian Brel <ch.brel@gmail.com>
 */

// Import OCS
import { Server } from 'node-osc';

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
    this._oscServer = new Server(3333);
    console.info('TUIO Client is ready.');

    this._oscServer.on('message', (msg) => {
      this.handleTUIOMessage(msg);
    });
  }

  /**
   * Handle TUIO Message, process it and send result to Socket.IO channel.
   *
   * @method handleTUIOMessage
   * @param {string} message - Message from OSC.
   */
  handleTUIOMessage(message) {
    console.log(message);
    /*
     var a;
     for(a = 0; a < msg.length; a++){
     if(msg[a].length >= 7 && msg[a][0] == "/tuio/2Dobj"){
     var tag = msg[a][3];
     var x = msg[a][4];
     var y = msg[a][5];
     var angle = msg[a][6];
     var marker = new Marker(tag,x,y,angle);
     handler.handleMarker(marker);
     }
     }
     var updates = handler.getUpdates();
     for(a = 0; a < updates.length; a++){
     console.log('Marker update');
     socket.emit("updateMarker",updates[a]);
     if(game.status === "placement")
     socket.emit("checkPlacement",{"idplayer":updates[a].playerId,"check":updates[a].positionOk});
     }
     var removes = handler.getRemoves();
     for(a = 0; a < removes.length; a++) {
     var idplayer = game.getPlayerIdFromMarker(removes[a]);
     socket.emit("removeMarker", {"id": removes[a], "playerId":idplayer });
     socket.emit("checkPlacement",{"idplayer":idplayer,"check":false});
     }
     */
  }
}

export default TUIOClient;
