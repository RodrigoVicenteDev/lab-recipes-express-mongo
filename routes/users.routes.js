const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const generateToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");

const RecipeModel = require("../models/Recipe.model");
const UserModel = require("../models/User.model");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "Hotmail",
  auth: {
    secure: false,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

//1º rota: Criar um user

router.post("/sign-up", async (req, res) => {
  try {
    const { password , email} = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#_!])[0-9a-zA-Z$*&@#_!]{8,}$/
      )
    ) {
      return res
        .status(400)
        .json({ message: "Senha não atende aos parâmetros de segurança" });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: passwordHash,
    });
    delete newUser._doc.passwordHash;
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Ativação de conta",
      html: `<p>Clique no link para ativar sua conta:<p> 
      <a href=http://localhost:4000/users/activate-account/${newUser._id}>LINK</a>`,
      
    };
    await transporter.sendMail(mailOptions)

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get('/activate-account/:idUser', async(req,res)=>{
  try {
    const {idUser} = req.params
    const user = await UserModel.findById(idUser)
    if(!user){
      return res.send("Erro na ativação da conta");
    }
    await UserModel.findByIdAndUpdate(idUser,{
      emailConfirm: true,
    })
    res.send("Usuário ativado!");
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor, informe seu email e senha! " });
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Usuário não encontrado no banco de dados" });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;
      const token = generateToken(user);
      return res.status(200).json({
        user: user,
        token: token,
      });
    } else {
      return res.status(400).json({ message: "Senha ou email incorretos." });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//2º rota: Pegar todos os users
router.get("/all", async (req, res) => {
  try {
    const all = await UserModel.find()
    return res.status(200).json(all);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//3º rota: Acessar um usuário pelo seu ID

router.get("/profile/", isAuth, attachCurrentUser, async (req, res) => {
  try {

    return res.status(200).json(req.currentUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//4º Adicionar uma receita na array de favorites
router.put(
  "/addlike/:idreceita",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      console.log(req.currentUser)
      const email = req.currentUser.email
      const { idreceita } = req.params;
      const receita = await RecipeModel.findById(idreceita)
      const iduser = req.currentUser._id;
      const addFav = await UserModel.findByIdAndUpdate(
        iduser,
        {
          $push: {
            favorites: idreceita,
          },
        },
        { new: true }
      );

      let mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Nova receita favoritada",
        html: `<h2>Voce favoritou a receita:</h2><br></br><article>${receita}</article>`
      }
      await transporter.sendMail(mailOptions)

      await RecipeModel.findByIdAndUpdate(idreceita, { $inc: { likes: +1 } });
      return res.status(200).json(addFav);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);
//5º Adicionar uma receita na array de deslikes
router.put(
  "/dislike/:idreceita",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { idreceita } = req.params;
      const iduser = req.currentUser._id;
      const addFav = await UserModel.findByIdAndUpdate(
        iduser,
        {
          $push: {
            dislikes: idreceita,
          },
        },
        { new: true }
      );
      await RecipeModel.findByIdAndUpdate(idreceita, {
        $inc: { dislikes: +1 },
      });
      return res.status(200).json(addFav);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

//6º Remover uma receita na array de favorite
router.delete(
  "/deletefav/:recid",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const { recid } = req.params;
    const userid = req.currentUser._id;
    try {
      const user = await UserModel.findByIdAndUpdate(userid, {
        $pull: { favorites: recid },
      });
      await RecipeModel.findByIdAndUpdate(recid, {
        $inc: { likes: -1, min: 0 },
      });
      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

//7º Remover uma receita na array de deslikes
router.delete(
  "/deletedeslike/:userid",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const { recid } = req.params;
    const userid = req.currentUser._id;
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
  }
);

module.exports = router;
