import SBOL2Graph from '../SBOL2Graph';

import S2Identified from './S2Identified'
import S2ComponentDefinition from './S2ComponentDefinition'
import S2SequenceAnnotation from './S2SequenceAnnotation'
import S2SequenceConstraint from './S2SequenceConstraint'

import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S2Location from './S2Location';

export default class S2ComponentInstance extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

        this.access = Specifiers.SBOL2.Access.PublicAccess

    }

    get facadeType():string {
        return Types.SBOL2.Component
    }

    get displayName():string {

        const name:string|undefined = this.name

        if(name)
            return name

        const def:S2ComponentDefinition = this.definition

        const defName:string|undefined = def.name
        
        if(defName)
            return defName

        return this.displayId || ''
    }

    get definition():S2ComponentDefinition {

        const uri = this.getUriProperty(Predicates.SBOL2.definition)

        if(!uri) {
            throw new Error('Component ' + this.uri + ' has no definition')
        }

        return new S2ComponentDefinition(this.graph, uri)
    }

    set definition(def:S2ComponentDefinition) {

        this.setUriProperty(Predicates.SBOL2.definition, def.uri)

    }

    get access():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.access)
    }

    set access(access:string|undefined) {

        if(access === undefined) {
            this.deleteProperty(Predicates.SBOL2.access)
        } else {
            this.setUriProperty(Predicates.SBOL2.access, access)
        }
    }

    get sequenceAnnotations():Array<S2SequenceAnnotation> {

        return this.graph.match(null, Predicates.SBOL2.component, this.uri)
                   .map(triple.subjectUri)
                   .filter((uri:string) => this.graph.getType(uri) === Types.SBOL2.SequenceAnnotation)
                   .map((uri:string) => new S2SequenceAnnotation(this.graph, uri))

    }

    get sequenceConstraints():Array<S2SequenceConstraint> {

        return this.graph.match(null, Predicates.SBOL2.subject, this.uri)
                   .map(triple.subjectUri)
                   .filter((uri:string) => this.graph.getType(uri) === Types.SBOL2.SequenceConstraint)
                   .map((uri:string) => new S2SequenceConstraint(this.graph, uri))

    }

    hasRole(role:string):boolean {
        return this.definition ? this.definition.hasRole(role) : false
    }

    get containingComponentDefinition():S2ComponentDefinition {
            
        const uri:string|undefined = this.graph.match(
            null, Predicates.SBOL2.component, this.uri
        ).map(triple.subjectUri).filter((s: string) => {
            return this.graph.hasType(s, Types.SBOL2.ComponentDefinition)
        })[0]

        if(uri === undefined) {
            throw new Error('component not contained by definition?')
        }

        return new S2ComponentDefinition(this.graph, uri)
    }

    get containingObject():S2Identified|undefined {

        return this.containingComponentDefinition

    }


    isSequenceBound():boolean {

        return this.sequenceAnnotations.length > 0 || this.sequenceConstraints.length > 0

    }

    get displayDescription():string|undefined {

        var desc = this.description

        if(desc !== undefined)
            return desc
        
        const def = this.definition

        if(def !== undefined)
            return def.displayDescription

        return undefined
    }

    get sourceLocation():S2Location|undefined {

        let uri = this.getUriProperty(Predicates.SBOL2.sourceLocation)

        if(uri === undefined)
            return undefined
        
        let obj = this.graph.uriToFacade(uri)

        if(! (obj instanceof S2Location)) {
            throw new Error('sourceLocation was not a location')
        }

        return obj
    }

    set sourceLocation(location:S2Location|undefined) {

        if(location !== undefined)
            this.setUriProperty(Predicates.SBOL2.sourceLocation, location.uri)
        else
            this.deleteProperty(Predicates.SBOL2.sourceLocation)

    }

}


