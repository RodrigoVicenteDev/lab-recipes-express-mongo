const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnection = require("./config/db.config");
dbConnection();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.REACT_APP_URI }));

const RecipesRoute = require('./routes/recipes.routes')
app.use('/recipes', RecipesRoute)

const UserRoute = require('./routes/users.routes')
app.use('/users', UserRoute)

app.listen(Number(process.env.PORT), () => {
  console.log("Server up and running on port", process.env.PORT);
});
