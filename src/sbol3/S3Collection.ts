
import SBOL3GraphView from '../SBOL3GraphView';

import S3Identified from './S3Identified'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

export default class S3Collection extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL3.Collection
    }

    get members():Array<S3Identified> {

        return this.getProperties(Predicates.SBOL3.member)
                   .map((subject:Node) => this.view.subjectToFacade(subject))
                   .filter((r:S3Identified) => r !== undefined) as Array<S3Identified>

    }

    addMember(member:S3Identified):void {

        this.insertProperties({
            [Predicates.SBOL3.member]: member.subject
        })

    }

}




