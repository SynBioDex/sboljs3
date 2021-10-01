import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'
import S2FunctionalComponent from './S2FunctionalComponent'
import S2Interaction from './S2Interaction'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S2Measure from './S2Measure';

export default class S2Participation extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.Participation
    }

    get participant():S2FunctionalComponent|undefined {

        const subject:Node|undefined = this.getProperty(Predicates.SBOL2.participant)

        if(subject) {
            return new S2FunctionalComponent(this.view, subject)
        }
    }

    set participant(participant:S2FunctionalComponent|undefined) {

        if(participant !== undefined) {
            this.setProperty(Predicates.SBOL2.participant, participant.subject)
        } else {
            this.deleteProperty(Predicates.SBOL2.participant)
        }

    }

    get interaction():S2Interaction|undefined {

        const subject:Node|undefined = this.view.graph.matchOne(null, Predicates.SBOL2.participation, this.subject)?.subject

        if(subject) {
            return new S2Interaction(this.view, subject)
        }

    }

    get containingObject():S2Identified|undefined {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL2.participation, this.subject)?.subject

        if(!subject) {
            throw new Error('Participation has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }

    hasRole(subject:string):boolean {

        return this.view.graph.hasMatch(this.subject, Predicates.SBOL2.role, node.createUriNode(subject))
    
    }

    addRole(role:string):void {
        this.insertProperty(Predicates.SBOL2.role, node.createUriNode(role))
    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL2.role)
    }

    setParticipant(participant:S2FunctionalComponent):void {
        this.setProperty(Predicates.SBOL2.participant, participant.subject)
    }

    get measure():S2Measure|undefined {
        let measure = this.getProperty(Predicates.SBOL2.measure)

        if(measure === undefined)
            return
        
        return new S2Measure(this.view, measure)
    }

    set measure(measure:S2Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL2.measure)
        else
            this.setProperty(Predicates.SBOL2.measure, measure.subject)

    }


}


