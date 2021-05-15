import {Router} from 'express'
import {unlinkSync} from 'fs'

import { ArquivoController, ErroThumb  } from '../controller/ArquivoController';

export const thumbRouter = Router()
thumbRouter.get('/thumb/:id', async (req,res) => {
    const id = req.params.id

    const bd = req.app.locals.bd
    const imageCtrl = new ArquivoController(bd)

    try {
        const  caminhoArquivo = await imageCtrl.realizarThumb(id)
        return res.download(caminhoArquivo, ()=>{
            unlinkSync(caminhoArquivo)
        })
    } catch (erro) {
        switch (erro){
            case ErroThumb .ID_INVALIDO:
                return res.status(400).json({mensagem:ErroThumb .ID_INVALIDO})
            case ErroThumb .NAO_FOI_POSSIVEL_GRAVAR:
                return res.status(500).json({mensagem: ErroThumb .NAO_FOI_POSSIVEL_GRAVAR})
            case ErroThumb .NENHUMA_IMAGEM_ENCONTRADA: 
                return res.status(404).json({mensagem:ErroThumb .NENHUMA_IMAGEM_ENCONTRADA}) 
            default:
                return res.status(500).json({mensagem: 'Erro no servidor'})
        }
    }
}) 