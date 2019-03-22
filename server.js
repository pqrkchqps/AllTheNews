// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/AllTheNews";

mongoose.connect(MONGODB_URI);


app.get("/scrape", (req,res)=>{
    axios.get("http://www.newsweek.com").then(function(response){
        
    var $ = cheerio.load(response.data);

        // grab every article tag with a class of clearfix
        $("article.clearfix").each(function(i, element){
            // Save an empty result object
            var result = {};
            // Add the text, href, and summary and saves them as properties of result
            result.headline = $(this)
                .children("h4")
                .children("a")
                .text();
            result.link = $(this)
                .children("h4")
                .children("a")
                .attr("href");
            result.summary = $(this)
                .children("div.summary")
                .text();
            //creates a new Article using the result object
            db.Article.insertMany(result)
              .then(function(dbArticle){
                console.log(dbArticle);
              })
              .catch(function(err){
                  console.log(err);
              });
        });
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // the route grabs all of the articles
    db.Article.find({}) 
      .then( articles => res.json(articles))
  });
  
  // Gets a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // finds one article using the req.params.id and run the populate method with "note",
    db.Article.findOne({_id: req.params.id}) 
      .populate("note")
      .then( article => res.json(article))
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // save the new note that gets posted to the Notes collection
    db.Note.create(req.body)
    // then find an article from the req.params.id
      .then( dbNote => db.Article.findOneAndUpdate(
              {_id:req.params.id},
              {$set:{note:dbNote._id}})    
      )
      .then(dbArticle => res.json(dbArticle))
      .catch( err => res.json(500, err))
    // and update it's "note" property with the _id of the new note
  
  });
  app.post("/articles/saved/:id", function(req, res) {
    // updatesaved
    if(req.saved === false){
    db.Article.findOneAndUpdate(
        {_id:req.params.id},
        {$set:{saved:true}})    
      .then(dbArticle => res.json(dbArticle))
      .catch( err => res.json(500, err))
    }
  
  });
  app.post("/articles/nosaved/:id", function(req, res) {
    // updatesaved to false
    db.Article.findOneAndUpdate(
        {_id:req.params.id},
        {$set:{saved:false}})    
      .then(dbArticle => res.json(dbArticle))
      .catch( err => res.json(500, err))
  
  });
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
