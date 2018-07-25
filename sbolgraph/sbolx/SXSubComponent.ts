
import SXIdentified from './SXIdentified'
import SXThingWithLocation from './SXThingWithLocation'
import SXComponent from './SXComponent'
import SXSequenceConstraint from './SXSequenceConstraint'
import SXOrientedLocation from './SXOrientedLocation'
import SXIdentifiedFactory from './SXIdentifiedFactory'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraph from "../SBOLXGraph";
import SXMapsTo from './SXMapsTo';

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

        let instanceOf = this.instanceOf

        if(instanceOf) {
            let instanceOfName = this.instanceOf.name

            if(instanceOfName) {
                return instanceOfName
            }
        }

        return this.id
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
            this.graph.matchOne(null, Predicates.SBOLX.hasSubComponent, this.uri)
        )

        if(!uri) {
            throw new Error('subcomponent has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    get containingComponent():SXComponent {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasSubComponent, this.uri)
        )

        if(!uri) {
            throw new Error('subcomponent has no containing object?')
        }

        return this.graph.uriToFacade(uri) as SXComponent

    }

    get sequenceConstraints():Array<SXSequenceConstraint> {

        return this.graph.match(null, Predicates.SBOLX.constraintSubject, this.uri)
                   .map(triple.subjectUri)
                   //.filter((uri:string) => this.graph.getType(uri) === Types.SBOLX.SequenceConstraint)
                   .map((uri:string) => new SXSequenceConstraint(this.graph, uri))

    }

    addOrientedLocation():SXOrientedLocation {

        const loc:SXIdentified = SXIdentifiedFactory.createChild(this.graph, Types.SBOLX.OrientedLocation, this, 'location', undefined, this.version)

        return new SXOrientedLocation(loc.graph, loc.uri)
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

        return this.graph.match(null, Predicates.SBOLX.constraintSubject, this.uri)
                    .map(triple.subjectUri)
                    .map((uri:string) => new SXSequenceConstraint(this.graph, uri))
    }

    getConstraintsWithThisObject():Array<SXSequenceConstraint> {

        return this.graph.match(null, Predicates.SBOLX.constraintObject, this.uri)
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
            SXIdentifiedFactory.createChild(this.graph, Types.SBOL2.MapsTo, this, 'mapping_' + local.id + '_' + remote.id, undefined, this.version)

        const mapping:SXMapsTo = new SXMapsTo(this.graph, identified.uri)

        this.graph.add(node.createUriNode(this.uri), node.createUriNode(Predicates.SBOL2.mapsTo), node.createUriNode(identified.uri))

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

    destroy() {

        for(let c of this.getConstraints()) {
            c.destroy()
        }

        for(let m of this.mappings) {
            m.destroy()
        }

        super.destroy()

    }

}


