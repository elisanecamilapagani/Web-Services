import { conectatNoBD } from './../config/db';
import { ArquivoController, ErroUpload } from './../controller/ArquivoController';
import { Router } from 'express'
import * as path from 'path'
import * as fs from 'fs'
import { mkdirSync } from 'node:fs'

export const uploadRouter = Router()

uploadRouter.post('/', async (req, res) => {
    if (!req.files || Object.keys(req.files).length == 0) {
        return res.status(404).send('Nenhum arquivo recebido')
    }
  
    const nomesArquivos = Object.keys(req.files)
    const diretorio = path.join(__dirname, '..', '..', 'arquivos')
    if (!fs.existsSync(diretorio)) {
        fs.mkdirSync(diretorio)
    }

    const bd = req.app.locals.bd
    const arquivoCtrl = new ArquivoController(bd)
    const idsArquivosSalvos = [ ]
    let  quantidadeErrosGravacao = 0
    let quantidadeErrorObjArquivoInvalido = 0
    let quantidadeErroInesperado = 0 


    const promises = nomesArquivos.map(async (arquivo) => {
        const objArquivo = req.files[arquivo]
        try {
            const idArquivo = await arquivoCtrl.realizarUpload(objArquivo)
            idsArquivosSalvos.push(idArquivo)
        } catch (erro) {
            switch(erro){
               case ErroUpload.NAO_FOI_POSSIVEL_GRAVAR:
                   quantidadeErrosGravacao++
                break
                case ErroUpload.OBJETVO_ARQUIVO_INVALIDO:
                    quantidadeErrorObjArquivoInvalido++
                break
                default:
                    quantidadeErroInesperado ++
            }
       }
       
    })

await Promise.all(promises)

res.json({
    idsArquivosSalvos,
    quantidadeErrosGravacao,
    quantidadeErroInesperado,
    quantidadeErrorObjArquivoInvalido
})



})    


