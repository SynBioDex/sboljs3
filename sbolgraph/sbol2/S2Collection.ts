
import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

export default class S2Collection extends S2Identified {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Collection
    }

    get members():Array<S2Identified> {

        return this.getUriProperties(Predicates.SBOL2.member)
                   .map((uri:string) => this.view.uriToFacade(uri))
                   .filter((r:S2Identified) => r !== undefined) as Array<S2Identified>

    }

    addMember(member:S2Identified):void {

        this.insertProperty(Predicates.SBOL2.member, node.createUriNode(member.uri))

    }

    get containingObject():S2Identified|undefined {

        return undefined

    }


}




