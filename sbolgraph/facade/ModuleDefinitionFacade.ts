
import IdentifiedFacade from './IdentifiedFacade'
import ModuleInstanceFacade from './ModuleInstanceFacade'
import FunctionalComponentFacade from './FunctionalComponentFacade'
import InteractionFacade from './InteractionFacade'

import SbolGraph from '../SbolGraph'

import * as triple from '../triple'
import { Predicates, Types } from 'sbolterms'

export default class ModuleDefinitionFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.ModuleDefinition
    }

    get modules():Array<ModuleInstanceFacade> {

        return this.getUriProperties(Predicates.SBOL2.module)
                   .map((uri:string) => new ModuleInstanceFacade(this.graph, uri))

    }

    get functionalComponents():Array<FunctionalComponentFacade> {

        return this.getUriProperties(Predicates.SBOL2.functionalComponent)
                   .map((uri:string) => new FunctionalComponentFacade(this.graph, uri))

    }

    get interactions():Array<InteractionFacade> {

        return this.getUriProperties(Predicates.SBOL2.interaction)
                    .map((uri:string) => new InteractionFacade(this.graph, uri))

    }

    get containingObject():IdentifiedFacade|undefined {
        return undefined
    }
}


