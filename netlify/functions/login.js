import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";


export async function handler(event)
{

    if (event.httpMethod !== "POST")
    {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Method not allowed"
            })
        };
    }


    if (!event.body)
    {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Missing request body"
            })
        };
    }


    let data;

    try
    {
        data = JSON.parse(event.body);
    }
    catch
    {
        return {
            statusCode:400,
            body:JSON.stringify({
                error:"Invalid JSON"
            })
        };
    }


    const {
        email,
        password
    } = data;



    if (!email || !password)
    {
        return {
            statusCode:400,
            body:JSON.stringify({
                error:"Email and password required"
            })
        };
    }



    const sql =
        neon(process.env.NEON_DATABASE_URL);



    const users =
    await sql`

        SELECT *
        FROM users
        WHERE email=${email}

    `;



    if(users.length === 0)
    {
        return {
            statusCode:401,
            body:JSON.stringify({
                error:"Invalid login"
            })
        };
    }



    const user = users[0];



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

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            success:true,

            token,

            username:user.username

        })

    };

}