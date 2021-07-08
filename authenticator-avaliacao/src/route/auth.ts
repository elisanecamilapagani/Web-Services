import { Router } from 'express'
import { sign } from 'jsonwebtoken'
import { AuthController } from '../controller/AuthController'
import { STATUS, User } from '../entity/User'
import { App, STATUSAPP } from '../entity/Apps'
import { SECRET } from '../config/secret'
import { UserToApp } from '../entity/UserToApp'

export const authRouter = Router()

authRouter.post('/user/register', async (req, res) => {
    const { email, name, password } = req.body

    const user: User = new User(email, name, password)
    const response = user.isValid()

    if (response == STATUS.OK) {
        const authCtrl = new AuthController()
        const userEmail = await authCtrl.findUserByEmail(email)
        try{
            email == userEmail.email
            return res.status(500).json({message:  STATUS.ERRO_EMAIL})
        } catch(error){
        }
        try {
            const savedUser = await authCtrl.registerUser(user)
            return res.json(savedUser)
        } catch (error) {
            return res.status(500).json({ message: STATUS.REGISTER_ERROR })
        }
    } else {
        return res.status(400).json({ message: response })
    }
})

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body

    const authCtrl = new AuthController()
    const user = await authCtrl.findUserByEmail(email)
    if (user && user.isPasswordCorrect(password)) {
        const token = sign(
            { user: email, timestamp: new Date() },
            SECRET,
            {
                expiresIn: '30s'
            }
        )

        res.json({
            authorized: true,
            user,
            token
        })
    } else {
        return res.status(401).json({
            authorized: false,
            message: STATUS.NOT_AUTHORIZED
        })
    }
})

authRouter.post('/app/register', async (req, res) => {
    const { id_app, secret, expiresIn } = req.body
    const app: App = new App(id_app, secret, expiresIn)
    const response = app.isValid()

    if (response == STATUSAPP.OK) {
        const authCtrl = new AuthController()
        const secretApp= await authCtrl.findSecreetApp(secret)
        const AppDB= await authCtrl.findAppById(id_app)
        try{
            id_app == AppDB.id_app
            return res.status(500).json({message: STATUSAPP.INVALID_ID_APP})
        } catch(error){
          
        }
            try{
                secret == secretApp.secret
                return res.status(500).json({message: STATUSAPP.INVALID_SECRET})
            } catch(error){
    
            } 
        try {
            const savedApp = await authCtrl.registerApp(app)
            return res.json(savedApp)
        } catch (error) {
            return res.status(500).json({ message: STATUS.REGISTER_ERROR })
        }
    } else {
        return res.status(400).json({ mensage: response })
    }
})

authRouter.post('/app/associate', async (req, res) => {
    const { email, id_app } = req.body
    
    const authCtrl = new AuthController()
    const user = await authCtrl.findUserByEmail(email)
    const userEmail= user.email
    const app = await authCtrl.findAppById(id_app)
    const appId= app.id_app
    console.log(userEmail, appId)
    const userToApp = new UserToApp()
    userToApp.email = userEmail
    userToApp.id_app= app.id_app
    authCtrl.associateUserToApp(userToApp)
    
})

authRouter.get('/sidneys_secret', AuthController.verifyToken, (req, res) => {
    res.json({ secretMessage: "My subscribers are the best! They're amazing!" })
})