const mongoose=require('mongoose');

const connectDB=()=>{
    mongoose.connect(process.env.MONGO_URL).then(con=>{
        console.log(`Database is connected to host ${con.connection.host}`);
    })
}
module.exports=connectDB;