import SBOLGraph from '../SBOLGraph';

import S2Identified from './S2Identified'
import S2ComponentInstance from './S2ComponentInstance'
import S2Sequence from './S2Sequence'
import S2SequenceAnnotation from './S2SequenceAnnotation'
import S2SequenceConstraint from './S2SequenceConstraint'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'sbolterms'
import CompliantURIs from "../CompliantURIs";

export default class S2ComponentDefinition extends S2Identified {

    constructor(graph:SBOLGraph, uri:string) {

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

    get components():Array<S2ComponentInstance> {

        return this.getUriProperties(Predicates.SBOL2.component)
                   .map((uri:string) => new S2ComponentInstance(this.graph, uri))

    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL2.role)
    }

    hasRole(role:string):boolean {
        return this.graph.hasMatch(this.uri, Predicates.SBOL2.role, role)
    }

    addRole(role:string):void {
        this.graph.insert(node.createUriNode(this.uri), node.createUriNode(Predicates.SBOL2.role), node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.graph.removeMatches(this.uri, Predicates.SBOL2.role, role)
    }

    get sequences():Array<S2Sequence> {

        return this.getUriProperties(Predicates.SBOL2.sequence)
                   .map((uri:string) => new S2Sequence(this.graph, uri))

    }

    get sequenceAnnotations():Array<S2SequenceAnnotation> {

        return this.getUriProperties(Predicates.SBOL2.sequenceAnnotation)
                   .map((uri:string) => new S2SequenceAnnotation(this.graph, uri))

    }

    get sequenceConstraints():Array<S2SequenceConstraint> {

        return this.getUriProperties(Predicates.SBOL2.sequenceConstraint)
                   .map((uri:string) => new S2SequenceConstraint(this.graph, uri))

    }

    isPlasmidBackbone():boolean {

        return this.hasRole(Specifiers.SBOL2.Role.PlasmidBackbone)
    
    }

    static fromIdentified(identified:S2Identified):S2ComponentDefinition {

        const type:string|undefined = identified.objectType

        if(type === Types.SBOL2.ComponentDefinition) {
            return new S2ComponentDefinition(identified.graph, identified.uri)
        }

        if(type === Types.SBOL2.Component) {

            const def:string|undefined = identified.getUriProperty(Predicates.SBOL2.definition)

            if(def === undefined)
                throw new Error('component instance with no def?')

            return new S2ComponentDefinition(identified.graph, def)
        }

        throw new Error('cannot get component definition from ' + identified.uri)
    }

    get containingObject():S2Identified|undefined {
        return undefined
    }

    addComponent(component:S2ComponentInstance):void {

        this.graph.add(this.uri, Predicates.SBOL2.component, node.createUriNode(component.uri))

    }

    addComponentByDefinition(componentDefinition:S2ComponentDefinition):S2ComponentInstance {

        const cUri:string = this.graph.generateURI(this.persistentIdentity + '/' + componentDefinition.displayId + '$n?$/1')

        this.graph.insertProperties(cUri, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.Component),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(cUri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(cUri)),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(cUri)),
            [Predicates.SBOL2.definition]: node.createUriNode(componentDefinition.uri)
        })

        this.graph.add(this.uri, Predicates.SBOL2.component, node.createUriNode(cUri))

        return new S2ComponentInstance(this.graph, cUri)
    }



    addSequenceAnnotationForComponent(componentInstance:S2ComponentInstance):S2SequenceAnnotation {

        const saUri:string = this.graph.generateURI(this.persistentIdentity + '/' + componentInstance.displayId + '_sequenceAnnotation$n?$/1')

        this.graph.insertProperties(saUri, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.SequenceAnnotation),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(saUri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(saUri)),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(saUri))
        })

        this.graph.add(this.uri, Predicates.SBOL2.component, node.createUriNode(saUri))

        return new S2SequenceAnnotation(this.graph, saUri)

    }



    addSequence(sequence:S2Sequence):void {

        this.graph.insert(this.uri, Predicates.SBOL2.sequence, node.createUriNode(sequence.uri))
    }



    annotateRange(start:number, end:number, name:string):S2SequenceAnnotation {

        const saUri = this.graph.generateURI(this.persistentIdentity + '/' + this.graph.nameToDisplayId(name) + '$n$/' + this.version)

        this.graph.startIgnoringWatchers()

        this.graph.insertProperties(saUri, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.SequenceAnnotation),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(saUri)),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(saUri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(saUri))
        })

        const sa:S2SequenceAnnotation = new S2SequenceAnnotation(this.graph, saUri)

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




