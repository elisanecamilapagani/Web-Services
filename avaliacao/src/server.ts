import { Server } from 'node:http'
import { app } from './app'
 
import { conectatNoBD } from './config/db'


const porta = process.env.PORT || 3000

const serve = app.listen(
    porta,
    () => {
        conectatNoBD( ) 
        console.log(`App ouvindo na porta ${porta}`)
    }
)

process.on('SIGINT', ( )=>{
    serve.close( )
    console.log('App finalizado')
})