import { Db, GridFSBucket, ObjectId } from "mongodb";
import { join } from 'path'
import { resolve } from 'node:path';
import { rejects, strict } from 'assert/strict';
import {
    existsSync,
    writeFileSync,
    createReadStream,
    mkdirSync,
    unlinkSync,
    createWriteStream
} from 'fs'
import { promises } from "node:stream";

import * as sharp from 'sharp'

export enum ErroUpload {
    OBJETVO_ARQUIVO_INVALIDO = 'Objeto de arquivo inválido',
    NAO_FOI_POSSIVEL_GRAVAR = 'Não foi possivel gravar o arquivo no banco de'
}

export enum ErroDownload {
    ID_INVALIDO = 'Id inválido',
    NENHUM_ARQUIVO_ENCONTRADO = 'Nenhum arquivo encontrado com este id',
    NAO_FOI_POSSIVEL_GRAVAR = 'Não foi possível gravar o arquivo recuperado'
}


export enum ErroThumb{
    ID_INVALIDO = 'ID Inválido',
    NENHUMA_IMAGEM_ENCONTRADA = 'Nenhuma imagem encontrada com este id',
    NAO_FOI_POSSIVEL_GRAVAR = 'Não foi possível gravar a imagem recuperada'
}
export class ArquivoController {


    private _db: Db
    private _caminhoDiretorioArquivos: string

    constructor(bd: Db) {
        this._db = bd
        this._caminhoDiretorioArquivos = join(__dirname, '..', '..', 'arquivos_temporarios')
        if (!existsSync(this._caminhoDiretorioArquivos)) {
            mkdirSync(this._caminhoDiretorioArquivos)
        }
    }

    private _ehUmObjetoDeArquivoValido(objArquivo: any): boolean {
        return objArquivo
            && 'name' in objArquivo
            && 'data' in objArquivo
            && objArquivo['name']
            && objArquivo['data']

    }

    private _inicializarBucket(): GridFSBucket {
        return new GridFSBucket(this._db, {
            bucketName: 'arquivos'
        })
    }
    realizarUpload(objArquivo: any): Promise<ObjectId> {
        return new Promise((resolve, rejects) => {


            if (this._ehUmObjetoDeArquivoValido(objArquivo)) {
                const bucket = this._inicializarBucket()

                const nomeArquivo = objArquivo['name']
                const conteudoArquivo = objArquivo['data']
                const nomeArquivoTemp = `${nomeArquivo}_ ${(new Date().getTime())}`

                const caminhoArquivoTemp = join(this._caminhoDiretorioArquivos, nomeArquivoTemp)
                writeFileSync(caminhoArquivoTemp, conteudoArquivo)


                const streamGridFs = bucket.openUploadStream(nomeArquivo, {
                    metadata: {
                        MimeType: objArquivo['mimetype']

                    }
                })

                const streamleitura = createReadStream(caminhoArquivoTemp)
                streamleitura
                    .pipe(streamGridFs)
                    .on('finish', () => {
                        unlinkSync(caminhoArquivoTemp)
                        resolve(new ObjectId(`${streamGridFs.id}`))
                    })

                    .on('erro', erro => {
                        console.log(erro)
                        rejects(ErroUpload.NAO_FOI_POSSIVEL_GRAVAR)
                    })
            } else {
                rejects(ErroUpload.OBJETVO_ARQUIVO_INVALIDO)
            }

        })
        
    }

    realizarDownload(id: string): Promise<string> {
        return new Promise(async (resolve, rejects) => {
            if (id && id.length == 24) {
                const _id = new ObjectId(id)
                const bucket = this._inicializarBucket()
                const resultados = await bucket.find({ '_id': _id }).toArray()
                if (resultados.length > 0) {
                    const metadados = resultados[0]
                  const streamGridFs= bucket.openDownloadStream( _id )
                  const caminhoArquivo = join(this._caminhoDiretorioArquivos, metadados[ 'filename'])
                   const streamGravacao=createWriteStream(caminhoArquivo )

                   streamGridFs
                   .pipe( streamGravacao)
                   .on('finish', ( )=>{
                       resolve(caminhoArquivo)
                   })
                   .on('erro', erro =>{
                       console.log(erro)
                       rejects(ErroDownload.NAO_FOI_POSSIVEL_GRAVAR)
                   })
                } else {
                    rejects(ErroDownload.NENHUM_ARQUIVO_ENCONTRADO)
                }
            } else {
                rejects(ErroDownload.ID_INVALIDO)
            }
        })
    }

    
    realizarThumb(id: string): Promise<string>{
        return new Promise( async (resolve, reject) =>{
            if(id && id.length == 24){
                const _id = new ObjectId(id) 
                const bucket = this._inicializarBucket()

                const resizeImg = sharp()
                    .resize(100)
                    
                const resultados = await bucket.find({'_id' : _id}).toArray()
                if(resultados.length > 0){
                    const metadados = resultados[0]
                    const streamGridFS = bucket.openDownloadStream(_id)
                    const caminhoArquivo = join(this._caminhoDiretorioArquivos, metadados['filename'])
                    const streamGravacao = createWriteStream(caminhoArquivo)
                    
                    streamGridFS
                        .pipe(resizeImg)
                        .pipe(streamGravacao)
                        .on('finish', ()=>{
                            resolve(caminhoArquivo)
                        })
                        .on('erro', erro => {
                            console.log(erro)
                            reject(ErroDownload.NAO_FOI_POSSIVEL_GRAVAR)
                        })

                }else{
                    reject(ErroDownload.NENHUM_ARQUIVO_ENCONTRADO)
                }

            }else{
                reject(ErroDownload.ID_INVALIDO)
            }
        })
    }


    realizarImagemNormal(id: string): Promise<string>{
        return new Promise( async (resolve, reject) =>{
            if(id && id.length == 24){
                const _id = new ObjectId(id) 
                const bucket = this._inicializarBucket()
                 
                const resizeImg = sharp()
                    .resize(100)
                    
                const resultados = await bucket.find({'_id' : _id}).toArray()
                if(resultados.length > 0){
                    const metadados = resultados[0]
                    const streamGridFS = bucket.openDownloadStream(_id)
                    const caminhoArquivo = join(this._caminhoDiretorioArquivos, metadados['filename'])
                    const streamGravacao = createWriteStream(caminhoArquivo)
                    
                    streamGridFS
                        .pipe(resizeImg)
                        .pipe(streamGravacao)
                        .on('finish', ()=>{
                            resolve(caminhoArquivo)
                        })
                        .on('erro', erro => {
                            console.log(erro)
                            reject(ErroDownload.NAO_FOI_POSSIVEL_GRAVAR)
                        })

                }else{
                    reject(ErroDownload.NENHUM_ARQUIVO_ENCONTRADO)
                }

            }else{
                reject(ErroDownload.ID_INVALIDO)
            }
        })
    }


}



