
import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple, Node, node } from 'rdfoo'
import SBOL3GraphView from '../SBOL3GraphView';

export default class S3MapsTo extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL3.MapsTo
    }

    get local():S3Identified|undefined {

        const localsubject:Node|undefined = this.getProperty(Predicates.SBOL3.local)

        if(localsubject === undefined)
            return undefined

        return this.view.uriToIdentified(localsubject)

    }

    set local(local:S3Identified|undefined) {

        if(local)
            this.setProperty(Predicates.SBOL3.local, local.subject)
        else
            this.deleteProperty(Predicates.SBOL3.local)

    }

    get remote():S3Identified|undefined {

        const remotesubject:Node|undefined = this.getProperty(Predicates.SBOL3.remote)

        if(remotesubject === undefined)
            return undefined

        return this.view.uriToIdentified(remotesubject)

    }

    set remote(remote:S3Identified|undefined) {

        if(remote)
            this.setProperty(Predicates.SBOL3.remote, remote.subject)
        else
            this.deleteProperty(Predicates.SBOL3.remote)

    }

    set refinement(refinement:string|undefined) {

        if(refinement)
            this.setProperty(Predicates.SBOL3.refinement, node.createUriNode(refinement))
        else
            this.deleteProperty(Predicates.SBOL3.refinement)

    }

    get refinement():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.refinement)
    }

    get containingObject():S3Identified|undefined {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL3.mapsTo, this.subject)?.subject

        if(!subject) {
            throw new Error('MapsTo has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }
}

