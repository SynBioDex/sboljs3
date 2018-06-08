
import SXIdentified from './SXIdentified'
import SXThingWithLocation from './SXThingWithLocation'
import SXComponent from './SXComponent'
import SXSequenceConstraint from './SXSequenceConstraint'
import SXOrientedLocation from './SXOrientedLocation'
import SXIdentifiedFactory from './SXIdentifiedFactory'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraph from "../SBOLXGraph";

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

        container.createConstraint(this, Specifiers.SBOLX.SequenceConstraint.Precedes, sc)

        return sc
    }

    createBefore(component:SXComponent):SXSubComponent {

        const container:SXComponent = this.containingComponent

        const sc:SXSubComponent = container.createSubComponent(component)

        container.createConstraint(sc, Specifiers.SBOLX.SequenceConstraint.Precedes, this)

        return sc
    }
}


