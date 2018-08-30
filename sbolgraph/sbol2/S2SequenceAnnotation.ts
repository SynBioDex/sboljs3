import { SBOL2Graph, S2ComponentDefinition } from '..';

import S2Identified from './S2Identified'
import S2ComponentInstance from './S2ComponentInstance'
import S2Range from './S2Range'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'
import CompliantURIs from "../SBOL2CompliantURIs";
import S2Location from "./S2Location";

export default class S2SequenceAnnotation extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.SequenceAnnotation
    }

    get locations():Array<S2Location> {

        return this.getUriProperties(Predicates.SBOL2.location)
                   .map((uri:string) => this.graph.uriToFacade(uri) as S2Location)
    }

    get rangeLocations():Array<S2Range> {

        return this.locations.filter((location:S2Identified) => {
            return location.objectType === Types.SBOL2.Range
        }).map((identified:S2Identified) => {
            return new S2Range(this.graph, identified.uri)
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

        const uri:string|undefined = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.sequenceAnnotation, this.uri)
        )

        if(uri === undefined) {
            throw new Error('SA not contained by a CD??')
        }

        return new S2ComponentDefinition(this.graph, uri)
    }

    get component():S2ComponentInstance|undefined {

        const uri = this.getUriProperty(Predicates.SBOL2.component)

        if(uri)
            return new S2ComponentInstance(this.graph, uri)
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

    addRole(role:string):void {
        this.graph.insert(this.uri, Predicates.SBOL2.role, node.createUriNode(role))
    }

    static fromIdentified(identified:S2Identified):S2SequenceAnnotation {

        const type:string|undefined = identified.objectType

        if(type === Types.SBOL2.SequenceAnnotation)
            return new S2SequenceAnnotation(identified.graph, identified.uri)

        if(type === Types.SBOL2.Component) {
            
            const sa:S2SequenceAnnotation|undefined = (new S2ComponentInstance(identified.graph, identified.uri)).sequenceAnnotations[0]

            if(sa === undefined) {
                throw new Error('cannot get sequence annotation from ' + identified.uri)
            }

            return sa
        }

        throw new Error('cannot get sequence annotation from ' + identified.uri)

    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.sequenceAnnotation, this.uri)
        )

        if(!uri) {
            throw new Error('SA has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }


    clearLocations():void {

        this.locations.forEach((location:S2Identified) => {
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


