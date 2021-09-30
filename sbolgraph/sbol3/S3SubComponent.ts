
import S3Identified from './S3Identified'
import S3Feature from './S3Feature'
import S3Component from './S3Component'
import S3Constraint from './S3Constraint'
import S3OrientedLocation from './S3OrientedLocation'
import S3IdentifiedFactory from './S3IdentifiedFactory'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";
import S3MapsTo from './S3MapsTo';
import S3Interaction from './S3Interaction'
import S3Location from './S3Location'
import S3Measure from './S3Measure';

export default class S3SubComponent extends S3Feature {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL3.SubComponent
    }

    get displayName():string|undefined {

        let name = this.name
        
        if(name)
            return name

        try {
            let instanceOf = this.instanceOf

            let instanceOfName = instanceOf.name

            if (instanceOfName) {
                return instanceOfName
            }
        } catch(e) {
        }

        return this.getStringProperty(Predicates.SBOL3.displayId) || this.subject.value
    }

    get instanceOf():S3Component {

        const subject:Node|undefined = this.getProperty(Predicates.SBOL3.instanceOf)

        if(subject === undefined) {
            throw new Error('subcomponent has no instanceOf?')
        }

        return new S3Component(this.view, subject)
    }

    set instanceOf(def:S3Component) {

        this.setProperty(Predicates.SBOL3.instanceOf, def.subject)

    }

    get containingObject():S3Identified|undefined {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL3.hasFeature, this.subject)?.subject

        if(!subject) {
            throw new Error('subcomponent has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }

    get containingComponent():S3Component {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL3.hasFeature, this.subject)?.subject

        if(!subject) {
            throw new Error('subcomponent has no containing object?')
        }

        return this.view.subjectToFacade(subject) as S3Component

    }

    get sequenceConstraints():Array<S3Constraint> {

        return this.view.graph.match(null, Predicates.SBOL3.subject, this.subject)
                   .map(t => t.subject)
                   //.filter((subject:Node) => this.view.getType(subject) === Types.SBOL3.SequenceConstraint)
                   .map((subject:Node) => new S3Constraint(this.view, subject))

    }

    createAfter(component:S3Component):S3SubComponent {

        const container:S3Component = this.containingComponent

        const sc:S3SubComponent = container.createSubComponent(component)

        let existingConstraints:Array<S3Constraint> = this.getConstraintsWithThisSubject()

        container.createConstraint(this, Specifiers.SBOL3.Constraint.Precedes, sc)

        for(let c of existingConstraints) {
            if(c.constraintRestriction === Specifiers.SBOL3.Constraint.Precedes) {
                c.constraintSubject = sc
            }
        }

        return sc
    }

    createBefore(component:S3Component):S3SubComponent {

        const container:S3Component = this.containingComponent

        const sc:S3SubComponent = container.createSubComponent(component)


        let existingConstraints:Array<S3Constraint> = this.getConstraintsWithThisObject()

        container.createConstraint(sc, Specifiers.SBOL3.Constraint.Precedes, this)

        for(let c of existingConstraints) {
            if(c.constraintRestriction === Specifiers.SBOL3.Constraint.Precedes) {
                c.constraintObject = sc
            }
        }

        return sc
    }

    getConstraintsWithThisSubject():Array<S3Constraint> {

        return this.view.graph.match(null, Predicates.SBOL3.subject, this.subject)
                    .map(t => t.subject)
                    .map((subject:Node) => new S3Constraint(this.view, subject))
    }

    getConstraintsWithThisObject():Array<S3Constraint> {

        return this.view.graph.match(null, Predicates.SBOL3.object, this.subject)
                    .map(t => t.subject)
                    .map((subject:Node) => new S3Constraint(this.view, subject))
    }

    getConstraints():Array<S3Constraint> {

        return this.getConstraintsWithThisSubject().concat(this.getConstraintsWithThisObject())

    }

    get mappings():Array<S3MapsTo> {

        return this.view.graph.match(null, Predicates.SBOL2.local, this.subject).map(t => t.subject)
                .concat(
                    this.view.graph.match(null, Predicates.SBOL2.remote, this.subject).map(t => t.subject)
                )
                .filter((el) => !!el)
                .map((mapsTosubject) => new S3MapsTo(this.view, mapsTosubject))
    }

    addMapping(mapping:S3MapsTo) {

        this.insertProperties({
            [Predicates.SBOL2.mapsTo]: mapping.subject
        })

    }

    createMapping(local:S3SubComponent, remote:S3SubComponent)  {

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL2.MapsTo, this, Predicates.SBOL2.mapsTo, 'mapping_' + local.displayId + '_' + remote.displayId, undefined)

        const mapping:S3MapsTo = new S3MapsTo(this.view, identified.subject)

        mapping.local = local
        mapping.remote = remote

        return mapping

    }

    swapWith(otherSubComponent:S3SubComponent) {

        let a = this.getConstraintsWithThisObject()
        let b = this.getConstraintsWithThisSubject()
        let c = otherSubComponent.getConstraintsWithThisObject()
        let d = otherSubComponent.getConstraintsWithThisSubject()

        for(let sc of a) {
            sc.constraintObject = otherSubComponent
        }

        for(let sc of b) {
            sc.constraintSubject = otherSubComponent
        }

        for(let sc of c) {
            sc.constraintObject = this
        }

        for(let sc of d) {
            sc.constraintSubject = this
        }

        // TODO locations
    }

    createInteractionWith(other:S3SubComponent, id:string, interactionType:string, ourRole:string, theirRole:string):S3Interaction {

        if(!other.isSiblingOf(this)) {
            throw new Error('???')
        }

        let container = this.containingComponent

        if(!container) {
            throw new Error('???')
        }

        let interaction = container.createInteraction(id)
        interaction.type = interactionType

        interaction.createParticipationWithParticipantAndRole('ourParticipation', this, ourRole)
        interaction.createParticipationWithParticipantAndRole('theirParticipation', other, theirRole)

        return interaction
    }

    createProduct(id:string):S3SubComponent {

        let product = this.view.createComponent(this.uriPrefix, id)

        let container = this.containingComponent

        let productSC = container.createSubComponent(product)

        let interaction = this.createInteractionWith(productSC, 'production', Prefixes.sbo + 'SBO:0000589', Prefixes.sbo + 'SBO:0000645', Prefixes.sbo + 'SBO:0000011')

        return productSC
    }

    getInteractions():Array<S3Interaction> {

        let container = this.containingComponent

        return container.interactions.filter((interaction) => {
            return interaction.hasParticipant(this)
        })

    }

    getProducts():Array<S3SubComponent> {

        let interactions = this.getInteractions()

        let productionInteractions = interactions.filter((interaction) => {
            return interaction.hasType(Prefixes.sbo + 'SBO:0000589')
        })

        let products:S3SubComponent[] = []
        
        for(let i of productionInteractions) {
            for(let p of i.participations) {
                if(p.hasRole(Prefixes.sbo + 'SBO:0000011')) {
                    let participant = p.participant
                    if(participant  === undefined) {
                        throw new Error('???')
                    }
                    products.push(participant)
                }
            }
        }

        return products
    }

    dissolve() {

        let containingComponent = this.containingComponent

        let def = this.instanceOf

        for(let subcomponent of def.subComponents) {
            let newSC = containingComponent.createSubComponent(subcomponent.instanceOf)
            // TODO locations etc
        }

        this.destroy()
    }

    get sourceLocation():S3Location|undefined {

        let uri = this.getProperty(Predicates.SBOL3.sourceLocation)

        if(uri === undefined)
            return undefined
        
        let obj = this.view.subjectToFacade(uri)

        if(! (obj instanceof S3Location)) {
            throw new Error('sourceLocation was not a location')
        }

        return obj
    }

    set sourceLocation(location:S3Location|undefined) {

        if(location !== undefined)
            this.setProperty(Predicates.SBOL3.sourceLocation, location.subject)
        else
            this.deleteProperty(Predicates.SBOL3.sourceLocation)

    }

    get measure():S3Measure|undefined {
        let measure = this.getProperty(Predicates.SBOL3.hasMeasure)

        if(measure === undefined)
            return
        
        return new S3Measure(this.view, measure)
    }

    set measure(measure:S3Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL3.hasMeasure)
        else
            this.setProperty(Predicates.SBOL3.hasMeasure, measure.subject)

    }

}


