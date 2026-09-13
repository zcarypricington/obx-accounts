import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";


export async function handler(event)
{

    const sql = neon(
        process.env.NEON_DATABASE_URL
    );


    const {
        username,
        email,
        password
    } = JSON.parse(event.body);



    const existing =
    await sql`
        SELECT id
        FROM users
        WHERE email=${email}
    `;


    if(existing.length)
    {
        return {
            statusCode:400,
            body:JSON.stringify({
                error:"Account already exists"
            })
        };
    }



    const hash =
    await bcrypt.hash(
        password,
        12
    );



    await sql`

        INSERT INTO users
        (
            username,
            email,
            password_hash
        )

        VALUES
        (
            ${username},
            ${email},
            ${hash}
        )

    `;



    return {

        statusCode:200,

        body:JSON.stringify({
            success:true
        })

    };

}