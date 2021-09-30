
import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";

import { triple, Node } from 'rdfoo'

export default class S2MapsTo extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL2.MapsTo
    }

    get local():S2Identified|undefined {

        const localsubject:Node|undefined = this.getProperty(Predicates.SBOL2.local)

        if(localsubject === undefined)
            return undefined

        return this.view.uriToIdentified(localsubject)

    }

    set local(local:S2Identified|undefined) {

        if(local)
            this.setProperty(Predicates.SBOL2.local, local.subject)
        else
            this.deleteProperty(Predicates.SBOL2.local)

    }

    get remote():S2Identified|undefined {

        const remotesubject:Node|undefined = this.getProperty(Predicates.SBOL2.remote)

        if(remotesubject === undefined)
            return undefined

        return this.view.uriToIdentified(remotesubject)

    }

    set remote(remote:S2Identified|undefined) {

        if(remote)
            this.setProperty(Predicates.SBOL2.remote, remote.subject)
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

        const subject = this.view.graph.matchOne(null, Predicates.SBOL2.mapsTo, this.subject)?.subject

        if(!subject) {
            throw new Error('MapsTo has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }
}

