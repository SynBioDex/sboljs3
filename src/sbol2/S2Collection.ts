
import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'

import { Node, triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

export default class S2Collection extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL2.Collection
    }

    get members():Array<S2Identified> {

        return this.getProperties(Predicates.SBOL2.member)
                   .map((subject:Node) => this.view.subjectToFacade(subject))
                   .filter((r:S2Identified) => r !== undefined) as Array<S2Identified>

    }

    addMember(member:S2Identified):void {

        this.insertProperty(Predicates.SBOL2.member, member.subject)

    }

    get containingObject():S2Identified|undefined {

        return undefined

    }


}




