import bcrypt from "bcrypt";
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
            statusCode: 400,
            body: JSON.stringify({
                error: "Invalid JSON"
            })
        };
    }



    const {
        username,
        email,
        password
    } = data;



    if (!username || !email || !password)
    {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Username, email, and password are required"
            })
        };
    }



    const sql = neon(
        process.env.NEON_DATABASE_URL
    );



    const existing =
    await sql`

        SELECT id
        FROM users
        WHERE email=${email}
        OR username=${username}

    `;



    if (existing.length)
    {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Account already exists"
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

        statusCode: 200,

        headers:
        {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            success: true
        })

    };

}