
import SXIdentified from './SXIdentified'

import { Types, Predicates, Specifiers } from 'bioterms'

import * as triple from '../triple'
import SBOLXGraph from '../SBOLXGraph';

export default class SXMapsTo extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.MapsTo
    }

    get local():SXIdentified|undefined {

        const localUri:string|undefined = this.getUriProperty(Predicates.SBOL2.local)

        if(localUri === undefined)
            return undefined

        return this.graph.uriToFacade(localUri)

    }

    set local(local:SXIdentified|undefined) {

        if(local)
            this.setUriProperty(Predicates.SBOL2.local, local.uri)
        else
            this.deleteProperty(Predicates.SBOL2.local)

    }

    get remote():SXIdentified|undefined {

        const remoteUri:string|undefined = this.getUriProperty(Predicates.SBOL2.remote)

        if(remoteUri === undefined)
            return undefined

        return this.graph.uriToFacade(remoteUri)

    }

    set remote(remote:SXIdentified|undefined) {

        if(remote)
            this.setUriProperty(Predicates.SBOL2.remote, remote.uri)
        else
            this.deleteProperty(Predicates.SBOL2.remote)

    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.mapsTo, this.uri)
        )

        if(!uri) {
            throw new Error('MapsTo has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }
}

