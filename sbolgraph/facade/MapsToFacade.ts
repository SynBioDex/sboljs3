
import IdentifiedFacade from './IdentifiedFacade'

import { Types, Predicates, Specifiers } from 'sbolterms'
import SbolGraph from "../SbolGraph";

import * as triple from '../triple'

export default class MapsToFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.MapsTo
    }

    get local():IdentifiedFacade|undefined {

        const localUri:string|undefined = this.getUriProperty(Predicates.SBOL2.local)

        if(localUri === undefined)
            return undefined

        return this.graph.uriToFacade(localUri)

    }

    get remote():IdentifiedFacade|undefined {

        const remoteUri:string|undefined = this.getUriProperty(Predicates.SBOL2.remote)

        if(remoteUri === undefined)
            return undefined

        return this.graph.uriToFacade(remoteUri)

    }

    get containingObject():IdentifiedFacade|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.mapsTo, this.uri)
        )

        if(!uri) {
            throw new Error('MapsTo has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }
}

