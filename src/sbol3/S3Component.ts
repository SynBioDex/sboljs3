
import S3Identified from './S3Identified'
import S3SubComponent from './S3SubComponent'
import S3Interaction from './S3Interaction'

import SBOL3GraphView from '../SBOL3GraphView'

import { triple, node, Node } from 'rdfoo'
import { Predicates, Types, Specifiers, Prefixes } from 'bioterms'
import S3Sequence from './S3Sequence';
import S3Constraint from './S3Constraint';
import S3SequenceFeature from './S3SequenceFeature'
import S3IdentifiedFactory from './S3IdentifiedFactory';
import S3Feature from './S3Feature';
import S3Location from './S3Location'
import S3OrientedLocation from './S3OrientedLocation'
import S3MapsTo from './S3ComponentReference';
import { S3Model } from '..';
import extractTerm from '../extractTerm'
import S3Interface from './S3Interface'
import S3LocalSubComponent from './S3LocalSubComponent'
import S3ExternallyDefined from './S3ExternallyDefined'

export default class S3Component extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL3.Component
    }

    get types():Array<string> {
        return this.getUriProperties(Predicates.SBOL3.type)
    }

    hasType(type:string):boolean {
        return this.view.graph.hasMatch(this.subject, Predicates.SBOL3.type, node.createUriNode(type))
    }

    addType(type:string):void {
        this.view.graph.insertTriple(this.subject, Predicates.SBOL3.type, node.createUriNode(type))
    }

    removeType(type:string):void {
        this.view.graph.removeMatches(this.subject, Predicates.SBOL3.type, node.createUriNode(type))
    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL3.role)
    }

    hasRole(role:string):boolean {
        return this.view.graph.hasMatch(this.subject, Predicates.SBOL3.role, node.createUriNode(role))
    }

    addRole(role:string):void {
        this.view.graph.insertTriple(this.subject, Predicates.SBOL3.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.subject, Predicates.SBOL3.role, node.createUriNode(role))
    }

    get soTerms():string[] {

        let terms:string[] = []

        for(let role of this.roles) {
            let term = extractTerm(node.createUriNode(role))

            if(term)
                terms.push(term)
        }

        return terms
    }

    get sequences():Array<S3Sequence> {

        return this.getProperties(Predicates.SBOL3.hasSequence)
                   .map((subject:Node) => new S3Sequence(this.view, subject))

    }

    get subComponents():Array<S3SubComponent> {

        return this.getProperties(Predicates.SBOL3.hasFeature)
                   .filter((subject:Node) => this.graph.hasMatch(subject, Predicates.a, node.createUriNode(Types.SBOL3.SubComponent)))
                   .map((subject:Node) => new S3SubComponent(this.view, subject))

    }

    get localSubComponents():Array<S3LocalSubComponent> {

        return this.getProperties(Predicates.SBOL3.hasFeature)
                   .filter((subject:Node) => this.graph.hasMatch(subject, Predicates.a, node.createUriNode(Types.SBOL3.LocalSubComponent)))
                   .map((subject:Node) => new S3LocalSubComponent(this.view, subject))

    }

    get externalDefinitions():Array<S3ExternallyDefined> {

        return this.getProperties(Predicates.SBOL3.hasFeature)
                   .filter((subject:Node) => this.graph.hasMatch(subject, Predicates.a, node.createUriNode(Types.SBOL3.ExternallyDefined)))
                   .map((subject:Node) => new S3ExternallyDefined(this.view, subject))

    }

    get interactions():Array<S3Interaction> {

        return this.getProperties(Predicates.SBOL3.hasInteraction)
                    .map((subject:Node) => new S3Interaction(this.view, subject))

    }

    get interfaces():Array<S3Interface> {

        return this.getProperties(Predicates.SBOL3.hasInterface)
                    .map((subject:Node) => new S3Interface(this.view, subject))

    }

    get containingObject():S3Identified|undefined {
        return undefined
    }

    get sequenceConstraints():Array<S3Constraint> {

        return this.getProperties(Predicates.SBOL3.hasConstraint)
                   .map((subject:Node) => new S3Constraint(this.view, subject))

    }

    get sequenceFeatures():Array<S3SequenceFeature> {

        return this.getProperties(Predicates.SBOL3.hasFeature)
                   .filter((subject:Node) => this.graph.hasMatch(subject, Predicates.a, node.createUriNode(Types.SBOL3.SequenceFeature)))
                   .map((subject:Node) => new S3SequenceFeature(this.view, subject))

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

    get thingsWithLocations():Array<S3Feature> {

        return (this.subComponents as Array<S3Feature>)
                    .concat(this.sequenceFeatures as Array<S3Feature>)
    }

    isPlasmidBackbone():boolean {

        return this.hasRole(Specifiers.SO.PlasmidBackbone)
    
    }

    createSubComponent(definition:S3Component):S3SubComponent {

        const id:string|undefined = definition.displayId

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.SubComponent, this, Predicates.SBOL3.hasFeature, id, undefined)

        const module:S3SubComponent = new S3SubComponent(this.view, identified.subject)

        module.instanceOf = definition

        return module
    }

    createFeature(name:string):S3SequenceFeature {

        const id:string = 'feature_' + name

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.SequenceFeature, this, Predicates.SBOL3.hasFeature, id, undefined)

        return new S3SequenceFeature(this.view, identified.subject)

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

    createConstraint(subject:S3SubComponent, restriction:string, object:S3SubComponent):S3Constraint {

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(
                this.view, Types.SBOL3.Constraint, this, Predicates.SBOL3.hasConstraint, 'constraint_' + subject.displayId + '_' + object.displayId, undefined)

        const constraint:S3Constraint = new S3Constraint(this.view, identified.subject)

        constraint.constraintSubject = subject
        constraint.constraintRestriction = restriction
        constraint.constraintObject = object

        return constraint
    }

    createSequence():S3Sequence {

        const seq:S3Sequence = this.view.createSequence(this.uriPrefix, this.displayName + '_sequence')

        this.addSequence(seq)

        return seq
    }

    addSequence(seq:S3Sequence):void {

        this.view.graph.insertProperties(this.subject, {
            [Predicates.SBOL3.hasSequence]: seq.subject
        })

    }

    createInteraction(id:string, version?:string):S3Interaction {

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.Interaction, this,  Predicates.SBOL3.hasInteraction, id, undefined)

        const interaction:S3Interaction = new S3Interaction(this.view, identified.subject)

        return interaction
    }

    addModel(model:S3Model) {
        this.insertProperty(Predicates.SBOL3.hasModel, model.subject)
    }

    get instances():S3SubComponent[] {

        return this.graph.match(null, Predicates.SBOL3.instanceOf, this.subject)
                .map(t => this.view.subjectToFacade(t.subject))
                .map(f => f! as S3SubComponent)
    
    }


    dissolve() {

        let instances = this.instances

        for(let inst of instances) {
            inst.dissolve()
        }

        this.destroy()

    }


}







