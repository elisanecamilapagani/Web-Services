import { NextFunction, Request, Response } from "express"
import { getConnection, getManager } from "typeorm"
import { verify } from 'jsonwebtoken'


import { STATUS, User } from "../entity/User"
import { SECRET } from "../config/secret"
import { App } from "../entity/Apps"


export class AuthController {



    async registerUser(user: User): Promise<User> {
        delete user._password
        try {
            const savedUser = await getManager().save(user)
            return savedUser
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }


    //contruindo app 
    async registerApp(app: App): Promise<App> {
        try {
            const savedApp = await getManager().save(app)
            return savedApp
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await getManager().findOne(User, { email: email })
        return user
    }

    async findAppById(id_app: string): Promise<App> {
        const app = await getManager().findOne(App, { id_app:id_app} )
        return app
    }

    async findSecreetApp(secret: string): Promise<App> {
        const app = await getManager().findOne(App, {secret: secret})
        return app
    }
    async associateUserToApp(user: User, app: App) {
        console.log(user, 'APP')
       console.log(app,'USER')
        await getConnection().createQueryBuilder().relation(User, "apps").of(user).add(app)
    }



    static verifyToken(req: Request, res: Response, next: NextFunction) {
        let token = req.headers['authorization']
        if (token) {
            token = token.substring(7, token.length)

            try {
                verify(token, SECRET)
                next()
            } catch (error) {

            }
        }

        res.status(401).json({ message: STATUS.NOT_AUTHORIZED })
    }
}