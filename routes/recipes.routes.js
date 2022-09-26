const express = require("express");
const router = express.Router();

const RecipeModel = require("../models/Recipe.model");
const UserModel = require("../models/User.model");
const { route } = require("./users.routes");

const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");

//1º rota: Criar uma receita
router.post("/create", isAuth, attachCurrentUser, isAdmin, async (req, res) => {
  try {
    const newRecepies = await RecipeModel.create({ ...req.body });
    return res.status(200).json(newRecepies);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//2º rota: Acessar todas as receitas
router.get("/all", async (req, res) => {
  try {
    const allrecipes = await RecipeModel.find();
    return res.status(200).json(allrecipes);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
//3º rota: Acessar uma única receita pelo seu ID
router.get("/recipe/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const byid = await RecipeModel.findById(id);
    return res.status(200).json(byid);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//4º rota: Criar várias receitas de uma só vez

router.post(
  "/createMany",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const createMany = await RecipeModel.insertMany([...req.body]);
      return res.status(200).json(createMany);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

//6º rota: Acessar todos os usuários que favoritaram essa receita
router.get("/searchfav/:recid", async (req, res) => {
  try {
    const { recid } = req.params;
    const response = await UserModel.find({ favorites: recid });
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
//7º rota: Acessar todos os usuários que deram dislike essa receita
router.get("/searcdeslike/:recid", async (req, res) => {
  try {
    const { recid } = req.params;
    const response = await UserModel.find({ dislikes: recid });
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
//!5º rota: Deletar uma receita pelo seu ID - retira-la da array de favorites e dislikes dos USERS
router.delete(
  "/recepie/delete/:id",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleteRecepie = await RecipeModel.findByIdAndDelete(id);
      await UserModel.updateMany(
        { favorites: id },
        { $pull: { favorites: id } }
      );
      await UserModel.updateMany({ dislikes: id }, { $pull: { dislikes: id } });
      return res.status(200).json(deleteRecepie);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

module.exports = router;
