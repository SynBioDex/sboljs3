
import S2Identified from './S2Identified'
import S2ModuleInstance from './S2ModuleInstance'
import S2FunctionalComponent from './S2FunctionalComponent'
import S2Interaction from './S2Interaction'

import SBOL2Graph from '../SBOL2Graph'

import * as triple from '../triple'
import { Predicates, Types } from 'sbolterms'

export default class S2ModuleDefinition extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.ModuleDefinition
    }

    get modules():Array<S2ModuleInstance> {

        return this.getUriProperties(Predicates.SBOL2.module)
                   .map((uri:string) => new S2ModuleInstance(this.graph, uri))

    }

    get functionalComponents():Array<S2FunctionalComponent> {

        return this.getUriProperties(Predicates.SBOL2.functionalComponent)
                   .map((uri:string) => new S2FunctionalComponent(this.graph, uri))

    }

    get interactions():Array<S2Interaction> {

        return this.getUriProperties(Predicates.SBOL2.interaction)
                    .map((uri:string) => new S2Interaction(this.graph, uri))

    }

    get containingObject():S2Identified|undefined {
        return undefined
    }
}


