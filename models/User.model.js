const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* CAMPOS 
- name: String
- email: String
- favorites: [ObjectsId]
- dislikes: [ObjectsId]
*/

const clientSchema = new Schema({
  name: { type: String },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm,
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
});

const ClientModel = mongoose.model("Client", clientSchema);

module.exports = ClientModel;
