
import SXIdentified from './SXIdentified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple } from 'rdfoo'
import SBOLXGraphView from '../SBOLXGraphView';

export default class SXMapsTo extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOLX.MapsTo
    }

    get local():SXIdentified|undefined {

        const localUri:string|undefined = this.getUriProperty(Predicates.SBOLX.local)

        if(localUri === undefined)
            return undefined

        return this.view.uriToIdentified(localUri)

    }

    set local(local:SXIdentified|undefined) {

        if(local)
            this.setUriProperty(Predicates.SBOLX.local, local.uri)
        else
            this.deleteProperty(Predicates.SBOLX.local)

    }

    get remote():SXIdentified|undefined {

        const remoteUri:string|undefined = this.getUriProperty(Predicates.SBOLX.remote)

        if(remoteUri === undefined)
            return undefined

        return this.view.uriToIdentified(remoteUri)

    }

    set remote(remote:SXIdentified|undefined) {

        if(remote)
            this.setUriProperty(Predicates.SBOLX.remote, remote.uri)
        else
            this.deleteProperty(Predicates.SBOLX.remote)

    }

    set refinement(refinement:string|undefined) {

        if(refinement)
            this.setUriProperty(Predicates.SBOLX.refinement, refinement)
        else
            this.deleteProperty(Predicates.SBOLX.refinement)

    }

    get refinement():string|undefined {
        return this.getUriProperty(Predicates.SBOLX.refinement)
    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOLX.mapsTo, this.uri)
        )

        if(!uri) {
            throw new Error('MapsTo has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }
}

