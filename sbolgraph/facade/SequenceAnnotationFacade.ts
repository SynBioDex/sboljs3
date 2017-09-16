import SbolGraph, { ComponentDefinitionFacade } from '..';

import IdentifiedFacade from './IdentifiedFacade'
import ComponentInstanceFacade from './ComponentInstanceFacade'
import RangeFacade from './RangeFacade'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'sbolterms'
import CompliantURIs from "../CompliantURIs";
import LocationFacade from "./LocationFacade";

export default class SequenceAnnotationFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.SequenceAnnotation
    }

    get locations():Array<LocationFacade> {

        return this.getUriProperties(Predicates.SBOL2.location)
                   .map((uri:string) => this.graph.uriToFacade(uri) as LocationFacade)
    }

    get rangeLocations():Array<RangeFacade> {

        return this.locations.filter((location:IdentifiedFacade) => {
            return location.objectType === Types.SBOL2.Range
        }).map((identified:IdentifiedFacade) => {
            return new RangeFacade(this.graph, identified.uri)
        })

    }

    get rangeMin():number|null {

        var n:number = Number.MAX_VALUE

        this.rangeLocations.forEach((range:RangeFacade) => {

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

        this.rangeLocations.forEach((range:RangeFacade) => {

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

    get containingComponentDefinition():ComponentDefinitionFacade {

        const uri:string|undefined = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.sequenceAnnotation, this.uri)
        )

        if(uri === undefined) {
            throw new Error('SA not contained by a CD??')
        }

        return new ComponentDefinitionFacade(this.graph, uri)
    }

    get component():ComponentInstanceFacade|undefined {

        const uri = this.getUriProperty(Predicates.SBOL2.component)

        if(uri)
            return new ComponentInstanceFacade(this.graph, uri)
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
        return this.graph.hasMatch(this.uri, Predicates.SBOL2.role, role)
    }

    static fromIdentified(identified:IdentifiedFacade):SequenceAnnotationFacade {

        const type:string|undefined = identified.objectType

        if(type === Types.SBOL2.SequenceAnnotation)
            return new SequenceAnnotationFacade(identified.graph, identified.uri)

        if(type === Types.SBOL2.Component) {
            
            const sa:SequenceAnnotationFacade|undefined = (new ComponentInstanceFacade(identified.graph, identified.uri)).sequenceAnnotations[0]

            if(sa === undefined) {
                throw new Error('cannot get sequence annotation from ' + identified.uri)
            }

            return sa
        }

        throw new Error('cannot get sequence annotation from ' + identified.uri)

    }

    get containingObject():IdentifiedFacade|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.sequenceAnnotation, this.uri)
        )

        if(!uri) {
            throw new Error('SA has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }


    clearLocations():void {

        this.locations.forEach((location:IdentifiedFacade) => {
            this.graph.purgeSubject(location.uri)
        })

    }

    addLocationGeneric(orientation:string) {

        const locationUri:string = this.graph.generateURI(this.persistentIdentity + '/location$n?$/1')

        this.graph.insertProperties(locationUri, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.GenericLocation),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(locationUri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(locationUri)),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(locationUri))
        })

        this.graph.add(this.uri, Predicates.SBOL2.location, node.createUriNode(locationUri))
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

}


