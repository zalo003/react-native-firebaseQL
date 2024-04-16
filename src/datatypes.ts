import { WhereFilterOp } from "firebase/firestore"

export type whereClause = {
    key: string,
    operator: WhereFilterOp,
    value: any,
}

/**
 * firebase where clause
 */
export type andOrWhereClause = {
    key: string,
    operator: WhereFilterOp,
    value: any,
    type: 'and' | 'or'
}

export type QueryReturn = {
    data?: any,
    status: 'error' | 'success',
    message: string
}