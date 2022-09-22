const mongoose = require("mongoose");

async function connect() {
  try {
    const dbCOnnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado ao db")
  } catch (error) {
    console.log("Conexão com o banco de dados com erro", error);
  }
}

module.exports = connect;
