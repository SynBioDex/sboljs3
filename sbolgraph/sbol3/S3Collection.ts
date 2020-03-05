
import SBOL3GraphView from '../SBOL3GraphView';

import S3Identified from './S3Identified'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

export default class S3Collection extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Collection
    }

    get members():Array<S3Identified> {

        return this.getUriProperties(Predicates.SBOL3.member)
                   .map((uri:string) => this.view.uriToFacade(uri))
                   .filter((r:S3Identified) => r !== undefined) as Array<S3Identified>

    }

    addMember(member:S3Identified):void {

        this.insertProperties({
            [Predicates.SBOL3.member]: node.createUriNode(member.uri)
        })

    }

}




