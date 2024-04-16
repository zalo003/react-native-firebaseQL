import { AuthInterface } from "./AuthInterface";
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { StoreModel } from "./StoreModel";
import { QueryReturn } from "./datatypes";
import { User, deleteUser } from "firebase/auth"
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export class UserModel extends StoreModel implements AuthInterface {

    private _auth: FirebaseAuthTypes.Module;


    constructor(auth: FirebaseAuthTypes.Module, firestoreDB: FirebaseFirestoreTypes.Module, table?: string){
        super(table ?? "Users", firestoreDB);
        this._auth = auth;
    }

    /**
     * Create a new firebase user and sore the value
     * of data in firestore database
     * @param { string; string; object; } {email; password; userData;}
     * @returns 
     */
    async registerWithEmailAndPassword({ 
        email, 
        password, 
        userData 
    }: { 
        email: string; 
        password: string; 
        userData?: object; 
    }): Promise<QueryReturn> {
        try {
            const user = await this._auth?.createUserWithEmailAndPassword(email, password);
            // send verification mail
            if(user && userData){
                this.save(userData, user.user.uid)
            }
            return {
                data: user,
                status: 'success',
                message: 'User registered successfully'
            }
        } catch (error) {
            if ((error as any).code === 'auth/email-already-in-use') {
                return {
                    status: 'error',
                    message: `${email} is already in use!`
                }
            }
        
            if ((error as any).code === 'auth/invalid-email') {
                return {
                    status: 'error',
                    message: `${email} is an invalid email address`
                }
            }

            return {
                status: 'error',
                message: 'Unable to register user'
            }
        }
    }

    /**
     * Login user with email and password
     * @param param0 
     * @returns 
     */
    async login({ 
        email, 
        password, 
        verifyEmail = false 
    }: { 
        email: string; 
        password: string; 
        verifyEmail?: boolean 
    }): Promise<QueryReturn> {
        
        try {
            const signedIn = await this._auth.signInWithEmailAndPassword(email, password);
            // check if email should be verified
            if(verifyEmail){
                if(!signedIn.user.emailVerified){
                    return {
                        status: 'error',
                        message: 'Email address needs verification'
                    }
                }
            }
            return {

                status: 'success',
                message: 'User logged in successfully',
                data: signedIn
            }

        } catch (error) {
            return {
                status: 'error',
                message: 'Invalid login credentials'
            }
        }
    }

    async logout(): Promise<QueryReturn> {
        try {
            await this._auth.signOut()
            return {
                status: 'success',
                message: "User signout!"
            }
        } catch (_) {
            return { status: 'error', message: 'Unable to complete process'}
        }
    }

    async deleteAccount( user: User): Promise<QueryReturn> {
        try {
            await Promise.all([
                 deleteUser(user),
                this.delete(user.uid)
            ])
            return {status: 'success', message: 'Account deleted successfully'};
        } catch (error) {
            return {status: 'error', message: "unable to delete user account"}
        }
    }

}