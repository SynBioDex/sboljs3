import SBOLGraph from '../SBOLGraph';

import S2Identified from './S2Identified'
import S2ComponentDefinition from './S2ComponentDefinition'
import S2ModuleDefinition from './S2ModuleDefinition'
import S2MapsTo from './S2MapsTo'
import S2Participation from './S2Participation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import S2Interaction from "./S2Interaction";

export default class S2FunctionalComponent extends S2Identified {

    constructor(graph:SBOLGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.FunctionalComponent
    }

    get displayName():string {

        const name = this.name

        if(name)
            return name

        const def = this.definition

        const defName = def.name
        
        if(defName)
            return defName

        return this.displayId || ''
    }

    get definition():S2ComponentDefinition {

        const uri = this.getUriProperty(Predicates.SBOL2.definition)

        if(!uri) {
            throw new Error('fc ' + this.uri + ' has no def?')
        }

        return new S2ComponentDefinition(this.graph, uri)
    }

    get mappings():Array<S2MapsTo> {

        return this.graph.match(null, Predicates.SBOL2.local, this.uri).map(triple.subjectUri)
                .concat(
                    this.graph.match(null, Predicates.SBOL2.remote, this.uri).map(triple.subjectUri)
                )
                .filter((el) => !!el)
                .map((mapsToUri) => new S2MapsTo(this.graph, mapsToUri as string))
    }


    get containingModuleDefinition():S2ModuleDefinition {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.functionalComponent, this.uri)
        )

        if(!uri) {
            throw new Error('FC ' + this.uri + ' not contained by a MD?')
        }

        return new S2ModuleDefinition(this.graph, uri)
    }



    get participations():Array<S2Participation> {

        return this.graph.match(null, Predicates.SBOL2.participant, this.uri)
                   .map(triple.subjectUri)
                   .map((uri) => uri ? new S2Participation(this.graph, uri): undefined)
                   .filter((el) => !!el) as Array<S2Participation>
    }

    get interactions():Array<S2Interaction> {

        return this.participations.map((participation) => participation.interaction).filter((el) => !!el) as Array<S2Interaction>
    }

    get containingObject():S2Identified|undefined {

        return this.containingModuleDefinition

    }

}


