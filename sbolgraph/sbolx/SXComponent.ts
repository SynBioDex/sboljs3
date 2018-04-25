
import SXIdentified from './SXIdentified'
import SXSubComponent from './SXSubComponent'
import SXInteraction from './SXInteraction'

import SBOLXGraph from '../SBOLXGraph'

import * as triple from '../triple'
import * as node from '../node'
import { Predicates, Types, Specifiers } from 'bioterms'
import SXSequence from './SXSequence';
import SXSequenceConstraint from './SXSequenceConstraint';
import SXSequenceFeature from './SXSequenceFeature'
import SXIdentifiedFactory from './SXIdentifiedFactory';
import SXThingWithLocation from './SXThingWithLocation';
import SXLocation from './SXLocation'
import SXOrientedLocation from './SXOrientedLocation'

export default class SXComponent extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Component
    }

    get types():Array<string> {
        return this.getUriProperties(Predicates.SBOLX.type)
    }

    hasType(type:string):boolean {
        return this.graph.hasMatch(this.uri, Predicates.SBOLX.type, type)
    }

    addType(type:string):void {
        this.graph.insert(node.createUriNode(this.uri), Predicates.SBOLX.type, node.createUriNode(type))
    }

    removeType(type:string):void {
        this.graph.removeMatches(this.uri, Predicates.SBOLX.type, type)
    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOLX.hasRole)
    }

    hasRole(role:string):boolean {
        return this.graph.hasMatch(this.uri, Predicates.SBOLX.hasRole, role)
    }

    addRole(role:string):void {
        this.graph.insert(node.createUriNode(this.uri), Predicates.SBOLX.hasRole, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.graph.removeMatches(this.uri, Predicates.SBOLX.hasRole, role)
    }

    get sequence():SXSequence|undefined {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOLX.usesSequence)

        if(uri === undefined)
            return undefined

        return new SXSequence(this.graph, uri)
    }

    get subComponents():Array<SXSubComponent> {

        return this.getUriProperties(Predicates.SBOLX.hasSubComponent)
                   .map((uri:string) => new SXSubComponent(this.graph, uri))

    }

    get interactions():Array<SXInteraction> {

        return this.getUriProperties(Predicates.SBOLX.hasInteraction)
                    .map((uri:string) => new SXInteraction(this.graph, uri))

    }

    get containingObject():SXIdentified|undefined {
        return undefined
    }

    get sequenceConstraints():Array<SXSequenceConstraint> {

        return this.getUriProperties(Predicates.SBOLX.hasSequenceConstraint)
                   .map((uri:string) => new SXSequenceConstraint(this.graph, uri))

    }

    get sequenceFeatures():Array<SXSequenceFeature> {

        return this.getUriProperties(Predicates.SBOLX.hasSequenceFeature)
                   .map((uri:string) => new SXSequenceFeature(this.graph, uri))

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

        return this.hasRole(Specifiers.SBOL2.Role.PlasmidBackbone)
    
    }

    createSubComponent(definition:SXComponent):SXSubComponent {

        const id:string = 'submodule_' + definition.id

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.graph, Types.SBOLX.SubComponent, this, id, undefined, this.version)

        this.graph.add(node.createUriNode(this.uri), node.createUriNode(Predicates.SBOLX.hasSubComponent), node.createUriNode(identified.uri))

        const module:SXSubComponent = new SXSubComponent(this.graph, identified.uri)

        module.instanceOf = definition

        return module
    }

    setSequence(sequence:SXSequence|undefined):void {

        if(sequence === undefined)
            this.deleteProperty(Predicates.SBOLX.usesSequence)
        else
            this.setUriProperty(Predicates.SBOLX.usesSequence, sequence.uri)

    }

    createFeature(name:string):SXSequenceFeature {

        const id:string = 'feature_' + name

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.graph, Types.SBOLX.SequenceFeature, this, id, undefined, this.version)

        this.graph.add(node.createUriNode(this.uri), node.createUriNode(Predicates.SBOLX.hasSequenceFeature), node.createUriNode(identified.uri))

        return new SXSequenceFeature(this.graph, identified.uri)

    }

    createFeatureWithRange(start:number, end:number, name:string):SXSequenceFeature {

        const feature:SXSequenceFeature = this.createFeature(name)

        feature.addRange(start, end)

        return feature
    }

    wrap():SXComponent {

        const wrapper:SXComponent = this.graph.createComponent(this.uriPrefix, this.displayName + '_wrapper', this.version)

        wrapper.createSubComponent(this)

        return wrapper
    }

    createConstraint(subject:SXSubComponent, restriction:string, object:SXSubComponent):SXSequenceConstraint {

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.graph, Types.SBOLX.SequenceConstraint, this, 'constraint_' + subject.id + '_' + object.id, undefined, this.version)

        this.graph.add(node.createUriNode(this.uri), node.createUriNode(Predicates.SBOLX.hasSequenceConstraint), node.createUriNode(identified.uri))

        const constraint:SXSequenceConstraint = new SXSequenceConstraint(this.graph, identified.uri)

        constraint.subject = subject
        constraint.restriction = restriction
        constraint.object = object

        return constraint
    }

    createSequence():SXSequence {

        const seq:SXSequence = this.graph.createSequence(this.uriPrefix, this.displayName + '_sequence', this.version)

        this.addSequence(seq)

        return seq
    }

    addSequence(seq:SXSequence):void {

        this.graph.insertProperties(this.uri, {
            [Predicates.SBOLX.usesSequence]: node.createUriNode(seq.uri)
        })

    }

}







