
import * as node from './node'

import { Triple } from 'rdf-graph-array'

export function subjectUri(triple:Triple|undefined):string|undefined {

    if(triple === undefined)
        return undefined

    return node.toUri(triple.subject)
}

export function predicateUri(triple:Triple|undefined):string|undefined {

    if(triple === undefined)
        return undefined

    return node.toUri(triple.predicate)
}

export function objectUri(triple:Triple|undefined):string|undefined {

    if(triple === undefined)
        return undefined

    return node.toUri(triple.object)
}

export function objectInt(triple:Triple|undefined):number|undefined {

    if(triple === undefined)
        return undefined

    return node.toInt(triple.object)

}

export function objectFloat(triple:Triple|undefined):number|undefined {

    if(triple === undefined)
        return undefined

    return node.toFloat(triple.object)

}

export function objectBool(triple:Triple|undefined):boolean|undefined {

    if(triple === undefined)
        return undefined

    return node.toBool(triple.object)

}

export function objectString(triple:Triple|undefined):string|undefined {

    if(triple === undefined)
        return undefined

    return node.toString(triple.object)

}



