
import SXIdentified from './SXIdentified'
import SXThingWithLocation from './SXThingWithLocation'
import SXComponent from './SXComponent'
import SXSequenceConstraint from './SXSequenceConstraint'
import SXOrientedLocation from './SXOrientedLocation'
import SXIdentifiedFactory from './SXIdentifiedFactory'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'
import SBOLXGraph from "../SBOLXGraph";
import SXMapsTo from './SXMapsTo';
import SXInteraction from './SXInteraction'
import SXLocation from './SXLocation'
import SXMeasure from './SXMeasure';

export default class SXSubComponent extends SXThingWithLocation {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOLX.SubComponent
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

        return this.getStringProperty(Predicates.SBOLX.id) || this.uri
    }

    get instanceOf():SXComponent {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOLX.instanceOf)

        if(uri === undefined) {
            throw new Error('subcomponent has no instanceOf?')
        }

        return new SXComponent(this.graph, uri)
    }

    set instanceOf(def:SXComponent) {

        this.setUriProperty(Predicates.SBOLX.instanceOf, def.uri)

    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.subComponent, this.uri)
        )

        if(!uri) {
            throw new Error('subcomponent has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    get containingComponent():SXComponent {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.subComponent, this.uri)
        )

        if(!uri) {
            throw new Error('subcomponent has no containing object?')
        }

        return this.graph.uriToFacade(uri) as SXComponent

    }

    get sequenceConstraints():Array<SXSequenceConstraint> {

        return this.graph.match(null, Predicates.SBOLX.subject, this.uri)
                   .map(triple.subjectUri)
                   //.filter((uri:string) => this.graph.getType(uri) === Types.SBOLX.SequenceConstraint)
                   .map((uri:string) => new SXSequenceConstraint(this.graph, uri))

    }

    createAfter(component:SXComponent):SXSubComponent {

        const container:SXComponent = this.containingComponent

        const sc:SXSubComponent = container.createSubComponent(component)

        let existingConstraints:Array<SXSequenceConstraint> = this.getConstraintsWithThisSubject()

        container.createConstraint(this, Specifiers.SBOLX.SequenceConstraint.Precedes, sc)

        for(let c of existingConstraints) {
            if(c.restriction === Specifiers.SBOLX.SequenceConstraint.Precedes) {
                c.subject = sc
            }
        }

        return sc
    }

    createBefore(component:SXComponent):SXSubComponent {

        const container:SXComponent = this.containingComponent

        const sc:SXSubComponent = container.createSubComponent(component)


        let existingConstraints:Array<SXSequenceConstraint> = this.getConstraintsWithThisObject()

        container.createConstraint(sc, Specifiers.SBOLX.SequenceConstraint.Precedes, this)

        for(let c of existingConstraints) {
            if(c.restriction === Specifiers.SBOLX.SequenceConstraint.Precedes) {
                c.object = sc
            }
        }

        return sc
    }

    getConstraintsWithThisSubject():Array<SXSequenceConstraint> {

        return this.graph.match(null, Predicates.SBOLX.subject, this.uri)
                    .map(triple.subjectUri)
                    .map((uri:string) => new SXSequenceConstraint(this.graph, uri))
    }

    getConstraintsWithThisObject():Array<SXSequenceConstraint> {

        return this.graph.match(null, Predicates.SBOLX.object, this.uri)
                    .map(triple.subjectUri)
                    .map((uri:string) => new SXSequenceConstraint(this.graph, uri))
    }

    getConstraints():Array<SXSequenceConstraint> {

        return this.getConstraintsWithThisSubject().concat(this.getConstraintsWithThisObject())

    }

    get mappings():Array<SXMapsTo> {

        return this.graph.match(null, Predicates.SBOL2.local, this.uri).map(triple.subjectUri)
                .concat(
                    this.graph.match(null, Predicates.SBOL2.remote, this.uri).map(triple.subjectUri)
                )
                .filter((el) => !!el)
                .map((mapsToUri) => new SXMapsTo(this.graph, mapsToUri as string))
    }

    addMapping(mapping:SXMapsTo) {

        this.graph.insertProperties(this.uri, {
            [Predicates.SBOL2.mapsTo]: node.createUriNode(mapping.uri)
        })

    }

    createMapping(local:SXSubComponent, remote:SXSubComponent)  {

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.graph, Types.SBOL2.MapsTo, this, Predicates.SBOL2.mapsTo, 'mapping_' + local.id + '_' + remote.id, undefined, this.version)

        const mapping:SXMapsTo = new SXMapsTo(this.graph, identified.uri)

        mapping.local = local
        mapping.remote = remote

        return mapping

    }

    swapWith(otherSubComponent:SXSubComponent) {

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

    createInteractionWith(other:SXSubComponent, id:string, interactionType:string, ourRole:string, theirRole:string):SXInteraction {

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

    createProduct(id:string):SXSubComponent {

        let product = this.graph.createComponent(this.uriPrefix, id)

        let container = this.containingComponent

        let productSC = container.createSubComponent(product)

        let interaction = this.createInteractionWith(productSC, 'production', Prefixes.sbo + 'SBO:0000589', Prefixes.sbo + 'SBO:0000645', Prefixes.sbo + 'SBO:0000011')

        return productSC
    }

    getInteractions():Array<SXInteraction> {

        let container = this.containingComponent

        return container.interactions.filter((interaction) => {
            return interaction.hasParticipant(this)
        })

    }

    getProducts():Array<SXSubComponent> {

        let interactions = this.getInteractions()

        let productionInteractions = interactions.filter((interaction) => {
            return interaction.hasType(Prefixes.sbo + 'SBO:0000589')
        })

        let products:SXSubComponent[] = []
        
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

    destroy() {

        for(let c of this.getConstraints()) {
            c.destroy()
        }

        for(let m of this.mappings) {
            m.destroy()
        }

        super.destroy()

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

    get sourceLocation():SXLocation|undefined {

        let uri = this.getUriProperty(Predicates.SBOLX.sourceLocation)

        if(uri === undefined)
            return undefined
        
        let obj = this.graph.uriToFacade(uri)

        if(! (obj instanceof SXLocation)) {
            throw new Error('sourceLocation was not a location')
        }

        return obj
    }

    set sourceLocation(location:SXLocation|undefined) {

        if(location !== undefined)
            this.setUriProperty(Predicates.SBOLX.sourceLocation, location.uri)
        else
            this.deleteProperty(Predicates.SBOLX.sourceLocation)

    }

    get measure():SXMeasure|undefined {
        let measure = this.getUriProperty(Predicates.SBOLX.measure)

        if(measure === undefined)
            return
        
        return new SXMeasure(this.graph, measure)
    }

    set measure(measure:SXMeasure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOLX.measure)
        else
            this.setUriProperty(Predicates.SBOLX.measure, measure.uri)

    }

}


