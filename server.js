const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());

const upload = multer({ dest: __dirname + "/public/images" });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let movies = [
  {
    _id: 1,
    title: "Dungeons and Dragons: Honor Among Thieves",
    year: 2023,
    image: "images/dnd.jpg",
    actors: [
      "Chris Pine",
      "Michelle Rodriguez",
      "Justice Smith",
      "Sophia Lillis",
    ],
    length: 134,
    director: "John Franics Daley",
  },
  {
    _id: 2,
    title: "Dune",
    year: 2021,
    image: "images/dune.jpg",
    actors: [
      "Timothée Chalamet",
      "Rebecca Ferguson",
      "Oscar Isaac",
      "Josh Brolin",
    ],
    length: 155,
    director: "Denis Villeneuve",
  },
  {
    _id: 3,
    title: "How to Train Your Dragon: The Hidden World",
    year: 2019,
    image: "images/httyd.jpg",
    actors: [
      "Jay Baruchel",
      "America Ferrera",
      "Cate Blanchett",
      "Craig Ferguson",
    ],
    length: 104,
    director: "Dean DeBlois",
  },
  {
    _id: 4,
    title: "Interstellar",
    year: 2014,
    image: "images/interstellar.jpg",
    actors: [
      "Matthew McConaughey",
      "Anne Hathaway",
      "Jessica Chastain",
      "Michael Caine",
    ],
    length: 169,
    director: "Christopher Nolan",
  },
  {
    _id: 5,
    title: "Spider-Man: Across the Spiderverse",
    year: 2023,
    image: "images/spiderman.webp",
    actors: [
      "Shameik Moore",
      "Hailee Steinfeld",
      "Jake Johnson",
      "Oscar Isaac",
    ],
    length: 140,
    director: "Joaquim Dos Santos",
  },
];

app.get("/api/movies", (req, res) => {
  res.send(movies);
});

app.get("/api/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find((m) => m.id === id);

  if(!movie) {
    res.status(404).send("Movie not found");
  }

  res.send(movie);
});

app.post("/api/movies", upload.single("image"), (req, res) => {
  const validate = validateMovie(req.body);

  if (validate.error) {
    res.status(400).send(validate.error.details[0].message);
    return;
  }

  const movie = {
    _id: movies.length + 1,
    title: req.body.title,
    year: req.body.year,
    image: req.body.file,
    actors: req.body.actors.split(","),
    length: req.body.length,
    director: req.body.director
  };

  movies.push(movie);
  res.send(movie);
});

app.put("/api/movies/:id", upload.single("image"), (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find((m) => m._id === id);

  const validate = validateMovie(req.body);
  if(validate.error) {
    res.status(400).send(validate.error.details[0].message);
    return;
  }

  movie.title = req.body.title;
  movie.year = req.body.year;
  movie.image = req.body.image;
  movie.actors = req.body.actors.split(",");
  movie.length = req.body.length;
  movie.director = req.body.director;

  res.send(movie);
});

app.delete("/api/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find((m) => m._id === id);

  if(!movie) {
    res.status(404).send("Movie not found");
  }

  const index = movies.indexOf(movie);
  movies.splice(index, 1);
  res.send(movie);
});

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
