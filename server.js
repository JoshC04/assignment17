const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
  .connect(
    "mongodb+srv://joshCook:d85E3y01kxAggwI2@assignment17.yyxfcpj.mongodb.net/"
  )
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log("Could not connect to MongoDB...", err));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const movieSchema = new mongoose.Schema({
  title: String,
  year: Number,
  image: String,
  actors: [String],
  length: Number,
  director: String,
});

const Movie = mongoose.model("Movie", movieSchema);

app.get("/api/movies", (req, res) => {
  getMovies(res);
});

const getMovies = async (res) => {
  const movies = await Movie.find();
  res.send(movies);
  console.log(movies);
};

app.post("/api/movies", upload.single("image"), (req, res) => {
  const validate = validateMovie(req.body);

  if (validate.error) {
    res.status(400).send(validate.error.details[0].message);
    return;
  }

  const movie = new Movie({
    title: req.body.title,
    year: req.body.year,
    image: String,
    actors: req.body.actors.split(","),
    length: req.body.length,
    director: req.body.director,
  });

  createMovie(res, movie);
});

const createMovie = async (res, movie) => {
  const result = await movie.save();
  res.send(result);
  console.log(result);
};

app.put("/api/movies/:id", upload.single("image"), (req, res) => {
  const validate = validateMovie(req.body);
  if (validate.error) {
    res.status(400).send(validate.error.details[0].message);
    return;
  }
  updateMovie(req, res);
});

const updateMovie = async (req, res) => {
  let fields = {
    title: req.body.title,
    year: req.body.year,
    image: req.body.image,
    actors: req.body.actors.split(","),
    length: req.body.length,
    director: req.body.director,
  };

  if (req.file) {
    fields.image = "images/" + req.file.filename;
  }

  const result = await Movie.updateOne({ _id: req.params.id }, fields);
  res.send(result);
};

app.delete("/api/movies/:id", (req, res) => {
  removeMovie(res, req.params.id);
});

const removeMovie = async (res, id) => {
  const result = await Movie.findByIdAndDelete(id);
  res.send(result);
};

const validateMovie = (movie) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    title: Joi.string().min(3).required(),
    year: Joi.number().min(1900).required(),
    image: Joi.allow(""),
    actors: Joi.allow(""),
    length: Joi.number().min(1).required(),
    director: Joi.string().min(3).required(),
  });

  return schema.validate(movie);
};

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
