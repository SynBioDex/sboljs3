
import { RdfNode } from 'rdf-ext'
import rdf = require('rdf-ext')

import assert from 'power-assert'

export function createUriNode(uri:string):RdfNode {

    if(! (typeof(uri) === 'string')) {
        throw new Error('trying to create URI node for ' + (typeof uri) + ' ' + uri)
    }

    return rdf.createNamedNode(uri)

}

export function isUri(node:RdfNode):boolean {

    return node.interfaceName === 'NamedRdfNode'

}

export function toUri(node:RdfNode|undefined):string|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'NamedRdfNode') {

        //throw new Error('nodeToUri requires a NamedRdfNode, but found ' + node.interfaceName)

    }

    return node.nominalValue

}

export function createIntNode(value:number):RdfNode {

    return rdf.createLiteral('' + value)

}

export function toInt(node:RdfNode|undefined):number|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Integer node must be a literal; instead got ' + node.interfaceName)

    }

    const res = parseInt(node.nominalValue)

    if(isNaN(res)) {

        console.warn('parseInt returned NaN for ' + JSON.stringify(node.nominalValue))

    }

    return res

}

export function createStringNode(value:string):RdfNode {

    return rdf.createLiteral('' + value)

}

export function toString(node:RdfNode|undefined):string|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('String node must be a literal; instead got ' + node.interfaceName)

    }

    return node.nominalValue

}

export function createFloatNode(value:number):RdfNode {

    return rdf.createLiteral('' + value)

}

export function isFloat(node:RdfNode):boolean {

    return node.interfaceName === 'Literal'

}

export function toFloat(node:RdfNode|undefined):number|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Floating point node must be a literal; instead got ' + node.interfaceName)

    }

    return parseFloat(node.nominalValue)

}

export function createBoolNode(value:boolean):RdfNode {

    return rdf.createLiteral(value ? 'true' : 'false')

}

export function toBool(node:RdfNode|undefined): boolean|undefined {

    if(node === undefined)
        return

    if(node.interfaceName !== 'Literal') {

        console.error(JSON.stringify(node))

        throw new Error('Boolean node must be a literal; instead got ' + node.interfaceName)

    }

    return node.nominalValue === 'true' ? true : false

}


