
import S3Identified from './S3Identified'
import S3SubComponent from './S3SubComponent'
import S3Interaction from './S3Interaction'

import SBOL3GraphView from '../SBOL3GraphView'

import { triple, node } from 'rdfoo'
import { Predicates, Types, Specifiers, Prefixes } from 'bioterms'
import S3Sequence from './S3Sequence';
import S3SequenceConstraint from './S3SequenceConstraint';
import S3SequenceFeature from './S3SequenceFeature'
import S3IdentifiedFactory from './S3IdentifiedFactory';
import S3ThingWithLocation from './S3ThingWithLocation';
import S3Location from './S3Location'
import S3OrientedLocation from './S3OrientedLocation'
import S3MapsTo from './S3MapsTo';
import { S3Model } from '..';
import extractTerm from '../extractTerm'

export default class S3Component extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL3.Component
    }

    get types():Array<string> {
        return this.getUriProperties(Predicates.SBOL3.type)
    }

    hasType(type:string):boolean {
        return this.view.graph.hasMatch(this.uri, Predicates.SBOL3.type, type)
    }

    addType(type:string):void {
        this.view.graph.insert(this.uri, Predicates.SBOL3.type, node.createUriNode(type))
    }

    removeType(type:string):void {
        this.view.graph.removeMatches(this.uri, Predicates.SBOL3.type, type)
    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL3.role)
    }

    hasRole(role:string):boolean {
        return this.view.graph.hasMatch(this.uri, Predicates.SBOL3.role, role)
    }

    addRole(role:string):void {
        this.view.graph.insert(this.uri, Predicates.SBOL3.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.uri, Predicates.SBOL3.role, role)
    }

    get soTerms():string[] {

        let terms:string[] = []

        for(let role of this.roles) {
            let term = extractTerm(role)

            if(term)
                terms.push(term)
        }

        return terms
    }

    get sequences():Array<S3Sequence> {

        return this.getUriProperties(Predicates.SBOL3.sequence)
                   .map((uri:string) => new S3Sequence(this.view, uri))

    }

    get subComponents():Array<S3SubComponent> {

        return this.getUriProperties(Predicates.SBOL3.subComponent)
                   .map((uri:string) => new S3SubComponent(this.view, uri))

    }

    get interactions():Array<S3Interaction> {

        return this.getUriProperties(Predicates.SBOL3.interaction)
                    .map((uri:string) => new S3Interaction(this.view, uri))

    }

    get containingObject():S3Identified|undefined {
        return undefined
    }

    get sequenceConstraints():Array<S3SequenceConstraint> {

        return this.getUriProperties(Predicates.SBOL3.sequenceConstraint)
                   .map((uri:string) => new S3SequenceConstraint(this.view, uri))

    }

    get sequenceFeatures():Array<S3SequenceFeature> {

        return this.getUriProperties(Predicates.SBOL3.sequenceAnnotation)
                   .map((uri:string) => new S3SequenceFeature(this.view, uri))

    }

    get containedObjects():Array<S3Identified> {

        return (this.subComponents as S3Identified[])
                   .concat(this.interactions)
                   .concat(this.sequenceConstraints)
                   .concat(this.sequenceFeatures)
    }

    get annotatedLocations():Array<S3Location> {

        const all:Array<S3Location> = []

        this.subComponents.forEach((sc:S3SubComponent) => {
            Array.prototype.push.apply(all, sc.locations)
        })

        this.sequenceFeatures.forEach((f:S3SequenceFeature) => {
            Array.prototype.push.apply(all, f.locations)
        })

        return all
    }

    get thingsWithLocations():Array<S3ThingWithLocation> {

        return (this.subComponents as Array<S3ThingWithLocation>)
                    .concat(this.sequenceFeatures as Array<S3ThingWithLocation>)
    }

    isPlasmidBackbone():boolean {

        return this.hasRole(Specifiers.SO.PlasmidBackbone)
    
    }

    createSubComponent(definition:S3Component):S3SubComponent {

        const id:string|undefined = definition.displayId

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.SubComponent, this, Predicates.SBOL3.subComponent, id, undefined)

        const module:S3SubComponent = new S3SubComponent(this.view, identified.uri)

        module.instanceOf = definition

        return module
    }

    createFeature(name:string):S3SequenceFeature {

        const id:string = 'feature_' + name

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.SequenceAnnotation, this, Predicates.SBOL3.sequenceAnnotation, id, undefined)

        return new S3SequenceFeature(this.view, identified.uri)

    }

    createFeatureWithRange(start:number, end:number, name:string):S3SequenceFeature {

        const feature:S3SequenceFeature = this.createFeature(name)

        feature.addRange(start, end)

        return feature
    }

    wrap(wrapperId?:string):S3Component {

        const wrapper:S3Component = this.view.createComponent(this.uriPrefix, wrapperId || (this.displayName + '_wrapper'))

        for(let type of this.types) {
            wrapper.addType(type)
        }

        wrapper.createSubComponent(this)

        return wrapper
    }

    createConstraint(subject:S3SubComponent, restriction:string, object:S3SubComponent):S3SequenceConstraint {

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.SequenceConstraint, this, Predicates.SBOL3.sequenceConstraint, 'constraint_' + subject.displayId + '_' + object.displayId, undefined)

        const constraint:S3SequenceConstraint = new S3SequenceConstraint(this.view, identified.uri)

        constraint.subject = subject
        constraint.restriction = restriction
        constraint.object = object

        return constraint
    }

    createSequence():S3Sequence {

        const seq:S3Sequence = this.view.createSequence(this.uriPrefix, this.displayName + '_sequence')

        this.addSequence(seq)

        return seq
    }

    addSequence(seq:S3Sequence):void {

        this.view.graph.insertProperties(this.uri, {
            [Predicates.SBOL3.sequence]: node.createUriNode(seq.uri)
        })

    }

    createInteraction(id:string, version?:string):S3Interaction {

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.Interaction, this,  Predicates.SBOL3.interaction, id, undefined)

        const interaction:S3Interaction = new S3Interaction(this.view, identified.uri)

        return interaction
    }

    addModel(model:S3Model) {
        this.insertProperty(Predicates.SBOL3.model, node.createUriNode(model.uri))
    }

    dissolve() {
        let instances = this.view.getInstancesOfComponent(this)

        for(let instance of instances) {
            instance.dissolve()
        }

        this.destroy()
    }

}







