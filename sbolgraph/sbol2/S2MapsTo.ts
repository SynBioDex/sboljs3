
import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2Graph from "../SBOL2Graph";

import * as triple from '../triple'

export default class S2MapsTo extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.MapsTo
    }

    get local():S2Identified|undefined {

        const localUri:string|undefined = this.getUriProperty(Predicates.SBOL2.local)

        if(localUri === undefined)
            return undefined

        return this.graph.uriToFacade(localUri)

    }

    set local(local:S2Identified|undefined) {

        if(local)
            this.setUriProperty(Predicates.SBOL2.local, local.uri)
        else
            this.deleteProperty(Predicates.SBOL2.local)

    }

    get remote():S2Identified|undefined {

        const remoteUri:string|undefined = this.getUriProperty(Predicates.SBOL2.remote)

        if(remoteUri === undefined)
            return undefined

        return this.graph.uriToFacade(remoteUri)

    }

    set remote(remote:S2Identified|undefined) {

        if(remote)
            this.setUriProperty(Predicates.SBOL2.remote, remote.uri)
        else
            this.deleteProperty(Predicates.SBOL2.remote)

    }

    set refinement(refinement:string|undefined) {

        if(refinement)
            this.setStringProperty(Predicates.SBOL2.refinement, refinement)
        else
            this.deleteProperty(Predicates.SBOL2.refinement)

    }

    get refinement():string|undefined {
        return this.getStringProperty(Predicates.SBOL2.refinement)
    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.mapsTo, this.uri)
        )

        if(!uri) {
            throw new Error('MapsTo has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }
}

