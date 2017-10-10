import SBOLGraph from '..';

import S2Identified from './S2Identified'
import S2FunctionalComponent from './S2FunctionalComponent'
import S2Interaction from './S2Interaction'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'

export default class S2Participation extends S2Identified {

    constructor(graph:SBOLGraph, uri:string) {

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

}


