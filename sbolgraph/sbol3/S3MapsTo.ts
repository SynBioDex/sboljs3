
import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple } from 'rdfoo'
import SBOL3GraphView from '../SBOL3GraphView';

export default class S3MapsTo extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL3.MapsTo
    }

    get local():S3Identified|undefined {

        const localUri:string|undefined = this.getUriProperty(Predicates.SBOL3.local)

        if(localUri === undefined)
            return undefined

        return this.view.uriToIdentified(localUri)

    }

    set local(local:S3Identified|undefined) {

        if(local)
            this.setUriProperty(Predicates.SBOL3.local, local.uri)
        else
            this.deleteProperty(Predicates.SBOL3.local)

    }

    get remote():S3Identified|undefined {

        const remoteUri:string|undefined = this.getUriProperty(Predicates.SBOL3.remote)

        if(remoteUri === undefined)
            return undefined

        return this.view.uriToIdentified(remoteUri)

    }

    set remote(remote:S3Identified|undefined) {

        if(remote)
            this.setUriProperty(Predicates.SBOL3.remote, remote.uri)
        else
            this.deleteProperty(Predicates.SBOL3.remote)

    }

    set refinement(refinement:string|undefined) {

        if(refinement)
            this.setUriProperty(Predicates.SBOL3.refinement, refinement)
        else
            this.deleteProperty(Predicates.SBOL3.refinement)

    }

    get refinement():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.refinement)
    }

    get containingObject():S3Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.mapsTo, this.uri)
        )

        if(!uri) {
            throw new Error('MapsTo has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }
}

