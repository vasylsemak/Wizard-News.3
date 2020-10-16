const router = ("express").Router();
const client = require("../db");
const postList = require("../views/postList");
const postDetails = require("../views/postDetails");
const addPost = require("../views/addPost");

const baseQuery = "SELECT posts.*, users.name, counting.upvotes FROM posts INNER JOIN users ON users.id = posts.userId LEFT JOIN (SELECT postId, COUNT(*) as upvotes FROM upvotes GROUP BY postId) AS counting ON posts.id = counting.postId\n";

router.get("/", async (req, res, next) => {
  try {
    const data = await client.query(baseQuery);
    res.send(postList(data.rows));
  } catch (error) { next(error) }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, title, content } = req.body;
    const userData = await client.query('SELECT * FROM users WHERE name=$1',
      [name]);
    if(!userData.rows.length) {
      userData = await client.query('INSERT INTO users (name) VALUES ($1) RETURNING *',
        [name]);
    }
    await client.query('INSERT INTO posts (userId, title, content) VALUES ($1, $2, $3)',
      [userData.rows[0].id, title, content]);
    res.redirect('/posts');
  } catch (error) { next(error) }
});

router.get("/add", (req, res) => { res.send(addPost()) });

router.get("/:id", async (req, res, next) => {
  try {
    const data = await client.query(baseQuery + "WHERE posts.id = $1",
      [req.params.id]);
    const post = data.rows[0];
    res.send(postDetails(post));
  } catch (error) { next(error) }
});

module.exports = router;
