const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* CAMPOS 
- name: String
- email: String
- favorites: [ObjectsId]
- dislikes: [ObjectsId]
*/

const clientSchema = new Schema({
  name:{type:String},
  email:{type:String},
  favorites: [{type: Schema.Types.ObjectId, ref: 'Recipe'}],
  dislikes: [{type: Schema.Types.ObjectId, ref: 'Recipe'}]

});

const ClientModel = mongoose.model("Client", clientSchema);

module.exports = ClientModel;
