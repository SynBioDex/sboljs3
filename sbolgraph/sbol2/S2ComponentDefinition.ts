import SBOL2Graph from '../SBOL2Graph';

import S2Identified from './S2Identified'
import S2ComponentInstance from './S2ComponentInstance'
import S2Sequence from './S2Sequence'
import S2SequenceAnnotation from './S2SequenceAnnotation'
import S2SequenceConstraint from './S2SequenceConstraint'
import S2Range from './S2Range'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers, uriToName } from 'bioterms'

import S2IdentifiedFactory from './S2IdentifiedFactory'

export default class S2ComponentDefinition extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

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

    get types():Array<string> {

        return this.getUriProperties(Predicates.SBOL2.type)
    }

    set type(uri:string) {

        this.setUriProperty(Predicates.SBOL2.type, uri)

    }

    addType(uri:string) {
        this.graph.insertProperties(this.uri, {
            [Predicates.SBOL2.type]: node.createUriNode(uri)
        })
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

    get containedObjects():Array<S2Identified> {

        return (this.components as S2Identified[])
                   .concat(this.sequenceConstraints)
                   .concat(this.sequenceAnnotations)
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
        this.graph.insert(this.uri, Predicates.SBOL2.role, node.createUriNode(role))
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

        let identified = S2IdentifiedFactory.createChild(this.graph, Types.SBOL2.Component, this, Predicates.SBOL2.component, componentDefinition.displayId || 'subcomponent', this.version)
        let component = new S2ComponentInstance(this.graph, identified.uri)

        component.definition = componentDefinition

        return component
    }

    addSequenceAnnotationForComponent(componentInstance:S2ComponentInstance):S2SequenceAnnotation {

        let identified = S2IdentifiedFactory.createChild(this.graph, Types.SBOL2.SequenceAnnotation, this, Predicates.SBOL2.sequenceAnnotation, componentInstance.displayId + '_sequenceAnnotation', this.version)
        let sequenceAnnotation = new S2SequenceAnnotation(this.graph, identified.uri)

        sequenceAnnotation.component = componentInstance

        return sequenceAnnotation

    }

    createSequence():S2Sequence {

        const seq:S2Sequence = this.graph.createSequence(this.uriPrefix, this.displayName + '_sequence', this.version)

        this.addSequence(seq)

        return seq
    }


    addSequence(sequence:S2Sequence):void {

        this.graph.insert(this.uri, Predicates.SBOL2.sequence, node.createUriNode(sequence.uri))
    }


    annotateRange(start:number, end:number, name:string):S2SequenceAnnotation {

        this.graph.startIgnoringWatchers()

        let identified = S2IdentifiedFactory.createChild(this.graph, Types.SBOL2.SequenceAnnotation, this, Predicates.SBOL2.sequenceAnnotation, 'anno_' + name, this.version)
        let sequenceAnnotation = new S2SequenceAnnotation(this.graph, identified.uri)

        let rangeIdentified = S2IdentifiedFactory.createChild(this.graph, Types.SBOL2.Range, sequenceAnnotation, Predicates.SBOL2.location, 'range', this.version)
        let range = new S2Range(this.graph, rangeIdentified.uri)

        range.start = start
        range.end = end

        this.graph.stopIgnoringWatchers()

        return sequenceAnnotation
    }
}




