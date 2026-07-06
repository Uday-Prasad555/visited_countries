import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
let error="";
let db= new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"world",
  password:"1234",
  port:5433,
})
await db.connect();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", async (req, res) => {
  //Write your code here.
  let countries=[];
  const result= await db.query("SELECT country_code FROM visited_countries");
  result.rows.forEach((country)=>{
    if(country.country_code!="IO"){
      countries.push(country.country_code);
    }
  })
  console.log(result.rows);
  res.render("index.ejs",{countries:countries,total:countries.length,error:error});
  error="";
});
app.post("/add", async (req, res) => {
  //Write your code here.
  let n=req.body.country;
  try{
  const result=await db.query("SELECT country_code FROM country WHERE country_name ILIKE '%' || $1 || '%'",
  [n]);
  if(result.rows.length>0){
try{
    await db.query("insert into visited_countries(country_code) values($1)",[result.rows[0].country_code]);
}
catch(err){
    console.error("Error occurred while inserting country code:", err);
    error="Country has already been added, try again.";
}
  return res.redirect("/");}
else{
  error="Country not found, try again.";
  return res.redirect("/");
}}
  catch(err){
    console.error("Error occurred while fetching country code:", err);
    error= "Country not found, try again.";
    return res.redirect("/");
};
  });
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
