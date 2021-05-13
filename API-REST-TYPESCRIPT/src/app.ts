import * as express from 'express';
import * as cors from 'cors';
import * as logger from 'morgan';

import { router } from './routes/index';
/**
 * criar app
 */
 export const app = express( )
 /**
  * configuração dos maddlewares
  */

 app.use(express.json())
 app.use(cors( ))
 app.use (logger('dev' ))

 /**
  * entrega o  endpont  na aplicação
  */

 app.use('/', router)

