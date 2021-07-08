import { Entity, Column, ManyToMany, JoinTable, PrimaryGeneratedColumn } from "typeorm"
import { validate } from 'email-validator'
import { User } from './User'
import { type } from "os";


export enum STATUSAPP {
  INVALID_PASSWORD = 'The password must contain at least 8 characters, 1 uppercase character, and 1 digit',
  OK = 'Ok',
  INVALID_SECRET = 'This Secret has already been registered',
  INVALID_ID_APP =  'Already have an app with this ID'
}
@Entity()
export class App {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_app: string;

  @Column()
  secret: string;

  @Column()
  expiresIn: string;

  @ManyToMany(type => User, user => user.email)
  user: User[]

  constructor(id_app: string, secret: string, expiresIn: string) {
    this.id_app = id_app
    this.secret = secret
    this.expiresIn = expiresIn
  }


  isValid(): STATUSAPP {
    if (this.secret === "") {
      return STATUSAPP.INVALID_SECRET
    }
      return STATUSAPP.OK
    
  }
}
