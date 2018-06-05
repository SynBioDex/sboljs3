
import S2Identified from './S2Identified'
import S2ModuleInstance from './S2ModuleInstance'
import S2FunctionalComponent from './S2FunctionalComponent'
import S2Interaction from './S2Interaction'

import SBOL2Graph from '../SBOL2Graph'

import * as triple from '../triple'
import * as node from '../node'
import { Predicates, Types } from 'bioterms'
import S2IdentifiedFactory from '../sbol2/S2IdentifiedFactory';
import { S2ComponentDefinition } from '..';

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

    addInteraction(interaction:S2Interaction) {
        this.graph.insertProperties(this.uri, {
            [Predicates.SBOL2.interaction]: node.createUriNode(interaction.uri)
        })
    }

    addFunctionalComponent(fc:S2FunctionalComponent) {
        this.graph.insertProperties(this.uri, {
            [Predicates.SBOL2.functionalComponent]: node.createUriNode(fc.uri)
        })
    }

    createInteraction(id:string, version?:string):S2Interaction {

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.graph, Types.SBOL2.Interaction, this, id, undefined, version)

        const interaction:S2Interaction = new S2Interaction(this.graph, identified.uri)

        this.addInteraction(interaction)

        return interaction
    }

    createFunctionalComponent(definition:S2ComponentDefinition, id?:string, version?:string):S2FunctionalComponent {

        let actualId = id || definition.displayId

        if(actualId === undefined)
            throw new Error('???')

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.graph, Types.SBOL2.FunctionalComponent, this, actualId, undefined, version)

        const fc:S2FunctionalComponent = new S2FunctionalComponent(this.graph, identified.uri)

        fc.definition = definition

        this.addFunctionalComponent(fc)

        return fc
    }
}


