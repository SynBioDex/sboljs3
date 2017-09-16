import SbolGraph from '../SbolGraph';

import IdentifiedFacade from './IdentifiedFacade'
import ComponentInstanceFacade from './ComponentInstanceFacade'
import SequenceFacade from './SequenceFacade'
import SequenceAnnotationFacade from './SequenceAnnotationFacade'
import SequenceConstraintFacade from './SequenceConstraintFacade'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'sbolterms'
import CompliantURIs from "../CompliantURIs";

export default class ComponentDefinitionFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.ComponentDefinition
    }

    get type():string {

        const typeUri:string|undefined = this.getUriProperty(Predicates.SBOL2.type)

        if(!typeUri)
            throw new Error(this.uri + ' has no type?')

        return typeUri
    }

    set type(uri:string) {

        this.setUriProperty(Predicates.SBOL2.type, uri)

    }

    get components():Array<ComponentInstanceFacade> {

        return this.getUriProperties(Predicates.SBOL2.component)
                   .map((uri:string) => new ComponentInstanceFacade(this.graph, uri))

    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL2.role)
    }

    hasRole(role:string):boolean {
        return this.graph.hasMatch(this.uri, Predicates.SBOL2.role, role)
    }

    get sequences():Array<SequenceFacade> {

        return this.getUriProperties(Predicates.SBOL2.sequence)
                   .map((uri:string) => new SequenceFacade(this.graph, uri))

    }

    get sequenceAnnotations():Array<SequenceAnnotationFacade> {

        return this.getUriProperties(Predicates.SBOL2.sequenceAnnotation)
                   .map((uri:string) => new SequenceAnnotationFacade(this.graph, uri))

    }

    get sequenceConstraints():Array<SequenceConstraintFacade> {

        return this.getUriProperties(Predicates.SBOL2.sequenceConstraint)
                   .map((uri:string) => new SequenceConstraintFacade(this.graph, uri))

    }

    isPlasmidBackbone():boolean {

        return this.hasRole(Specifiers.SBOL2.Role.PlasmidBackbone)
    
    }

    static fromIdentified(identified:IdentifiedFacade):ComponentDefinitionFacade {

        const type:string|undefined = identified.objectType

        if(type === Types.SBOL2.ComponentDefinition) {
            return new ComponentDefinitionFacade(identified.graph, identified.uri)
        }

        if(type === Types.SBOL2.Component) {

            const def:string|undefined = identified.getUriProperty(Predicates.SBOL2.definition)

            if(def === undefined)
                throw new Error('component instance with no def?')

            return new ComponentDefinitionFacade(identified.graph, def)
        }

        throw new Error('cannot get component definition from ' + identified.uri)
    }

    get containingObject():IdentifiedFacade|undefined {
        return undefined
    }

    addComponent(component:ComponentInstanceFacade):void {

        this.graph.add(this.uri, Predicates.SBOL2.component, node.createUriNode(component.uri))

    }

    addComponentByDefinition(componentDefinition:ComponentDefinitionFacade):ComponentInstanceFacade {

        const cUri:string = this.graph.generateURI(this.persistentIdentity + '/' + componentDefinition.displayId + '$n?$/1')

        this.graph.insertProperties(cUri, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.Component),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(cUri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(cUri)),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(cUri)),
            [Predicates.SBOL2.definition]: node.createUriNode(componentDefinition.uri)
        })

        this.graph.add(this.uri, Predicates.SBOL2.component, node.createUriNode(cUri))

        return new ComponentInstanceFacade(this.graph, cUri)
    }



    addSequenceAnnotationForComponent(componentInstance:ComponentInstanceFacade):SequenceAnnotationFacade {

        const saUri:string = this.graph.generateURI(this.persistentIdentity + '/' + componentInstance.displayId + '_sequenceAnnotation$n?$/1')

        this.graph.insertProperties(saUri, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.SequenceAnnotation),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(saUri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(saUri)),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(saUri))
        })

        this.graph.add(this.uri, Predicates.SBOL2.component, node.createUriNode(saUri))

        return new SequenceAnnotationFacade(this.graph, saUri)

    }



    addSequence(sequence:SequenceFacade):void {

        this.graph.insert(this.uri, Predicates.SBOL2.sequence, node.createUriNode(sequence.uri))
    }



    annotateRange(start:number, end:number, name:string):SequenceAnnotationFacade {

        const saUri = this.graph.generateURI(this.persistentIdentity + '/' + this.graph.nameToDisplayId(name) + '$n$/' + this.version)

        this.graph.startIgnoringWatchers()

        this.graph.insertProperties(saUri, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.SequenceAnnotation),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(saUri)),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(saUri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(saUri))
        })

        const sa:SequenceAnnotationFacade = new SequenceAnnotationFacade(this.graph, saUri)

        this.graph.insertProperties(this.uri, {
            [Predicates.SBOL2.sequenceAnnotation]: node.createUriNode(saUri)
        })

        const rangeUri = sa.persistentIdentity + '/range/' + sa.version

        this.graph.insertProperties(rangeUri, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.Range),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(rangeUri)),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(rangeUri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(rangeUri)),
            [Predicates.SBOL2.start]: node.createIntNode(start),
            [Predicates.SBOL2.end]: node.createIntNode(end)
        })

        this.graph.insertProperties(saUri, {
            [Predicates.SBOL2.location]: node.createUriNode(rangeUri)
        })

        this.graph.stopIgnoringWatchers()

        return sa
    }



}




