
import S3Identified from './S3Identified'
import S3ThingWithLocation from './S3ThingWithLocation'
import S3Component from './S3Component'
import S3SequenceConstraint from './S3SequenceConstraint'
import S3OrientedLocation from './S3OrientedLocation'
import S3IdentifiedFactory from './S3IdentifiedFactory'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";
import S3MapsTo from './S3MapsTo';
import S3Interaction from './S3Interaction'
import S3Location from './S3Location'
import S3Measure from './S3Measure';

export default class S3SubComponent extends S3ThingWithLocation {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)
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

        return this.getStringProperty(Predicates.SBOL3.displayId) || this.uri
    }

    get instanceOf():S3Component {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOL3.instanceOf)

        if(uri === undefined) {
            throw new Error('subcomponent has no instanceOf?')
        }

        return new S3Component(this.view, uri)
    }

    set instanceOf(def:S3Component) {

        this.setUriProperty(Predicates.SBOL3.instanceOf, def.uri)

    }

    get containingObject():S3Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.subComponent, this.uri)
        )

        if(!uri) {
            throw new Error('subcomponent has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }

    get containingComponent():S3Component {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.subComponent, this.uri)
        )

        if(!uri) {
            throw new Error('subcomponent has no containing object?')
        }

        return this.view.uriToFacade(uri) as S3Component

    }

    get sequenceConstraints():Array<S3SequenceConstraint> {

        return this.view.graph.match(null, Predicates.SBOL3.subject, this.uri)
                   .map(triple.subjectUri)
                   //.filter((uri:string) => this.view.getType(uri) === Types.SBOL3.SequenceConstraint)
                   .map((uri:string) => new S3SequenceConstraint(this.view, uri))

    }

    createAfter(component:S3Component):S3SubComponent {

        const container:S3Component = this.containingComponent

        const sc:S3SubComponent = container.createSubComponent(component)

        let existingConstraints:Array<S3SequenceConstraint> = this.getConstraintsWithThisSubject()

        container.createConstraint(this, Specifiers.SBOL3.SequenceConstraint.Precedes, sc)

        for(let c of existingConstraints) {
            if(c.restriction === Specifiers.SBOL3.SequenceConstraint.Precedes) {
                c.subject = sc
            }
        }

        return sc
    }

    createBefore(component:S3Component):S3SubComponent {

        const container:S3Component = this.containingComponent

        const sc:S3SubComponent = container.createSubComponent(component)


        let existingConstraints:Array<S3SequenceConstraint> = this.getConstraintsWithThisObject()

        container.createConstraint(sc, Specifiers.SBOL3.SequenceConstraint.Precedes, this)

        for(let c of existingConstraints) {
            if(c.restriction === Specifiers.SBOL3.SequenceConstraint.Precedes) {
                c.object = sc
            }
        }

        return sc
    }

    getConstraintsWithThisSubject():Array<S3SequenceConstraint> {

        return this.view.graph.match(null, Predicates.SBOL3.subject, this.uri)
                    .map(triple.subjectUri)
                    .map((uri:string) => new S3SequenceConstraint(this.view, uri))
    }

    getConstraintsWithThisObject():Array<S3SequenceConstraint> {

        return this.view.graph.match(null, Predicates.SBOL3.object, this.uri)
                    .map(triple.subjectUri)
                    .map((uri:string) => new S3SequenceConstraint(this.view, uri))
    }

    getConstraints():Array<S3SequenceConstraint> {

        return this.getConstraintsWithThisSubject().concat(this.getConstraintsWithThisObject())

    }

    get mappings():Array<S3MapsTo> {

        return this.view.graph.match(null, Predicates.SBOL2.local, this.uri).map(triple.subjectUri)
                .concat(
                    this.view.graph.match(null, Predicates.SBOL2.remote, this.uri).map(triple.subjectUri)
                )
                .filter((el) => !!el)
                .map((mapsToUri) => new S3MapsTo(this.view, mapsToUri as string))
    }

    addMapping(mapping:S3MapsTo) {

        this.insertProperties({
            [Predicates.SBOL2.mapsTo]: node.createUriNode(mapping.uri)
        })

    }

    createMapping(local:S3SubComponent, remote:S3SubComponent)  {

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL2.MapsTo, this, Predicates.SBOL2.mapsTo, 'mapping_' + local.displayId + '_' + remote.displayId, undefined)

        const mapping:S3MapsTo = new S3MapsTo(this.view, identified.uri)

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
            sc.object = otherSubComponent
        }

        for(let sc of b) {
            sc.subject = otherSubComponent
        }

        for(let sc of c) {
            sc.object = this
        }

        for(let sc of d) {
            sc.subject = this
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

        let uri = this.getUriProperty(Predicates.SBOL3.sourceLocation)

        if(uri === undefined)
            return undefined
        
        let obj = this.view.uriToFacade(uri)

        if(! (obj instanceof S3Location)) {
            throw new Error('sourceLocation was not a location')
        }

        return obj
    }

    set sourceLocation(location:S3Location|undefined) {

        if(location !== undefined)
            this.setUriProperty(Predicates.SBOL3.sourceLocation, location.uri)
        else
            this.deleteProperty(Predicates.SBOL3.sourceLocation)

    }

    get measure():S3Measure|undefined {
        let measure = this.getUriProperty(Predicates.SBOL3.hasMeasure)

        if(measure === undefined)
            return
        
        return new S3Measure(this.view, measure)
    }

    set measure(measure:S3Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL3.hasMeasure)
        else
            this.setUriProperty(Predicates.SBOL3.hasMeasure, measure.uri)

    }

}


