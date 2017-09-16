import SbolGraph from '../SbolGraph';

import IdentifiedFacade from './IdentifiedFacade'
import ComponentDefinitionFacade from './ComponentDefinitionFacade'
import ModuleDefinitionFacade from './ModuleDefinitionFacade'
import MapsToFacade from './MapsToFacade'
import ParticipationFacade from './ParticipationFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import InteractionFacade from "./InteractionFacade";

export default class FunctionalComponentFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

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

    get definition():ComponentDefinitionFacade {

        const uri = this.getUriProperty(Predicates.SBOL2.definition)

        if(!uri) {
            throw new Error('fc ' + this.uri + ' has no def?')
        }

        return new ComponentDefinitionFacade(this.graph, uri)
    }

    get mappings():Array<MapsToFacade> {

        return this.graph.match(null, Predicates.SBOL2.local, this.uri).map(triple.subjectUri)
                .concat(
                    this.graph.match(null, Predicates.SBOL2.remote, this.uri).map(triple.subjectUri)
                )
                .filter((el) => !!el)
                .map((mapsToUri) => new MapsToFacade(this.graph, mapsToUri as string))
    }


    get containingModuleDefinition():ModuleDefinitionFacade {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.functionalComponent, this.uri)
        )

        if(!uri) {
            throw new Error('FC ' + this.uri + ' not contained by a MD?')
        }

        return new ModuleDefinitionFacade(this.graph, uri)
    }



    get participations():Array<ParticipationFacade> {

        return this.graph.match(null, Predicates.SBOL2.participant, this.uri)
                   .map(triple.subjectUri)
                   .map((uri) => uri ? new ParticipationFacade(this.graph, uri): undefined)
                   .filter((el) => !!el) as Array<ParticipationFacade>
    }

    get interactions():Array<InteractionFacade> {

        return this.participations.map((participation) => participation.interaction).filter((el) => !!el) as Array<InteractionFacade>
    }

    get containingObject():IdentifiedFacade|undefined {

        return this.containingModuleDefinition

    }

}


