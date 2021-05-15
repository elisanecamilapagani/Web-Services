import { downloadRouter } from './routes/download';
import * as express from 'express'
import * as fileUpload  from 'express-fileupload'
import * as cors from 'cors'
import * as logger from 'morgan'

import { uploadRouter} from './routes/upload'
import { thumbRouter } from './routes/thump';
import { ImagemNormalRouter } from './routes/ImagemNormal';

export const app = express( )

app.use(cors())
app.use(logger('dev'))
app.use (fileUpload())

app.use('/upload', uploadRouter)
app.use('/download', downloadRouter)
app.use('/imagem', thumbRouter)
app.use('/imagem', ImagemNormalRouter)
