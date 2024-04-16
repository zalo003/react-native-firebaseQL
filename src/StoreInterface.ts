import { DocumentData } from "firebase/firestore"
import { QueryReturn, andOrWhereClause, whereClause } from "./datatypes"

export interface StoreInterface {
 
    // fetch single item
    find(id: string): Promise<QueryReturn>

    // select all from database
    findAll(ids?: string[]): Promise<QueryReturn>

    // find item by where clause
    findWhereOrAnd({wh, lim, order, offset} : 
        {
            wh?:  {
                type: 'or' | 'and' | 'andOr',
                parameter: andOrWhereClause[]
            }, 
            lim?:number, 
            order?:string,
            offset?: string
        }): Promise<QueryReturn>
    

    findWhere({wh, lim, order, offset} : 
        {
            wh?:  whereClause[], 
            lim?:number, 
            order?:string,
            offset?: string
        }): Promise<QueryReturn>

    /**
     * Save data to database,
     * create new data if does not exists
     * and update data if already exists
     */
    save(data: object, id?: string ):  Promise<QueryReturn>

    /**
     * Delete an item from database
     */
    delete(id: string): Promise<QueryReturn>

    /**
     * Update part of data
     * @param data 
     */
    update(data: object, id:string): Promise<QueryReturn>

    /**
     * Realtime data listener
     * @param where 
     */
    stream(callBack: (data: DocumentData | DocumentData[]| undefined)=>void, id?: string, ):  void

    /**
     * Stream data with where clause
     * @param wh 
     * @param callBack 
     * @param errorHander 
     * @param lim 
     * @param order 
     */
    streamWhere(wh: whereClause[], callBack: (data: DocumentData[])=>void,  lim?:number, order?: string, offset?: string): void 

    /**
     * count data in database
     * @param qyery 
     * @param isAll 
     */
    countData(where: whereClause[]): Promise<QueryReturn>


    /**
     * create multiple documents
     * @param param0 
     */
    saveBatch({data}:{data: object[]}): Promise<QueryReturn>

    /**
     * Update multiple documents
     * @param param0 
     */
    updateBatch({data}:{data: object[], callBack:()=>void }): Promise<QueryReturn>

    /**
     * Delete multiple documents
     * @param param0 
     */
    deleteBatch({ids}:{ids: string[]}): Promise<QueryReturn>

    incrementDecrement({dbReference, key, isIncrement, incrementalValue}: 
        {dbReference: string, key:string, isIncrement?:boolean, incrementalValue?: number} ): Promise<QueryReturn>
}