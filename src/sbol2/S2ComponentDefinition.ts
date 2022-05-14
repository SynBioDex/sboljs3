import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'
import S2ComponentInstance from './S2ComponentInstance'
import S2Sequence from './S2Sequence'
import S2SequenceAnnotation from './S2SequenceAnnotation'
import S2SequenceConstraint from './S2SequenceConstraint'
import S2Range from './S2Range'

import { node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers, uriToName } from 'bioterms'

import S2IdentifiedFactory from './S2IdentifiedFactory'

export default class S2ComponentDefinition extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL2.ComponentDefinition
    }

    get type():string {

        const typeUri:string|undefined = this.getUriProperty(Predicates.SBOL2.type)

        if(!typeUri)
            throw new Error(this.subject.value + ' has no type?')

        return typeUri
    }

    get types():Array<string> {

        return this.getUriProperties(Predicates.SBOL2.type)
    }

    set type(uri:string) {

        this.setUriProperty(Predicates.SBOL2.type, uri)

    }

    addType(uri:string) {
        this.insertProperties({
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

    get components():Array<S2ComponentInstance> {

        return this.getProperties(Predicates.SBOL2.component)
                   .map((subject:Node) => new S2ComponentInstance(this.view, subject))

    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL2.role)
    }

    hasRole(role:string):boolean {
        return this.graph.hasMatch(this.subject, Predicates.SBOL2.role, node.createUriNode(role))
    }

    addRole(role:string):void {
        this.graph.insertTriple(this.subject, Predicates.SBOL2.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.graph.removeMatches(this.subject, Predicates.SBOL2.role, node.createUriNode(role))
    }

    get sequences():Array<S2Sequence> {

        return this.getProperties(Predicates.SBOL2.sequence)
                   .map((subject:Node) => new S2Sequence(this.view, subject))

    }

    get sequenceAnnotations():Array<S2SequenceAnnotation> {

        return this.getProperties(Predicates.SBOL2.sequenceAnnotation)
                   .map((subject:Node) => new S2SequenceAnnotation(this.view, subject))

    }

    get sequenceConstraints():Array<S2SequenceConstraint> {

        return this.getProperties(Predicates.SBOL2.sequenceConstraint)
                   .map((subject:Node) => new S2SequenceConstraint(this.view, subject))

    }

    isPlasmidBackbone():boolean {

        return this.hasRole(Specifiers.SO.PlasmidBackbone)
    
    }

    static fromIdentified(identified:S2Identified):S2ComponentDefinition {

        const type:string|undefined = identified.objectType

        if(type === Types.SBOL2.ComponentDefinition) {
            return new S2ComponentDefinition(identified.view, identified.subject)
        }

        if(type === Types.SBOL2.Component) {

            const def = identified.getProperty(Predicates.SBOL2.definition)

            if(def === undefined)
                throw new Error('component instance with no def?')

            return new S2ComponentDefinition(identified.view, def)
        }

        throw new Error('cannot get component definition from ' + identified.subject)
    }

    get containingObject():S2Identified|undefined {
        return undefined
    }

    get containedObjects():S2Identified[] {
        return [
            ...this.components,
            ...this.sequenceAnnotations,
            ...this.sequenceConstraints,
            ...this.sequences
        ]
    }

    addComponent(component:S2ComponentInstance):void {

        this.insertProperty(Predicates.SBOL2.component, component.subject)

    }

    addComponentByDefinition(componentDefinition:S2ComponentDefinition, id?:string|undefined, name?:string|undefined, version?:string|undefined):S2ComponentInstance {

        let identified = S2IdentifiedFactory.createChild(this.view, Types.SBOL2.Component, this, Predicates.SBOL2.component, id || componentDefinition.displayId || 'subcomponent', name, version || this.version)

        let component = new S2ComponentInstance(this.view, identified.subject)

        component.definition = componentDefinition

        return component
    }

    addSequenceAnnotationForComponent(componentInstance:S2ComponentInstance):S2SequenceAnnotation {

        let identified = S2IdentifiedFactory.createChild(this.view, Types.SBOL2.SequenceAnnotation, this, Predicates.SBOL2.sequenceAnnotation, componentInstance.displayId + '_sequenceAnnotation', undefined, this.version)
        let sequenceAnnotation = new S2SequenceAnnotation(this.view, identified.subject)

        sequenceAnnotation.component = componentInstance

        return sequenceAnnotation

    }

    createSequence():S2Sequence {

        const seq:S2Sequence = this.view.createSequence(this.uriPrefix, this.displayName + '_sequence', this.version)

        this.addSequence(seq)

        return seq
    }


    addSequence(sequence:S2Sequence):void {

        this.insertProperty(Predicates.SBOL2.sequence, sequence.subject)
    }


    annotateRange(start:number, end:number, name:string):S2SequenceAnnotation {

        this.view.graph.startIgnoringWatchers()

        let identified = S2IdentifiedFactory.createChild(this.view, Types.SBOL2.SequenceAnnotation, this, Predicates.SBOL2.sequenceAnnotation, 'anno_' + name, this.version)
        let sequenceAnnotation = new S2SequenceAnnotation(this.view, identified.subject)

        let rangeIdentified = S2IdentifiedFactory.createChild(this.view, Types.SBOL2.Range, sequenceAnnotation, Predicates.SBOL2.location, 'range', this.version)
        let range = new S2Range(this.view, rangeIdentified.subject)

        range.start = start
        range.end = end

        this.view.graph.stopIgnoringWatchers()

        return sequenceAnnotation
    }

    destroy() {

        let instantiations = this.graph.match(null, Predicates.SBOL2.definition, this.subject)
                .map(t => new S2ComponentInstance(this.view, t.subject))

        super.destroy()

        for(let instantiation of instantiations) {
            instantiation.destroy()
        }
    }
}




