$(document).ready(function() {
  //Grab database because scrap takes a bit
  appendArticles();
// Grab the articles as a json
  scrapeArticles();
});

function scrapeArticles() {
  $.getJSON("/scrape", function(data){
      console.log(data);

      //Update after data has been scraped
      appendArticles();
    });
}

function appendArticles(){
  $.getJSON("/articles", function(articles) { // approperiate names is very valuable
      // For each one
      for (var i = 0; i < articles.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<div class = 'artClick' data-id='" + articles[i]._id + "'>" +"<h2>"+ articles[i].headline + "</h2>"
        +"<div>"+ articles[i].summary + "</div>"+ articles[i].link + "</div>");
        $("#articles").append("<button data-id='" + articles[i]._id + "' id='saveart'>Save Article</button>");
      }
    });
  }

//Try placing in a function and calling on $(document).ready()
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        if(data[i].saved === true){
      // Display the apropos information on the page
      $("#savedarticles").append("<div class = 'artClick' data-id='" + data[i]._id + "'>" +"<h2>"+ data[i].headline + "</h2>" +"<div>"+ data[i].summary + "</div>"+ data[i].link + "</div>");
      $("#savedarticles").append("<button sdata-id='" + data[i]._id + "' id='nosaveart'>Unsave Article</button>");
    }
    }

});
$(document).on("click", "#nosaveart",function(){
    var noSaveArtId = $(this).attr("sdata-id");
    $.ajax({
        method: "POST",
        url: "/articles/nosaved/" + noSaveArtId,
        data: {
            saved: false
         }
      })
      .then(function(savedata){
          console.log(savedata);
      });
});
$(document).on("click", "#saveart",function(){
    var thisArtId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/saved/" + thisArtId,
        data: {
            saved: true
         }
      })
      .then(function(savedata){
          console.log(savedata);
      });
});

$(document).on("click", "#scrape",function(){
    $ajax({
        method: "GET",
        url:"/scrape"
    })
    .then(function(data){
        console.log(data);
    });
});
// Whenever someone clicks a p tag
$(document).on("click", "div.artClick", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.headline + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
