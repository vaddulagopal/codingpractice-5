const express = require("express")
const {open} = require("sqlite");
const sqlite3 =require("sqlite3");
const path =require("path");
const dbPath=path.join(__dirname,"moviesData.db");

const app=express();
app.use(express.json());
let db=null;

const initializeDbAndServer =async() =>{
    try{
        db =await open({
            filename: dbPath,
            driver:sqlite3.Database,
        });
        app.listen(3000, () => console.log("server running at http://localhost:3000/"));
    }; catch(error){
        console.log(`DB Error : ${error.message}`);
        process.exit(1);
    }
};
initializeDbAndServer();

const convertingDbObjectToResponseObject =(dbObject) =>{
    return {
        movieId :dbObject.playerId,
        directorId:dbObject.director_id,
        movieName:dbObject.movie_name,
        leadActor :dbObject.lead_actor,
    }
};
const returnMovieName =(movieObj) =>{
    return {
        movieName:movieObj.movie_name,
    };
};
const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/",(request,response) =>{
    const getMovieNameQuery =`
    SELECT
       movie_name
    FROM
       movie;
    `;
    const movieNameArray= await db.all(getMovieNameQuery);
    response.send(
        movieNameArray.map((eachMovie) => returnMovieName(eachMovie))
    );
});

app.post("/movies/",(request,response) =>{
    const {directorId,movieName,leadActor} =response.body
    const postMovieQuery =`
    INSERT INTO
        movie
    VALUES
        (${directorId},'${movieName}','${leadActor}');`;
    const movie=await db.run(postMovieQuery);
    response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/",(request,response) =>{
    const {movieId}= request.params;
    const getMovieNameQuery =`
    SELECT
       *
    FROM
       movie
    WHERE
       movie_id=${movieId};
    `;
    const movieArray= await db.get(getMovieNameQuery);
    response.send(convertingDbObjectToResponseObject(movieArray));
});
app.put("/movies/:movieId/",(request,response) =>{
    const {directorId,movieName,leadActor} =request.body;
    const {movieId}=request.params;

    const updateMovieDetailsQuery=`
    UPDATE
       movie
    SET
       director_id=${directorId},
       movie_name='${movieName}',
       lead_actor='${leadActor}'
    WHERE
       movie_id=${movieId};
    `;
    await db.run(updateMovieDetailsQuery);
    response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/",(request,response) =>{
    const {movieId} =request.params;
    const deleteMovieQuery= `
    DELETE FROM 
        movie
    WHERE
        movie_id=${movieId};
    `;
    await db.run(deleteMovieQuery);
    response.send("Movie Removed");
});
app.get("/directors/", (request,response) =>{
    const getDirectorsQuery=`
    SELECT 
        *
    FROM
        director;
    `;
    const directorArray=await db.all(getDirectorsQuery);
    response.send(
        directorArray.map((eachDirector) =>convertDirectorDbObjectToResponseObject(eachDirector));
    );
});

app.get("/directors/:directorId/movies/",(request,response) =>{
    const {directorId} =request.params;
    const getMovieNameQuery=`
    SELECT
        movie_name
    FROM 
        movie
    WHERE
        director_id=${directorId};
    `;
    const movieNameArray=await db.all(getMovieNameQuery);
    response.send(
        movieNameArray.map((eachMovie) =>returnMovieName(eachMovie))
    );
});

module.exports=app;