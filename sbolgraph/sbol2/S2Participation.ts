import SBOL2Graph from '../SBOL2Graph';

import S2Identified from './S2Identified'
import S2FunctionalComponent from './S2FunctionalComponent'
import S2Interaction from './S2Interaction'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'
import S2Measure from './S2Measure';

export default class S2Participation extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Participation
    }

    get participant():S2FunctionalComponent|undefined {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOL2.participant)

        if(uri) {
            return new S2FunctionalComponent(this.graph, uri)
        }
    }

    set participant(participant:S2FunctionalComponent|undefined) {

        if(participant !== undefined) {
            this.setUriProperty(Predicates.SBOL2.participant, participant.uri)
        } else {
            this.deleteProperty(Predicates.SBOL2.participant)
        }

    }

    get interaction():S2Interaction|undefined {

        const uri:string|undefined = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.participation, this.uri)
        )

        if(uri) {
            return new S2Interaction(this.graph, uri)
        }

    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.participation, this.uri)
        )

        if(!uri) {
            throw new Error('Participation has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    hasRole(uri:string):boolean {

        return this.graph.hasMatch(this.uri, Predicates.SBOL2.role, uri)
    
    }

    addRole(role:string):void {
        this.graph.insert(this.uri, Predicates.SBOL2.role, node.createUriNode(role))
    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL2.role)
    }

    setParticipant(participant:S2FunctionalComponent):void {
        this.setUriProperty(Predicates.SBOL2.participant, participant.uri)
    }

    get measure():S2Measure|undefined {
        let measure = this.getUriProperty(Predicates.SBOL2.measure)

        if(measure === undefined)
            return
        
        return new S2Measure(this.graph, measure)
    }

    set measure(measure:S2Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL2.measure)
        else
            this.setUriProperty(Predicates.SBOL2.measure, measure.uri)

    }


}


