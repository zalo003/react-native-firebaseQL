import { DocumentData } from "firebase/firestore";
import { StoreInterface } from "./StoreInterface";
import { QueryReturn, andOrWhereClause, whereClause } from "./datatypes";
import firestore, { Filter, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export class StoreModel implements StoreInterface {

    protected _table: FirebaseFirestoreTypes.CollectionReference;
    private _firestoreDB: FirebaseFirestoreTypes.Module;


    constructor(table: string, firestoreDB: FirebaseFirestoreTypes.Module){
        this._firestoreDB = firestoreDB;
        this._table = this._firestoreDB.collection(table);
    }

    /**
     * 
     * @param { string } id 
     * @returns 
     */
    async find(id: string): Promise<QueryReturn> {
        try {
            const docSnap = await this._table.doc(id).get();
            if (docSnap.exists) {
                return {
                    data: {...docSnap.data(), reference: id},
                    message: "Document found",
                    status: 'success'
                }
            }
            return {message: 'Document does not exist', status: 'success'}
            
        } catch (_) {
            return {message: 'Document does not exist', status: 'error'};
        }
    }


    /**
     * Fetch all data in a document or range of data
     * by the document references
     * @param ids 
     * @returns 
     */
    async findAll(ids?: string[] | undefined): Promise<QueryReturn> {
        try {
            if(ids){
                const results: DocumentData[] = []
                for (let id of ids){
                    const item = await this.find(id)
                    if(item.data){
                        results.push(item as DocumentData)
                    }
                }
                return {data: results, message: 'Documents found', status: 'success'}
            } else {
                const snapshots = await this._table.get();
                if(!snapshots.empty){
                    const data = snapshots.docs.map((document)=>{
                        return {...document.data(), reference: document.id}
                    })
                    return {data, message: 'Documents found', status: 'success'}
                }else{
                    return {message: 'Documents empty', status: 'success'}
                }
            }
            
        } catch (_) {
            return {message: 'Document does not exist', status: 'error'};
        }
    }

    async findWhereOrAnd({ wh, lim, order, offset }: { wh?: { type: "or" | "and" | "andOr"; parameter: andOrWhereClause[]; } | undefined; lim?: number | undefined; order?: string | undefined; offset?: string | undefined; }): Promise<QueryReturn> {
        try {
            // set where clause
            const andWhere: FirebaseFirestoreTypes.QueryFilterConstraint[] = []
            const orWhere: FirebaseFirestoreTypes.QueryFilterConstraint[] = [];
            let queryRef: FirebaseFirestoreTypes.Query = this._table;

            // add where parameter
            if(wh){
                
                wh.parameter.forEach((clause)=>{
                    const {key, operator, value } = clause
                    const whe = Filter(key, operator, value)
                    clause.type === 'and' ?
                    andWhere.push(whe) : orWhere.push(whe)
                })

                if(wh.type==='andOr'){
                    queryRef = this._table.where(
                        Filter.and(...andWhere,
                            Filter.or(...orWhere)
                        )
                    );
                } else if(wh.type === 'or') {
                    queryRef = Filter.or(...orWhere)
                } else {
                    queryRef = Filter.and(...andWhere)
                }
            }        
            // let constraint = []
            // add order by
            if(order){
                queryRef.orderBy(order)
            }
            // add offset
            if(offset){
                const off = await this._table.doc(offset).get();
                queryRef.startAfter(off.data())
            }
            // add limit
            if(lim){
                queryRef.limit(lim)
            }
            // fetch data
        
            const snapshot = await this._table.get()
            if(!snapshot.empty){
                const data =  snapshot.docs.map(document=>{
                    return {...document.data(), reference: document.id}
                })
                return {data, message: 'Documents found', status: 'success'}
            }else{ return {message: 'No Documents found', status: 'success'} }
            
        } catch (_) {
            return {message: 'No Documents found', status: 'error'}
        }
    }

    async findWhere({ wh, lim, order, offset }: { wh?: whereClause[]; lim?: number | undefined; order?: string | undefined; offset?: string | undefined; }): Promise<QueryReturn> {
        try {
            // set where clause
            const andWhere: FirebaseFirestoreTypes.QueryFilterConstraint[] = []
            
             wh? wh.forEach((clause)=>{
                const {key, operator, value } = clause
                const whe = Filter(key, operator, value);
                andWhere.push(whe);
            }) : []

            // let constraint: QueryConstraint[] = []
            // add where parameter
            if(wh){
                this._table.where(Filter.and(...andWhere))
            }
            // add order by
            if(order){
                this._table.orderBy(order)
            }
            // add offset
            if(offset){
                const off = await this._table.doc(offset).get();
                this._table.startAfter(off.data())
            }
            // add limit
            if(lim){
                this._table.limit(lim)
            }
        
            const snapshot = await this._table.get()
            if(!snapshot.empty){
                const data = snapshot.docs.map(document=>{
                    return {...document.data(), reference: document.id}
                })
                return {data, message: 'Documents found', status: 'success'}
            }else{ return {message: 'No Documents found', status: 'success'} }
            
        } catch (error) {
            return {message: 'No Documents found', status: 'error'}
        }
    }

    async save(data: object, id?: string): Promise<QueryReturn> {
        delete (data as any).reference
        try {
            if(id===undefined){
                const documentRef = await this._table.add(data);
                return {status: 'success', message: 'Document added successfully!', data: documentRef.id}
            } else {
                // await setDoc(doc(this.firestorDB!, this.table, id!), data)
                await this._table.doc(id).set(data);
                return {status: 'success', message: 'Document updated successfully!', data: id}
            }
                    
        } catch (_) {
            return {status: 'error', message: 'Unable to save document'}
        }
    }

    async delete(id: string): Promise<QueryReturn> {
        try {
            await this._table.doc(id).delete()
            return {status: 'success', message: 'Document deleted successfully!'}
        } catch (error) {
            return {status: 'success', message: 'Unable to delete document'}
        }
    }

    async update(data: object, id: string): Promise<QueryReturn> {
        try {
            delete (data as any).reference
            const result = await this._table.doc(id).update(data)
            return {data: result, message: 'Data updated successfully', status: 'success'}
        } catch (error) {
            return { message: 'Unable to update document', status: 'error'}
        }
    }

    stream(callBack: (data: DocumentData | DocumentData[] | undefined) => void, id?: string | undefined): void {
        try {
            if(id){
                this._table.doc(id).onSnapshot((doc)=>{
                    callBack({...doc.data(), reference: id})
                })
                
            }else{
                this._table.onSnapshot((coll)=>{
                    callBack(
                        coll.docs.map((value)=>{
                            const data = {...value.data(), reference: value.id}
                            return data
                        })
                    )
                })
            }
        } catch (_) {
            return
        }
    }

    async streamWhere(wh: whereClause[], callBack: (data: DocumentData[]) => void, lim?: number | undefined, order?: string | undefined, offset?: string | undefined): Promise<void> {
        try {
            const andWhere: FirebaseFirestoreTypes.QueryFilterConstraint[] = []
            wh? wh.forEach((clause)=>{
                const {key, operator, value } = clause
                const whe = Filter(key, operator, value);
                andWhere.push(whe);
            }) : []
            // add where parameter
            if(wh){
                this._table.where(Filter.and(...andWhere))
            }
            // add order by
            if(order){
                this._table.orderBy(order)
            }
            // add offset
            if(offset){
                const off = await this._table.doc(offset).get();
                this._table.startAfter(off.data())
            }
            // add limit
            if(lim){
                this._table.limit(lim)
            }

            this._table.onSnapshot((snapShot)=>{
                callBack(snapShot.docs.map((value)=>{
                    const data = {...value.data(), reference: value.id}
                    return data
                }))
            })
            
        } catch (error) {
           return 
        }
    }

    async countData(where: whereClause[]): Promise<QueryReturn> {
        try {
            
            // set parameter
            const andWhere: FirebaseFirestoreTypes.QueryFilterConstraint[] = []
            where? where.forEach((clause)=>{
                const {key, operator, value } = clause
                const whe = Filter(key, operator, value);
                andWhere.push(whe);
            }) : []

            this._table.where(Filter.and(...andWhere));
            
            const data = await this._table.countFromServer().get()

            return {message: "Counted data", status: 'success', data: data.data()}
            
            } catch (_) {
                return {message: "Unable to cound data", status: "error"}
            }
    }

    saveBatch({ data }: { data: object[]; }): Promise<QueryReturn> {
        throw new Error("Method not implemented.");
    }

    updateBatch({ data }: { data: object[]; callBack: () => void; }): Promise<QueryReturn> {
        throw new Error("Method not implemented.");
    }

    deleteBatch({ ids }: { ids: string[]; }): Promise<QueryReturn> {
        throw new Error("Method not implemented.");
    }

    async incrementDecrement({ dbReference, key, isIncrement, incrementalValue }: { dbReference: string; key: string; isIncrement?: boolean | undefined; incrementalValue?: number | undefined; }): Promise<QueryReturn> {
        try {
            const docRef = this._table.doc(dbReference)
            const value = isIncrement?incrementalValue??1:(incrementalValue??1) * -1;
            await docRef.update({[key]: firestore.FieldValue.increment(value)})
            return {status: 'success', message: "Counter successful"}
        } catch (error) {
            return {status: 'error', message: "unable to count data"}
        }
    } 

}