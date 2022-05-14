
import S2Identified from './S2Identified'
import S2ModuleInstance from './S2ModuleInstance'
import S2FunctionalComponent from './S2FunctionalComponent'
import S2Interaction from './S2Interaction'

import SBOL2GraphView from '../SBOL2GraphView'

import { node, triple } from 'rdfoo'
import { Predicates, Types, uriToName } from 'bioterms'
import S2IdentifiedFactory from '../sbol2/S2IdentifiedFactory';
import { S2ComponentDefinition } from '..';
import S2Model from './S2Model';
import { Node } from 'rdfoo'

export default class S2ModuleDefinition extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.ModuleDefinition
    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL2.role)
    }

    hasRole(role:string):boolean {
        return this.view.graph.hasMatch(this.subject, Predicates.SBOL2.role, node.createUriNode(role))
    }

    addRole(role:string):void {
        this.insertProperty(Predicates.SBOL2.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.subject, Predicates.SBOL2.role, node.createUriNode(role))
    }

    get containedObjects():Array<S2Identified> {

        return (this.modules as S2Identified[])
                   .concat(this.functionalComponents)
                   .concat(this.interactions)
                   .concat(this.models)
    }

    get modules():Array<S2ModuleInstance> {

        return this.getProperties(Predicates.SBOL2.module)
                   .map((subject:Node) => new S2ModuleInstance(this.view, subject))

    }

    get functionalComponents():Array<S2FunctionalComponent> {

        return this.getProperties(Predicates.SBOL2.functionalComponent)
                   .map((subject:Node) => new S2FunctionalComponent(this.view, subject))

    }

    get interactions():Array<S2Interaction> {

        return this.getProperties(Predicates.SBOL2.interaction)
                    .map((subject:Node) => new S2Interaction(this.view, subject))

    }

    get models():Array<S2Model> {

        return this.getProperties(Predicates.SBOL2.model)
                    .map((subject:Node) => new S2Model(this.view, subject))

    }

    get containingObject():S2Identified|undefined {
        return undefined
    }

    addInteraction(interaction:S2Interaction) {
        this.insertProperties({
            [Predicates.SBOL2.interaction]: interaction.subject
        })
    }

    addFunctionalComponent(fc:S2FunctionalComponent) {
        this.insertProperties({
            [Predicates.SBOL2.functionalComponent]: fc.subject
        })
    }

    createInteraction(id?:string, version?:string):S2Interaction {

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.view, Types.SBOL2.Interaction, this, Predicates.SBOL2.interaction, id, undefined, version)

        const interaction:S2Interaction = new S2Interaction(this.view, identified.subject)

        return interaction
    }

    createFunctionalComponent(definition:S2ComponentDefinition, id?:string, name?:string, version?:string):S2FunctionalComponent {

        let actualId = id || definition.displayId || undefined

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.view, Types.SBOL2.FunctionalComponent, this, Predicates.SBOL2.functionalComponent, actualId, name, version || this.version)

        const fc:S2FunctionalComponent = new S2FunctionalComponent(this.view, identified.subject)

        fc.definition = definition

        return fc
    }

    createSubModule(definition:S2ModuleDefinition, id?:string, name?:string, version?:string):S2ModuleInstance {

        let actualId = id || definition.displayId || undefined

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.view, Types.SBOL2.Module, this, Predicates.SBOL2.module, actualId, name, version || this.version)

        const m:S2ModuleInstance = new S2ModuleInstance(this.view, identified.subject)

        m.definition = definition

        return m
    }

    get displayType():string {
        for(let role of this.roles) {
            
            let name = uriToName(role)
            
            if(name) {
                return name
            }
        }

        return "Design"
    }

    destroy() {

        let instantiations = this.graph.match(null, Predicates.SBOL2.definition, this.subject)
                .map(t => t.subject)
                .map(uri => new S2ModuleInstance(this.view, uri))

        super.destroy()

        for(let instantiation of instantiations) {
            instantiation.destroy()
        }
    }

}


