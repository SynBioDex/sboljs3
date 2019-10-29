
import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";

import { triple } from 'rdfoo'

export default class S2MapsTo extends S2Identified {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL2.MapsTo
    }

    get local():S2Identified|undefined {

        const localUri:string|undefined = this.getUriProperty(Predicates.SBOL2.local)

        if(localUri === undefined)
            return undefined

        return this.view.uriToIdentified(localUri)

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

        return this.view.uriToIdentified(remoteUri)

    }

    set remote(remote:S2Identified|undefined) {

        if(remote)
            this.setUriProperty(Predicates.SBOL2.remote, remote.uri)
        else
            this.deleteProperty(Predicates.SBOL2.remote)

    }

    set refinement(refinement:string|undefined) {

        if(refinement)
            this.setUriProperty(Predicates.SBOL2.refinement, refinement)
        else
            this.deleteProperty(Predicates.SBOL2.refinement)

    }

    get refinement():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.refinement)
    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL2.mapsTo, this.uri)
        )

        if(!uri) {
            throw new Error('MapsTo has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }
}

