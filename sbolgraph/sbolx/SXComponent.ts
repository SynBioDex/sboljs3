
import SXIdentified from './SXIdentified'
import SXSubComponent from './SXSubComponent'
import SXInteraction from './SXInteraction'

import SBOLXGraphView from '../SBOLXGraphView'

import { triple, node } from 'rdfoo'
import { Predicates, Types, Specifiers, Prefixes } from 'bioterms'
import SXSequence from './SXSequence';
import SXSequenceConstraint from './SXSequenceConstraint';
import SXSequenceFeature from './SXSequenceFeature'
import SXIdentifiedFactory from './SXIdentifiedFactory';
import SXThingWithLocation from './SXThingWithLocation';
import SXLocation from './SXLocation'
import SXOrientedLocation from './SXOrientedLocation'
import SXMapsTo from './SXMapsTo';
import { SXModel } from '..';
import extractTerm from '../extractTerm'

export default class SXComponent extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Component
    }

    get types():Array<string> {
        return this.getUriProperties(Predicates.SBOLX.type)
    }

    hasType(type:string):boolean {
        return this.view.graph.hasMatch(this.uri, Predicates.SBOLX.type, type)
    }

    addType(type:string):void {
        this.view.graph.insert(this.uri, Predicates.SBOLX.type, node.createUriNode(type))
    }

    removeType(type:string):void {
        this.view.graph.removeMatches(this.uri, Predicates.SBOLX.type, type)
    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOLX.role)
    }

    hasRole(role:string):boolean {
        return this.view.graph.hasMatch(this.uri, Predicates.SBOLX.role, role)
    }

    addRole(role:string):void {
        this.view.graph.insert(this.uri, Predicates.SBOLX.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.uri, Predicates.SBOLX.role, role)
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

    get sequences():Array<SXSequence> {

        return this.getUriProperties(Predicates.SBOLX.sequence)
                   .map((uri:string) => new SXSequence(this.view, uri))

    }

    get subComponents():Array<SXSubComponent> {

        return this.getUriProperties(Predicates.SBOLX.subComponent)
                   .map((uri:string) => new SXSubComponent(this.view, uri))

    }

    get interactions():Array<SXInteraction> {

        return this.getUriProperties(Predicates.SBOLX.interaction)
                    .map((uri:string) => new SXInteraction(this.view, uri))

    }

    get containingObject():SXIdentified|undefined {
        return undefined
    }

    get sequenceConstraints():Array<SXSequenceConstraint> {

        return this.getUriProperties(Predicates.SBOLX.sequenceConstraint)
                   .map((uri:string) => new SXSequenceConstraint(this.view, uri))

    }

    get sequenceFeatures():Array<SXSequenceFeature> {

        return this.getUriProperties(Predicates.SBOLX.sequenceAnnotation)
                   .map((uri:string) => new SXSequenceFeature(this.view, uri))

    }

    get containedObjects():Array<SXIdentified> {

        return (this.subComponents as SXIdentified[])
                   .concat(this.interactions)
                   .concat(this.sequenceConstraints)
                   .concat(this.sequenceFeatures)
    }

    get annotatedLocations():Array<SXLocation> {

        const all:Array<SXLocation> = []

        this.subComponents.forEach((sc:SXSubComponent) => {
            Array.prototype.push.apply(all, sc.locations)
        })

        this.sequenceFeatures.forEach((f:SXSequenceFeature) => {
            Array.prototype.push.apply(all, f.locations)
        })

        return all
    }

    get thingsWithLocations():Array<SXThingWithLocation> {

        return (this.subComponents as Array<SXThingWithLocation>)
                    .concat(this.sequenceFeatures as Array<SXThingWithLocation>)
    }

    isPlasmidBackbone():boolean {

        return this.hasRole(Specifiers.SO.PlasmidBackbone)
    
    }

    createSubComponent(definition:SXComponent):SXSubComponent {

        const id:string|undefined = definition.id

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.view, Types.SBOLX.SubComponent, this, Predicates.SBOLX.subComponent, id, undefined, this.version)

        const module:SXSubComponent = new SXSubComponent(this.view, identified.uri)

        module.instanceOf = definition

        return module
    }

    createFeature(name:string):SXSequenceFeature {

        const id:string = 'feature_' + name

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.view, Types.SBOLX.SequenceAnnotation, this, Predicates.SBOLX.sequenceAnnotation, id, undefined, this.version)

        return new SXSequenceFeature(this.view, identified.uri)

    }

    createFeatureWithRange(start:number, end:number, name:string):SXSequenceFeature {

        const feature:SXSequenceFeature = this.createFeature(name)

        feature.addRange(start, end)

        return feature
    }

    wrap(wrapperId?:string):SXComponent {

        const wrapper:SXComponent = this.view.createComponent(this.uriPrefix, wrapperId || (this.displayName + '_wrapper'), this.version)

        for(let type of this.types) {
            wrapper.addType(type)
        }

        wrapper.createSubComponent(this)

        return wrapper
    }

    createConstraint(subject:SXSubComponent, restriction:string, object:SXSubComponent):SXSequenceConstraint {

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.view, Types.SBOLX.SequenceConstraint, this, Predicates.SBOLX.sequenceConstraint, 'constraint_' + subject.id + '_' + object.id, undefined, this.version)

        const constraint:SXSequenceConstraint = new SXSequenceConstraint(this.view, identified.uri)

        constraint.subject = subject
        constraint.restriction = restriction
        constraint.object = object

        return constraint
    }

    createSequence():SXSequence {

        const seq:SXSequence = this.view.createSequence(this.uriPrefix, this.displayName + '_sequence', this.version)

        this.addSequence(seq)

        return seq
    }

    addSequence(seq:SXSequence):void {

        this.view.graph.insertProperties(this.uri, {
            [Predicates.SBOLX.sequence]: node.createUriNode(seq.uri)
        })

    }

    createInteraction(id:string, version?:string):SXInteraction {

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.view, Types.SBOLX.Interaction, this,  Predicates.SBOLX.interaction, id, undefined, version)

        const interaction:SXInteraction = new SXInteraction(this.view, identified.uri)

        return interaction
    }

    addModel(model:SXModel) {
        this.insertProperty(Predicates.SBOLX.model, node.createUriNode(model.uri))
    }

    dissolve() {
        let instances = this.view.getInstancesOfComponent(this)

        for(let instance of instances) {
            instance.dissolve()
        }

        this.destroy()
    }

}







