import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";


export async function handler(event)
{


const sql =
neon(process.env.NEON_DATABASE_URL);



const {
email,
password
}=JSON.parse(event.body);



const users =
await sql`

SELECT *
FROM users
WHERE email=${email}

`;



if(!users.length)
{

return {

statusCode:401,

body:JSON.stringify({
error:"Invalid login"
})

};

}



const user=users[0];



const valid =
await bcrypt.compare(
password,
user.password_hash
);



if(!valid)
{

return {

statusCode:401,

body:JSON.stringify({
error:"Invalid login"
})

};

}



const token =
jwt.sign(

{
id:user.id,
username:user.username

},

process.env.JWT_SECRET,

{
expiresIn:"30d"
}

);



return {

statusCode:200,

body:JSON.stringify({

success:true,

token,

username:user.username

})

};


}