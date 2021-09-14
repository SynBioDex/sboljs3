
import SBOL3GraphView from '../SBOL3GraphView';

import S3Identified from './S3Identified'
import S3SubComponent from './S3SubComponent'
import S3Interaction from './S3Interaction'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S3Measure from './S3Measure';

export default class S3Participation extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL3.Participation
    }

    get participant():S3SubComponent|undefined {

        const subject:Node|undefined = this.getUriProperty(Predicates.SBOL3.participant)

        if(subject) {
            return new S3SubComponent(this.view, subject)
        }
    }

    set participant(c:S3SubComponent|undefined) {

        if(c) {
            this.setUriProperty(Predicates.SBOL3.participant, c.subject)
        } else {
            this.deleteProperty(Predicates.SBOL3.participant)
        }
    }

    get interaction():S3Interaction|undefined {

        const subject:Node|undefined = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.hasParticipation, this.subject)
        )

        if(subject) {
            return new S3Interaction(this.view, subject)
        }

    }

    get containingObject():S3Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.hasParticipation, this.subject)
        )

        if(!subject) {
            throw new Error('Participation has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }

    hasRole(subject:Node):boolean {

        return this.view.graph.hasMatch(this.subject, Predicates.SBOL3.role, subject)
    
    }

    addRole(role:string):void {
        this.insertProperty(Predicates.SBOL3.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.subject, Predicates.SBOL3.role, role)
    }

    get roles():string[] {
        return this.getUriProperties(Predicates.SBOL3.role)
    }

    setParticipant(participant:S3SubComponent):void {
        this.setUriProperty(Predicates.SBOL3.participant, participant.subject)
    }

    get measure():S3Measure|undefined {
        let measure = this.getUriProperty(Predicates.SBOL3.hasMeasure)

        if(measure === undefined)
            return
        
        return new S3Measure(this.view, measure)
    }

    set measure(measure:S3Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL3.hasMeasure)
        else
            this.setUriProperty(Predicates.SBOL3.hasMeasure, measure.subject)

    }


}


