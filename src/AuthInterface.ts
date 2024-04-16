import { FirebaseAuthTypes } from "@react-native-firebase/auth"
import { QueryReturn } from "./datatypes"
import { User } from "firebase/auth"


export interface AuthInterface {

    registerWithEmailAndPassword ({
        email, 
        password, 
        userData,
     }: {
        email:string, 
        password: string, 
        userData?: object
    }): Promise<QueryReturn>


    login ({
        email, 
        password, 
        verifyEmail
    }: {
        email: string, 
        password: string, 
        verifyEmail?: boolean
    }): Promise<QueryReturn> 


    logout(): Promise<QueryReturn>

    deleteAccount(user: User) : Promise<QueryReturn>
}