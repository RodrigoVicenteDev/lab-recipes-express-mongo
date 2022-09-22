const express = require("express");
const router = express.Router();

const RecipeModel = require("../models/Recipe.model");
const UserModel = require("../models/User.model");

//1º rota: Criar um user

router.post("/create", async (req, res) => {
  try {
    const newUser = await UserModel.create({ ...req.body });
    return res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//2º rota: Pegar todos os users
router.get("/all", async (req, res) => {
  try {
    const all = await UserModel.find();
    return res.status(200).json(all);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//3º rota: Acessar um usuário pelo seu ID

router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const byid = await UserModel.findById(id);
    return res.status(200).json(byid);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//4º Adicionar uma receita na array de favorites
router.put("/addlike/:idreceita/:iduser", async (req, res) => {
  try {
    const { idreceita, iduser } = req.params;

    const addFav = await UserModel.findByIdAndUpdate(
      iduser,
      {
        $push: {
          favorites: idreceita,
        },
      },
      { new: true }
    );

    await RecipeModel.findByIdAndUpdate(idreceita, { $inc: { likes: +1 } });
    return res.status(200).json(addFav);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
//5º Adicionar uma receita na array de deslikes
router.put("/dislike/:idreceita/:iduser", async (req, res) => {
  try {
    const { idreceita, iduser } = req.params;

    const addFav = await UserModel.findByIdAndUpdate(
      iduser,
      {
        $push: {
          dislikes: idreceita,
        },
      },
      { new: true }
    );
    await RecipeModel.findByIdAndUpdate(idreceita, { $inc: { dislikes: +1 } });
    return res.status(200).json(addFav);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//6º Remover uma receita na array de favorite
router.delete("/deletefav/:userid/:recid", async (req, res) => {
  const { userid, recid } = req.params;
  try {
    const user = await UserModel.findByIdAndUpdate(userid, {
      $pull: { favorites: recid },
    });
    await RecipeModel.findByIdAndUpdate(idreceita, {
      $inc: { likes: -1, min: 0 },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//7º Remover uma receita na array de deslikes
router.delete("/deletedeslike/:userid/:recid", async (req, res) => {
  const { userid, recid } = req.params;
  try {
    const user = await UserModel.findByIdAndUpdate(
      userid,
      {
        $pull: { dislikes: recid },
      },
      { new: true }
    );

    await RecipeModel.findByIdAndUpdate(idreceita, {
      $inc: { dislikes: -1, min: 0 },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

module.exports = router;
