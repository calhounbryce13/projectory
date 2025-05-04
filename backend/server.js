import express from "express";
const app = express();
const PORT = 3000;


app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.get("/testing", (req, res)=>{
    const message = JSON.stringify("hello");
    res.send(message);
});

app.post("/registration",(req, res)=>{
    const useremail = req.body.userEmail;
    const userpassword = req.body.userPass;
    res.send({useremail, userpassword});
});

app.listen(PORT, ()=>{
    console.log("server listening on port", PORT);
})