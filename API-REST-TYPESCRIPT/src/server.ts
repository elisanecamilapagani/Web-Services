import {app } from './app'

const porta =process.env.Port || 3000

 const server= app.listen(porta, () => console.log(`App ouvindo na porta ${porta}`))

process.on( `SIGINT`,( ) => {
  server.close( )
  console.log('App finalizado')
})