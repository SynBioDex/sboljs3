import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'
import S2ComponentInstance from './S2ComponentInstance'
import S2Range from './S2Range'
import S2GenericLocation from './S2GenericLocation'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S2Location from "./S2Location";

import S2IdentifiedFactory from './S2IdentifiedFactory'
import S2ComponentDefinition from './S2ComponentDefinition';

export default class S2SequenceAnnotation extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.SequenceAnnotation
    }

    get locations():Array<S2Location> {

        return this.getProperties(Predicates.SBOL2.location)
                   .map((subject:Node) => this.view.subjectToFacade(subject) as S2Location)
    }

    get rangeLocations():Array<S2Range> {

        return this.locations.filter((location:S2Identified) => {
            return location.objectType === Types.SBOL2.Range
        }).map((identified:S2Identified) => {
            return new S2Range(this.view, identified.subject)
        })

    }

    get rangeMin():number|null {

        var n:number = Number.MAX_VALUE

        this.rangeLocations.forEach((range:S2Range) => {

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && start < n)
                n = start

            if(end !== undefined && end < n)
                n = end
        })

        return n === Number.MAX_VALUE ? null : n
    }

    get rangeMax():number|null {

        var n:number = Number.MIN_VALUE

        this.rangeLocations.forEach((range:S2Range) => {

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && start > n)
                n = start

            if(end !== undefined && end > n)
                n = end
        })

        return n === Number.MIN_VALUE ? null : n
    }

    hasFixedLocation():boolean {

        const locations = this.locations

        for(var i = 0; i < locations.length; ++ i) {

            if(locations[i].isFixed())
                return true

        }

        return false
    }

    get containingComponentDefinition():S2ComponentDefinition {

        const subject:Node|undefined = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL2.sequenceAnnotation, this.subject)
        )

        if(uri === undefined) {
            throw new Error('SA not contained by a CD??')
        }

        return new S2ComponentDefinition(this.view, subject)
    }

    get component():S2ComponentInstance|undefined {

        const uri = this.getUriProperty(Predicates.SBOL2.component)

        if(subject)
            return new S2ComponentInstance(this.view, subject)
    }

    set component(component:S2ComponentInstance|undefined) {

        if(component !== undefined) {
            this.setUriProperty(Predicates.SBOL2.component, component.subject)
        } else {
            this.deleteProperty(Predicates.SBOL2.component)
        }
    }

    get displayName():string {

        const component = this.component

        if(component) {

            const componentDisplayName = component.displayName

            if(componentDisplayName)
                return componentDisplayName
        }

        return this.name || this.displayId || ''
    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL2.role)
    }

    hasRole(role:string):boolean {
        return this.view.graph.hasMatch(this.subject, Predicates.SBOL2.role, role)
    }

    addRole(role:string):void {
        this.insertProperty(Predicates.SBOL2.role, node.createUriNode(role))
    }

    static fromIdentified(identified:S2Identified):S2SequenceAnnotation {

        const type:string|undefined = identified.objectType

        if(type === Types.SBOL2.SequenceAnnotation)
            return new S2SequenceAnnotation(identified.view, identified.subject)

        if(type === Types.SBOL2.Component) {
            
            const sa:S2SequenceAnnotation|undefined = (new S2ComponentInstance(identified.view, identified.subject)).sequenceAnnotations[0]

            if(sa === undefined) {
                throw new Error('cannot get sequence annotation from ' + identified.subject)
            }

            return sa
        }

        throw new Error('cannot get sequence annotation from ' + identified.subject)

    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL2.sequenceAnnotation, this.subject)
        )

        if(!subject) {
            throw new Error('SA has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }


    clearLocations():void {

        this.locations.forEach((location:S2Identified) => {
            this.view.graph.purgeSubject(location.subject)
        })

    }

    addLocationGeneric(orientation:string) {

        let identified = S2IdentifiedFactory.createChild(this.view, Types.SBOL2.GenericLocation, this, Predicates.SBOL2.location, 'location', this.version)

        let location = new S2GenericLocation(this.view, identified.subject)

        location.orientation = orientation

        return location
    }

    setLocationGeneric(orientation:string) {

        this.clearLocations()
        this.addLocationGeneric(orientation)

    }

    get allRoles():string[] {

        const rolesHere = this.roles


        const component = this.component

        if(component && component.definition) {
            return rolesHere.concat(component.definition.roles)
        } else {
            return rolesHere
        }


    }

    get displayDescription():string|undefined {

        var desc = this.description

        if(desc !== undefined)
            return desc
        
        const c = this.component

        if(c !== undefined)
            return c.displayDescription

        return undefined
    }

    get containedObjects():Array<S2Identified> {

        return (this.locations as S2Identified[])
    }

}


