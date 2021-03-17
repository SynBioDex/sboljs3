
import SBOL3GraphView from '../SBOL3GraphView';

import S3Identified from './S3Identified'
import S3SubComponent from './S3SubComponent'
import S3Interaction from './S3Interaction'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S3Measure from './S3Measure';

export default class S3Participation extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL3.Participation
    }

    get participant():S3SubComponent|undefined {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOL3.participant)

        if(uri) {
            return new S3SubComponent(this.view, uri)
        }
    }

    set participant(c:S3SubComponent|undefined) {

        if(c) {
            this.setUriProperty(Predicates.SBOL3.participant, c.uri)
        } else {
            this.deleteProperty(Predicates.SBOL3.participant)
        }
    }

    get interaction():S3Interaction|undefined {

        const uri:string|undefined = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.hasParticipation, this.uri)
        )

        if(uri) {
            return new S3Interaction(this.view, uri)
        }

    }

    get containingObject():S3Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.hasParticipation, this.uri)
        )

        if(!uri) {
            throw new Error('Participation has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }

    hasRole(uri:string):boolean {

        return this.view.graph.hasMatch(this.uri, Predicates.SBOL3.role, uri)
    
    }

    addRole(role:string):void {
        this.insertProperty(Predicates.SBOL3.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.uri, Predicates.SBOL3.role, role)
    }

    get roles():string[] {
        return this.getUriProperties(Predicates.SBOL3.role)
    }

    setParticipant(participant:S3SubComponent):void {
        this.setUriProperty(Predicates.SBOL3.participant, participant.uri)
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
            this.setUriProperty(Predicates.SBOL3.hasMeasure, measure.uri)

    }


}


